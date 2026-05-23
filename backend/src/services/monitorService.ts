import axios from 'axios';
import { db } from './dbService';
import { getAIService } from './aiService';
import { getActiveChaos } from '../routes/chaos';

let socketServer: any = null;
const activeIntervals: Record<string, NodeJS.Timeout> = {};

export const setSocketServer = (server: any) => {
  socketServer = server;
};

export const sendWebhookAlert = async (type: string, message: string) => {
  console.log(`🔔 [ALERT CHANNEL] [${type.toUpperCase()}] - ${message}`);
  
  if (socketServer) {
    socketServer.emit('alert-triggered', {
      type,
      message,
      timestamp: new Date()
    });
  }
};

const isAnomalyDetected = (newLatency: number, historicalLogs: any[]): boolean => {
  if (historicalLogs.length < 5) return false;
  
  const latencies = historicalLogs.map(l => l.responseTime);
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = sum / latencies.length;
  
  const variance = latencies.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / latencies.length;
  const stdDev = Math.sqrt(variance);

  const threshold = Math.max(avg + 2.5 * stdDev, avg * 2.5, 400); 
  return newLatency > threshold;
};

export const pingAPI = async (api: any) => {
  const startTime = Date.now();
  let statusCode = 200;
  let status: 'UP' | 'DOWN' | 'DEGRADED' = 'UP';
  let error = '';
  let responseTime = 0;

  // --- INTEGRATED DISASTER CHAOS ENGINE OVERRIDE ---
  const activeChaos = getActiveChaos();
  const isChaosActive = activeChaos && activeChaos.apiId.toString() === api._id.toString();

  if (isChaosActive) {
    // Injected Disaster Overrides
    const type = activeChaos.type.toLowerCase();
    console.log(`🔥 [CHAOS OVERRIDE] Simulating disaster: [${activeChaos.type}] on API: [${api.name}]`);

    if (type.includes('latency') || type.includes('slowness')) {
      responseTime = Math.floor(Math.random() * 800) + 2400; // 2.4s - 3.2s spike
      status = 'DEGRADED';
      error = 'High Latency SLA Warning: timing exceeded 2000ms';
    } else if (type.includes('deadlock') || type.includes('database')) {
      statusCode = 500;
      status = 'DOWN';
      error = '500 Internal Server Error: Mongoose transaction deadlock on billing_collection_idx';
      responseTime = Math.floor(Math.random() * 50) + 60;
    } else if (type.includes('overload') || type.includes('packet')) {
      statusCode = 503;
      status = 'DOWN';
      error = '503 Service Unavailable: High packet drop rate (84% loss) on auth gateways';
      responseTime = Math.floor(Math.random() * 2000) + 8000; // heavy load timing
    } else {
      statusCode = 504;
      status = 'DOWN';
      error = '504 Gateway Timeout: Consecutive gateway timeout failures scanned';
      responseTime = 15000; // complete timeout
    }
  } else {
    // Standard monitoring/simulation routine
    const isSimulated = api.url.includes('stripe') || 
                        api.url.includes('auth') || 
                        api.url.includes('profile') || 
                        api.url.includes('recommend') || 
                        api.url.includes('inventory') ||
                        api.url.includes('internal') ||
                        api.url.includes('localhost');

    if (isSimulated) {
      const rand = Math.random();
      
      if (api.name.includes('AI')) {
        responseTime = Math.floor(Math.random() * 200) + 500;
        if (rand > 0.9) {
          responseTime = Math.floor(Math.random() * 1000) + 1200;
          status = 'DEGRADED';
        }
      } else if (api.name.includes('Stripe')) {
        responseTime = Math.floor(Math.random() * 60) + 100;
        if (rand > 0.95) {
          statusCode = 504;
          status = 'DOWN';
          error = '504 Gateway Timeout from acquirer network';
        }
      } else if (api.name.includes('Inventory')) {
        responseTime = Math.floor(Math.random() * 50) + 60;
        if (rand > 0.93) {
          statusCode = 500;
          status = 'DOWN';
          error = '500 Internal Server Error (Database lock contention)';
        }
      } else {
        responseTime = Math.floor(Math.random() * 40) + 40;
        if (rand > 0.98) {
          statusCode = 502;
          status = 'DOWN';
          error = '502 Bad Gateway';
        }
      }
      responseTime += Math.floor(Math.random() * 20);
    } else {
      try {
        const response = await axios({
          method: api.method,
          url: api.url,
          headers: api.headers || {},
          data: api.body ? JSON.parse(api.body) : undefined,
          timeout: 5000
        });
        responseTime = Date.now() - startTime;
        statusCode = response.status;
        status = 'UP';
      } catch (err: any) {
        responseTime = Date.now() - startTime;
        statusCode = err.response?.status || 0;
        status = 'DOWN';
        error = err.message || 'Request connection failed';
      }
    }
  }

  const recentLogs = await db.logs.find({ apiId: api._id, limit: 10 });
  const latencyAnomaly = !isChaosActive && status === 'UP' && isAnomalyDetected(responseTime, recentLogs);

  if (latencyAnomaly) {
    status = 'DEGRADED';
    error = `Latency Anomaly: response time spiked to ${responseTime}ms compared to average`;
  }

  const log = await db.logs.create({
    apiId: api._id,
    statusCode,
    responseTime,
    status,
    error,
    timestamp: new Date()
  });

  const last20 = await db.logs.find({ apiId: api._id, limit: 20 });
  const upCount = last20.filter(l => l.status === 'UP').length;
  const healthScore = Math.round((upCount / Math.max(last20.length, 1)) * 100);

  await db.apis.findByIdAndUpdate(api._id, { healthScore });

  if (socketServer) {
    socketServer.emit('ping-result', {
      apiId: api._id,
      name: api.name,
      url: api.url,
      statusCode,
      responseTime,
      status,
      healthScore,
      timestamp: log.timestamp,
      isChaosOverride: isChaosActive,
      chaosType: activeChaos?.type
    });
  }

  // INCIDENT TIMELINE WORKFLOW
  if (status === 'DOWN' || status === 'DEGRADED') {
    const activeIncidents = await db.incidents.find({ apiId: api._id, status: 'active' });
    
    if (activeIncidents.length === 0) {
      const incidentTitle = isChaosActive 
        ? `🚨 CHAOS ACTIVE: [${activeChaos.type}] Outage on ${api.name}`
        : status === 'DOWN' 
        ? `${api.name} is DOWN (Status: ${statusCode})` 
        : `${api.name} Performance Degradation Alert`;
      
      const newInc = await db.incidents.create({
        apiId: api._id,
        title: incidentTitle,
        status: 'active',
        severity: status === 'DOWN' ? 'critical' : 'warning',
        startedAt: new Date(),
        timeline: [
          { event: `Outage incident triggered. Code: ${statusCode}, Response Time: ${responseTime}ms.`, timestamp: new Date() },
          { event: `SRE Command Center activated RED ALERT protocol.`, timestamp: new Date() }
        ]
      });

      await sendWebhookAlert(
        status === 'DOWN' ? 'downtime' : 'latency', 
        `🚨 RED ALERT PROTOCOL: ${incidentTitle} at ${api.url}. Immediate inspection required.`
      );

      runAIIncidentDiagnostics(newInc._id, api, log);
    }
  } else {
    // Nominal state
    const activeIncidents = await db.incidents.find({ apiId: api._id, status: 'active' });
    
    for (const incident of activeIncidents) {
      const updatedTimeline = [
        ...incident.timeline,
        { event: `API returned nominal health metrics (Uptime verified).`, timestamp: new Date() },
        { event: `AI Observability closed emergency ticket. HUD returned to normal.`, timestamp: new Date() }
      ];

      await db.incidents.findByIdAndUpdate(incident._id, {
        status: 'resolved',
        resolvedAt: new Date(),
        timeline: updatedTimeline
      });

      await db.alerts.updateMany({ apiId: api._id, resolved: false }, { resolved: true });

      await sendWebhookAlert(
        'anomaly', 
        `💚 RECOVERED: ${api.name} is back online. Incident resolved.`
      );

      if (socketServer) {
        socketServer.emit('incident-updated', {
          incidentId: incident._id,
          apiId: api._id,
          status: 'resolved',
          resolvedAt: new Date()
        });
      }
    }
  }
};

const runAIIncidentDiagnostics = async (incidentId: string, api: any, failedLog: any) => {
  try {
    const ai = getAIService();
    const result = await ai.analyzeFailureLogs({
      apiName: api.name,
      url: api.url,
      method: api.method,
      statusCode: failedLog.statusCode,
      responseTime: failedLog.responseTime,
      error: failedLog.error || 'N/A'
    });

    const incident = await db.incidents.findById(incidentId);
    if (incident) {
      const updatedTimeline = [
        ...incident.timeline,
        { event: `AI Observability diagnostics complete. Cascading failure stories archived.`, timestamp: new Date() }
      ];

      await db.incidents.findByIdAndUpdate(incidentId, {
        timeline: updatedTimeline,
        aiAnalysis: {
          rootCause: result.rootCause,
          explanation: result.explanation,
          recommendations: result.recommendations,
          severityScore: result.severityScore
        }
      });

      if (socketServer) {
        socketServer.emit('incident-updated', {
          incidentId,
          apiId: api._id,
          status: 'active',
          aiAnalysis: {
            rootCause: result.rootCause,
            explanation: result.explanation,
            recommendations: result.recommendations,
            severityScore: result.severityScore
          }
        });
      }
    }
  } catch (err: any) {
    console.error(`🚨 AI incident diagnosis failed: ${err.message}`);
  }
};

export const startMonitoringScheduler = async () => {
  console.log('⏰ Starting PulseGuard Monitoring Scheduler...');
  
  Object.keys(activeIntervals).forEach(key => {
    clearInterval(activeIntervals[key]);
    delete activeIntervals[key];
  });

  const apiList = await db.apis.find({ status: 'active' });
  
  apiList.forEach(api => {
    setupAPIMonitorJob(api);
  });
};

export const setupAPIMonitorJob = (api: any) => {
  if (activeIntervals[api._id]) {
    clearInterval(activeIntervals[api._id]);
  }

  pingAPI(api);

  const intervalMs = Math.max(api.interval || 30, 5) * 1000;
  
  activeIntervals[api._id] = setInterval(() => {
    pingAPI(api);
  }, intervalMs);

  console.log(`⏱️  Scheduled monitor job for [${api.name}] every ${api.interval}s.`);
};

export const stopAPIMonitorJob = (apiId: string) => {
  if (activeIntervals[apiId]) {
    clearInterval(activeIntervals[apiId]);
    delete activeIntervals[apiId];
    console.log(`⏹️  Stopped monitor job for API: ${apiId}.`);
  }
};
