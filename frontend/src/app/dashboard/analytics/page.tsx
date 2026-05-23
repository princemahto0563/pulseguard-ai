"use client";

import { useStore } from "@/store/useStore";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area } from "recharts";
import { 
  BarChart3, RefreshCw, AlertTriangle, ShieldCheck, Thermometer, Info 
} from "lucide-react";
import { useEffect, useState } from "react";

export default function TelemetryCharts() {
  const { apis, logs, heatmapData, predictions, fetchAnalytics } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSync = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
  };

  // Restructure Heatmap data for stacked bar chart representation
  const getFormattedHeatmap = () => {
    return heatmapData.map(h => {
      const counts: Record<string, number> = {};
      h.data.forEach((d: any) => {
        counts[d.category] = d.value;
      });
      return {
        name: h.name,
        'Network Timeouts': counts['Network Timeouts'] || 0,
        'Database Deadlocks': counts['Database Deadlocks'] || 0,
        'Auth Violations': counts['Auth Violations'] || 0,
        'Unhandled Errors': counts['Unhandled Errors'] || 0,
      };
    });
  };

  const formattedHeatmap = getFormattedHeatmap();

  return (
    <div className="space-y-8 relative z-10">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Telemetry & Bottlenecks</h2>
          <p className="text-slate-400 text-sm">Visualize error category densities, evaluate AI predicted outages, and audit performance.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={isRefreshing}
          className="px-4 py-2.5 glass-panel text-xs font-bold font-mono text-slate-300 hover:text-white hover:border-indigo-500/50 flex items-center gap-2 rounded-xl transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          <span>{isRefreshing ? "SYNCING ANALYTICS..." : "SYNC ANALYTICS"}</span>
        </button>
      </div>

      {/* Outage Risk Predictions Row */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Thermometer className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">AI Predictive Failure Detection Risks</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {predictions.length === 0 ? (
            <div className="col-span-full glass-panel py-8 text-center text-xs text-slate-500 font-mono">
              Running background predictive threat modeling assessments...
            </div>
          ) : (
            predictions.map((p) => {
              const score = p.riskScore || 5;
              const isHigh = score > 75;
              const isMed = score > 40 && score <= 75;

              return (
                <div 
                  key={p.apiId} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isHigh 
                      ? 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-500/5' 
                      : isMed 
                      ? 'bg-amber-500/5 border-amber-500/20' 
                      : 'glass-panel'
                  } space-y-4`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{p.name}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-slate-400">
                        {p.project}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-mono">RISK SCORE</div>
                      <div className={`text-lg font-black font-mono ${
                        isHigh ? 'text-rose-400 animate-pulse' : isMed ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {score}%
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] leading-relaxed text-slate-300 font-light flex gap-2">
                    <Info className={`w-4 h-4 shrink-0 ${isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-indigo-400'}`} />
                    <span>{p.prediction}</span>
                  </div>

                  {/* Visual risk bar gauge */}
                  <div className="space-y-1">
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>STABLE BASELINE</span>
                      <span>{isHigh ? 'OUTAGE DANGER' : 'NOMINAL'}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottlenecks Heatmap Area & Performance Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Stacked Density Bottlenecks Heatmap */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Root Cause Density Heatmap</h3>
            <p className="text-xs text-slate-500">Visual matrix tracking frequent failure groups and recurring bottlenecks by target.</p>
          </div>

          <div className="h-80 w-full font-mono text-[10px]">
            {formattedHeatmap.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500">
                Aggregating incident bottleneck history...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedHeatmap} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#090a0f', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Bar dataKey="Network Timeouts" stackId="a" fill="#6366f1" />
                  <Bar dataKey="Database Deadlocks" stackId="a" fill="#a855f7" />
                  <Bar dataKey="Auth Violations" stackId="a" fill="#ec4899" />
                  <Bar dataKey="Unhandled Errors" stackId="a" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Col: Health grids & performance consistency explanation */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-200">Stability Audit Check</h3>
            <p className="text-xs text-slate-500">Calculated metrics auditing transaction boundaries.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">Uptime Grade: A+</div>
                <p className="text-[10px] text-slate-500 leading-normal font-light">Global endpoints maintain continuous SLA criteria.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">Queue Latency: 92ms</div>
                <p className="text-[10px] text-slate-500 leading-normal font-light">Mongoose connection buffers operating comfortably.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-slate-400 font-mono leading-relaxed font-light">
              <div className="text-indigo-400 font-bold mb-1">🔍 TELEMETRY ANALYSIS SUMMARY:</div>
              Our systems recorded 1 critical outage cluster in Stripe capture microservices. Active GPU inference endpoints (AI Recommendations) exhibit elevated timings average (avg 612ms), suggesting caching thresholds must be set.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
