import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICutoffDocument extends Document {
  branchId: Types.ObjectId;
  examName: string;
  year: number;
  category: string;
  quota: "HS" | "OS" | "AI";
  gender: "Gender-Neutral" | "Female-only";
  openingRank: number;
  closingRank: number;
}

const CutoffSchema = new Schema<ICutoffDocument>(
  {
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    examName: { type: String, required: true },
    year: { type: Number, required: true },
    category: { type: String, required: true },
    quota: { type: String, enum: ["HS", "OS", "AI"], required: true },
    gender: { type: String, enum: ["Gender-Neutral", "Female-only"], required: true },
    openingRank: { type: Number, required: true },
    closingRank: { type: Number, required: true },
  },
  { timestamps: true }
);

CutoffSchema.index({ branchId: 1, year: -1, category: 1, quota: 1, gender: 1 });

const Cutoff: Model<ICutoffDocument> =
  mongoose.models.Cutoff ?? mongoose.model<ICutoffDocument>("Cutoff", CutoffSchema);

export default Cutoff;
