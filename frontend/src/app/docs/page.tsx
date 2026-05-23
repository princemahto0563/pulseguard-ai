"use client";

import Link from "next/link";
import { Activity, ArrowLeft, BookOpen, Key, Terminal, Code } from "lucide-react";

export default function DeveloperDocs() {
  return (
    <div className="min-h-screen bg-[#050508] relative grid-mesh overflow-hidden">
      {/* Glow mesh background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-radial-glow opacity-55 pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">PulseGuard Docs</span>
          </Link>
          
          <Link href="/dashboard" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow transition-colors">
            Go to Console
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10 space-y-12">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white">Developer API Integration</h1>
          <p className="text-slate-400 text-sm font-light">Comprehensive specs for integrating external pipelines, fetching logs, and triggering automated AI debug sequences.</p>
        </div>

        {/* Auth section */}
        <section className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Key className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Authentication Protocol</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            All endpoints must authenticate via standard JSON Web Token (JWT) bearer signatures. Include the token inside request headers:
          </p>
          <pre className="p-3.5 rounded-xl bg-black border border-white/5 text-[10px] text-indigo-300 font-mono overflow-x-auto">
            Authorization: Bearer &lt;YOUR_PULSEGUARD_SESSION_JWT&gt;
          </pre>
        </section>

        {/* Endpoints specs */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">API Operations Matrix</h3>
          </div>

          <div className="space-y-6">
            {/* Op 1 */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">POST</span>
                <span className="text-xs text-slate-200 font-bold font-mono">/api/apis</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal font-light">Register a new target microservice API route to undergo automated active monitoring loops.</p>
              
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Payload parameters:</div>
                <pre className="p-3 rounded-xl bg-black border border-white/5 text-[10px] text-slate-400 font-mono">
{`{
  "name": "Stripe Charge API",
  "url": "https://api.stripe.com/v3/charges",
  "method": "POST",
  "interval": 30, // in seconds
  "project": "Payments Subsystem"
}`}
                </pre>
              </div>
            </div>

            {/* Op 2 */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">POST</span>
                <span className="text-xs text-slate-200 font-bold font-mono">/api/apis/:id/test</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal font-light">Instantly trigger an active manual HTTP ping to check endpoint integrity, record timing, and calculate health.</p>
            </div>

            {/* Op 3 */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">POST</span>
                <span className="text-xs text-slate-200 font-bold font-mono">/api/ai/chat</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal font-light">Submit raw log stack dumps or SRE queries directly to the contextual AI diagnostics assistant.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
