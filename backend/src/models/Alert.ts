import { Schema, model, Types } from 'mongoose';

export interface IAlert {
  apiId: Types.ObjectId;
  type: 'downtime' | 'latency' | 'anomaly';
  message: string;
  resolved: boolean;
  timestamp: Date;
}

export const AlertSchema = new Schema<IAlert>({
  apiId: { type: Schema.Types.ObjectId, ref: 'API', required: true },
  type: { type: String, enum: ['downtime', 'latency', 'anomaly'], required: true },
  message: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export const AlertModel = model<IAlert>('Alert', AlertSchema);
