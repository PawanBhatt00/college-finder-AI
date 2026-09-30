import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFeeDocument extends Document {
  collegeId: Types.ObjectId;
  year: number;
  tuitionPerYear: number;
  hostelPerYear: number;
  otherFeesPerYear: number;
}

const FeeSchema = new Schema<IFeeDocument>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    year: { type: Number, required: true },
    tuitionPerYear: { type: Number, required: true },
    hostelPerYear: { type: Number, required: true },
    otherFeesPerYear: { type: Number, required: true },
  },
  { timestamps: true }
);

FeeSchema.index({ collegeId: 1, year: -1 });

const Fee: Model<IFeeDocument> =
  mongoose.models.Fee ?? mongoose.model<IFeeDocument>("Fee", FeeSchema);

export default Fee;
