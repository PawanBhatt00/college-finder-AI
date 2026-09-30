import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import College from "@/models/College";
import Branch from "@/models/Branch";
import Cutoff from "@/models/Cutoff";
import Fee from "@/models/Fee";
import Placement from "@/models/Placement";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid college ID" }, { status: 400 });
    }

    await connectDB();

    const college = await College.findById(id).lean();
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const branches = await Branch.find({ collegeId: id }).lean();
    const branchIds = branches.map((b) => b._id);

    const fees = await Fee.find({ collegeId: id }).sort({ year: -1 }).lean();
    const placements = await Placement.find({ collegeId: id }).sort({ year: -1 }).lean();

    // Build 3-year cutoff trends per branch
    const cutoffs = await Cutoff.find({
      branchId: { $in: branchIds },
      category: "General",
      gender: "Gender-Neutral",
    })
      .sort({ year: -1 })
      .lean();

    // Group by branch
    const branchCutoffMap = new Map<string, typeof cutoffs>();
    for (const c of cutoffs) {
      const key = c.branchId.toString();
      if (!branchCutoffMap.has(key)) branchCutoffMap.set(key, []);
      branchCutoffMap.get(key)!.push(c);
    }

    const cutoffTrends = branches.map((b) => ({
      branchId: b._id.toString(),
      branchName: b.name,
      data: (branchCutoffMap.get(b._id.toString()) ?? []).map((c) => ({
        year: c.year,
        openingRank: c.openingRank,
        closingRank: c.closingRank,
        category: c.category,
        quota: c.quota,
        gender: c.gender,
      })),
    }));

    return NextResponse.json({
      college: {
        ...college,
        _id: college._id.toString(),
      },
      branches: branches.map((b) => ({ ...b, _id: b._id.toString(), collegeId: b.collegeId.toString() })),
      fees: fees.map((f) => ({ ...f, _id: f._id.toString(), collegeId: f.collegeId.toString() })),
      placements: placements.map((p) => ({ ...p, _id: p._id.toString(), collegeId: p.collegeId.toString() })),
      cutoffTrends,
    });
  } catch (err) {
    console.error("College detail error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
