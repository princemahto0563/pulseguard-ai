"use client";

import { useStore, IIncident } from "@/store/useStore";
import { useState, useEffect } from "react";
import { 
  ShieldAlert, Activity, Cpu, Bot, RefreshCw, Zap, CheckCircle, 
  ArrowRight, AlertTriangle, Play 
} from "lucide-react";
import Link from "next/link";
import TopoMap from "@/components/TopoMap";

export default function WarRoomDashboard() {
  const { incidents, apis, executeAutoHeal, isWarRoomActive, setWarRoomActive } = useStore();
  const [healingId, setHealingId] = useState<string | null>(null);
  const [radarDeg, setRadarDeg] = useState(0);

  // Active radar scanner animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarDeg(prev => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const criticalIncident = activeIncidents.find(i => i.severity === 'critical') || activeIncidents[0];

  const handleAutoHeal = async (incidentId: string) => {
    setHealingId(incidentId);
    try {
      await executeAutoHeal(incidentId);
      alert("AI Auto-Healing execution complete. Telemetry recovery checks passed. System stabilized.");
    } catch (e) {
      console.error(e);
    } finally {
      setHealingId(null);
    }
  };

  return (
    <div className={`space-y-8 relative z-10 font-mono text-[11px] ${isWarRoomActive ? "red-alert-hud" : ""}`}>
      {/* Top Banner alert */}
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glow-rose">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
          <div>
            <h2 className="text-sm font-black text-rose-400 uppercase tracking-widest">RED ALERT PROTOCOL ACTIVE</h2>
            <p className="text-[10px] text-slate-400">Emergency Incident Command center triggered. Outage cascades detected.</p>
          </div>
        </div>

        <button
          onClick={() => setWarRoomActive(!isWarRoomActive)}
          className="px-3.5 py-2 glass-panel text-[9px] font-bold text-rose-400 border-rose-500/30 hover:border-rose-500/50 rounded-xl"
        >
          TOGGLE RED ALERT HUD
        </button>
      </div>

      {/* Grid: 3D map & Propagation chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: 3D topographies */}
        <div className="xl:col-span-2">
          <TopoMap />
        </div>

        {/* Right Col: sci-fi radar status */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden h-96 flex flex-col justify-between">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none radar-sweep" />
          
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Telemetry Radar sweep</h3>
            <p className="text-[10px] text-rose-500 font-bold animate-pulse">CASCADING BLOCK SENSING: WARNING</p>
          </div>

          {/* Visual radar circular display */}
          <div className="flex-1 flex items-center justify-center relative py-6">
            <div className="w-40 h-40 rounded-full border border-rose-500/25 relative flex items-center justify-center">
              {/* Radar sweep lines */}
              <div 
                className="absolute inset-0 rounded-full border-t border-rose-500/40 opacity-40"
                style={{ transform: `rotate(${radarDeg}deg)` }}
              />
              <div className="w-28 h-28 rounded-full border border-rose-500/10" />
              <div className="w-16 h-16 rounded-full border border-rose-500/5" />
              {/* Pulses targets */}
              <span className="absolute top-10 left-12 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute bottom-12 right-10 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping [animation-delay:1s]" />
              <span className="text-[9px] text-rose-400 font-bold uppercase tracking-widest animate-pulse font-mono">TARGET SCAN</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-950/15 border border-rose-500/15 text-[10px] leading-relaxed text-slate-300">
            <div className="text-rose-400 font-bold mb-0.5">💥 CASCADING FAILURE story:</div>
            Auth Service latency spike created bottleneck queues → blocking Stripe captured transaction writes (504 gateway timeout) on primary Database writers.
          </div>
        </div>
      </div>

      {/* Incident details & AI Auto-Healing options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incident Info */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Diagnostics logs & timelines</h3>
          </div>

          {criticalIncident ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event traces */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Outage Timeline Trace</div>
                <div className="relative border-l border-rose-500/20 pl-4 ml-2 space-y-4">
                  {criticalIncident.timeline?.map((evt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-200">{evt.event}</p>
                        <span className="text-[9px] text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI diagnostic report */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">AI Incident Commander report</div>
                {criticalIncident.aiAnalysis ? (
                  <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                    <div className="flex items-center gap-1 text-rose-400 text-xs font-bold font-mono">
                      <Bot className="w-4 h-4 animate-bounce" />
                      <span>AI DIAGNOSIS COMPLETED</span>
                    </div>
                    <div className="font-bold text-slate-200">{criticalIncident.aiAnalysis.rootCause}</div>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-sans font-light">{criticalIncident.aiAnalysis.explanation}</p>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 font-mono flex flex-col items-center gap-2">
                    <Activity className="w-5 h-5 animate-spin text-rose-400" />
                    <span>Compiling diagnostic payloads...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 font-mono">
              All systems are quiet. No active alerts demanding war room mode.
            </div>
          )}
        </div>

        {/* Auto Healing Deck */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between h-auto">
          <div className="border-b border-white/5 pb-3 shrink-0">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">AI Auto-Healer triggers</h3>
          </div>

          <div className="space-y-4 flex-1 py-3">
            {criticalIncident ? (
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/25 text-emerald-400 space-y-1.5">
                  <div className="font-bold text-xs">Clear transactional query caches</div>
                  <p className="text-[10px] text-slate-300 font-sans font-light">Enforce redis buffer evictions on payment locks capturing models (94% confidence score).</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-white/5 text-slate-400 space-y-1">
                  <div className="font-bold text-xs">Scale pod replica configurations</div>
                  <p className="text-[10px] text-slate-500 font-sans font-light">kubectl scale stripe-charges deployment replicas to +5 instances (87% confidence).</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                No active healing steps.
              </div>
            )}
          </div>

          {criticalIncident && (
            <button
              onClick={() => handleAutoHeal(criticalIncident._id)}
              disabled={healingId === criticalIncident._id}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-xs font-mono font-bold uppercase text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Zap className="w-4 h-4 animate-bounce" />
              <span>{healingId === criticalIncident._id ? "EXECUTING RECOVERY HEAL..." : "EXECUTE AUTO-HEAL ⚡"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
