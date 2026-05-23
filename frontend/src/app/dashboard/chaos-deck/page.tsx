"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Flame, ShieldAlert, Zap, RefreshCw, XOctagon, Info, Sparkles, Server } from "lucide-react";
import axios from "axios";

interface IDisasterTemplate {
  id: string;
  name: string;
  icon: any;
  defaultSeverity: "critical" | "warning";
  description: string;
  telemetryEffect: string;
}

export default function ChaosDeck() {
  const { apis, activeChaos, injectChaos, abortChaos, speakText } = useStore();
  const [targetApiId, setTargetApiId] = useState("");
  const [selectedDisasterId, setSelectedDisasterId] = useState("cpu_spike");
  const [disasterSeverity, setDisasterSeverity] = useState<"critical" | "warning">("critical");
  const [loading, setLoading] = useState(false);
  
  // Simulation impact preview states
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);

  const disasters: IDisasterTemplate[] = [
    { id: "api_outage", name: "Full API Outage", icon: XOctagon, defaultSeverity: "critical", description: "Simulate immediate HTTP 503 Service Unavailable drops.", telemetryEffect: "Drops throughput to 0 req/sec | Latency infinity" },
    { id: "packet_loss", name: "Network Packet Drop", icon: Zap, defaultSeverity: "warning", description: "Inject 65% packet drops causing transaction retries.", telemetryEffect: "Bridges latency spikes +650ms | HTTP 504 Timeouts" },
    { id: "latency_spike", name: "High Latency Cascade", icon: RefreshCw, defaultSeverity: "warning", description: "Inject random delays ranging from 1.5s to 8s across active pings.", telemetryEffect: "Response delay avg jumps 340% | Thread congestion" },
    { id: "cpu_overload", name: "CPU Resource Overload", icon: Flame, defaultSeverity: "critical", description: "Throttle host VM CPU cores to 99% usage parameters.", telemetryEffect: "Gradual health degradation to <20% | Response delays" },
    { id: "db_deadlock", name: "Database Deadlock Lockout", icon: ShieldAlert, defaultSeverity: "critical", description: "Simulate concurrent relational indexing locks blocking transactions.", telemetryEffect: "Active connections pool exhaustion | HTTP 500 crashes" },
    { id: "region_outage", name: "AWS Region Blackout", icon: Server, defaultSeverity: "critical", description: "Simulate entire EU-West-1 cluster terminal offline state.", telemetryEffect: "100% request loss for EU traffic routes" }
  ];

  useEffect(() => {
    if (apis.length > 0 && !targetApiId) {
      setTargetApiId(apis[0]._id);
    }
  }, [apis]);

  // Update AI impact assessment projections dynamically when selections modify
  useEffect(() => {
    const selectedTemplate = disasters.find(d => d.id === selectedDisasterId);
    const targetApiName = apis.find(a => a._id === targetApiId)?.name || "Target Gateway";
    if (selectedTemplate) {
      setImpactAnalysis({
        severityScore: disasterSeverity === "critical" ? 92 : 64,
        blastRadius: disasterSeverity === "critical" ? "88% (Multiple microservices affected)" : "35% (Isolated cluster degradation)",
        estimatedUptimeLoss: disasterSeverity === "critical" ? "14.2 minutes" : "3.1 minutes",
        prediction: `AI Projections indicate injecting [${selectedTemplate.name}] into [${targetApiName}] will trigger immediate cascading deadlocks across downstream billing routes. Estimated recovery time is ~8 mins following disaster termination.`
      });
    }
  }, [selectedDisasterId, targetApiId, disasterSeverity, apis]);

  const handleInject = async () => {
    if (!targetApiId || loading) return;
    setLoading(true);

    const template = disasters.find(d => d.id === selectedDisasterId);
    const apiName = apis.find(a => a._id === targetApiId)?.name || "API";
    
    try {
      await injectChaos({
        type: template?.name || "Disaster Simulation",
        apiId: targetApiId,
        severity: disasterSeverity
      });
      speakText(`Warning! Injected ${template?.name} disaster into ${apiName}. emergency state activated!`);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAbort = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await abortChaos();
      speakText("Chaos simulation aborted. Core telemetry restoring to green baseline.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Flame className="w-6.5 h-6.5 text-rose-500 animate-pulse" />
          AI Chaos Injection Deck
        </h2>
        <p className="text-slate-400 text-xs">Simulate enterprise infrastructure disasters in sandboxed environments to train AI auto-healing logic and stress test circuit breakers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Setup Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-black/60 relative overflow-hidden space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              Disaster Core Parameters
            </h3>

            {/* Target Select */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-mono">TARGET MICROSERVICE / ENDPOINT</label>
              <select
                value={targetApiId}
                onChange={(e) => setTargetApiId(e.target.value)}
                className="w-full bg-[#0d0d12] border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
              >
                {apis.map(api => (
                  <option key={api._id} value={api._id}>
                    {api.name} ({api.method} - {api.url.slice(0, 45)})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-mono">SELECT DISASTER ATTACK VECTOR</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {disasters.map(d => {
                  const Icon = d.icon;
                  const isSelected = selectedDisasterId === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDisasterId(d.id);
                        setDisasterSeverity(d.defaultSeverity);
                      }}
                      className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/5"
                          : "bg-white/[0.01] border-white/5 hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-slate-400"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-bold font-mono ${isSelected ? "text-rose-400" : "text-slate-200"}`}>
                          {d.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal mb-2">{d.description}</p>
                      <div className="mt-auto border-t border-white/5 pt-1.5 text-[9px] text-slate-500 font-mono flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        {d.telemetryEffect}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Dials */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-mono">DISASTER IMPACT LEVEL</label>
              <div className="flex gap-4">
                {[
                  { label: "WARNING INCIDENT", val: "warning" as const, desc: "Inject soft degradation patterns", color: "border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10", activeColor: "border-amber-500 bg-amber-500/10 text-amber-300" },
                  { label: "CRITICAL FAILURE OUTAGE", val: "critical" as const, desc: "Inject hard cascading failures", color: "border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10", activeColor: "border-rose-500 bg-rose-500/10 text-rose-300" }
                ].map(sev => {
                  const isActive = disasterSeverity === sev.val;
                  return (
                    <button
                      key={sev.val}
                      onClick={() => setDisasterSeverity(sev.val)}
                      className={`flex-1 p-3.5 rounded-2xl border text-left transition-all ${
                        isActive ? sev.activeColor : sev.color
                      }`}
                    >
                      <span className="block text-xs font-extrabold font-mono mb-1">{sev.label}</span>
                      <span className="block text-[10px] text-slate-400 font-sans">{sev.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Inject button */}
            <div className="border-t border-white/5 pt-6 flex items-center justify-between">
              <div>
                {activeChaos ? (
                  <span className="text-xs text-rose-400 font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    SIMULATION RUNNING: RED OUTAGE ALERT ENGAGED
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Engine Status: Idle and Armed</span>
                )}
              </div>
              
              <div className="flex gap-3">
                {activeChaos && (
                  <button
                    onClick={handleAbort}
                    disabled={loading}
                    className="px-5 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 text-xs font-extrabold transition-all"
                  >
                    Abort Active Chaos
                  </button>
                )}
                
                <button
                  onClick={handleInject}
                  disabled={loading || activeChaos !== null}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-rose-950/20 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Flame className="w-4 h-4" />
                  Inject Disaster Cascade
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Impact Diagnostic Analysis */}
        <div className="space-y-6">
          {/* Active Incident HUD overlay */}
          {activeChaos && (
            <div className="glass-panel rounded-3xl p-5 border border-rose-500/20 bg-rose-950/10 shadow-[0_0_40px_rgba(244,63,94,0.05)] relative overflow-hidden flex flex-col items-center justify-center text-center py-8">
              <div className="absolute inset-0 bg-radial-glow-rose opacity-10 pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3.5 status-dot-pulse border border-rose-500/40">
                <ShieldAlert className="w-6.5 h-6.5" />
              </div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">RED ALERT ACTIVATED</h4>
              <p className="text-[10px] text-rose-400 font-mono mt-1 mb-4">CHAOS: {activeChaos.type.toUpperCase()}</p>
              
              <div className="w-full space-y-2 border-t border-rose-500/10 pt-4 text-left text-[10px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Microservice:</span>
                  <span className="text-slate-200 font-bold">{apis.find(a => a._id === activeChaos.apiId)?.name || "Stripe"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Injected At:</span>
                  <span className="text-slate-200">{new Date(activeChaos.startedAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Blast Radius:</span>
                  <span className="text-rose-400 font-bold">100% Cascade Degradation</span>
                </div>
              </div>

              <button
                onClick={handleAbort}
                className="w-full mt-6 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/20 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                EMERGENCY ABORT
              </button>
            </div>
          )}

          {/* AI Impact Projections Card */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 relative overflow-hidden space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Impact Assessment Projections
            </h3>

            {impactAnalysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="block text-[9px] text-slate-500 font-mono">SEVERITY INDEX</span>
                    <span className={`text-base font-extrabold font-mono ${
                      impactAnalysis.severityScore > 80 ? "text-rose-500" : "text-amber-500"
                    }`}>
                      {impactAnalysis.severityScore}/100
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="block text-[9px] text-slate-500 font-mono">EST. RECOVERY TIME</span>
                    <span className="text-base font-extrabold font-mono text-indigo-400">
                      {impactAnalysis.estimatedUptimeLoss}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-slate-300 leading-relaxed font-mono">
                  <div className="flex gap-2 items-start">
                    <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <p>{impactAnalysis.prediction}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Forecast Blast Radius:</span>
                    <span className="text-slate-200 font-bold">{impactAnalysis.blastRadius}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Circuit Breaker Status:</span>
                    <span className="text-rose-400 font-bold">BYPASSED BY INJECTION</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Model Confidence:</span>
                    <span className="text-emerald-400 font-bold">96.42%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 font-mono text-xs">
                Armed. Awaiting disaster template parameters selection.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
