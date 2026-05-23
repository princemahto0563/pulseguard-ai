"use client";

import { useState, useEffect } from "react";
import { 
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FastForward, 
  History, Cpu, ShieldAlert, CheckCircle, Clock 
} from "lucide-react";

interface IPlaybackFrame {
  timeOffset: string;
  status: "UP" | "DOWN" | "DEGRADED";
  latency: number;
  statusCode: number;
  log: string;
  alert?: string;
  autoHealStep?: string;
}

export default function IncidentReplayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x

  const playbackFrames: IPlaybackFrame[] = [
    { timeOffset: "-05:00 mins", status: "UP", latency: 92, statusCode: 200, log: "INFO [stripe] Captured Charge capture_id=c_0921a - 200 OK" },
    { timeOffset: "-04:30 mins", status: "UP", latency: 85, statusCode: 200, log: "INFO [stripe] Captured Charge capture_id=c_0921b - 200 OK" },
    { timeOffset: "-04:00 mins", status: "UP", latency: 98, statusCode: 200, log: "INFO [stripe] Captured Charge capture_id=c_0921c - 200 OK" },
    { timeOffset: "-03:30 mins", status: "UP", latency: 120, statusCode: 200, log: "DEBUG [stripe] Concurrency locks scan timing total=12ms" },
    { timeOffset: "-03:00 mins", status: "DEGRADED", latency: 450, statusCode: 200, log: "WARN [stripe] Latency spike warning limit exceeded timing=450ms" },
    { timeOffset: "-02:30 mins", status: "DEGRADED", latency: 850, statusCode: 200, log: "WARN [stripe] Downstream gateway spent >850ms waiting bank nodes" },
    { timeOffset: "-02:00 mins", status: "DOWN", latency: 15000, statusCode: 504, log: "ERROR [stripe] Gateway Timeout (504) captured in Billing channels", alert: "🚨 CRITICAL OUTAGE: Stripe capturing returned Gateway Timeout (504)" },
    { timeOffset: "-01:30 mins", status: "DOWN", latency: 15000, statusCode: 504, log: "ERROR [stripe] Consecutive timeouts (2/3) captured", alert: "🚨 Webhook dispatched: Slack alert dispatched to #sre-ops" },
    { timeOffset: "-01:00 mins", status: "DOWN", latency: 15000, statusCode: 504, log: "FATAL [stripe] Transaction dropped due to gateway timeout", autoHealStep: "🤖 [AI AUTO-HEAL] Cleared Redis buffers & recycled stuck API pods" },
    { timeOffset: "-00:30 mins", status: "UP", latency: 145, statusCode: 200, log: "INFO [stripe] Charge captured successfully capture_id=c_0922a", autoHealStep: "🤖 [AI AUTO-HEAL] Post-heal checks passed. Latency stable." },
    { timeOffset: "00:00 mins (Now)", status: "UP", latency: 80, statusCode: 200, log: "INFO [stripe] Health restored. All telemetry green.", autoHealStep: "🤖 [AI AUTO-HEAL] Closed incident ticket. Telemetry nominal." }
  ];

  // Playback timer loops
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx(prev => {
        if (prev >= playbackFrames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleRewind = () => {
    setIsPlaying(false);
    setCurrentFrameIdx(0);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentFrameIdx(prev => Math.max(prev - 1, 0));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentFrameIdx(prev => Math.min(prev + 1, playbackFrames.length - 1));
  };

  const currentFrame = playbackFrames[currentFrameIdx];

  return (
    <div className="space-y-8 relative z-10 font-mono text-[11px] scanner-line">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider font-sans">Incident Replay Console</h2>
        <p className="text-slate-400 text-xs font-sans">Play back historical outage incidents visually. Scrub through timestamps to analyze crash vectors.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Replay Deck Map */}
        <div className="xl:col-span-2 glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between h-96">
          {/* Deck Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">STRIPE WEBHOOK CHECK TIMELINE REPLAY</span>
            </div>
            <span className="text-[10px] text-slate-500">TIMESTAMP OFFSET: <strong className="text-slate-200">{currentFrame.timeOffset}</strong></span>
          </div>

          {/* Visual State Representation */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-6">
            <div className="flex gap-4 items-center">
              {/* Outer status ring */}
              <div className={`relative w-28 h-28 rounded-full flex items-center justify-center border transition-all duration-500 ${
                currentFrame.status === "UP" 
                  ? "bg-emerald-500/5 border-emerald-500/25 glow-emerald" 
                  : currentFrame.status === "DEGRADED" 
                  ? "bg-amber-500/5 border-amber-500/25 glow-cyan" 
                  : "bg-rose-500/5 border-rose-500/25 glow-rose"
              }`}>
                {/* Internal text info */}
                <div className="text-center space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">STATUS</div>
                  <div className={`text-md font-black ${
                    currentFrame.status === "UP" ? "text-emerald-400" : currentFrame.status === "DEGRADED" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {currentFrame.status}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold">{currentFrame.statusCode}</div>
                </div>
              </div>

              {/* Latency timing card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 font-mono text-center space-y-1 shrink-0 min-w-[100px]">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">LATENCY</span>
                <div className="text-lg font-black text-slate-200">{currentFrame.latency}ms</div>
                <div className="text-[9px] text-slate-500">Node Timers</div>
              </div>
            </div>

            {/* Horizontal Timeline ticks */}
            <div className="w-full max-w-lg flex gap-1.5 justify-between">
              {playbackFrames.map((frame, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentFrameIdx(idx)}
                  className={`flex-1 h-3 rounded-md cursor-pointer transition-all duration-300 ${
                    idx === currentFrameIdx 
                      ? "scale-y-125 border border-indigo-400 shadow-md" 
                      : ""
                  } ${
                    frame.status === "UP" 
                      ? "bg-emerald-500" 
                      : frame.status === "DEGRADED" 
                      ? "bg-amber-500" 
                      : "bg-rose-500"
                  }`}
                  title={`Offset: ${frame.timeOffset}`}
                />
              ))}
            </div>
          </div>

          {/* Scrubber Playback Bar */}
          <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/25 p-3 rounded-2xl">
            {/* Control panel buttons */}
            <div className="flex gap-2">
              <button onClick={handleRewind} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200" title="Reset Timeline">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleStepPrev} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200" title="Step Back">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-1 ${
                  isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
              </button>

              <button onClick={handleStepNext} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 text-slate-400 hover:text-slate-200" title="Step Forward">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Playback speed selector */}
            <div className="flex gap-2 items-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">SPEED:</span>
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold font-mono transition-all ${
                    playbackSpeed === s 
                      ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 font-black" 
                      : "bg-white/5 border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {s}X
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Timeline telemetry log feeds */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col h-96 overflow-hidden">
          <div className="border-b border-white/5 pb-3 shrink-0">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Telemetry Event Stream</h3>
            <p className="text-[10px] text-slate-500">Live transaction pings at timeline offset frame.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Server logs */}
            <div className="space-y-1.5">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Raw Log Output:</div>
              <pre className="p-3.5 rounded-xl bg-black border border-white/5 text-[9px] text-slate-400 leading-normal font-mono break-all whitespace-pre-wrap">
                {currentFrame.log}
              </pre>
            </div>

            {/* Alert dispatched */}
            {currentFrame.alert && (
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 space-y-1 flex gap-2 items-start animate-pulse">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider">ALERT BROADCASTED:</div>
                  <p className="text-[10px] text-slate-200 mt-0.5 leading-normal">{currentFrame.alert}</p>
                </div>
              </div>
            )}

            {/* Auto-heal check */}
            {currentFrame.autoHealStep && (
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 space-y-1 flex gap-2 items-start">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider">AUTO-HEALING TRIGGERED:</div>
                  <p className="text-[10px] text-slate-200 mt-0.5 leading-normal">{currentFrame.autoHealStep}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
