import College from "@/models/College";
import Branch from "@/models/Branch";
import Cutoff from "@/models/Cutoff";
import Fee from "@/models/Fee";
import Placement from "@/models/Placement";

import collegesData from "@/data/colleges.json";
import branchesData from "@/data/branches.json";
import cutoffsData from "@/data/cutoffs.json";
import feesData from "@/data/fees.json";
import placementsData from "@/data/placements.json";
import { CollegeType, Quota, Category, Gender } from "@/types";

export async function autoSeedIfEmpty() {
  try {
    const collegeCount = await College.countDocuments();
    if (collegeCount > 0) {
      return; // Already seeded
    }

    console.log("🌱 Auto-seeding database from local JSON data...");

    // Seed Colleges
    const collegeSlugMap = new Map<string, string>(); // slug -> _id
    for (const c of collegesData) {
      const { slug, ...data } = c;
      const created = await College.create({
        ...data,
        type: data.type as CollegeType,
      });
      collegeSlugMap.set(slug, created._id.toString());
    }

    // Seed Branches
    const branchKeyMap = new Map<string, string>(); // "collegeSlug|branchName" -> _id
    for (const b of branchesData) {
      const { collegeSlug, ...data } = b;
      const collegeId = collegeSlugMap.get(collegeSlug);
      if (!collegeId) continue;
      const created = await Branch.create({ ...data, collegeId });
      branchKeyMap.set(`${collegeSlug}|${data.name}`, created._id.toString());
    }

    // Seed Cutoffs
    const cutoffDocs = [];
    for (const c of cutoffsData) {
      const { collegeSlug, branchName, ...data } = c;
      const branchId = branchKeyMap.get(`${collegeSlug}|${branchName}`);
      if (!branchId) continue;
      cutoffDocs.push({
        ...data,
        branchId,
        category: data.category as Category,
        quota: data.quota as Quota,
        gender: data.gender as Gender,
      });
    }
    if (cutoffDocs.length) {
      await Cutoff.insertMany(cutoffDocs);
    }

    // Seed Fees
    const feeDocs = [];
    for (const f of feesData) {
      const { collegeSlug, ...data } = f;
      const collegeId = collegeSlugMap.get(collegeSlug);
      if (!collegeId) continue;
      feeDocs.push({ ...data, collegeId });
    }
    if (feeDocs.length) {
      await Fee.insertMany(feeDocs);
    }

    // Seed Placements
    const placementDocs = [];
    for (const p of placementsData) {
      const { collegeSlug, ...data } = p;
      const collegeId = collegeSlugMap.get(collegeSlug);
      if (!collegeId) continue;
      placementDocs.push({ ...data, collegeId });
    }
    if (placementDocs.length) {
      await Placement.insertMany(placementDocs);
    }

    console.log("✅ Auto-seeding complete!");
  } catch (err) {
    console.error("⚠️ Auto-seeding warning:", err);
  }
}
