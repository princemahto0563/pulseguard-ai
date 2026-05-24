"use client";

import { useStore } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] text-emerald-300";
      case "error":
        return "border-rose-500/30 bg-rose-950/10 shadow-[0_0_20px_rgba(244,63,94,0.1)] text-rose-300";
      case "warning":
        return "border-amber-500/30 bg-amber-950/10 shadow-[0_0_20px_rgba(245,158,11,0.1)] text-amber-300";
      default:
        return "border-indigo-500/30 bg-indigo-950/10 shadow-[0_0_20px_rgba(99,102,241,0.1)] text-indigo-300";
    }
  };

  return (
    <div className="fixed top-24 right-6 z-[9999] pointer-events-none w-full max-w-sm flex flex-col gap-3 font-mono text-[10px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto border rounded-xl p-3.5 flex items-start gap-3 backdrop-blur-md ${getColorClasses(
              toast.type
            )}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 leading-normal tracking-wide pr-1 select-none">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-500 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
