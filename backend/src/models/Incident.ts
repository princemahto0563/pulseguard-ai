import { Schema, model, Types } from 'mongoose';

export interface IIncidentTimeline {
  event: string;
  timestamp: Date;
}

export interface IAIAnalysis {
  rootCause: string;
  explanation: string;
  recommendations: string[];
  severityScore: number; // 0 to 100
}

export interface IIncident {
  apiId: Types.ObjectId;
  title: string;
  status: 'active' | 'resolved';
  severity: 'critical' | 'warning' | 'info';
  startedAt: Date;
  resolvedAt?: Date;
  timeline: IIncidentTimeline[];
  aiAnalysis?: IAIAnalysis;
  createdAt: Date;
}

export const IncidentSchema = new Schema<IIncident>({
  apiId: { type: Schema.Types.ObjectId, ref: 'API', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'warning' },
  startedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  timeline: [{
    event: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  aiAnalysis: {
    rootCause: { type: String },
    explanation: { type: String },
    recommendations: [{ type: String }],
    severityScore: { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

export const IncidentModel = model<IIncident>('Incident', IncidentSchema);
