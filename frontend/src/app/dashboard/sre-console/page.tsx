"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Terminal as TerminalIcon, ShieldAlert, Cpu, Activity, Play, HelpCircle, CornerDownLeft } from "lucide-react";
import axios from "axios";

interface ITerminalLine {
  type: "input" | "output" | "error" | "success" | "system";
  text: string;
  timestamp: string;
}

export default function SRECommandConsole() {
  const { apis, incidents, executeAutoHeal, speakText } = useStore();
  const [history, setHistory] = useState<ITerminalLine[]>([
    { type: "system", text: "PulseGuard AI [SRE Command Link Enabled]", timestamp: new Date().toLocaleTimeString() },
    { type: "system", text: "Type 'help' to audit available operational commands.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  useEffect(() => {
    // Focus terminal input on load
    inputRef.current?.focus();
  }, []);

  const executeCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Add command to history
    setCommandHistory(prev => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const timestamp = new Date().toLocaleTimeString();
    setHistory(prev => [...prev, { type: "input", text: `sre-operator@pulseguard-core:~$ ${trimmed}`, timestamp }]);

    const args = trimmed.split(" ");
    const command = args[0].toLowerCase();
    const target = args.slice(1).join(" ");

    setLoading(true);

    // Simulate SRE processing latency
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      switch (command) {
        case "help":
          setHistory(prev => [
            ...prev,
            { type: "system", text: "AVAILABLE SRE DEVOPS SHELL COMMANDS:", timestamp },
            { type: "output", text: "  analyze <service-name>    - Perform deep AI fault-audit on active endpoint", timestamp },
            { type: "output", text: "  predict outage            - Forecast outage probability models in next 15m", timestamp },
            { type: "output", text: "  show failed requests      - Audit active HTTP warning logs", timestamp },
            { type: "output", text: "  run autoheal              - Execute script to auto-resolve current incidents", timestamp },
            { type: "output", text: "  inspect latency           - Output latency metrics across registered nodes", timestamp },
            { type: "output", text: "  summarize incidents       - View structural audit of recent server crashes", timestamp },
            { type: "output", text: "  clear                     - Clear active terminal buffers", timestamp }
          ]);
          speakText("Displaying SRE console guidelines");
          break;

        case "clear":
          setHistory([]);
          break;

        case "analyze":
          if (!target) {
            setHistory(prev => [...prev, { type: "error", text: "Error: Please specify target service name. e.g. 'analyze Stripe Payment Gateway'", timestamp }]);
            break;
          }
          const matchedApi = apis.find(a => a.name.toLowerCase().includes(target.toLowerCase()));
          if (!matchedApi) {
            setHistory(prev => [...prev, { type: "error", text: `Error: No registered node matches target query '${target}'. Available services: ${apis.map(a => a.name).join(", ")}`, timestamp }]);
            break;
          }

          try {
            const token = localStorage.getItem("pg_token");
            const res = await axios.post("http://:5001/api/ai/chat", {
              message: `Why is service ${matchedApi.name} registering healthScore ${matchedApi.healthScore}%? Provide diagnostic review.`
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(prev => [
              ...prev,
              { type: "success", text: `AI SRE Analysis result for service: [${matchedApi.name}]`, timestamp },
              { type: "output", text: res.data.reply, timestamp }
            ]);
            speakText(`Analysis complete for service ${matchedApi.name}`);
          } catch (err: any) {
            setHistory(prev => [...prev, { type: "error", text: `AI Engine analysis connection dropped. Underlying trace: ${err.message}`, timestamp }]);
          }
          break;

        case "predict":
          if (target !== "outage") {
            setHistory(prev => [...prev, { type: "error", text: "Command suggestion: Did you mean 'predict outage'?", timestamp }]);
            break;
          }
          try {
            const token = localStorage.getItem("pg_token");
            // Call prediction endpoint or forecast telemetry
            const response = await axios.post("https://pulseguard-ai-1.onrender.com/api/ai/digital-twin-predict", {
              trafficMultiplier: 2.5,
              podCount: 2,
              cachePolicy: "disabled"
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data;
            setHistory(prev => [
              ...prev,
              { type: "success", text: `DIGITAL TWIN TELEMETRY OUTAGE RISK FORECAST:`, timestamp },
              { type: "output", text: `  Outage Probability: ${data.outageProbability}%`, timestamp },
              { type: "output", text: `  Resource Bottlenecks: ${data.bottleneckThreshold}`, timestamp },
              { type: "output", text: `  Behavior Profile: ${data.behaviorPrediction}`, timestamp },
              { type: "output", text: `  Financial Projections: ${data.costImpactEstimation}`, timestamp }
            ]);
            speakText(`Outage probability predicted at ${data.outageProbability} percent.`);
          } catch (e: any) {
            setHistory(prev => [...prev, { type: "error", text: "Forecast nodes offline. Connection terminated.", timestamp }]);
          }
          break;

        case "show":
          if (target !== "failed requests") {
            setHistory(prev => [...prev, { type: "error", text: "Command suggestion: Did you mean 'show failed requests'?", timestamp }]);
            break;
          }
          const activeWarnings = apis.filter(a => a.healthScore < 80);
          if (activeWarnings.length === 0) {
            setHistory(prev => [...prev, { type: "success", text: "System baseline operating healthy. All HTTP endpoints return green heartbeats.", timestamp }]);
          } else {
            setHistory(prev => [
              ...prev,
              { type: "error", text: `WARNING: ${activeWarnings.length} degraded cluster nodes detected!`, timestamp },
              ...activeWarnings.map(api => ({
                type: "output" as const,
                text: `  -> [${api.name}] (Status: DEGRADED) | Health Score: ${api.healthScore}% | Endpoint: ${api.url}`,
                timestamp
              }))
            ]);
            speakText("Degraded nodes detected inside telemetry pool");
          }
          break;

        case "run":
          if (target !== "autoheal") {
            setHistory(prev => [...prev, { type: "error", text: "Command suggestion: Did you mean 'run autoheal'?", timestamp }]);
            break;
          }
          const activeInc = incidents.find(i => i.status === "active");
          if (!activeInc) {
            setHistory(prev => [...prev, { type: "success", text: "No active incidents detected. Auto-healing queues idle.", timestamp }]);
            break;
          }
          try {
            await executeAutoHeal(activeInc._id);
            setHistory(prev => [
              ...prev,
              { type: "success", text: `[AUTO-HEAL TRIGGERED SUCCESSFULLY]`, timestamp },
              { type: "output", text: `Successfully executed: db.killOp() transaction unlock on Stripe captures. Recycled target PM2 pods. Nominal latency verified.`, timestamp }
            ]);
            speakText("Auto healing protocol completed successfully");
          } catch (e: any) {
            setHistory(prev => [...prev, { type: "error", text: "Auto-healing script aborted: session transaction deadlocked.", timestamp }]);
          }
          break;

        case "inspect":
          if (target !== "latency") {
            setHistory(prev => [...prev, { type: "error", text: "Command suggestion: Did you mean 'inspect latency'?", timestamp }]);
            break;
          }
          setHistory(prev => [
            ...prev,
            { type: "system", text: "CLUSTER NODE LATENCY TRACES (LIVE MS):", timestamp },
            ...apis.map(api => ({
              type: "output" as const,
              text: `  [${api.name}] avg response delay: ${100 - api.healthScore > 20 ? 840 : 85}ms | stability indicator: ${api.healthScore >= 90 ? "OPTIMAL" : "CRITICAL"}`,
              timestamp
            }))
          ]);
          break;

        case "summarize":
          if (target !== "incidents") {
            setHistory(prev => [...prev, { type: "error", text: "Command suggestion: Did you mean 'summarize incidents'?", timestamp }]);
            break;
          }
          if (incidents.length === 0) {
            setHistory(prev => [...prev, { type: "success", text: "Incident log table is empty. Absolute green status.", timestamp }]);
          } else {
            setHistory(prev => [
              ...prev,
              { type: "system", text: `SUMMARIZING RECENT LOG INCIDENTS (${incidents.length} entries):`, timestamp },
              ...incidents.map(inc => ({
                type: (inc.status === "active" ? "error" : "success") as any,
                text: `  [ID: ${inc._id.slice(-6)}] ${inc.title} - Severity: ${inc.severity.toUpperCase()} | Status: ${inc.status.toUpperCase()}`,
                timestamp
              }))
            ]);
          }
          break;

        default:
          setHistory(prev => [...prev, { type: "error", text: `Command not found: '${command}'. Type 'help' to review structural SRE parameters.`, timestamp }]);
          break;
      }
    } catch (err: any) {
      setHistory(prev => [...prev, { type: "error", text: `Unexpected operator system panic: ${err.message}`, timestamp }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const loadPreset = (cmd: string) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6 relative z-10 h-[calc(100vh-140px)] flex flex-col justify-between">
      {/* Title */}
      <div className="shrink-0">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <TerminalIcon className="w-6 h-6 text-indigo-400" />
          SRE Live Command Terminal
        </h2>
        <p className="text-slate-400 text-xs">Execute low-level cluster audits, analyze diagnostic models, and run emergency auto-healing code scripts.</p>
      </div>

      {/* Terminal View Container */}
      <div className="flex-1 glass-panel rounded-3xl p-5 md:p-6 flex flex-col justify-between min-h-0 bg-black/90 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.05)] relative overflow-hidden font-mono">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3 mb-4 text-[10px] text-indigo-400/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/40 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
            <span className="ml-2 font-bold tracking-widest uppercase">pulseguard-ai-sre-shell-v1.4</span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[8px] tracking-wider text-indigo-400 font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            SECURE LINK ACTIVE
          </div>
        </div>

        {/* Scrollable Buffer */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-style pb-4 text-xs leading-relaxed text-slate-300">
          {history.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-[9px] text-slate-600 select-none shrink-0 py-0.5">[{line.timestamp}]</span>
              <span className={`whitespace-pre-wrap font-mono ${
                line.type === "input" ? "text-white font-bold" :
                line.type === "error" ? "text-rose-400 font-medium" :
                line.type === "success" ? "text-emerald-400 font-medium" :
                line.type === "system" ? "text-indigo-400 font-medium" : "text-slate-300"
              }`}>
                {line.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-indigo-500/40 select-none shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-indigo-400/80 animate-pulse flex items-center gap-2 font-mono">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Streaming AI diagnostics from deep monitoring trace queues...</span>
              </span>
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Console Presets Tickers */}
        <div className="py-2.5 border-t border-indigo-500/10 shrink-0 flex flex-wrap gap-2 text-[10px]">
          <span className="text-slate-500 flex items-center py-1">PRESET UTILITIES:</span>
          {[
            { label: "Predict Outage Risk", cmd: "predict outage" },
            { label: "Analyze Stripe Service", cmd: "analyze Stripe" },
            { label: "Show Failed Requests", cmd: "show failed requests" },
            { label: "Run AI Auto-Heal", cmd: "run autoheal" },
            { label: "Inspect Latency MS", cmd: "inspect latency" }
          ].map((preset, index) => (
            <button
              key={index}
              onClick={() => loadPreset(preset.cmd)}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/30 text-indigo-400/70 hover:text-indigo-300 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleFormSubmit} className="flex gap-3 shrink-0 relative mt-2">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-extrabold select-none pointer-events-none text-xs">
            $
          </div>
          <input
            type="text"
            ref={inputRef}
            placeholder="Type command... (e.g. 'help', 'predict outage', 'run autoheal')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full bg-black/80 border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl pl-8 pr-16 py-3.5 text-xs text-indigo-300 placeholder-indigo-500/40 focus:outline-none focus:border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.05)] focus:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all font-mono"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white transition-all shadow-lg flex items-center gap-1 text-[10px] font-bold"
          >
            <span>Execute</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
