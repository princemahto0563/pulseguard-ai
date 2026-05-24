"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, X, Send, Terminal, Sparkles } from "lucide-react";

export default function CopilotDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hi! I'm your **PulseGuard AI Copilot**. I am monitoring all microservice channels live. How can I assist you with performance fixes, stack dumps, or DB index designs today?" }
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
        "https://pulseguard-ai-1.onrender.com/api/ai/chat",
        { message: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => [...prev, { sender: "ai", text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: "ai", 
        text: "🚨 Connection warning. Verify backend logs." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-mono text-[11px]">
      {/* Floating pulsing button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all status-dot-pulse"
          style={{ color: '#6366f1' }}
        >
          <Bot className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Expanded Glass Drawer */}
      {open && (
        <div className="w-80 h-96 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden border border-indigo-500/20 shadow-2xl animate-slide-in bg-[#08090f]/95">
          {/* Header */}
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>PULSEGUARD COPILOT</span>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="p-1 rounded bg-white/5 text-slate-400 hover:text-white border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-style">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`p-2.5 rounded-xl leading-normal ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none font-sans' 
                    : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'
                }`}>
                  {/* Basic markup bold renderer */}
                  <span dangerouslySetInnerHTML={{ 
                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 max-w-[90%]">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick presets */}
          <div className="px-3 pb-2 flex gap-1 text-[9px]">
            <button 
              onClick={() => setInput("Explain Stripe capturing failure.")}
              className="px-2 py-0.5 rounded bg-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-slate-200 border border-transparent transition-all"
            >
              "Stripe crash?"
            </button>
            <button 
              onClick={() => setInput("Suggest caching logic.")}
              className="px-2 py-0.5 rounded bg-white/5 hover:border-indigo-500/20 text-slate-400 hover:text-slate-200 border border-transparent transition-all"
            >
              "Optimizations?"
            </button>
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-2 border-t border-white/5 flex gap-1.5 bg-black/40">
            <input
              type="text"
              placeholder="Query copilot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full bg-black border border-white/5 rounded-xl px-3 py-2 text-[10px] focus:outline-none focus:border-indigo-500/30 text-slate-200"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
