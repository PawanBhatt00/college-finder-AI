import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICollegeDocument extends Document {
  name: string;
  type: "IIT" | "NIT" | "IIIT" | "GFTI" | "State" | "Private";
  state: string;
  city: string;
  website: string;
  nirfRank: number | null;
  logoUrl?: string;
  description?: string;
}

const CollegeSchema = new Schema<ICollegeDocument>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["IIT", "NIT", "IIIT", "GFTI", "State", "Private"], required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    website: { type: String, default: "" },
    nirfRank: { type: Number, default: null },
    logoUrl: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

CollegeSchema.index({ name: "text", state: 1, type: 1 });

const College: Model<ICollegeDocument> =
  mongoose.models.College ?? mongoose.model<ICollegeDocument>("College", CollegeSchema);

export default College;
