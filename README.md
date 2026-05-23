# PulseGuard AI 🛡️
### AI-Powered API Failure Detection & Debugging Platform

PulseGuard AI is an enterprise-grade API monitoring, failure detection, anomaly detection, and automated debugging platform. It continuously monitors registered API endpoints, applies statistics to detect response time spikes and anomalies, and feeds incidents into a custom LLM debugging engine powered by Gemini or OpenAI to explain root causes and recommend dynamic fixes.

---

## Technical Architecture

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand, Axios
- **Backend**: Node.js, Express, TypeScript, Socket.io, Node-cron
- **Database**: MongoDB with Mongoose
- **AI Agent**: Gemini/OpenAI API (with integrated high-fidelity semantic simulation fallback)

---

## Directory Structure

```text
pulseguard-ai/
├── backend/            # Express, WebSockets, DB Models, Monitoring Scheduler & AI Engine
└── frontend/           # Next.js 15 App, Zustand, Recharts, Dashboard & Glassmorphic UI
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URI)

### 2. Running Locally

We've prepared simple startup commands. To run the full application:

1. Set up your `.env` variables in both directories.
2. In the `backend/` directory, run:
   ```bash
   npm run dev
   ```
3. In the `frontend/` directory, run:
   ```bash
   npm run dev
   ```

Explore the interactive dashboard, add custom APIs, view real-time log tickers, chat with the AI debug assistant, and listen to spoken Voice Alert summaries.
