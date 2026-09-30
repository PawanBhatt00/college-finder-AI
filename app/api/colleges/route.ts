import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import College from "@/models/College";
import Fee from "@/models/Fee";
import Placement from "@/models/Placement";
import { collegeQuerySchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const parsed = collegeQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Validation error" }, { status: 400 });
    }

    const { search, state, type, nirfMax, page, limit } = parsed.data;

    await connectDB();

    // Build college filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ];
    }
    if (state) filter.state = state;
    if (type) filter.type = type;
    if (nirfMax) filter.nirfRank = { $lte: nirfMax };

    const total = await College.countDocuments(filter);
    const colleges = await College.find(filter)
      .sort({ nirfRank: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const collegeIds = colleges.map((c) => c._id);

    // Latest fee per college
    const fees = await Fee.find({ collegeId: { $in: collegeIds } })
      .sort({ year: -1 })
      .lean();
    const feeMap = new Map<string, number>();
    for (const f of fees) {
      const key = f.collegeId.toString();
      if (!feeMap.has(key)) {
        feeMap.set(key, f.tuitionPerYear + f.hostelPerYear + f.otherFeesPerYear);
      }
    }

    // Latest placement per college
    const placements = await Placement.find({ collegeId: { $in: collegeIds } })
      .sort({ year: -1 })
      .lean();
    const placementMap = new Map<string, number>();
    for (const p of placements) {
      const key = p.collegeId.toString();
      if (!placementMap.has(key)) {
        placementMap.set(key, p.avgPackageLPA);
      }
    }

    // Filter by fee/placement if specified
    const { feeMax, placementMin } = parsed.data;

    const results = colleges
      .map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        type: c.type,
        state: c.state,
        city: c.city,
        nirfRank: c.nirfRank,
        logoUrl: c.logoUrl,
        avgFee: feeMap.get(c._id.toString()) ?? null,
        avgPlacement: placementMap.get(c._id.toString()) ?? null,
      }))
      .filter((c) => {
        if (feeMax && c.avgFee && c.avgFee > feeMax) return false;
        if (placementMin && c.avgPlacement && c.avgPlacement < placementMin) return false;
        return true;
      });

    return NextResponse.json({
      colleges: results,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Colleges list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
