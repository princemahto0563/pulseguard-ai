"use client";

import { useRef, useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Activity, ShieldAlert, Cpu } from "lucide-react";

interface INode3D {
  id: string;
  name: string;
  x: number; // 3D coordinates
  y: number;
  z: number;
  baseX: number; // base reference
  baseY: number;
  baseZ: number;
  size: number;
  color: string;
  status: "UP" | "DOWN" | "DEGRADED";
}

export default function TopoMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { apis, logs } = useStore();
  const [angleX, setAngleX] = useState(0.005); // continuous orbital rotation speed
  const [angleY, setAngleY] = useState(0.004);
  const [nodes, setNodes] = useState<INode3D[]>([]);

  // Generate 3D infrastructure nodes representing registered APIs
  useEffect(() => {
    if (apis.length === 0) return;
    
    const count = apis.length;
    const tempNodes: INode3D[] = apis.map((api, idx) => {
      // Position nodes in a 3D spherical shell
      const phi = Math.acos(-1 + (2 * idx) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const radius = 100;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const apiLogs = logs[api._id] || [];
      const lastLog = apiLogs[0];
      const status = lastLog ? lastLog.status : 'UP';

      return {
        id: api._id,
        name: api.name,
        x, y, z,
        baseX: x,
        baseY: y,
        baseZ: z,
        size: status === 'DOWN' ? 14 : 9,
        color: status === 'UP' ? '#00e1ff' : status === 'DEGRADED' ? '#f59e0b' : '#ff0055',
        status
      };
    });

    setNodes(tempNodes);
  }, [apis, logs]);

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let particles: Array<{x: number, y: number, vx: number, vy: number, alpha: number, color: string}> = [];

    // Local copy of nodes coordinates for rotation transformations
    let localNodes = nodes.map(n => ({ ...n }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      // 1. Perspective 3D rotation projection matrix transformations
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      localNodes.forEach(node => {
        // Rotate around Y axis
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;
        
        // Rotate around X axis
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        node.x = x1;
        node.y = y2;
        node.z = z2;
      });

      // 2. Draw connections (API mesh linkages)
      ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < localNodes.length; i++) {
        for (let j = i + 1; j < localNodes.length; j++) {
          const n1 = localNodes[i];
          const n2 = localNodes[j];
          
          // Perspective scale
          const fov = 200;
          const scale1 = fov / (fov + n1.z);
          const scale2 = fov / (fov + n2.z);

          ctx.beginPath();
          ctx.moveTo(cx + n1.x * scale1, cy + n1.y * scale1);
          ctx.lineTo(cx + n2.x * scale2, cy + n2.y * scale2);
          ctx.stroke();
        }
      }

      // 3. Draw nodes & warning particles
      localNodes.forEach(node => {
        const fov = 200;
        const scale = fov / (fov + node.z);
        const px = cx + node.x * scale;
        const py = cy + node.y * scale;
        const radius = Math.max(node.size * scale, 2);

        // Highlight failure state nodes
        if (node.status === 'DOWN' || node.status === 'DEGRADED') {
          // Warning pulse wave circle
          ctx.beginPath();
          ctx.arc(px, py, radius * (1.5 + Math.sin(Date.now() / 150) * 0.4), 0, Math.PI * 2);
          ctx.strokeStyle = node.status === 'DOWN' ? "rgba(244, 63, 94, 0.4)" : "rgba(245, 158, 11, 0.4)";
          ctx.stroke();

          // Generate warn disintegrating particles
          if (Math.random() > 0.8) {
            particles.push({
              x: px,
              y: py,
              vx: (Math.random() * 2 - 1) * 0.5,
              vy: (Math.random() * 2 - 1) * 0.5,
              alpha: 1.0,
              color: node.status === 'DOWN' ? "#f43f5e" : "#f59e0b"
            });
          }
        }

        // Draw node dot
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Node tag label
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "8px 'Roboto Mono'";
        ctx.fillText(node.name.split(" ")[0], px + radius + 3, py + 3);
      });

      // 4. Update and draw disintegrating warn particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        
        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [nodes]);

  // Handle Drag physics rotation updates
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) return; // Only dragging with left click
    setAngleX(e.movementY * 0.003);
    setAngleY(e.movementX * 0.003);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-96">
      <div className="flex justify-between items-start border-b border-white/5 pb-3 z-10 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">3D Orbital Infrastructure Topography</h3>
          <p className="text-[10px] text-slate-500">Drag to rotate the 3D network cluster topography live. Orbital perspective active.</p>
        </div>
        <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
      </div>

      <div className="flex-1 relative min-h-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={240}
          onMouseMove={handleMouseMove}
          className="w-full h-full cursor-grab active:cursor-grabbing max-h-[220px]"
        />
      </div>

      <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between font-mono text-[9px] z-10 shrink-0">
        <span className="flex items-center gap-1 text-slate-500 animate-pulse">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Nominal nodes: green | Anomaly nodes: amber | Outage nodes: red warning waves.</span>
        </span>
      </div>
    </div>
  );
}
