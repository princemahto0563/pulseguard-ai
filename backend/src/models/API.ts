import { Schema, model, Types } from 'mongoose';

export interface IAPI {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  interval: number; // in seconds
  status: 'active' | 'paused';
  project: string;
  team?: Types.ObjectId;
  healthScore: number;
  isMonitored: boolean;
  createdAt: Date;
}

export const APISchema = new Schema<IAPI>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
  headers: { type: Map, of: String },
  body: { type: String },
  interval: { type: Number, default: 30 },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  project: { type: String, default: 'Default Project' },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  healthScore: { type: Number, default: 100 },
  isMonitored: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const APIModel = model<IAPI>('API', APISchema);
