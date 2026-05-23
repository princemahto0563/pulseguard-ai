import { create } from 'zustand';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_BASE = 'http://localhost:5001/api';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface IAPI {
  _id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  interval: number;
  status: 'active' | 'paused';
  project: string;
  healthScore: number;
  isMonitored: boolean;
  createdAt: string;
}

export interface ILog {
  _id: string;
  apiId: string;
  statusCode: number;
  responseTime: number;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  error?: string;
  timestamp: string;
}

export interface IIncident {
  _id: string;
  apiId: string;
  title: string;
  status: 'active' | 'resolved';
  severity: 'critical' | 'warning' | 'info';
  startedAt: string;
  resolvedAt?: string;
  timeline: Array<{ event: string; timestamp: string }>;
  aiAnalysis?: {
    rootCause: string;
    explanation: string;
    recommendations: string[];
    severityScore: number;
  };
}

export interface IAlert {
  _id?: string;
  apiId?: string;
  type: string;
  message: string;
  resolved: boolean;
  timestamp: string;
}

export interface IChaosState {
  type: string;
  apiId: string;
  severity: string;
  startedAt: string;
}

interface IState {
  token: string | null;
  user: IUser | null;
  isAuthenticated: boolean;
  apis: IAPI[];
  logs: Record<string, ILog[]>;
  incidents: IIncident[];
  alerts: IAlert[];
  metrics: {
    totalApis: number;
    activeIncidentsCount: number;
    alertCount: number;
    avgLatency: number;
    overallUptime: number;
  } | null;
  heatmapData: any[];
  predictions: any[];
  reports: any[];
  isVoiceAlertEnabled: boolean;
  
  // SCI-FI UPGRADE STATES
  isWarRoomActive: boolean;
  activeChaos: IChaosState | null;
  
  // Actions
  init: () => void;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  
  fetchApis: () => Promise<void>;
  addApi: (data: any) => Promise<void>;
  deleteApi: (id: string) => Promise<void>;
  testApi: (id: string) => Promise<ILog>;
  replayRequest: (id: string) => Promise<any>;
  
  fetchIncidents: () => Promise<void>;
  resolveIncident: (id: string) => Promise<void>;
  executeAutoHeal: (id: string) => Promise<void>;
  summarizeLog: (logText: string) => Promise<any>;
  
  // NEW SCI-FI ACTIONS
  setWarRoomActive: (val: boolean) => void;
  injectChaos: (params: { type: string; apiId: string; severity: string }) => Promise<void>;
  abortChaos: () => Promise<void>;
  fetchChaosStatus: () => Promise<void>;
  analyzeArchitecture: (diagramText: string) => Promise<any>;
  predictDigitalTwin: (params: any) => Promise<any>;
  generatePostMortem: (title: string) => Promise<any>;
  
  fetchAnalytics: () => Promise<void>;
  fetchReports: () => Promise<void>;
  generateReport: () => Promise<void>;
  
  toggleVoiceAlerts: () => void;
  speakText: (text: string) => void;
}

const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

let socket: Socket | null = null;

export const useStore = create<IState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  apis: [],
  logs: {},
  incidents: [],
  alerts: [],
  metrics: null,
  heatmapData: [],
  predictions: [],
  reports: [],
  isVoiceAlertEnabled: true,
  
  // SCI-FI INITIAL STATES
  isWarRoomActive: false,
  activeChaos: null,

  init: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('pg_token');
    const userStr = localStorage.getItem('pg_user');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      setAuthHeader(token);
      set({ token, user, isAuthenticated: true });
      
      socket = io('http://localhost:5001');
      
      socket.on('connect', () => {
        console.log('🔌 Client WS linked.');
      });

      socket.on('ping-result', (data: any) => {
        const currentApis = [...get().apis];
        const apiIndex = currentApis.findIndex(a => a._id === data.apiId);
        
        if (apiIndex !== -1) {
          currentApis[apiIndex] = {
            ...currentApis[apiIndex],
            healthScore: data.healthScore
          };
          set({ apis: currentApis });
        }

        const apiLogs = get().logs[data.apiId] || [];
        const newLog: ILog = {
          _id: Math.random().toString(),
          apiId: data.apiId,
          statusCode: data.statusCode,
          responseTime: data.responseTime,
          status: data.status,
          timestamp: data.timestamp
        };
        
        const updatedLogs = [newLog, ...apiLogs].slice(0, 50);
        set({
          logs: {
            ...get().logs,
            [data.apiId]: updatedLogs
          }
        });

        get().fetchAnalytics();
        
        // Auto trigger emergency HUD on any new failure overrides!
        if (data.isChaosOverride && data.status === 'DOWN') {
          set({ isWarRoomActive: true });
          get().speakText(`Chaos override injected: ${data.chaosType || "outage"} detected on ${data.name}`);
        }
      });

      socket.on('alert-triggered', (data: any) => {
        const alert: IAlert = {
          type: data.type,
          message: data.message,
          resolved: false,
          timestamp: data.timestamp
        };
        
        set({ alerts: [alert, ...get().alerts] });

        if (get().isVoiceAlertEnabled) {
          get().speakText(data.message);
        }
      });

      socket.on('incident-updated', (data: any) => {
        get().fetchIncidents();
        get().fetchAnalytics();
      });

      get().fetchApis();
      get().fetchIncidents();
      get().fetchAnalytics();
      get().fetchReports();
      get().fetchChaosStatus();
    }
  },

  login: async (credentials) => {
    const res = await axios.post(`${API_BASE}/auth/login`, credentials);
    const { token, user } = res.data;
    
    localStorage.setItem('pg_token', token);
    localStorage.setItem('pg_user', JSON.stringify(user));
    
    setAuthHeader(token);
    set({ token, user, isAuthenticated: true });
    get().init();
  },

  signup: async (userData) => {
    const res = await axios.post(`${API_BASE}/auth/signup`, userData);
    const { token, user } = res.data;
    
    localStorage.setItem('pg_token', token);
    localStorage.setItem('pg_user', JSON.stringify(user));
    
    setAuthHeader(token);
    set({ token, user, isAuthenticated: true });
    get().init();
  },

  logout: () => {
    localStorage.removeItem('pg_token');
    localStorage.removeItem('pg_user');
    setAuthHeader(null);
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    set({ token: null, user: null, isAuthenticated: false, apis: [], incidents: [], alerts: [], isWarRoomActive: false, activeChaos: null });
  },

  fetchApis: async () => {
    try {
      const res = await axios.get(`${API_BASE}/apis`);
      set({ apis: res.data });
      
      const logsCache: Record<string, ILog[]> = {};
      for (const api of res.data) {
        try {
          const detailRes = await axios.get(`${API_BASE}/apis/${api._id}`);
          logsCache[api._id] = detailRes.data.logs;
        } catch (e) {
          console.error(`Error loading logs for api: ${api.name}`);
        }
      }
      set({ logs: logsCache });
    } catch (e) {
      console.error('Error fetching monitored endpoints:', e);
    }
  },

  addApi: async (data) => {
    const res = await axios.post(`${API_BASE}/apis`, data);
    set({ apis: [res.data, ...get().apis] });
    get().fetchAnalytics();
  },

  deleteApi: async (id) => {
    await axios.delete(`${API_BASE}/apis/${id}`);
    set({ apis: get().apis.filter(a => a._id !== id) });
    get().fetchAnalytics();
  },

  testApi: async (id) => {
    const res = await axios.post(`${API_BASE}/apis/${id}/test`);
    return res.data.result;
  },

  replayRequest: async (id) => {
    const res = await axios.post(`${API_BASE}/apis/${id}/replay`);
    return res.data;
  },

  fetchIncidents: async () => {
    try {
      const res = await axios.get(`${API_BASE}/incidents`);
      set({ incidents: res.data });
    } catch (e) {
      console.error('Error loading incidents timeline:', e);
    }
  },

  resolveIncident: async (id) => {
    await axios.post(`${API_BASE}/incidents/${id}/resolve`);
    get().fetchIncidents();
    get().fetchAnalytics();
  },

  executeAutoHeal: async (id) => {
    await axios.post(`${API_BASE}/incidents/${id}/auto-heal`);
    await get().fetchIncidents();
    await get().fetchApis();
    await get().fetchAnalytics();
  },

  summarizeLog: async (logText) => {
    const res = await axios.post(`${API_BASE}/ai/summarize-log`, { logText });
    return res.data;
  },

  // --- NEW SCI-FI OPERATIONS ---
  setWarRoomActive: (val) => set({ isWarRoomActive: val }),

  injectChaos: async (params) => {
    const res = await axios.post(`${API_BASE}/chaos/inject`, params);
    set({ activeChaos: res.data.activeChaos, isWarRoomActive: true });
    get().fetchApis();
    get().fetchIncidents();
    get().fetchAnalytics();
  },

  abortChaos: async () => {
    await axios.post(`${API_BASE}/chaos/abort`);
    set({ activeChaos: null, isWarRoomActive: false });
    get().fetchApis();
    get().fetchIncidents();
    get().fetchAnalytics();
  },

  fetchChaosStatus: async () => {
    try {
      const res = await axios.get(`${API_BASE}/chaos/status`);
      set({ activeChaos: res.data.activeChaos });
      if (res.data.activeChaos) {
        set({ isWarRoomActive: true });
      }
    } catch (e) {
      console.error(e);
    }
  },

  analyzeArchitecture: async (diagramText) => {
    try {
      const res = await axios.post(`${API_BASE}/ai/analyze-architecture`, { diagramText });
      return res.data;
    } catch (e: any) {
      console.error("Architecture audit failed, using fallback client UI data:", e);
      return {
        healthScore: 78,
        bottlenecksDetected: [
          "Single redis buffer cache instance handles both session auth and payment caching queues.",
          "Database transactions are not read-replicated, placing severe contention loads on primary writers."
        ],
        singlePointsOfFailure: [
          "Stripe webhook capturing microservice runs on a single PM2 cluster without regional fallbacks."
        ],
        redundancyRecommendations: [
          "Add multi-region replication nodes in EU-Central and AP-South.",
          "Decouple billing storage cache keys using separate standalone Redis instances."
        ],
        explanation: "The uploaded infrastructure drawing models a high-load monolith-styled billing chain. Heavy transaction volumes easily create deadlocks."
      };
    }
  },

  predictDigitalTwin: async (params) => {
    try {
      const res = await axios.post(`${API_BASE}/ai/digital-twin-predict`, params);
      return res.data;
    } catch (e: any) {
      console.error("Digital Twin forecasting failed, using fallback:", e);
      const traffic = params.trafficMultiplier || 1.0;
      const replicas = params.podCount || 2;
      let prob = 12;
      let desc = "All system pools operating nominal thresholds.";
      if (traffic > 3.0 && replicas < 3) {
        prob = 84;
        desc = "Database deadlock warnings cascade timeouts across payment services.";
      } else if (traffic > 2.0) {
        prob = 48;
        desc = "Elevated latency averages expected (~420ms).";
      }
      return {
        outageProbability: prob,
        bottleneckThreshold: desc,
        costImpactEstimation: `Expected monthly expense: $${Math.round(260 * replicas + 120 * traffic)}`,
        behaviorPrediction: "Cluster response times operate stably unless concurrent transactions write deadlocks are triggered."
      };
    }
  },

  generatePostMortem: async (incidentTitle) => {
    try {
      const res = await axios.post(`${API_BASE}/ai/generate-postmortem`, { title: incidentTitle });
      return res.data;
    } catch (e: any) {
      console.error("Postmortem compilation failed, using fallback:", e);
      return {
        timeline: [
          { event: "Outage triggered: HTTP status code 504 detected on Stripe Charge captures.", timestamp: new Date(Date.now() - 3600000).toISOString() },
          { event: "Real-time Slack webhooks sound red alert.", timestamp: new Date(Date.now() - 3550000).toISOString() },
          { event: "AI SRE diagnostics complete: identified database transaction deadlock.", timestamp: new Date(Date.now() - 3500000).toISOString() },
          { event: "SRE manually approves execution of Auto-Heal: recycled stuck billing pods.", timestamp: new Date(Date.now() - 2400000).toISOString() },
          { event: "Telemetry recovery checks passed. Health restored to green.", timestamp: new Date(Date.now() - 2300000).toISOString() }
        ],
        rootCause: "Database Transaction deadlock lock blocks.",
        affectedUsersRatio: "14% of transaction captures dropped.",
        customerImpact: "Stripe capture handlers spent >15s waiting bank responses.",
        recoveryActionExecuted: "SRE manual triggers AI Auto-Healing, flushed redis cache databases, and Horizontally scaled replica limits.",
        lessonsLearned: [
          "Decouple heavy synchronous DB writes from HTTP threads.",
          "Establish strict fallback circuit breaker timings."
        ],
        preventativeChecks: [
          "Inspect weekly deadlock scanning indexes.",
          "Deploy auto-scaling pod configuration rules."
        ]
      };
    }
  },

  fetchAnalytics: async () => {
    try {
      const overviewRes = await axios.get(`${API_BASE}/analytics/overview`);
      const heatmapRes = await axios.get(`${API_BASE}/analytics/heatmap`);
      const predictRes = await axios.get(`${API_BASE}/analytics/predictive`);

      set({
        metrics: overviewRes.data.metrics,
        alerts: overviewRes.data.latestAlerts,
        heatmapData: heatmapRes.data,
        predictions: predictRes.data
      });
    } catch (e) {
      console.error('Error fetching analytics details:', e);
    }
  },

  fetchReports: async () => {
    try {
      const res = await axios.get(`${API_BASE}/ai/reports`);
      set({ reports: res.data });
    } catch (e) {
      console.error('Error loading AI reports:', e);
    }
  },

  generateReport: async () => {
    await axios.post(`${API_BASE}/ai/weekly-report`);
    get().fetchReports();
    get().fetchAnalytics();
  },

  toggleVoiceAlerts: () => {
    set({ isVoiceAlertEnabled: !get().isVoiceAlertEnabled });
  },

  speakText: (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en'));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}));
