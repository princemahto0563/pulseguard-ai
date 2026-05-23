"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Network, Sparkles, ShieldAlert, Cpu, CheckCircle, FileText, Send, ArrowRight } from "lucide-react";

export default function ArchitectureAnalyzer() {
  const { analyzeArchitecture, speakText } = useStore();
  const [diagramText, setDiagramText] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const mermaidPresets = [
    {
      title: "E-Commerce Transaction Monolith",
      desc: "Single relational db node holding stripe sessions + transactional checkout caches.",
      code: `graph TD
  Client[Web / Mobile client] --> Gateway[Express Monolithic Gateway]
  Gateway --> Redis[Single Redis Cache Session]
  Gateway --> PrimaryDB[(Single Mongoose PostgreSQL Instance)]
  Gateway --> StripeWorker[Stripe Hook Thread]`
    },
    {
      title: "Multi-Region Distributed API Mesh",
      desc: "Distributed client routing with decoupled edge databases and region failovers.",
      code: `graph TD
  Client --> EdgeRouter[Cloudflare Edge Gateway]
  EdgeRouter --> US_Node[US-East API cluster]
  EdgeRouter --> EU_Node[EU-Central API cluster]
  US_Node --> US_DB[(Active US Mongo Replica)]
  EU_Node --> EU_DB[(Active EU Mongo Replica)]
  US_DB <--> EU_DB[Dynamic Replication Tunnel]`
    },
    {
      title: "High-Concurrency AI Chat Orchestrator",
      desc: "Fast broker setups with queues and decoupled heavy processing layers.",
      code: `graph TD
  Web --> Proxy[Nginx Load Balancer]
  Proxy --> WebServer[Node Socket Cluster]
  WebServer --> RabbitMQ{RabbitMQ Task Broker}
  RabbitMQ --> GPUWorker1[GPU Inference Node 1]
  RabbitMQ --> GPUWorker2[GPU Inference Node 2]
  WebServer --> MongoDB[(MongoDB Primary Session Store)]`
    }
  ];

  const loadPreset = (code: string) => {
    setDiagramText(code);
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagramText.trim() || loading) return;

    setLoading(true);
    speakText("Starting site architecture audit...");
    
    try {
      const res = await analyzeArchitecture(diagramText);
      setAuditResult(res);
      speakText(`Audit complete. Architecture health score calculated at ${res.healthScore} percent.`);
    } catch (e: any) {
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
          <Network className="w-6.5 h-6.5 text-indigo-400" />
          AI Architecture & Redundancy Auditor
        </h2>
        <p className="text-slate-400 text-xs">Upload infrastructure scripts, paste Mermaid.js graph code, or describe your microservice layouts to detect single points of failure, bottleneck structures, and regional latency weaknesses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Graph Specification Inputs
            </h3>

            {/* Presets */}
            <div className="space-y-2">
              <span className="block text-[10px] text-slate-500 font-mono">SELECT ARCHITECTURE TEMPLATES:</span>
              <div className="space-y-2">
                {mermaidPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(preset.code)}
                    className="w-full text-left p-3 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 hover:bg-white/5 transition-all"
                  >
                    <span className="block text-xs font-bold text-slate-200 font-mono">{preset.title}</span>
                    <span className="block text-[9px] text-slate-400 mt-1 leading-normal">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <form onSubmit={handleAudit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono">PASTE MERMAID SYNTAX OR LAYOUT DESCRIPTION</label>
                <textarea
                  value={diagramText}
                  onChange={(e) => setDiagramText(e.target.value)}
                  placeholder={`graph TD\n  Client --> Gateway\n  Gateway --> Database[(PostgreSQL)]`}
                  rows={8}
                  disabled={loading}
                  className="w-full bg-[#0d0d12] border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/40 placeholder-slate-600 resize-none scrollbar-style"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !diagramText.trim()}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20"
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Compiling Structural Audit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Audit Architecture</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Output Diagnostic Panel */}
        <div className="lg:col-span-2 space-y-6">
          {auditResult ? (
            <div className="space-y-6">
              {/* Score HUD Header */}
              <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-black/60 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-radial-glow opacity-10 pointer-events-none" />
                
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Structural Compliance Result</h3>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">{auditResult.explanation}</p>
                </div>

                <div className="shrink-0 flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-3xl px-5 py-4 self-start md:self-center">
                  <div className="text-center">
                    <span className="block text-[9px] text-slate-500 font-mono">RESILIENCE HEALTH SCORE</span>
                    <span className={`text-3xl font-black font-mono tracking-tight ${
                      auditResult.healthScore >= 80 ? "text-emerald-400" :
                      auditResult.healthScore >= 60 ? "text-amber-400" : "text-rose-500"
                    }`}>
                      {auditResult.healthScore}%
                    </span>
                  </div>
                  <div className="w-1.5 h-10 border-r border-white/5" />
                  <span className={`text-xs font-extrabold font-mono px-3 py-1.5 rounded-xl border ${
                    auditResult.healthScore >= 80 ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" :
                    auditResult.healthScore >= 60 ? "border-amber-500/20 bg-amber-500/5 text-amber-400" : "border-rose-500/20 bg-rose-500/5 text-rose-400"
                  }`}>
                    {auditResult.healthScore >= 80 ? "COMPLIANT" :
                     auditResult.healthScore >= 60 ? "VULNERABLE" : "HIGH EXPOSURE"}
                  </span>
                </div>
              </div>

              {/* Vulnerabilities Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bottlenecks */}
                <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 space-y-4">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    Bottlenecks Detected
                  </h4>
                  <ul className="space-y-3">
                    {auditResult.bottlenecksDetected.map((item: string, index: number) => (
                      <li key={index} className="flex gap-2.5 text-xs text-slate-300 font-mono leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                        <span className="text-rose-400/60 font-bold">#0{index + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Single Points of Failure */}
                <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Single Points of Failure
                  </h4>
                  <ul className="space-y-3">
                    {auditResult.singlePointsOfFailure.map((item: string, index: number) => (
                      <li key={index} className="flex gap-2.5 text-xs text-slate-300 font-mono leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                        <span className="text-amber-400/60 font-bold">#0{index + 1}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Redundancy Recommendations */}
              <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  AI Suggested Architecture Upgrades
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditResult.redundancyRecommendations.map((item: string, index: number) => (
                    <div key={index} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-300 font-mono flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-white/5 bg-black/60 h-[480px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Network className="w-6.5 h-6.5" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">Resilience Analyzer Locked</h3>
              <p className="text-xs text-slate-500 max-w-sm font-mono leading-normal">Paste or select an architecture code definition on the left parameters sidebar to initialize real-time AI security scans.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
