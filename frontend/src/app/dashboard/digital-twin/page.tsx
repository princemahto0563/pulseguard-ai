"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Cpu, HelpCircle, Sparkles, Activity, ShieldAlert, BadgeDollarSign, Sliders, Play } from "lucide-react";

export default function DigitalTwinSimulator() {
  const { predictDigitalTwin, speakText } = useStore();
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);
  const [podCount, setPodCount] = useState(2);
  const [cachePolicy, setCachePolicy] = useState("disabled");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Trigger twin forecasting dynamically when values modify
  useEffect(() => {
    let active = true;
    const fetchPrediction = async () => {
      try {
        const res = await predictDigitalTwin({ trafficMultiplier, podCount, cachePolicy });
        if (active) {
          setPrediction(res);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPrediction();
    return () => {
      active = false;
    };
  }, [trafficMultiplier, podCount, cachePolicy]);

  // High-performance canvas drawing loop for the digital twin mesh node
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const nodes: Array<{ x: number; y: number; z: number; ox: number; oy: number; oz: number; vx: number; vy: number }> = [];
    const numNodes = 30;

    for (let i = 0; i < numNodes; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 120 + Math.random() * 60;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      nodes.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02
      });
    }

    let angleX = 0.005;
    let angleY = 0.005;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Perspective projection values
      const fov = 350;
      const cx = width / 2;
      const cy = height / 2;

      // Adjust rotation speed depending on traffic load
      const rotationSpeed = 0.002 * trafficMultiplier;
      angleX = rotationSpeed;
      angleY = rotationSpeed;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Color scheme based on risk levels
      const risk = prediction?.outageProbability || 10;
      const nodeColor = risk > 70 ? "244, 63, 94" : risk > 40 ? "245, 158, 11" : "99, 102, 241";
      const laserColor = risk > 70 ? "rgba(244, 63, 94, 0.15)" : risk > 40 ? "rgba(245, 158, 11, 0.1)" : "rgba(99, 102, 241, 0.08)";

      // Draw active network web connections
      ctx.lineWidth = 0.75;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        
        // Dynamic sphere wobble
        const wobble = Math.sin(Date.now() * 0.003 + i) * 3 * (trafficMultiplier / 2);
        
        // Rotate node coords
        let x = n1.x;
        let y = n1.y;
        let z = n1.z;

        // Y-axis rotation
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // X-axis rotation
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        n1.x = x1;
        n1.y = y2;
        n1.z = z2;

        const scale = fov / (fov + z2 + 200);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale + wobble;

        // Check distance to draw lines
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 150) {
            ctx.strokeStyle = laserColor;
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            
            const scale2 = fov / (fov + n2.z + 200);
            const projX2 = cx + n2.x * scale2;
            const projY2 = cy + n2.y * scale2 + Math.sin(Date.now() * 0.003 + j) * 3 * (trafficMultiplier / 2);
            
            ctx.lineTo(projX2, projY2);
            ctx.stroke();
          }
        }

        // Draw particle nodes
        const radius = Math.max(1, 4.5 * scale * (1 + (n1.z + 200) / 400));
        ctx.fillStyle = `rgba(${nodeColor}, ${scale + 0.35})`;
        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing warning circles around nodes on overload
        if (risk > 70 && i % 4 === 0) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${0.1 * Math.abs(Math.sin(Date.now() * 0.005 + i))})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(projX, projY, radius * 3 * Math.abs(Math.sin(Date.now() * 0.004)), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Render center holographic target radar ring
      ctx.strokeStyle = `rgba(${nodeColor}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(${nodeColor}, 0.05)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 210, 0, Math.PI * 2);
      ctx.stroke();

      // Sweeping radar scanning line
      const sweepAngle = (Date.now() * 0.001) % (Math.PI * 2);
      ctx.strokeStyle = `rgba(${nodeColor}, 0.25)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * 140, cy + Math.sin(sweepAngle) * 140);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trafficMultiplier, prediction]);

  const handleTestTwin = async () => {
    setLoading(true);
    speakText("Initiating virtual model load sweep...");
    await new Promise(resolve => setTimeout(resolve, 1200));
    setLoading(false);
    speakText("Digital Twin forecast synchronized successfully.");
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Cpu className="w-6.5 h-6.5 text-indigo-400" />
          AI Digital Twin Simulator
        </h2>
        <p className="text-slate-400 text-xs">Run prognostic test simulations against an active, virtual math replica model of your infrastructure before scaling clusters or introducing code deployments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Parameter Siders Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" />
              Scale Variables
            </h3>

            {/* Slider 1: Traffic Multiplier */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">TRAFFIC VELOCITY MULTIPLIER</span>
                <span className="text-indigo-400 font-bold">{trafficMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={trafficMultiplier}
                onChange={(e) => setTrafficMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#171721] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="block text-[9px] text-slate-500 font-mono leading-normal">
                Scale normal client request flows. Up to 10.0x peak e-commerce transaction volumes.
              </span>
            </div>

            {/* Slider 2: Pod Replicas Limit */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">ACTIVE POD REPLICAS LIMIT</span>
                <span className="text-indigo-400 font-bold">{podCount} Pods</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={podCount}
                onChange={(e) => setPodCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#171721] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="block text-[9px] text-slate-500 font-mono leading-normal">
                Provision maximum concurrent cluster handlers allowed under stress rules.
              </span>
            </div>

            {/* Selector: Caching Policy */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-mono">MEMORY CACHING ARCHITECTURE</label>
              <select
                value={cachePolicy}
                onChange={(e) => setCachePolicy(e.target.value)}
                className="w-full bg-[#0d0d12] border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
              >
                <option value="disabled">CACHE BYPASS (None - Heavy DB Writes)</option>
                <option value="lru">STANDARD LRU IN-MEMORY CACHE (Local Cache TTL 60s)</option>
                <option value="redis">CLUSTERED REDIS MEMCACHED (Highly-Scalable TTL 300s)</option>
              </select>
              <span className="block text-[9px] text-slate-500 font-mono leading-normal">
                Eviction policies heavily impact SQL deadlock risk mitigation.
              </span>
            </div>

            {/* Run button */}
            <button
              onClick={handleTestTwin}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/20"
            >
              <Play className="w-4 h-4" />
              <span>Simulate Sandbox Load</span>
            </button>
          </div>
        </div>

        {/* Center/Right 3D Visual Mesh Projection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual Canvas Container */}
            <div className="md:col-span-2 glass-panel rounded-3xl border border-white/5 bg-black/60 h-[450px] relative overflow-hidden flex flex-col justify-between p-5">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#050508]/60 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-mono text-indigo-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                VIRTUALIZED CLONED SHIELD
              </div>

              {/* Dynamic canvas */}
              <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-0" />

              <div className="absolute bottom-4 left-4 z-10 text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                Twin projection mapping: 60fps local sync
              </div>
            </div>

            {/* Simulation Results Sidebar */}
            <div className="md:col-span-1 space-y-6">
              {prediction ? (
                <div className="space-y-6">
                  {/* Probability Card */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 text-center space-y-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-glow opacity-5 pointer-events-none" />
                    <span className="block text-[10px] text-slate-500 font-mono">OUTAGE DEGRADATION RISK</span>
                    <span className={`block text-4xl font-black font-mono tracking-tighter ${
                      prediction.outageProbability > 70 ? "text-rose-500 status-dot-pulse" :
                      prediction.outageProbability > 40 ? "text-amber-500" : "text-emerald-400"
                    }`}>
                      {prediction.outageProbability}%
                    </span>
                    <span className={`inline-block text-[9px] font-extrabold font-mono px-2.5 py-1 rounded border ${
                      prediction.outageProbability > 70 ? "border-rose-500/20 bg-rose-500/5 text-rose-400 animate-pulse" :
                      prediction.outageProbability > 40 ? "border-amber-500/20 bg-amber-500/5 text-amber-400" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    }`}>
                      {prediction.outageProbability > 70 ? "TERMINAL THREAT" :
                       prediction.outageProbability > 40 ? "ELEVATED VULNERABILITY" : "NOMINAL ENVIRONMENT"}
                    </span>
                  </div>

                  {/* Projections logs */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/5 bg-black/60 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      AI Behavior Audit
                    </h4>

                    <div className="space-y-3.5 text-[10px] font-mono leading-relaxed">
                      <div className="space-y-1">
                        <span className="text-slate-500">Resource bottlenecks:</span>
                        <p className="text-slate-200 font-bold">{prediction.bottleneckThreshold}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-slate-500">Scaling predictions:</span>
                        <p className="text-slate-300 leading-normal">{prediction.behaviorPrediction}</p>
                      </div>

                      <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1">
                          <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          Cost Audit:
                        </span>
                        <span className="text-slate-200 font-extrabold">{prediction.costImpactEstimation.split(": ")[1] || "$480"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl border border-white/5 bg-black/60 h-full flex items-center justify-center text-center p-5 font-mono text-xs text-slate-500">
                  Calibrating model nodes...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
