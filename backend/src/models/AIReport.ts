import { Schema, model } from 'mongoose';

export interface IAIReport {
  title: string;
  type: 'weekly' | 'incident';
  summary: string;
  metrics: {
    totalApis: number;
    overallUptime: number;
    averageLatency: number;
    criticalOutages: number;
  };
  recommendations: string[];
  generatedAt: Date;
}

export const AIReportSchema = new Schema<IAIReport>({
  title: { type: String, required: true },
  type: { type: String, enum: ['weekly', 'incident'], required: true },
  summary: { type: String, required: true },
  metrics: {
    totalApis: { type: Number, required: true },
    overallUptime: { type: Number, required: true },
    averageLatency: { type: Number, required: true },
    criticalOutages: { type: Number, required: true }
  },
  recommendations: [{ type: String }],
  generatedAt: { type: Date, default: Date.now }
});

export const AIReportModel = model<IAIReport>('AIReport', AIReportSchema);
