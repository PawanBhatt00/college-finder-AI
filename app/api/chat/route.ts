import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import ChatLog from "@/models/ChatLog";
import User from "@/models/User";
import { buildChatContext, callLLM } from "@/lib/chat";
import { chatSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Validation error" }, { status: 400 });
    }

    const { question } = parsed.data;

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Build grounded context
    const { context, contextString } = await buildChatContext(question);

    // Call LLM with grounded context
    const answer = await callLLM(question, contextString);

    // Log to DB
    const contextUsed = [
      ...context.colleges,
      ...context.cutoffs.slice(0, 5),
      ...context.fees.slice(0, 3),
      ...context.placements.slice(0, 3),
    ];

    await ChatLog.create({
      userId: user._id,
      question,
      answer,
      contextUsed,
      createdAt: new Date(),
    });

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
