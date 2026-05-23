import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseGuard AI | Failure Detection & API Debugging Platform",
  description: "Enterprise-grade real-time API monitoring, statistical anomaly detection, and automated AI diagnostics.",
  keywords: ["APIs", "Monitoring", "SRE", "DevOps", "AI debugging", "Log analyzer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#050508] text-slate-100">
        {children}
      </body>
    </html>
  );
}
