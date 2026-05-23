"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { 
  Terminal, Bot, UploadCloud, FileText, CheckCircle2, ShieldAlert, Cpu, Sparkles 
} from "lucide-react";

export default function LogSummarizer() {
  const { summarizeLog } = useStore();
  const [logText, setLogText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const summary = await summarizeLog(logText);
      setResult(summary);
    } catch (err) {
      console.error(err);
      alert("Error summarizing log files. Verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const loadExampleLog = (type: string) => {
    if (type === 'timeout') {
      setLogText(
`[2026-05-23T10:12:45.190Z] INFO [stripe-charges] Initiating payment capture node client_id=c_981a
[2026-05-23T10:12:45.220Z] DEBUG [stripe-charges] Querying downstream acquirer gateway endpoints host=api.stripe.com/v3
[2026-05-23T10:13:00.222Z] ERROR [stripe-charges] Gateway Timeout error captured in thread_pool_id=892
[2026-05-23T10:13:00.223Z] ERROR [stripe-charges] HTTP status=504 message="Gateway Timeout from downstream card processor bank nodes"
[2026-05-23T10:13:00.225Z] WARN [stripe-charges] Terminating active TCP transaction sockets. Transaction dropped.`
      );
    } else {
      setLogText(
`[2026-05-23T14:32:01.002Z] INFO [inventory-db] Scanning billing inventories index billing_id=b_0928a
[2026-05-23T14:32:01.082Z] WARN [inventory-db] Mongoose connection buffer reached concurrency threshold buffer_size=428
[2026-05-23T14:32:03.119Z] ERROR [inventory-db] Database Deadlock intercepted. Concurrent writes hold locks.
[2026-05-23T14:32:03.120Z] FATAL [inventory-db] MongooseConnectionError: Transaction index deadlock on billings_collection_idx
[2026-05-23T14:32:03.125Z] INFO [inventory-db] Process terminated with exit code 1.`
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setLogText(text);
      alert(`Successfully loaded log file: [${file.name}] (${text.length} characters)`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 relative z-10 font-mono text-[11px]">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider font-sans">AI Log Summarizer</h2>
        <p className="text-slate-400 text-xs font-sans">Drag and drop massive server log files. The AI will extract crash patterns and write explanations.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Log Paste Terminal */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Log Input Deck</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => loadExampleLog('timeout')}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
              >
                "TIMEOUT LOG"
              </button>
              <button 
                onClick={() => loadExampleLog('deadlock')}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
              >
                "DEADLOCK LOG"
              </button>
            </div>
          </div>

          {/* Drag & Drop Upload Simulation Area */}
          <div className="relative group p-4 border border-dashed border-white/5 hover:border-indigo-500/30 rounded-2xl bg-white/[0.01] transition-all flex flex-col items-center justify-center text-center py-6">
            <input 
              type="file" 
              accept=".log,.txt" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" />
            <span className="text-[10px] text-slate-400 font-sans">Drag & Drop Log file here or <strong className="text-indigo-400 hover:underline">Browse files</strong></span>
            <span className="text-[9px] text-slate-600 mt-1">Supports standard .log, .txt files up to 2MB.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="Paste raw stack logs or error logs here..."
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              className="w-full h-48 bg-black border border-white/5 rounded-2xl p-4 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/40"
              required
            />
            <button
              type="submit"
              disabled={loading || !logText.trim()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-xs font-bold rounded-xl text-white shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? "AUDITING LOG PATTERNS..." : "RUN AI LOG AUDIT"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: AI Diagnostics Summary Outcome */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">AI Diagnostics Outcome</h3>
          </div>

          {!result ? (
            <div className="py-28 text-center text-slate-500 font-mono flex flex-col items-center justify-center gap-2">
              <Cpu className="w-8 h-8 text-slate-600 mb-1 animate-pulse" />
              <span>Awaiting Log Telemetry Input...</span>
              <p className="text-[9px] text-slate-600 max-w-[220px]">Paste a log dump or choose an SRE preset log on the left to trigger the parser.</p>
            </div>
          ) : (
            <div className="space-y-5 font-mono text-xs">
              {/* Pattern header */}
              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                  <Bot className="w-4 h-4 animate-bounce" />
                  <span>CRASH PATTERN DETECTED</span>
                </div>
                <div className="text-slate-100 font-bold text-sm mt-1">{result.patternDetected}</div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Executive Summary</div>
                <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 text-slate-300 leading-relaxed font-light">
                  {result.summary}
                </div>
              </div>

              {/* Explanations */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Error Details Breakdown</div>
                <div className="p-3.5 rounded-xl bg-[#08090f]/60 border border-white/5 text-slate-400 leading-relaxed font-sans font-light">
                  {result.errorExplanation}
                </div>
              </div>

              {/* Severity badge */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase">SEVERITY INDEX</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider ${
                  result.severity === 'critical' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {result.severity}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
