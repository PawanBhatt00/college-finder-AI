import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually if process.env.MONGODB_URI is missing
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join("=").trim();
      }
    }
  }
}

// Models
import "../models/College";
import "../models/Branch";
import "../models/Cutoff";
import "../models/Fee";
import "../models/Placement";

const College = mongoose.model("College");
const Branch = mongoose.model("Branch");
const Cutoff = mongoose.model("Cutoff");
const Fee = mongoose.model("Fee");
const Placement = mongoose.model("Placement");

function readJSON(filename: string) {
  const filePath = path.join(__dirname, "../data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env.local");

  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected");

  // --- Colleges ---
  console.log("\n📚 Seeding colleges...");
  const collegesData = readJSON("colleges.json");
  const collegeSlugMap = new Map<string, string>(); // slug -> _id

  for (const c of collegesData) {
    const { slug, ...data } = c;
    const existing = await College.findOne({ name: data.name });
    if (existing) {
      collegeSlugMap.set(slug, existing._id.toString());
      console.log(`  ⏭  Skipped (exists): ${data.name}`);
    } else {
      const created = await College.create(data);
      collegeSlugMap.set(slug, created._id.toString());
      console.log(`  ✅ Created: ${data.name}`);
    }
  }

  // --- Branches ---
  console.log("\n🌿 Seeding branches...");
  const branchesData = readJSON("branches.json");
  const branchKeyMap = new Map<string, string>(); // "collegeSlug|branchName" -> _id

  for (const b of branchesData) {
    const { collegeSlug, ...data } = b;
    const collegeId = collegeSlugMap.get(collegeSlug);
    if (!collegeId) {
      console.log(`  ⚠️  No college found for slug: ${collegeSlug}`);
      continue;
    }
    const existing = await Branch.findOne({ collegeId: new mongoose.Types.ObjectId(collegeId), name: data.name });
    if (existing) {
      branchKeyMap.set(`${collegeSlug}|${data.name}`, existing._id.toString());
      console.log(`  ⏭  Skipped: ${collegeSlug} / ${data.name}`);
    } else {
      const created = await Branch.create({ ...data, collegeId });
      branchKeyMap.set(`${collegeSlug}|${data.name}`, created._id.toString());
      console.log(`  ✅ Created: ${collegeSlug} / ${data.name}`);
    }
  }

  // --- Cutoffs ---
  console.log("\n📊 Seeding cutoffs...");
  const cutoffsData = readJSON("cutoffs.json");
  let cutoffCreated = 0;
  let cutoffSkipped = 0;

  for (const c of cutoffsData) {
    const { collegeSlug, branchName, ...data } = c;
    const branchId = branchKeyMap.get(`${collegeSlug}|${branchName}`);
    if (!branchId) {
      console.log(`  ⚠️  No branch found: ${collegeSlug} / ${branchName}`);
      continue;
    }
    const existing = await Cutoff.findOne({
      branchId: new mongoose.Types.ObjectId(branchId),
      year: data.year,
      category: data.category,
      quota: data.quota,
      gender: data.gender,
    });
    if (existing) {
      cutoffSkipped++;
    } else {
      await Cutoff.create({ ...data, branchId });
      cutoffCreated++;
    }
  }
  console.log(`  ✅ Created: ${cutoffCreated} | Skipped: ${cutoffSkipped}`);

  // --- Fees ---
  console.log("\n💰 Seeding fees...");
  const feesData = readJSON("fees.json");
  let feeCreated = 0;
  let feeSkipped = 0;

  for (const f of feesData) {
    const { collegeSlug, ...data } = f;
    const collegeId = collegeSlugMap.get(collegeSlug);
    if (!collegeId) continue;
    const existing = await Fee.findOne({ collegeId: new mongoose.Types.ObjectId(collegeId), year: data.year });
    if (existing) {
      feeSkipped++;
    } else {
      await Fee.create({ ...data, collegeId });
      feeCreated++;
    }
  }
  console.log(`  ✅ Created: ${feeCreated} | Skipped: ${feeSkipped}`);

  // --- Placements ---
  console.log("\n🎓 Seeding placements...");
  const placementsData = readJSON("placements.json");
  let placementCreated = 0;
  let placementSkipped = 0;

  for (const p of placementsData) {
    const { collegeSlug, ...data } = p;
    const collegeId = collegeSlugMap.get(collegeSlug);
    if (!collegeId) continue;
    const existing = await Placement.findOne({ collegeId: new mongoose.Types.ObjectId(collegeId), year: data.year });
    if (existing) {
      placementSkipped++;
    } else {
      await Placement.create({ ...data, collegeId });
      placementCreated++;
    }
  }
  console.log(`  ✅ Created: ${placementCreated} | Skipped: ${placementSkipped}`);

  console.log("\n🎉 Seed complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
