"use client";

import { useStore, IAPI } from "@/store/useStore";
import { useState } from "react";
import { 
  Plus, Play, RotateCcw, Trash2, ArrowUpRight, Check, X, ShieldAlert, Cpu, Database 
} from "lucide-react";

export default function APIsManager() {
  const { apis, logs, addApi, deleteApi, testApi, replayRequest } = useStore();
  
  // Add API Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [interval, setIntervalVal] = useState("30");
  const [project, setProject] = useState("Core Platform");
  const [body, setBody] = useState("");

  // Testing/Replay Execution states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [replayConsole, setReplayConsole] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    try {
      await addApi({
        name,
        url,
        method,
        interval: Number(interval),
        project,
        body: body || ""
      });
      setShowAddModal(false);
      setName("");
      setUrl("");
      setBody("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestAPI = async (id: string) => {
    setTestingId(id);
    try {
      const res = await testApi(id);
      alert(`Manual Test Result for API: Status Code ${res.statusCode}, Latency: ${res.responseTime}ms, Result: ${res.status}`);
    } catch (e) {
      console.error(e);
    } finally {
      setTestingId(null);
    }
  };

  const handleReplayAPI = async (id: string) => {
    setReplayingId(id);
    setReplayConsole(null);
    try {
      const res = await replayRequest(id);
      setReplayConsole(res);
    } catch (e) {
      console.error(e);
    } finally {
      setReplayingId(null);
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Monitored Service Hub</h2>
          <p className="text-slate-400 text-sm">Register new microservice routes, perform request replays, and debug error payloads.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ADD API ENDPOINT</span>
        </button>
      </div>

      {/* Grid: Main APIs list & Console output */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: APIs List */}
        <div className="xl:col-span-2 space-y-4">
          {apis.length === 0 ? (
            <div className="glass-panel py-24 text-center text-slate-500 font-mono space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <div>No registered API endpoints found.</div>
              <p className="text-xs text-slate-600">Click the button above to register your first endpoint.</p>
            </div>
          ) : (
            apis.map((api) => {
              const apiLogs = logs[api._id] || [];
              const lastLog = apiLogs[0];
              const statusCode = lastLog ? lastLog.statusCode : 0;
              const status = lastLog ? lastLog.status : 'UP';

              return (
                <div 
                  key={api._id} 
                  className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-500/20 transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full status-dot-pulse ${
                        status === 'UP' ? 'bg-emerald-500' : status === 'DEGRADED' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      <span className="font-bold text-slate-200">{api.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-slate-400">
                        {api.method}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                        {api.project}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono break-all max-w-lg">
                      {api.url}
                    </div>
                    <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                      <span>Interval: <strong className="text-slate-300">{api.interval}s</strong></span>
                      <span>Uptime Score: <strong className="text-slate-300">{api.healthScore}%</strong></span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-0 border-white/5 pt-3 md:pt-0">
                    <div className="text-left md:text-right font-mono pr-2">
                      <div className="text-[10px] text-slate-500 uppercase">Response</div>
                      <div className="text-sm font-extrabold text-slate-200">{lastLog ? lastLog.responseTime : '...'}ms</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestAPI(api._id)}
                        disabled={testingId === api._id}
                        className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 text-slate-300 text-xs font-bold font-mono transition-all flex items-center gap-1"
                        title="Trigger Instant Manual Ping"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>PING</span>
                      </button>

                      <button
                        onClick={() => handleReplayAPI(api._id)}
                        disabled={replayingId === api._id}
                        className="px-3 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono transition-all flex items-center gap-1"
                        title="Replay failure log signature"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>REPLAY</span>
                      </button>

                      <button
                        onClick={() => deleteApi(api._id)}
                        className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 transition-colors"
                        title="Delete monitored endpoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Console Replay Logger */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-slate-200">Replay Logger Console</h3>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Debugger: ACTIVE</p>
          </div>

          {!replayConsole ? (
            <div className="py-24 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2 justify-center">
              <Cpu className="w-8 h-8 text-slate-600 mb-1 animate-pulse" />
              <span>Awaiting Replay Trigger...</span>
              <span className="text-[10px] text-slate-600 max-w-[200px]">Click REPLAY on any API to execute transactional integrity tests.</span>
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-black border border-white/5 text-emerald-400 space-y-2">
                <div className="flex items-center gap-2 border-b border-white/5 pb-1 text-slate-400 font-bold">
                  <span>🚀 TRANSACTION DETAILS</span>
                </div>
                <div>Status: <span className="text-slate-100 font-bold">{replayConsole.replayExecution?.status}</span></div>
                <div>Status Code: <span className="text-slate-100">{replayConsole.replayExecution?.statusCode}</span></div>
                <div>Latency duration: <span className="text-slate-100">{replayConsole.replayExecution?.responseTime}ms</span></div>
                <div>Timestamp: <span className="text-slate-100">{new Date(replayConsole.replayExecution?.timestamp).toLocaleTimeString()}</span></div>
              </div>

              {replayConsole.originalFailedLog && (
                <div className="p-3.5 rounded-xl bg-rose-950/10 border border-rose-500/10 text-rose-400 space-y-1.5">
                  <div className="font-bold border-b border-rose-500/10 pb-1 text-[10px]">⚠️ ORIGINAL FAILURE CAPTURED:</div>
                  <div>Status Code: <span className="text-slate-200">{replayConsole.originalFailedLog.statusCode}</span></div>
                  <div>Latency: <span className="text-slate-200">{replayConsole.originalFailedLog.responseTime}ms</span></div>
                  <div>Error: <span className="text-slate-200 break-all">{replayConsole.originalFailedLog.error || 'N/A'}</span></div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 space-y-1">
                <div className="text-xs text-slate-200 font-bold">💡 SRE Diagnostic Check:</div>
                <p className="text-[11px] leading-relaxed font-light">
                  {replayConsole.replayExecution?.status === 'UP' 
                    ? 'API has auto-recovered. Current parameters are satisfying HTTP SLA criteria successfully.' 
                    : 'API remains in failure state. Check DB Deadlocks, indexing profiles, or third-party downstream timeouts.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add API Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-xl glass-panel p-8 rounded-3xl space-y-6 glow-border-indigo animate-slide-in relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Register Target Endpoint</h3>
              <p className="text-xs text-slate-500">Input configuration variables to begin active telemetry pings.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Name</label>
                  <input
                    type="text"
                    placeholder="Stripe Checkout capturing"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace Project</label>
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HTTP Method</label>
                  <select
                    value={method}
                    onChange={(e: any) => setMethod(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Endpoint URL</label>
                  <input
                    type="url"
                    placeholder="https://api.stripe.com/v3/charges"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ping Interval (Seconds)</label>
                  <input
                    type="number"
                    min="5"
                    value={interval}
                    onChange={(e) => setIntervalVal(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custom payload body (JSON)</label>
                  <input
                    type="text"
                    placeholder='{"id": 123}'
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl text-white shadow-lg transition-all"
              >
                DEPLOY ENDPOINT TARGET
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
