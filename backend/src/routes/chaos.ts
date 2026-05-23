import { Router, Response } from 'express';
import { db } from '../services/dbService';
import { authenticateToken } from '../middleware/auth';
import { pingAPI } from '../services/monitorService';

const router = Router();
let activeChaos: any | null = null;

router.use(authenticateToken as any);

export const getActiveChaos = () => activeChaos;

// POST /api/chaos/inject - Inject simulated microservice disaster
router.post('/inject', async (req: any, res: Response) => {
  const { type, apiId, severity } = req.body;
  if (!type || !apiId) {
    return res.status(400).json({ error: 'Disaster type and Target apiId are required.' });
  }

  try {
    const api = await db.apis.findById(apiId);
    if (!api) return res.status(404).json({ error: 'API endpoint target not found' });

    console.log(`🔥 [CHAOS ENGINE] Injecting disaster: [${type}] on API: [${api.name}]`);

    activeChaos = {
      type,
      apiId,
      severity: severity || 'critical',
      startedAt: new Date()
    };

    // Force a ping run with injected chaos timing
    // In monitorService, we'll check if getActiveChaos() has this apiId, and override its result!
    // Let's force execute pings now to show immediate update over sockets
    await pingAPI(api);

    return res.status(200).json({
      message: `Disaster disaster simulation: [${type}] successfully injected into [${api.name}]. RED ALERT activated.`,
      activeChaos
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/chaos/abort - Clear active disaster simulations
router.post('/abort', async (req: any, res: Response) => {
  if (!activeChaos) {
    return res.status(400).json({ error: 'No active chaos simulations running.' });
  }

  try {
    const api = await db.apis.findById(activeChaos.apiId);
    console.log(`💚 [CHAOS ENGINE] Aborting active disaster simulation...`);
    activeChaos = null;

    if (api) {
      // Force immediate recovery ping
      await pingAPI(api);
    }

    return res.status(200).json({
      message: 'Active disaster simulation aborted. Telemetry grids returned to nominal baseline.',
      activeChaos: null
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/chaos/status - Get current active chaos status
router.get('/status', async (req: any, res: Response) => {
  return res.status(200).json({ activeChaos });
});

export default router;
