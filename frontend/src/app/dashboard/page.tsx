"use client";

import { useStore } from "@/store/useStore";
import { 
  Activity, ShieldAlert, Clock, RefreshCw, Zap, Bot, ArrowUpRight, Play, Terminal 
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useState, useEffect } from "react";
import Link from "next/link";
import RegionMap from "@/components/RegionMap";
import CopilotDrawer from "@/components/CopilotDrawer";

export default function DashboardOverview() {
  const { apis, logs, incidents, metrics, fetchAnalytics, fetchIncidents, testApi } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchIncidents()]);
    setIsRefreshing(false);
  };

  const triggerManualTest = async (apiId: string) => {
    setTestingId(apiId);
    try {
      await testApi(apiId);
      await fetchAnalytics();
    } catch (e) {
      console.error(e);
    } finally {
      setTestingId(null);
    }
  };

  const getOverallChartData = () => {
    const allLogs: any[] = [];
    Object.keys(logs).forEach(apiId => {
      const apiLogs = logs[apiId] || [];
      allLogs.push(...apiLogs);
    });

    allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const slicedLogs = allLogs.slice(-15);
    
    return slicedLogs.map(log => {
      const api = apis.find(a => a._id === log.apiId);
      return {
        time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latency: log.responseTime,
        endpoint: api ? api.name : 'Unknown API',
        status: log.statusCode
      };
    });
  };

  const chartData = getOverallChartData();
  const activeIncidents = incidents.filter(i => i.status === 'active');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-8 relative z-10 font-mono text-[11px] scanner-line">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider font-sans">DevOps Command Center</h2>
          <p className="text-slate-400 text-xs font-sans">Live multi-region telemetry nodes, AI predictive overload scores, and auto-healing scripts triggers.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2.5 glass-panel text-[10px] font-bold font-mono text-slate-300 hover:text-white hover:border-indigo-500/50 flex items-center gap-2 rounded-xl transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          <span>{isRefreshing ? "SYNCING TELEMETRY..." : "FORCE TELEMETRY SYNC"}</span>
        </button>
      </div>

      {/* Futuristic Floating Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group glow-indigo transition-all">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Telemetry Nodes</span>
            <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div className="font-extrabold text-2xl text-slate-200">
            {metrics?.totalApis || apis.length}
            <span className="text-[10px] text-slate-500 ml-1.5 font-normal">NODES ACTIVE</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-2">100% metrics resolution</div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group transition-all hover:border-emerald-500/30">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Aggregate SLA Uptime</span>
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="font-extrabold text-2xl text-slate-200">
            {metrics?.overallUptime || 99.8}%
            <span className="text-[9px] text-emerald-400 ml-1.5 font-normal">▲ 0.1%</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-2">Target benchmark threshold: 99.5%</div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group transition-all hover:border-pink-500/30">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Latency Timing</span>
            <Clock className="w-5 h-5 text-pink-400" />
          </div>
          <div className="font-extrabold text-2xl text-slate-200">
            {metrics?.avgLatency || 142}ms
          </div>
          <div className="text-[9px] text-slate-500 mt-2">Healthy response timings verified</div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group transition-all hover:border-rose-500/30">
          <div className="flex items-center justify-between mb-3 text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Threat Count</span>
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
          </div>
          <div className="font-extrabold text-2xl text-slate-200">
            {activeIncidents.length}
            <span className={`text-[9px] ml-1.5 font-normal ${activeIncidents.length > 0 ? "text-rose-400 animate-pulse" : "text-slate-500"}`}>
              {activeIncidents.length > 0 ? "OUTAGES DETECTED" : "NOMINAL"}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 mt-2">Auto-healing configurations armed</div>
        </div>
      </div>

      {/* Main World Map & Response timing chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Region map */}
        <RegionMap />

        {/* Aggregate timimg charts */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Aggregate Latency Timings</h3>
              <p className="text-[10px] text-slate-500">Live response time timelines representing concurrent log streams.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-wider">
              AUTO UPDATING
            </span>
          </div>

          <div className="h-56 w-full text-[9px] pt-4">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                Awaiting incoming log telemetries...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" unit="ms" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090a0f', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="latency" name="Response Latency" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#latencyGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Monitored Endpoints & Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monitored APIs list */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Telemetry Node Details</h3>
              <p className="text-[10px] text-slate-500 font-sans">Active parameters checked on target nodes.</p>
            </div>
            <Link href="/dashboard/apis" className="px-3 py-1.5 glass-panel text-[9px] font-bold text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors flex items-center gap-1">
              <span>MANAGE NODES</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {apis.slice(0, 4).map((api) => {
              const apiLogs = logs[api._id] || [];
              const lastLog = apiLogs[0];
              const status = lastLog ? lastLog.status : 'UP';

              return (
                <div key={api._id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full status-dot-pulse ${
                      status === 'UP' ? 'bg-emerald-500' : status === 'DEGRADED' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <span>{api.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                          {api.method}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 max-w-sm truncate">
                        {api.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Response</div>
                      <div className="text-xs font-bold text-slate-200 font-mono">
                        {lastLog ? lastLog.responseTime : '...'}ms
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Stability</div>
                      <div className={`text-xs font-bold font-mono ${api.healthScore > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {api.healthScore}%
                      </div>
                    </div>

                    <button
                      onClick={() => triggerManualTest(api._id)}
                      disabled={testingId === api._id}
                      className="p-1.5 rounded bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:text-indigo-400 text-slate-400 transition-all"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incidents feed */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Active Outage Feed</h3>
            <p className="text-[10px] text-slate-500 font-sans">Unresolved failures requiring SRE auto-healing action.</p>
          </div>

          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {activeIncidents.length === 0 ? (
              <div className="py-12 text-center text-[10px] text-slate-500 font-mono flex flex-col items-center justify-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-1">
                  ✓
                </div>
                <span>All microservices are stable.</span>
              </div>
            ) : (
              activeIncidents.map((incident) => {
                const api = apis.find(a => a._id === incident.apiId);
                return (
                  <div 
                    key={incident._id}
                    className={`p-3.5 rounded-xl border ${
                      incident.severity === 'critical' 
                        ? 'bg-rose-500/5 border-rose-500/20' 
                        : 'bg-amber-500/5 border-amber-500/20'
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-200 leading-normal">
                          {incident.title}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          API: {api ? api.name : 'Unknown Target'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold uppercase font-mono">
                        {incident.severity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] pt-1">
                      <span>Started: {new Date(incident.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <Link href="/dashboard/incidents" className="text-indigo-400 hover:underline flex items-center gap-0.5 font-bold">
                        <span>Heal Panel</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Floating Copilot Drawer globally linked */}
      <CopilotDrawer />
    </div>
  );
}
