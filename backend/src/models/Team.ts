import { Schema, model, Types } from 'mongoose';

export interface ITeamMember {
  userId: Types.ObjectId;
  role: 'owner' | 'admin' | 'member';
}

export interface ITeam {
  name: string;
  members: ITeamMember[];
  projects: string[];
  createdAt: Date;
}

export const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' }
  }],
  projects: [{ type: String, default: ['Default Project'] }],
  createdAt: { type: Date, default: Date.now }
});

export const TeamModel = model<ITeam>('Team', TeamSchema);
