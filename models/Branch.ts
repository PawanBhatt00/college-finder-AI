import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBranchDocument extends Document {
  collegeId: Types.ObjectId;
  name: string;
  seatsTotal: number;
}

const BranchSchema = new Schema<IBranchDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    name: { type: String, required: true },
    seatsTotal: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

BranchSchema.index({ collegeId: 1 });

const Branch: Model<IBranchDocument> =
  mongoose.models.Branch ?? mongoose.model<IBranchDocument>("Branch", BranchSchema);

export default Branch;
