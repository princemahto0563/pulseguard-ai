"use client";

import { useState } from "react";
import {
  Shield,
  Bell,
  RefreshCw,
  Slack,
  Send,
  Mail,
} from "lucide-react";

export default function SRESettings() {
  // Removed real-looking webhook URLs to avoid GitHub secret detection
  const [slackWebhook, setSlackWebhook] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [alertEmail, setAlertEmail] = useState("");

  const [latencyThreshold, setLatencyThreshold] = useState("900");
  const [consecutiveFailures, setConsecutiveFailures] = useState("3");

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      alert("SRE configurations saved successfully!");
    }, 1000);
  };

  return (
    <div className="relative z-10 max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          SRE Configurations
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Configure monitoring thresholds and notification integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Threshold Settings */}
        <div className="glass-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Shield className="h-5 w-5 text-indigo-400" />

            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-200">
              Incident Detection Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Latency */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Latency Threshold (ms)
              </label>

              <input
                type="number"
                value={latencyThreshold}
                onChange={(e) => setLatencyThreshold(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0c0d12] px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
                required
              />

              <p className="text-[10px] text-slate-500">
                Requests above this latency are marked as degraded.
              </p>
            </div>

            {/* Failures */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Consecutive Failures
              </label>

              <input
                type="number"
                value={consecutiveFailures}
                onChange={(e) => setConsecutiveFailures(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0c0d12] px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
                required
              />

              <p className="text-[10px] text-slate-500">
                Number of failures before triggering critical alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Channels */}
        <div className="glass-panel rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Bell className="h-5 w-5 text-indigo-400" />

            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-slate-200">
              Notification Integrations
            </h3>
          </div>

          <div className="space-y-5">
            {/* Slack */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Slack className="h-4 w-4 text-slate-400" />
                <span>Slack Webhook</span>
              </div>

              <input
                type="text"
                placeholder="Enter Slack webhook URL"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0c0d12] px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Discord */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Send className="h-4 w-4 text-slate-400" />
                <span>Discord Webhook</span>
              </div>

              <input
                type="text"
                placeholder="Enter Discord webhook URL"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0c0d12] px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>Emergency Alert Email</span>
              </div>

              <input
                type="email"
                placeholder="alerts@company.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#0c0d12] px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-xs font-bold text-white shadow-lg transition-all hover:bg-indigo-700 disabled:bg-indigo-800"
        >
          <RefreshCw
            className={`h-4 w-4 ${saving ? "animate-spin" : ""}`}
          />

          <span>
            {saving
              ? "SAVING CONFIGURATIONS..."
              : "DEPLOY CONFIGURATIONS"}
          </span>
        </button>
      </form>
    </div>
  );
}