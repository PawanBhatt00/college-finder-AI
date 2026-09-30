import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import SavedCollege from "@/models/SavedCollege";
import College from "@/models/College";
import Branch from "@/models/Branch";
import User from "@/models/User";
import { saveCollegeSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ saved: [] });

    const saved = await SavedCollege.find({ userId: user._id })
      .sort({ savedAt: -1 })
      .lean();

    const collegeIds = [...new Set(saved.map((s) => s.collegeId.toString()))];
    const branchIds = [...new Set(saved.map((s) => s.branchId.toString()))];

    const colleges = await College.find({ _id: { $in: collegeIds } }).lean();
    const branches = await Branch.find({ _id: { $in: branchIds } }).lean();

    const collegeMap = new Map(colleges.map((c) => [c._id.toString(), c]));
    const branchMap = new Map(branches.map((b) => [b._id.toString(), b]));

    const result = saved.map((s) => ({
      _id: s._id.toString(),
      userId: s.userId.toString(),
      collegeId: s.collegeId.toString(),
      branchId: s.branchId.toString(),
      savedAt: s.savedAt,
      college: collegeMap.get(s.collegeId.toString()) ?? null,
      branch: branchMap.get(s.branchId.toString()) ?? null,
    }));

    return NextResponse.json({ saved: result });
  } catch (err) {
    console.error("Get saved error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = saveCollegeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Validation error" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { collegeId, branchId } = parsed.data;
    try {
      const saved = await SavedCollege.create({
        userId: user._id,
        collegeId,
        branchId,
        savedAt: new Date(),
      });
      return NextResponse.json({ saved: { _id: saved._id.toString() } }, { status: 201 });
    } catch (e: unknown) {
      // Duplicate key — already saved
      if ((e as { code?: number }).code === 11000) {
        return NextResponse.json({ error: "Already saved" }, { status: 409 });
      }
      throw e;
    }
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
