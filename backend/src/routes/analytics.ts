import { Router, Response } from 'express';
import { db } from '../services/dbService';
import { authenticateToken } from '../middleware/auth';
import { getAIService } from '../services/aiService';

const router = Router();

router.use(authenticateToken as any);

// GET /api/analytics/overview - Aggregated metrics
router.get('/overview', async (req: any, res: Response) => {
  try {
    const apisList = await db.apis.find();
    const logsList = await db.logs.find();
    const incidentsList = await db.incidents.find();
    const activeAlerts = await db.alerts.find({ resolved: false });

    const totalApis = apisList.length;
    const activeIncidentsCount = incidentsList.filter(i => i.status === 'active').length;
    const alertCount = activeAlerts.length;

    // Latency averages
    const avgLatency = Math.round(
      logsList.reduce((acc, curr) => acc + curr.responseTime, 0) / Math.max(logsList.length, 1)
    );

    // Uptime percentage
    const totalPings = logsList.length;
    const successPings = logsList.filter(l => l.status === 'UP').length;
    const uptimePercentage = Number(((successPings / Math.max(totalPings, 1)) * 100).toFixed(2));

    return res.status(200).json({
      metrics: {
        totalApis,
        activeIncidentsCount,
        alertCount,
        avgLatency,
        overallUptime: uptimePercentage
      },
      latestAlerts: activeAlerts.slice(0, 5),
      activeIncidents: incidentsList.filter(i => i.status === 'active')
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/heatmap - Root cause bottleneck heatmap matrix
router.get('/heatmap', async (req: any, res: Response) => {
  try {
    const apisList = await db.apis.find();
    const incidentsList = await db.incidents.find();

    // Map each api to count of outages by category
    const heatmap = apisList.map(api => {
      const apiIncidents = incidentsList.filter(i => i.apiId.toString() === api._id.toString());
      
      const counts = {
        timeouts: 0,
        dbLocks: 0,
        authErrors: 0,
        other: 0
      };

      apiIncidents.forEach(inc => {
        const root = inc.aiAnalysis?.rootCause?.toLowerCase() || '';
        if (root.includes('timeout') || root.includes('gateway') || root.includes('network')) {
          counts.timeouts++;
        } else if (root.includes('db') || root.includes('database') || root.includes('lock') || root.includes('deadlock')) {
          counts.dbLocks++;
        } else if (root.includes('auth') || root.includes('expired') || root.includes('credential')) {
          counts.authErrors++;
        } else {
          counts.other++;
        }
      });

      return {
        apiId: api._id,
        name: api.name,
        project: api.project,
        data: [
          { category: 'Network Timeouts', value: counts.timeouts },
          { category: 'Database Deadlocks', value: counts.dbLocks },
          { category: 'Auth Violations', value: counts.authErrors },
          { category: 'Unhandled Errors', value: counts.other }
        ]
      };
    });

    return res.status(200).json(heatmap);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/predictive - AI Outage Risk Predictions
router.get('/predictive', async (req: any, res: Response) => {
  try {
    const apisList = await db.apis.find();
    const ai = getAIService();
    const predictions = [];

    for (const api of apisList) {
      const recentLogs = await db.logs.find({ apiId: api._id, limit: 10 });
      const risk = await ai.predictOutageRisk(api, recentLogs);
      
      predictions.push({
        apiId: api._id,
        name: api.name,
        url: api.url,
        project: api.project,
        ...risk
      });
    }

    return res.status(200).json(predictions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
