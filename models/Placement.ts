import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPlacementDocument extends Document {
  collegeId: Types.ObjectId;
  year: number;
  avgPackageLPA: number;
  medianPackageLPA: number;
  highestPackageLPA: number;
  placementPercent: number;
}

const PlacementSchema = new Schema<IPlacementDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    year: { type: Number, required: true },
    avgPackageLPA: { type: Number, required: true },
    medianPackageLPA: { type: Number, required: true },
    highestPackageLPA: { type: Number, required: true },
    placementPercent: { type: Number, required: true },
  },
  { timestamps: true }
);

PlacementSchema.index({ collegeId: 1, year: -1 });

const Placement: Model<IPlacementDocument> =
  mongoose.models.Placement ?? mongoose.model<IPlacementDocument>("Placement", PlacementSchema);

export default Placement;
