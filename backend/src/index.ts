import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db';
import { seedMockData } from './services/dbService';
import { startMonitoringScheduler, setSocketServer } from './services/monitorService';

// Import Routers
import authRouter from './routes/auth';
import apisRouter from './routes/apis';
import incidentsRouter from './routes/incidents';
import aiRouter from './routes/ai';
import analyticsRouter from './routes/analytics';
import chaosRouter from './routes/chaos';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Socket Server hookup
setSocketServer(io);

// API Health Check
app.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'PulseGuard AI Telemetry Engine',
    db: dbStatus
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/apis', apisRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/chaos', chaosRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Express Internal Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Websocket Events
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to PulseGuard WS: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Initialization routine
const startServer = async () => {
  console.log('🚀 Starting PulseGuard AI Engine...');
  
  // 1. Connect database
  await connectDB();
  
  // 2. Pre-populate database with seed data for rich instant visualizations
  await seedMockData();
  
  // 3. Start API monitoring intervals pinger loop
  await startMonitoringScheduler();

  // 4. Listen on PORT
  server.listen(PORT, () => {
    console.log(`\n🛡️  ==========================================`);
    console.log(`📡 PulseGuard Backend active on :https://pulseguard-ai-1.onrender.com${PORT}`);
    console.log(`🚀 Real-time WebSocket connection channels enabled`);
    console.log(`🛡️  ==========================================\n`);
  });
};

startServer().catch(err => {
  console.error('🚨 Core start routine crashed:', err);
});
