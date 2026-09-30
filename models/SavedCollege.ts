import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISavedCollegeDocument extends Document {
  userId: Types.ObjectId;
  collegeId: Types.ObjectId;
  branchId: Types.ObjectId;
  savedAt: Date;
}

const SavedCollegeSchema = new Schema<ISavedCollegeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

SavedCollegeSchema.index({ userId: 1, savedAt: -1 });
SavedCollegeSchema.index({ userId: 1, collegeId: 1, branchId: 1 }, { unique: true });

const SavedCollege: Model<ISavedCollegeDocument> =
  mongoose.models.SavedCollege ??
  mongoose.model<ISavedCollegeDocument>("SavedCollege", SavedCollegeSchema);

export default SavedCollege;
