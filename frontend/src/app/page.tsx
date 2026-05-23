"use client";

import { motion } from "framer-motion";
import { 
  Activity, ShieldAlert, Cpu, Bot, Zap, ArrowRight, CheckCircle, 
  Terminal, BarChart2, Bell, FileAudio, Globe, MapPin, Sparkles, ChevronDown 
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import TopoMap from "@/components/TopoMap";

export default function LandingPage() {
  const [pingPulse, setPingPulse] = useState<number[]>([120, 115, 230, 480, 110, 125, 540, 115]);
  const [pingIndex, setPingIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPingIndex((prev) => (prev + 1) % 8);
      setPingPulse(prev => {
        const next = [...prev];
        next[Math.floor(Math.random() * 8)] = Math.floor(Math.random() * 40) + (Math.random() > 0.85 ? 580 : 60);
        return next;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#030306] relative starry-grid scanner-line overflow-hidden">
      {/* Dynamic glow nodes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-radial-glow opacity-70 pointer-events-none z-0" />
      <div className="absolute top-[900px] right-0 w-[600px] h-[600px] bg-mesh-glow opacity-30 pointer-events-none z-0" />

      {/* Floating particles stars */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-indigo-500/40 blur-xs particle-dust pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-3.5 h-3.5 rounded-full bg-pink-500/20 blur-xs particle-dust pointer-events-none [animation-delay:4s]" />

      {/* Header navbar */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              PulseGuard<span className="text-indigo-400 font-medium">.AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-medium text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-slate-100 transition-colors">FEATURES</a>
            <a href="#pricing" className="hover:text-slate-100 transition-colors">PRICING</a>
            <a href="#integrations" className="hover:text-slate-100 transition-colors">INTEGRATIONS</a>
            <Link href="/docs" className="hover:text-slate-100 transition-colors">DEVELOPER DOCS</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-mono font-bold text-slate-300 hover:text-white px-4 py-2 transition-colors uppercase tracking-wider">
              Log in
            </Link>
            <Link href="/register" className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-indigo-600 text-xs font-mono font-bold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.02] uppercase tracking-wider">
              <span className="relative z-10 flex items-center gap-1.5">
                DEPLOY LIVE <ArrowRight className="w-4 h-4" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero CTA section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Neon Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/35 bg-indigo-500/5 text-indigo-300 text-[10px] font-bold font-mono tracking-widest uppercase shadow-md shadow-indigo-500/5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>Futuristic Observability Platform</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter max-w-5xl mx-auto leading-[0.95] text-white">
            ELITE REAL-TIME API{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">
              AI OBSERVABILITY
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-3xl mx-auto font-light leading-relaxed">
            Monitor microservice channels in real time. Predict overload spikes early. Summarize huge logs using AI. Replay outages visually.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all w-full sm:w-auto">
              DEPLOY FREE TELEMETRY
            </Link>
            <a href="#features" className="px-8 py-4 rounded-xl glass-panel text-slate-300 text-xs font-mono font-bold uppercase tracking-wider hover:border-slate-500 hover:text-white transition-all w-full sm:w-auto flex items-center justify-center gap-2">
              AUDIT FEATURES <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Live simulated console block with 3D map preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-16 max-w-5xl mx-auto glass-panel rounded-3xl p-1 md:p-3 glow-indigo"
        >
          <div className="bg-[#07080c] rounded-2xl p-4 md:p-6 text-left border border-white/5 shadow-2xl space-y-6">
            {/* Header decor */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono ml-3 uppercase tracking-wider">pulseguard_command_center.sh</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                DEMO SIMULATOR ONLINE
              </div>
            </div>

            {/* Live latency grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 font-mono text-xs">
              {pingPulse.map((val, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border transition-all duration-500 ${
                    idx === pingIndex 
                      ? "bg-indigo-500/15 border-indigo-500/40 scale-105" 
                      : val > 300 
                      ? "bg-rose-500/5 border-rose-500/20" 
                      : "bg-[#0b0c11] border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mb-2">
                    <span>PING {idx + 1}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${val > 400 ? "bg-rose-500" : "bg-emerald-500"}`} />
                  </div>
                  <div className="font-extrabold text-sm text-slate-200">
                    {val}ms
                  </div>
                  <div className="text-[9px] mt-1 text-slate-400">
                    {val > 400 ? "504 OUTAGE" : "200 NOMINAL"}
                  </div>
                </div>
              ))}
            </div>

            {/* AI diagnosis block preview */}
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="space-y-1 font-mono">
                <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>AI FAILURE PREDICTION OUTCOME</span>
                </div>
                <p className="text-xs font-bold text-slate-200">
                  92% probability of API Outage detected on Stripe Payment captures in next 3 minutes.
                </p>
                <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                  Reason: Heavy consecutive transaction timeouts scanned on down-level bank acquiring nodes. Autofix routine armed.
                </p>
              </div>
              <Link href="/register" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-mono font-bold uppercase tracking-wider text-white rounded-xl shadow-lg transition-all shrink-0 w-full md:w-auto text-center">
                TRIGGER AUTO-HEAL ⚡
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-6xl font-black text-white leading-none">
            CYBERPUNK SRE OBSERVABILITY
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-light">
            An elite, zero-friction telemetry dashboard built specifically for next-generation developer teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* F 1 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 glass-panel-hover glow-indigo">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-200 uppercase tracking-wide">Multi-Region Maps</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed font-mono">
              Audit regional latency bottlenecks globally on interactive SVG world maps in real time. US-East, EU-Central, AP-South.
            </p>
          </div>

          {/* F 2 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-200 uppercase tracking-wide">AI SRE Copilot</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed font-mono">
              A floating, collapsible glassmorphic AI chat drawer available on every page. Ask questions, optimize queries, generate PM2 templates instantly.
            </p>
          </div>

          {/* F 3 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-200 uppercase tracking-wide">Incident Playback</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed font-mono">
              Replay outages visually using full timeline play, pause, speed multipliers, and scrubber controllers.
            </p>
          </div>

          {/* F 4 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-200 uppercase tracking-wide">AI Auto-Healing</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed font-mono">
              Suggest and execute automated self-healing scripts (e.g. restart PM2 process, scale Kubernetes replicas) with verified confidence scores.
            </p>
          </div>

          {/* F 5 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <FileAudio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-200 uppercase tracking-wide">Voice Synthesizer</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed font-mono">
              Integrated text-to-speech loops read alert signatures aloud, giving hands-free signals when downtime captures occur.
            </p>
          </div>

          {/* F 6 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 glass-panel-hover">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-200 uppercase tracking-wide">Log Summarizer</h3>
            <p className="text-slate-400 text-xs font-light leading-relaxed font-mono">
              Drag-and-drop massive system logs. The AI extracts crashes, audits patterns, and details plain English explanations.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 relative z-10 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-5xl font-black text-white font-mono uppercase">Seamless integrations channels</h2>
          <p className="text-slate-400 text-xs max-w-xl mx-auto font-mono">Stream alert payloads to your pre-existing communication tools instantly.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 pt-4 font-mono text-xs text-slate-400">
          <span className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">SLACK WEBHOOKS</span>
          <span className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">DISCORD CHANNELS</span>
          <span className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">KUBERNETES REPLICAS</span>
          <span className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">PROMETHEUS TRACES</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center text-slate-500 text-xs relative z-10 font-mono">
        <p>© 2026 PulseGuard AI Observability. Engineered by Antigravity for Recruiter WOW factor.</p>
      </footer>
    </div>
  );
}
