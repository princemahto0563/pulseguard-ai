import { Schema, model, Types } from 'mongoose';

export interface IMonitoringLog {
  apiId: Types.ObjectId;
  statusCode: number;
  responseTime: number; // in ms
  status: 'UP' | 'DOWN' | 'DEGRADED';
  error?: string;
  timestamp: Date;
}

export const MonitoringLogSchema = new Schema<IMonitoringLog>({
  apiId: { type: Schema.Types.ObjectId, ref: 'API', required: true },
  statusCode: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  status: { type: String, enum: ['UP', 'DOWN', 'DEGRADED'], required: true },
  error: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const MonitoringLogModel = model<IMonitoringLog>('MonitoringLog', MonitoringLogSchema);
