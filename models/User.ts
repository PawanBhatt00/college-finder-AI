import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  authProvider: "google" | "credentials";
  passwordHash?: string;
  role: "student";
  examPreferences?: {
    examName: string;
    category: "General" | "OBC-NCL" | "SC" | "ST" | "EWS";
    homeState: string;
    gender: "male" | "female" | "other";
  };
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    authProvider: { type: String, enum: ["google", "credentials"], required: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["student"], default: "student" },
    examPreferences: {
      examName: { type: String },
      category: { type: String, enum: ["General", "OBC-NCL", "SC", "ST", "EWS"] },
      homeState: { type: String },
      gender: { type: String, enum: ["male", "female", "other"] },
    },
  },
  { timestamps: true }
);

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", UserSchema);

export default User;
