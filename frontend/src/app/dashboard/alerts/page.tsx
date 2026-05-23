"use client";

import { useStore } from "@/store/useStore";
import { 
  Bell, ShieldAlert, CheckCircle, Clock, Volume2, VolumeX, Mail, Slack, Send 
} from "lucide-react";

export default function AlertConsole() {
  const { alerts, isVoiceAlertEnabled, toggleVoiceAlerts, apis } = useStore();

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="space-y-8 relative z-10">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Alert Dispatch Terminal</h2>
          <p className="text-slate-400 text-sm">Review active webhooks logs, toggle dynamic voice synthesis alerts, and check channel connections.</p>
        </div>

        <button
          onClick={toggleVoiceAlerts}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center gap-2 ${
            isVoiceAlertEnabled 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
          }`}
        >
          {isVoiceAlertEnabled ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
          <span>{isVoiceAlertEnabled ? "VOICE ALERTS ON" : "VOICE ALERTS MUTED"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Alerts Log Stream */}
        <div className="xl:col-span-2 space-y-6">
          {/* Active Alerts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono border-b border-white/5 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Active Dispatches ({activeAlerts.length})</span>
            </h3>

            {activeAlerts.length === 0 ? (
              <div className="glass-panel py-12 text-center text-xs text-slate-500 font-mono">
                No active notifications currently in queue. All systems quiet.
              </div>
            ) : (
              activeAlerts.map((alert, idx) => {
                const api = apis.find(a => a._id === alert.apiId);
                return (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex gap-4 items-start"
                  >
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-200">{alert.message}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Target API: {api ? api.name : 'Unknown Target'} | Triggered: {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Resolved Alerts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono border-b border-white/5 pb-2">
              Resolved Archive ({resolvedAlerts.length})
            </h3>

            {resolvedAlerts.length === 0 ? (
              <div className="glass-panel py-12 text-center text-xs text-slate-500 font-mono">
                No resolved notifications archived yet.
              </div>
            ) : (
              resolvedAlerts.map((alert, idx) => {
                const api = apis.find(a => a._id === alert.apiId);
                return (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex gap-4 items-start"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-300">{alert.message}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Target: {api ? api.name : 'Unknown Target'} | Restored: {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Connection Status & Voice alerts info */}
        <div className="space-y-8 lg:col-span-1">
          {/* Channel Connections indicator */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Integration Channels</h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Slack className="w-4.5 h-4.5 text-slate-400" />
                  <span>Slack Webhook</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">CONNECTED</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Send className="w-4.5 h-4.5 text-slate-400" />
                  <span>Discord Alerting</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">CONNECTED</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4.5 h-4.5 text-slate-400" />
                  <span>SRE Mailing Pool</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-500 font-bold">STANDBY</span>
              </div>
            </div>
          </div>

          {/* Voice alert explanatory card */}
          <div className="glass-panel p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
            <div className="flex items-center gap-2 font-mono text-[10px] text-indigo-400 font-bold">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>DYNAMIC VOICE INCIDENT SUMMARIZATION</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              PulseGuard features an integrated in-browser vocal synthesizer. When critical outages hit, the platform automatically vocalizes key alert signatures (e.g. <em>"Stripe Capturing Outage timeout captures"</em>) so SRE teams receive heads-up signals immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
