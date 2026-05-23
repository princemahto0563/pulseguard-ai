import mongoose from 'mongoose';
import { APIModel, IAPI } from '../models/API';
import { UserModel, IUser } from '../models/User';
import { MonitoringLogModel, IMonitoringLog } from '../models/MonitoringLog';
import { IncidentModel, IIncident } from '../models/Incident';
import { AlertModel, IAlert } from '../models/Alert';
import { TeamModel, ITeam } from '../models/Team';
import { AIReportModel, IAIReport } from '../models/AIReport';
import bcrypt from 'bcryptjs';

// --- IN-MEMORY DATA STORAGE (Fallback when MOCK_DB=true) ---
let users: any[] = [];
let apis: any[] = [];
let logs: any[] = [];
let incidents: any[] = [];
let alerts: any[] = [];
let teams: any[] = [];
let reports: any[] = [];

// Helper to check mock
const isMock = () => process.env.MOCK_DB === 'true';

// Helper to generate IDs
const newId = () => new mongoose.Types.ObjectId().toString();

export const seedMockData = async () => {
  console.log('🌱 Pre-populating seed data for immediate demonstration...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const defaultUser = {
    _id: newId(),
    name: 'PulseGuard Admin',
    email: 'admin@pulseguard.ai',
    password: hashedPassword,
    role: 'admin' as const,
    createdAt: new Date()
  };

  const mockApis: any[] = [
    {
      _id: newId(),
      name: 'Stripe Payment Gateway',
      url: 'https://api.stripe.com/v3/charges',
      method: 'POST' as const,
      interval: 30,
      status: 'active' as const,
      project: 'E-Commerce Platform',
      healthScore: 98,
      isMonitored: true,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      _id: newId(),
      name: 'Auth Gateway',
      url: 'https://auth.pulseguard.ai/oauth/token',
      method: 'POST' as const,
      interval: 15,
      status: 'active' as const,
      project: 'Core Platform',
      healthScore: 100,
      isMonitored: true,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      _id: newId(),
      name: 'User Profile Sync',
      url: 'https://api.pulseguard.ai/v1/users/profile',
      method: 'GET' as const,
      interval: 60,
      status: 'active' as const,
      project: 'Core Platform',
      healthScore: 99,
      isMonitored: true,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      _id: newId(),
      name: 'AI Recommendations API',
      url: 'https://ai.pulseguard.ai/v2/recommend',
      method: 'GET' as const,
      interval: 45,
      status: 'active' as const,
      project: 'Marketing Hub',
      healthScore: 84,
      isMonitored: true,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      _id: newId(),
      name: 'Inventory Database API',
      url: 'https://db-core.internal/v1/inventory',
      method: 'GET' as const,
      interval: 30,
      status: 'active' as const,
      project: 'E-Commerce Platform',
      healthScore: 91,
      isMonitored: true,
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Generate 24 hours of response logs for each API
  const mockLogs: any[] = [];
  const mockAlerts: any[] = [];
  const mockIncidents: any[] = [];

  mockApis.forEach(api => {
    const isAi = api.name.includes('AI');
    const isPayment = api.name.includes('Stripe');
    const isDb = api.name.includes('Inventory');

    for (let h = 24; h >= 0; h--) {
      const time = new Date(Date.now() - h * 3600000 - Math.random() * 600000);
      
      let latency = Math.floor(Math.random() * 50) + 50; // default 50-100ms
      let code = 200;
      let status: 'UP' | 'DOWN' | 'DEGRADED' = 'UP';
      let error = '';

      if (isAi) {
        latency = Math.floor(Math.random() * 300) + 600; // high default latency
        if (h === 4 || h === 5) {
          latency = Math.floor(Math.random() * 1200) + 1500; // latency spike
          status = 'DEGRADED';
        }
      } else if (isPayment) {
        latency = Math.floor(Math.random() * 100) + 120;
        if (h === 12) {
          code = 504;
          status = 'DOWN';
          error = 'Gateway Timeout from bank endpoints';
        }
      } else if (isDb) {
        latency = Math.floor(Math.random() * 80) + 70;
        if (h === 18 || h === 19) {
          code = 500;
          status = 'DOWN';
          error = 'Deadlock detected: too many active transactions';
        }
      }

      mockLogs.push({
        _id: newId(),
        apiId: api._id,
        statusCode: code,
        responseTime: latency,
        status,
        error,
        timestamp: time
      });
    }
  });

  // Create an incident for the Stripe outage
  const stripeApi = mockApis[0];
  const stripeIncidentId = newId();
  mockIncidents.push({
    _id: stripeIncidentId,
    apiId: stripeApi._id,
    title: 'Stripe Gateway Timeout Outage',
    status: 'resolved',
    severity: 'critical',
    startedAt: new Date(Date.now() - 12 * 3600000),
    resolvedAt: new Date(Date.now() - 12 * 3600000 + 45 * 60000), // lasted 45 mins
    timeline: [
      { event: 'Downtime Detected (Status Code: 504)', timestamp: new Date(Date.now() - 12 * 3600000) },
      { event: 'Auto-Triggered System Alert Broadcasted', timestamp: new Date(Date.now() - 12 * 3600000 + 30000) },
      { event: 'AI Diagnostics Completed & Root Cause Identified', timestamp: new Date(Date.now() - 12 * 3600000 + 90000) },
      { event: 'Recovery Detected. Uptime restored to 100%', timestamp: new Date(Date.now() - 12 * 3600000 + 45 * 60000) }
    ],
    aiAnalysis: {
      rootCause: 'Third-Party Webhook Timeout / Bank API Gateway Congestion',
      explanation: 'Stripe POST requests timed out (504 Gateway Timeout) on downstream card acquisition servers. The payment capture handler spent over 15s waiting for bank response before dropping.',
      recommendations: [
        'Implement an idempotent retry queue with exponential backoff.',
        'Apply a circuit breaker with 5s timeout fallback on Stripe charges.'
      ],
      severityScore: 92
    },
    createdAt: new Date(Date.now() - 12 * 3600000)
  });

  // Create an active incident for AI recommendations latency spike
  const aiApi = mockApis[3];
  const aiIncidentId = newId();
  mockIncidents.push({
    _id: aiIncidentId,
    apiId: aiApi._id,
    title: 'AI Recommendation Latency Spiked (> 1500ms)',
    status: 'active',
    severity: 'warning',
    startedAt: new Date(Date.now() - 4 * 3600000),
    timeline: [
      { event: 'Latency Spike Alert (> 1500ms)', timestamp: new Date(Date.now() - 4 * 3600000) },
      { event: 'Slack Integration Paged Team', timestamp: new Date(Date.now() - 4 * 3600000 + 60000) },
      { event: 'AI Risk Engine Predicted Potential Crash State', timestamp: new Date(Date.now() - 4 * 3600000 + 120000) }
    ],
    aiAnalysis: {
      rootCause: 'Inefficient LLM Prompt Caching & High Concurrent Tokens Usage',
      explanation: 'The recommendations model payload size increased by 400%, leading to an increased inference overhead on GPUs and causing response queues to degrade rapidly.',
      recommendations: [
        'Cache recommendation weights using Redis with a 5-minute TTL.',
        'Batch batch-infer tokens or paginate recommendation queries.'
      ],
      severityScore: 74
    },
    createdAt: new Date(Date.now() - 4 * 3600000)
  });

  // Build some active alerts
  mockAlerts.push({
    _id: newId(),
    apiId: aiApi._id,
    type: 'latency',
    message: 'Latency exceeded SLA threshold (900ms) on AI Recommendations API',
    resolved: false,
    timestamp: new Date(Date.now() - 4 * 3600000)
  });
  
  mockAlerts.push({
    _id: newId(),
    apiId: stripeApi._id,
    type: 'downtime',
    message: 'Downtime detected on Stripe Payment Gateway - Returned 504 Gateway Timeout',
    resolved: true,
    timestamp: new Date(Date.now() - 12 * 3600000)
  });

  const mockTeam = {
    _id: newId(),
    name: 'PulseGuard Core Team',
    members: [{ userId: defaultUser._id, role: 'owner' }],
    projects: ['Core Platform', 'E-Commerce Platform', 'Marketing Hub'],
    createdAt: new Date()
  };

  const mockWeeklyReport = {
    _id: newId(),
    title: 'AI Weekly Performance Audit Report - May 2026',
    type: 'weekly' as const,
    summary: 'Across all 5 services, PulseGuard AI registered a solid 98.42% aggregate uptime. Our payment systems recovered seamlessly from a third-party gateway dropout, while the newly launched AI Recommendation APIs exhibit high latencies (avg 820ms) under peak loads, warranting local model caching policies.',
    metrics: {
      totalApis: 5,
      overallUptime: 98.42,
      averageLatency: 231,
      criticalOutages: 1
    },
    recommendations: [
      'Upgrade redis memory pool for user endpoints to decrease average auth timings from 120ms to 40ms.',
      'Refine Stripe endpoint timeout parameters to trigger local cache fallback after 3000ms.'
    ],
    generatedAt: new Date()
  };

  if (isMock()) {
    users = [defaultUser];
    apis = mockApis;
    logs = mockLogs;
    incidents = mockIncidents;
    alerts = mockAlerts;
    teams = [mockTeam];
    reports = [mockWeeklyReport];
    console.log('✅ In-Memory Data seeded successfully.');
  } else {
    try {
      // Clean DB collections and seed them
      await UserModel.deleteMany({});
      await APIModel.deleteMany({});
      await MonitoringLogModel.deleteMany({});
      await IncidentModel.deleteMany({});
      await AlertModel.deleteMany({});
      await TeamModel.deleteMany({});
      await AIReportModel.deleteMany({});

      await UserModel.create(defaultUser);
      await APIModel.create(mockApis);
      await MonitoringLogModel.create(mockLogs);
      await IncidentModel.create(mockIncidents);
      await AlertModel.create(mockAlerts);
      await TeamModel.create(mockTeam);
      await AIReportModel.create(mockWeeklyReport);
      console.log('🔌 MongoDB Database seeded successfully.');
    } catch (e: any) {
      console.error(`🚨 MongoDB seeding failed, loading seed inside Mock memory arrays instead. Error: ${e.message}`);
      process.env.MOCK_DB = 'true';
      users = [defaultUser];
      apis = mockApis;
      logs = mockLogs;
      incidents = mockIncidents;
      alerts = mockAlerts;
      teams = [mockTeam];
      reports = [mockWeeklyReport];
    }
  }
};

// --- DATA ACCESS METHODS WRAPPER ---
export const db = {
  users: {
    find: async () => isMock() ? users : UserModel.find(),
    findOne: async (query: any) => {
      if (isMock()) {
        return users.find(u => u.email === query.email || u._id === query._id) || null;
      }
      return UserModel.findOne(query);
    },
    create: async (data: any) => {
      const u = { _id: newId(), createdAt: new Date(), ...data };
      if (isMock()) {
        users.push(u);
        return u;
      }
      return UserModel.create(data);
    }
  },

  apis: {
    find: async (query: any = {}) => {
      if (isMock()) {
        let list = [...apis];
        if (query.project) list = list.filter(a => a.project === query.project);
        return list;
      }
      return APIModel.find(query);
    },
    findById: async (id: string) => {
      if (isMock()) return apis.find(a => a._id === id) || null;
      return APIModel.findById(id);
    },
    create: async (data: any) => {
      const a = { _id: newId(), healthScore: 100, isMonitored: true, status: 'active', createdAt: new Date(), ...data };
      if (isMock()) {
        apis.push(a);
        return a;
      }
      return APIModel.create(data);
    },
    findByIdAndUpdate: async (id: string, update: any) => {
      if (isMock()) {
        const index = apis.findIndex(a => a._id === id);
        if (index !== -1) {
          apis[index] = { ...apis[index], ...update };
          return apis[index];
        }
        return null;
      }
      return APIModel.findByIdAndUpdate(id, update, { new: true });
    },
    findByIdAndDelete: async (id: string) => {
      if (isMock()) {
        const index = apis.findIndex(a => a._id === id);
        if (index !== -1) {
          const removed = apis[index];
          apis.splice(index, 1);
          return removed;
        }
        return null;
      }
      return APIModel.findByIdAndDelete(id);
    }
  },

  logs: {
    find: async (query: any = {}) => {
      if (isMock()) {
        let list = [...logs];
        if (query.apiId) {
          list = list.filter(l => l.apiId.toString() === query.apiId.toString());
        }
        // sort by timestamp descending
        list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        if (query.limit) {
          list = list.slice(0, query.limit);
        }
        return list;
      }
      const mQuery = { ...query };
      delete mQuery.limit;
      let q = MonitoringLogModel.find(mQuery).sort({ timestamp: -1 });
      if (query.limit) {
        q = q.limit(query.limit);
      }
      return q;
    },
    create: async (data: any) => {
      const l = { _id: newId(), timestamp: new Date(), ...data };
      if (isMock()) {
        logs.push(l);
        // keep logs size in check
        if (logs.length > 500) logs.shift();
        return l;
      }
      return MonitoringLogModel.create(data);
    }
  },

  incidents: {
    find: async (query: any = {}) => {
      if (isMock()) {
        let list = [...incidents];
        if (query.status) list = list.filter(i => i.status === query.status);
        list.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
        return list;
      }
      return IncidentModel.find(query).sort({ startedAt: -1 });
    },
    findById: async (id: string) => {
      if (isMock()) return incidents.find(i => i._id === id) || null;
      return IncidentModel.findById(id);
    },
    create: async (data: any) => {
      const inc = { _id: newId(), status: 'active', timeline: data.timeline || [{ event: 'Outage Detected', timestamp: new Date() }], createdAt: new Date(), ...data };
      if (isMock()) {
        incidents.push(inc);
        return inc;
      }
      return IncidentModel.create(data);
    },
    findByIdAndUpdate: async (id: string, update: any) => {
      if (isMock()) {
        const index = incidents.findIndex(i => i._id === id);
        if (index !== -1) {
          incidents[index] = { ...incidents[index], ...update };
          return incidents[index];
        }
        return null;
      }
      return IncidentModel.findByIdAndUpdate(id, update, { new: true });
    }
  },

  alerts: {
    find: async (query: any = {}) => {
      if (isMock()) {
        let list = [...alerts];
        if (query.resolved !== undefined) list = list.filter(a => a.resolved === query.resolved);
        list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return list;
      }
      return AlertModel.find(query).sort({ timestamp: -1 });
    },
    create: async (data: any) => {
      const a = { _id: newId(), resolved: false, timestamp: new Date(), ...data };
      if (isMock()) {
        alerts.push(a);
        return a;
      }
      return AlertModel.create(data);
    },
    updateMany: async (query: any, update: any) => {
      if (isMock()) {
        alerts.forEach(a => {
          if (a.apiId.toString() === query.apiId?.toString() && !a.resolved) {
            a.resolved = update.resolved;
          }
        });
        return { modifiedCount: alerts.length };
      }
      return AlertModel.updateMany(query, update);
    }
  },

  teams: {
    find: async () => isMock() ? teams : TeamModel.find(),
    findOne: async (query: any) => {
      if (isMock()) return teams[0] || null;
      return TeamModel.findOne(query);
    },
    create: async (data: any) => {
      const t = { _id: newId(), createdAt: new Date(), ...data };
      if (isMock()) {
        teams.push(t);
        return t;
      }
      return TeamModel.create(data);
    },
    findOneAndUpdate: async (query: any, update: any) => {
      if (isMock()) {
        if (teams.length > 0) {
          teams[0] = { ...teams[0], ...update };
          return teams[0];
        }
        return null;
      }
      return TeamModel.findOneAndUpdate(query, update, { new: true });
    }
  },

  reports: {
    find: async () => isMock() ? reports : AIReportModel.find().sort({ generatedAt: -1 }),
    create: async (data: any) => {
      const r = { _id: newId(), generatedAt: new Date(), ...data };
      if (isMock()) {
        reports.push(r);
        return r;
      }
      return AIReportModel.create(data);
    }
  }
};
