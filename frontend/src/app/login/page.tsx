"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@pulseguard.ai");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const login = useStore((state) => state.login);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Animated background grid */}
      <div className="auth-grid" />

      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Horizontal scan line */}
      <div className="scan-bar" />

      <div className={`auth-card ${mounted ? "auth-card-in" : ""}`}>
        {/* Brand */}
        <div className="brand-area">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M3 12h3l3-7 4 14 3-9 2 2h3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-name">PulseGuard</span>
          <span className="brand-badge">AI</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your SRE diagnostic console</p>
        </div>

        {error && (
          <div className="auth-error">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{flexShrink:0}}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">EMAIL ADDRESS</label>
            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="admin@pulseguard.ai"
                required
              />
            </div>
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label">PASSWORD</label>
              <span className="field-link">Forgot?</span>
            </div>
            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="••••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? (
              <>
                <span className="btn-spinner" />
                Authenticating...
              </>
            ) : (
              <>
                Secure Login
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-link">
          New to PulseGuard?{" "}
          <Link href="/register" className="link-cta">Create an Account</Link>
        </div>

        <div className="demo-hint">
          <div className="demo-hint-header">
            <span className="demo-dot" />
            DEMO ACCESS CREDENTIALS
          </div>
          <div className="demo-hint-body">
            <span className="demo-label">Email</span>
            <span className="demo-val">admin@pulseguard.ai</span>
          </div>
          <div className="demo-hint-body">
            <span className="demo-label">Password</span>
            <span className="demo-val">admin123</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@600;700;800&display=swap');

        .auth-root {
          min-height: 100vh;
          background: #04040a;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 24px;
          font-family: 'Syne', sans-serif;
        }

        .auth-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .orb-1 {
          width: 400px; height: 400px;
          background: rgba(99,102,241,0.18);
          top: -100px; left: -100px;
          animation: drift 14s infinite alternate ease-in-out;
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: rgba(236,72,153,0.12);
          bottom: -80px; right: -80px;
          animation: drift 18s infinite alternate-reverse ease-in-out;
        }
        .orb-3 {
          width: 200px; height: 200px;
          background: rgba(6,182,212,0.10);
          top: 40%; right: 10%;
          animation: drift 22s infinite alternate ease-in-out;
        }
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to { transform: translate(40px, 30px) scale(1.1); }
        }

        .scan-bar {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(6,182,212,0.5), transparent);
          animation: scanline 8s linear infinite;
          pointer-events: none;
        }
        @keyframes scanline {
          0% { top: -1px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100vh; opacity: 0; }
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          background: rgba(8,8,16,0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          z-index: 10;
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.08) inset,
            0 30px 80px -20px rgba(0,0,0,0.8),
            0 0 60px -20px rgba(99,102,241,0.15);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .auth-card-in {
          opacity: 1;
          transform: translateY(0);
        }
        .auth-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), transparent 50%, rgba(236,72,153,0.15));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .brand-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(99,102,241,0.4);
        }
        .brand-name {
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .brand-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1px;
          color: #6366f1;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 4px;
          padding: 2px 6px;
          margin-top: 1px;
        }

        .auth-header {
          margin-bottom: 24px;
        }
        .auth-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.8px;
          margin: 0 0 6px;
        }
        .auth-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          font-weight: 400;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.2px;
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          color: #f87171;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 20px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field-group { display: flex; flex-direction: column; gap: 7px; }

        .field-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.2px;
          color: rgba(255,255,255,0.35);
        }
        .field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .field-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(99,102,241,0.7);
          cursor: pointer;
          transition: color 0.2s;
        }
        .field-link:hover { color: #818cf8; }

        .field-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 11px;
          padding: 13px 16px 13px 42px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: rgba(255,255,255,0.85);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.15); }
        .field-input:focus {
          border-color: rgba(99,102,241,0.45);
          background: rgba(99,102,241,0.04);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
        }

        .auth-btn {
          margin-top: 6px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px 20px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          box-shadow: 0 8px 32px -8px rgba(99,102,241,0.55), 0 0 0 1px rgba(99,102,241,0.3) inset;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .auth-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .auth-btn:hover:not(:disabled)::after { opacity: 1; }
        .auth-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 40px -8px rgba(99,102,241,0.65), 0 0 0 1px rgba(99,102,241,0.4) inset;
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer-link {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          font-family: 'JetBrains Mono', monospace;
        }
        .link-cta {
          color: #818cf8;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .link-cta:hover { color: #a5b4fc; text-decoration: underline; }

        .demo-hint {
          margin-top: 20px;
          padding: 14px 16px;
          background: rgba(99,102,241,0.05);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 12px;
          font-family: 'JetBrains Mono', monospace;
        }
        .demo-hint-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.4px;
          color: rgba(99,102,241,0.7);
          margin-bottom: 10px;
        }
        .demo-dot {
          width: 6px; height: 6px;
          background: #6366f1;
          border-radius: 50%;
          box-shadow: 0 0 8px #6366f1;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #6366f1; }
          50% { opacity: 0.6; box-shadow: 0 0 12px #6366f1; }
        }
        .demo-hint-body {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          margin-bottom: 4px;
        }
        .demo-label {
          color: rgba(255,255,255,0.25);
          min-width: 54px;
          font-size: 10px;
        }
        .demo-val { color: rgba(255,255,255,0.7); }
      `}</style>
    </div>
  );
}
