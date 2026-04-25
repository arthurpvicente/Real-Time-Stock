import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface Holding extends Document {
  userId: string;
  symbol: string;
  company: string;
  shares: number;
  buyPrice: number;
  buyDate: Date;
}

const HoldingsSchema = new Schema<Holding>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    shares: { type: Number, required: true, min: 0.0001 },
    buyPrice: { type: Number, required: true, min: 0.0001 },
    buyDate: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

HoldingsSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Holdings: Model<Holding> =
  (models?.Holdings as Model<Holding>) || model<Holding>('Holdings', HoldingsSchema);
