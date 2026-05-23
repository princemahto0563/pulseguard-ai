"use client";

import { useStore, IIncident } from "@/store/useStore";
import { useState } from "react";
import { 
  History, Clock, AlertTriangle, ShieldCheck, Bot, CheckCircle, ArrowRight, Activity 
} from "lucide-react";

export default function IncidentsFeed() {
  const { incidents, apis, resolveIncident } = useStore();
  const [selectedIncident, setSelectedIncident] = useState<IIncident | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveIncident(id);
      // Update local state preview
      if (selectedIncident && selectedIncident._id === id) {
        setSelectedIncident(prev => prev ? { ...prev, status: 'resolved' as const } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResolvingId(null);
    }
  };

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-8 relative z-10">
      {/* Header banner */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Incident Control Center</h2>
        <p className="text-slate-400 text-sm">Review real-time failures, audit historical diagnostic trails, and trigger automated closures.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Incidents List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Incidents */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Active Threats ({activeIncidents.length})</h3>
            </div>

            {activeIncidents.length === 0 ? (
              <div className="glass-panel py-8 text-center text-xs text-slate-500 font-mono">
                No active outage threats detected.
              </div>
            ) : (
              activeIncidents.map((incident) => {
                const api = apis.find(a => a._id === incident.apiId);
                const isSelected = selectedIncident?._id === incident._id;
                return (
                  <div 
                    key={incident._id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/5' 
                        : 'glass-panel hover:border-slate-500/30'
                    } space-y-2`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-bold text-slate-100">{incident.title}</div>
                      <span className="px-2 py-0.5 rounded text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold uppercase font-mono">
                        {incident.severity}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">API: {api ? api.name : 'Unknown Service'}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Started: {new Date(incident.startedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Resolved Incidents */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">History Log ({resolvedIncidents.length})</h3>
            </div>

            {resolvedIncidents.length === 0 ? (
              <div className="glass-panel py-8 text-center text-xs text-slate-500 font-mono">
                No resolved incidents archived yet.
              </div>
            ) : (
              resolvedIncidents.map((incident) => {
                const api = apis.find(a => a._id === incident.apiId);
                const isSelected = selectedIncident?._id === incident._id;
                return (
                  <div 
                    key={incident._id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500/40' 
                        : 'glass-panel hover:border-slate-600/30'
                    } space-y-2`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-bold text-slate-300">{incident.title}</div>
                      <span className="px-2 py-0.5 rounded text-[8px] bg-slate-500/10 border border-slate-500/20 text-slate-400 font-bold uppercase font-mono">
                        RESOLVED
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">API: {api ? api.name : 'Unknown Service'}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Duration: ~{incident.resolvedAt ? Math.round((new Date(incident.resolvedAt).getTime() - new Date(incident.startedAt).getTime()) / 60000) : '45'} mins</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Timeline Diagnostics Explorer */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedIncident ? (
            <div className="glass-panel py-32 text-center text-slate-500 font-mono flex flex-col items-center justify-center gap-2">
              <History className="w-8 h-8 text-slate-600 mb-1 animate-pulse" />
              <span>Select an Incident to Explore Timeline</span>
              <p className="text-[10px] text-slate-600 max-w-[250px]">Click any active or historical failure log to review deep root cause audits and developer checklists.</p>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              {/* Header variables */}
              <div className="flex justify-between items-start border-b border-white/5 pb-5">
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                    selectedIncident.status === 'active' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {selectedIncident.status === 'active' ? 'OUTAGE THREAT ACTIVE' : 'RESOLVED & STABILIZED'}
                  </span>
                  <h3 className="text-xl font-bold text-slate-200">{selectedIncident.title}</h3>
                  <div className="text-xs text-slate-400 font-mono">Started: {new Date(selectedIncident.startedAt).toLocaleString()}</div>
                </div>

                {selectedIncident.status === 'active' && (
                  <button
                    onClick={() => handleResolve(selectedIncident._id)}
                    disabled={resolvingId === selectedIncident._id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{resolvingId === selectedIncident._id ? "DECLARING RESOLUTION..." : "DECLARE RESOLUTION"}</span>
                  </button>
                )}
              </div>

              {/* Grid: AI root analysis + Incident timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Visual Vertical Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Diagnostic Trace Logs</h4>
                  
                  <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6 py-2">
                    {selectedIncident.timeline?.map((evt, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-[#050508] bg-indigo-500" />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-200 leading-normal">{evt.event}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Root Cause explanation */}
                <div className="space-y-6">
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">AI Root Cause Report</h4>

                  {selectedIncident.aiAnalysis ? (
                    <div className="space-y-4">
                      {/* Diagnostic score */}
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                          <Bot className="w-4 h-4 text-indigo-400 animate-bounce" />
                          <span>OUTAGE SEVERITY COMPOSITE</span>
                        </div>
                        <span className={`text-sm font-extrabold font-mono ${
                          selectedIncident.aiAnalysis.severityScore > 80 ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {selectedIncident.aiAnalysis.severityScore} / 100
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-indigo-300 font-mono">Root Bottleneck:</div>
                        <p className="text-xs text-slate-300 font-semibold">{selectedIncident.aiAnalysis.rootCause}</p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-indigo-300 font-mono">Detailed Diagnosis:</div>
                        <p className="text-xs text-slate-400 leading-relaxed font-light font-sans">{selectedIncident.aiAnalysis.explanation}</p>
                      </div>

                      {/* Code suggestions */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-indigo-300 font-mono">Developer Action Checklist:</div>
                        <ul className="space-y-1.5 text-xs text-slate-300 font-sans font-light">
                          {selectedIncident.aiAnalysis.recommendations?.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-indigo-400 font-bold font-mono shrink-0">[{idx+1}]</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
                      <Activity className="w-5 h-5 animate-spin text-slate-600" />
                      <span>AI Engine is compiling failure logs...</span>
                      <span className="text-[10px] text-slate-600">This requires ~1.5s for deep index inspection.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
