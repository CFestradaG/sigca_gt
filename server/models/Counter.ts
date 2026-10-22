import mongoose, { Schema } from 'mongoose';

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

export const CounterModel =
  mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
