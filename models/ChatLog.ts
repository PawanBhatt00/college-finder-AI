import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IChatLogDocument extends Document {
  userId: Types.ObjectId;
  question: string;
  answer: string;
  contextUsed: string[];
  createdAt: Date;
}

const ChatLogSchema = new Schema<IChatLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    contextUsed: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ChatLogSchema.index({ userId: 1, createdAt: -1 });

const ChatLog: Model<IChatLogDocument> =
  mongoose.models.ChatLog ?? mongoose.model<IChatLogDocument>("ChatLog", ChatLogSchema);

export default ChatLog;
