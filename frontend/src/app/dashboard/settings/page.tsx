"use client";

import { useState } from "react";
import { 
  Settings, Bell, Shield, Cpu, RefreshCw, Check, Slack, Send, Mail 
} from "lucide-react";

export default function SRESettings() {
  const [slackWebhook, setSlackWebhook] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [latencyThreshold, setLatencyThreshold] = useState("900");
  const [consecutiveFailures, setConsecutiveFailures] = useState("3");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Settings and Webhook Integration Channels saved successfully!");
    }, 800);
  };

  return (
    <div className="space-y-8 relative z-10 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">SRE Configurations</h2>
        <p className="text-slate-400 text-sm">Tune alert threshold logic parameters and establish integration pathways.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Card 1: Alerting limits */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Incident Detection Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Latency Spike SLA (Milliseconds)</label>
              <input
                type="number"
                value={latencyThreshold}
                onChange={(e) => setLatencyThreshold(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                required
              />
              <span className="text-[9px] text-slate-500 font-light">Pings exceeding this threshold flag the endpoint state as DEGRADED.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Consecutive Failures Limit</label>
              <input
                type="number"
                value={consecutiveFailures}
                onChange={(e) => setConsecutiveFailures(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                required
              />
              <span className="text-[9px] text-slate-500 font-light">Consecutive HTTP exceptions required to broadcast a Critical Outage Alert.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Slack/Discord Integration channels */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Integration Notification Channels</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                <Slack className="w-4 h-4 text-slate-400" />
                <span>Slack Webhook Link</span>
              </div>
              <input
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                <Send className="w-4 h-4 text-slate-400" />
                <span>Discord Webhook Link</span>
              </div>
              <input
                type="url"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-xs">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Emergency SRE Alert Email</span>
              </div>
              <input
                type="email"
                placeholder="sre-emergencies@company.com"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-xs font-bold rounded-xl text-white shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
          <span>{saving ? "SAVING SRE CONFIGURATIONS..." : "DEPLOY CONFIGURATIONS"}</span>
        </button>
      </form>
    </div>
  );
}
