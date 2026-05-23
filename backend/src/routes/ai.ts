import { Router, Response } from 'express';
import { db } from '../services/dbService';
import { authenticateToken } from '../middleware/auth';
import { getAIService } from '../services/aiService';

const router = Router();

router.use(authenticateToken as any);

// POST /api/ai/chat - AI Assistant Chatbot Terminal
router.post('/chat', async (req: any, res: Response) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message payload is required.' });
  }

  try {
    const apisList = await db.apis.find();
    const activeIncidents = await db.incidents.find({ status: 'active' });
    const alerts = await db.alerts.find({ resolved: false });
    
    const contextTelemetry = {
      monitoredEndpointsCount: apisList.length,
      endpointsHealth: apisList.map(a => ({ name: a.name, healthScore: a.healthScore, status: a.status, url: a.url })),
      activeIncidents: activeIncidents.map(i => ({ title: i.title, severity: i.severity, startedAt: i.startedAt })),
      unresolvedAlertsCount: alerts.length
    };

    const ai = getAIService();
    const reply = await ai.chatAssistant(message, [contextTelemetry]);
    
    return res.status(200).json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/weekly-report - Generate executive AI Weekly Report
router.post('/weekly-report', async (req: any, res: Response) => {
  try {
    const apisList = await db.apis.find();
    const logsList = await db.logs.find();
    const incidentsList = await db.incidents.find();

    const totalApis = apisList.length;
    const criticalOutages = incidentsList.filter(i => i.severity === 'critical').length;
    
    const avgLatency = Math.round(
      logsList.reduce((acc, curr) => acc + curr.responseTime, 0) / Math.max(logsList.length, 1)
    );
    const upLogs = logsList.filter(l => l.status === 'UP').length;
    const overallUptime = Number(((upLogs / Math.max(logsList.length, 1)) * 100).toFixed(2));

    const ai = getAIService();
    const reportData = await ai.generateWeeklyReport({
      totalApis,
      overallUptime,
      averageLatency: avgLatency,
      criticalOutages
    });

    const report = await db.reports.create({
      title: `AI Weekly Performance Audit - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      type: 'weekly',
      summary: reportData.summary,
      metrics: {
        totalApis,
        overallUptime,
        averageLatency: avgLatency,
        criticalOutages
      },
      recommendations: reportData.recommendations
    });

    return res.status(201).json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/reports - Get all generated weekly/incident reports
router.get('/reports', async (req: any, res: Response) => {
  try {
    const reportsList = await db.reports.find();
    return res.status(200).json(reportsList);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/summarize-log - New AI Log Summarizer
router.post('/summarize-log', async (req: any, res: Response) => {
  const { logText } = req.body;
  if (!logText) {
    return res.status(400).json({ error: 'Raw logText parameter is required.' });
  }

  try {
    const ai = getAIService();
    const result = await ai.summarizeLog(logText);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/auto-healing - Get healing suggestions for incident
router.get('/auto-healing', async (req: any, res: Response) => {
  const statusCode = Number(req.query.statusCode) || 500;
  const errorMsg = String(req.query.errorMsg || 'Database deadlock exception');

  try {
    const ai = getAIService();
    const result = await ai.getAutoHealingSuggestions(statusCode, errorMsg);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/analyze-architecture - Analyze infrastructure diagrams / Mermaid text
router.post('/analyze-architecture', async (req: any, res: Response) => {
  const { diagramText } = req.body;
  if (!diagramText) {
    return res.status(400).json({ error: 'diagramText parameter is required.' });
  }

  try {
    const ai = getAIService();
    const result = await ai.analyzeArchitecture(diagramText);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/digital-twin-predict - Forecast traffic load bottlenecks
router.post('/digital-twin-predict', async (req: any, res: Response) => {
  const { trafficMultiplier, podCount, cachePolicy } = req.body;

  try {
    const ai = getAIService();
    const result = await ai.predictDigitalTwin({
      trafficMultiplier: Number(trafficMultiplier) || 1.0,
      podCount: Number(podCount) || 2,
      cachePolicy: String(cachePolicy || 'disabled')
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/generate-postmortem - Compile a complete failure story postmortem
router.post('/generate-postmortem', async (req: any, res: Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'incidentTitle (title) parameter is required.' });
  }

  try {
    const ai = getAIService();
    const result = await ai.generatePostMortem(title);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
