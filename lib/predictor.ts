import { connectDB } from "@/lib/db";
import Branch from "@/models/Branch";
import College from "@/models/College";
import Cutoff from "@/models/Cutoff";
import { PredictorResult, Probability, Quota } from "@/types";
import { INDIAN_STATES } from "./constants";

function getProbability(rank: number, closingRank: number): Probability | null {
  if (rank <= closingRank * 0.85) return "Safe";
  if (rank <= closingRank * 1.05) return "Moderate";
  if (rank <= closingRank * 1.25) return "Ambitious";
  return null;
}

export async function runPredictor(
  rank: number,
  category: string,
  homeState: string,
  genderPref: string
): Promise<PredictorResult[]> {
  await connectDB();

  // Get the most recent cutoff year
  const latestCutoff = await Cutoff.findOne().sort({ year: -1 }).lean();
  if (!latestCutoff) return [];
  const latestYear = latestCutoff.year;

  const validGenders: Array<"Gender-Neutral" | "Female-only"> = ["Gender-Neutral"];
  if (genderPref === "female") {
    validGenders.push("Female-only");
  }

  const cutoffs = await Cutoff.find({
    year: latestYear,
    category,
    gender: { $in: validGenders },
  }).lean();

  if (!cutoffs.length) return [];

  // Get all branch and college data
  const branchIds = [...new Set(cutoffs.map((c) => c.branchId.toString()))];
  const branches = await Branch.find({ _id: { $in: branchIds } }).lean();
  const branchMap = new Map(branches.map((b) => [b._id.toString(), b]));

  const collegeIds = [...new Set(branches.map((b) => b.collegeId.toString()))];
  const colleges = await College.find({ _id: { $in: collegeIds } }).lean();
  const collegeMap = new Map(colleges.map((c) => [c._id.toString(), c]));

  const results: PredictorResult[] = [];

  for (const cutoff of cutoffs) {
    const branch = branchMap.get(cutoff.branchId.toString());
    if (!branch) continue;

    const college = collegeMap.get(branch.collegeId.toString());
    if (!college) continue;

    // Determine preferred quota
    const collegeState = college.state;
    let preferredQuota: Quota;
    if (collegeState === homeState && cutoff.quota === "HS") {
      preferredQuota = "HS";
    } else if (cutoff.quota === "OS" && collegeState !== homeState) {
      preferredQuota = "OS";
    } else if (cutoff.quota === "AI") {
      preferredQuota = "AI";
    } else {
      continue;
    }

    if (genderPref === "female" && cutoff.gender !== "Female-only") {
      const femaleExists = cutoffs.find(
        (c) =>
          c.branchId.toString() === cutoff.branchId.toString() &&
          c.gender === "Female-only" &&
          c.quota === cutoff.quota
      );
      if (femaleExists) continue;
    }

    const prob = getProbability(rank, cutoff.closingRank);
    if (!prob) continue;

    results.push({
      collegeId: college._id.toString(),
      collegeName: college.name,
      collegeType: college.type,
      branchId: branch._id.toString(),
      branchName: branch.name,
      closingRank: cutoff.closingRank,
      openingRank: cutoff.openingRank,
      probability: prob,
      quota: preferredQuota,
      nirfRank: college.nirfRank,
      state: college.state,
    });
  }

  // Deduplicate
  const seen = new Map<string, PredictorResult>();
  for (const r of results) {
    const key = `${r.collegeId}-${r.branchId}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, r);
    } else {
      const order = { Safe: 0, Moderate: 1, Ambitious: 2 };
      if (order[r.probability] < order[existing.probability]) {
        seen.set(key, r);
      }
    }
  }

  const unique = Array.from(seen.values());

  const probOrder = { Safe: 0, Moderate: 1, Ambitious: 2 };
  unique.sort((a, b) => {
    const probDiff = probOrder[a.probability] - probOrder[b.probability];
    if (probDiff !== 0) return probDiff;
    const nirfA = a.nirfRank ?? 9999;
    const nirfB = b.nirfRank ?? 9999;
    if (nirfA !== nirfB) return nirfA - nirfB;
    return a.collegeName.localeCompare(b.collegeName);
  });

  return unique;
}

export { INDIAN_STATES };
