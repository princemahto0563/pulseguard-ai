"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Send, Terminal, Cpu, RefreshCw, Sparkles, ArrowRight } from "lucide-react";

interface IMessage {
  sender: "user" | "ai";
  text: string;
}

export default function AIDebugAssistant() {
  const [messages, setMessages] = useState<IMessage[]>([
    { 
      sender: "ai", 
      text: "Hello! I am **PulseGuard's AI SRE Diagnostic Assistant**. I am actively connected to your API telemetry pool and log metrics. Ask me about failure signatures, latency anomalies, database deadlocks, or request cache optimizations!" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("pg_token");
      const res = await axios.post(
        "http://localhost:5001/api/ai/chat",
        { message: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { sender: "ai", text: res.data.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        sender: "ai", 
        text: "🚨 Diagnostic link lost. Please ensure the Express backend is running and you have active telemetry logs." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadStarterPreset = (msg: string) => {
    setInput(msg);
  };

  return (
    <div className="space-y-8 relative z-10 h-[calc(100vh-140px)] flex flex-col justify-between">
      {/* Header Banner */}
      <div className="shrink-0">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">AI Debug Console</h2>
        <p className="text-slate-400 text-sm">Query incident logs directly, translate stack dumps, and generate caching config snippets.</p>
      </div>

      {/* Main Terminal Frame */}
      <div className="flex-1 glass-panel rounded-3xl p-4 md:p-6 flex flex-col justify-between min-h-0 bg-[#07070b]/90 border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Terminal Window Header Decoration */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0 font-mono text-slate-500 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/20" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
            <span className="ml-2">pulseguard_sre_chatbot_v1.0.sh</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>AI AGENT ONLINE</span>
          </div>
        </div>

        {/* Message Pool */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-style pb-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                msg.sender === "ai" 
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                  : "bg-white/5 border-white/10 text-slate-400"
              }`}>
                {msg.sender === "ai" ? <Bot className="w-4.5 h-4.5" /> : <Terminal className="w-4 h-4" />}
              </div>

              {/* Text Balloon */}
              <div className={`p-4 rounded-2xl text-xs leading-relaxed font-mono ${
                msg.sender === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none font-sans" 
                  : "bg-white/[0.02] border border-white/5 text-slate-300 rounded-tl-none"
              }`}>
                {/* Basic markdown renderer simulator */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.text.split("\n").map((line, lidx) => {
                    // Check if it's code block start or end
                    if (line.trim().startsWith("```")) return null;
                    
                    // Simple replacement for bold text markdown **word**
                    let rendered = line;
                    const bolds = line.match(/\*\*(.*?)\*\*/g);
                    if (bolds) {
                      bolds.forEach(b => {
                        const word = b.replace(/\*\*/g, '');
                        rendered = rendered.replace(b, `<strong class="text-white font-bold">${word}</strong>`);
                      });
                    }
                    return <p key={lidx} dangerouslySetInnerHTML={{ __html: rendered }} />;
                  })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Bot className="w-4.5 h-4.5 animate-bounce" />
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-mono text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI SRE is inspecting telemetry traces...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Console Presets Tickers */}
        <div className="py-3 border-t border-white/5 shrink-0 flex flex-wrap gap-2 text-[10px] font-mono">
          <span className="text-slate-500 flex items-center py-1">PRESETS:</span>
          <button 
            onClick={() => loadStarterPreset("Why is Stripe Payment Gateway failing?")}
            className="px-2.5 py-1 rounded bg-white/5 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200 transition-colors"
          >
            "Why is Stripe Gateway failing?"
          </button>
          <button 
            onClick={() => loadStarterPreset("Suggest optimizations for AI Recommendations latency.")}
            className="px-2.5 py-1 rounded bg-white/5 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200 transition-colors"
          >
            "Optimize Recommendations Latency"
          </button>
          <button 
            onClick={() => loadStarterPreset("Write a Node-Cache code block fallback for heavy DB lookups.")}
            className="px-2.5 py-1 rounded bg-white/5 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200 transition-colors"
          >
            "Write Node-Cache template"
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="flex gap-3 shrink-0 relative">
          <input
            type="text"
            placeholder="Type SRE telemetry queries... (e.g. 'Why did my payment API crash?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full bg-black border border-white/5 rounded-2xl pl-4 pr-12 py-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white transition-all shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
