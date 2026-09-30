import { connectDB } from "../lib/db";
import User from "../models/User";
import College from "../models/College";
import Branch from "../models/Branch";
import Cutoff from "../models/Cutoff";
import SavedCollege from "../models/SavedCollege";
import ChatLog from "../models/ChatLog";
import { runPredictor } from "../lib/predictor";
import { buildChatContext } from "../lib/chat";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

async function runTests() {
  console.log("==========================================");
  console.log("🧪 STARTING DATABASE & API UNIT/INTEGRATION TESTS");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail ?? "Assertion failed"}`);
      failed++;
    }
  }

  try {
    // 1. Connect DB
    console.log("\n--- Test 1: Database Connectivity ---");
    const conn = await connectDB();
    assert(conn.connection.readyState === 1, "Database connection established");

    // 2. Collections count & seeding check
    console.log("\n--- Test 2: Auto-Seeding & Data Integrity ---");
    const collegeCount = await College.countDocuments();
    assert(collegeCount >= 10, "Colleges loaded into DB", `Found ${collegeCount} colleges`);

    const branchCount = await Branch.countDocuments();
    assert(branchCount >= 20, "Branches loaded into DB", `Found ${branchCount} branches`);

    const cutoffCount = await Cutoff.countDocuments();
    assert(cutoffCount >= 50, "Cutoffs loaded into DB", `Found ${cutoffCount} cutoffs`);

    // 3. User CRUD
    console.log("\n--- Test 3: User Model CRUD & Hashing ---");
    const testEmail = `testuser_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash("Password123!", 10);
    
    // Create
    const user = await User.create({
      name: "Test Aspirant",
      email: testEmail,
      authProvider: "credentials",
      passwordHash,
      role: "student",
    });
    assert(!!user._id, "Create User doc", `ID: ${user._id}`);

    // Read
    const foundUser = await User.findOne({ email: testEmail });
    assert(foundUser?.name === "Test Aspirant", "Read User doc");

    // Password Check
    const isPassValid = await bcrypt.compare("Password123!", foundUser!.passwordHash!);
    assert(isPassValid, "Password Hash comparison");

    // Update (Onboarding)
    foundUser!.examPreferences = {
      examName: "JEE Main",
      category: "General",
      homeState: "Maharashtra",
      gender: "male",
    };
    await foundUser!.save();
    const updatedUser = await User.findOne({ email: testEmail });
    assert(updatedUser?.examPreferences?.homeState === "Maharashtra", "Update User Profile");

    // 4. SavedCollege CRUD
    console.log("\n--- Test 4: SavedCollege CRUD & Constraints ---");
    const sampleCollege = await College.findOne();
    const sampleBranch = await Branch.findOne({ collegeId: sampleCollege!._id });

    // Save
    const saved = await SavedCollege.create({
      userId: user._id,
      collegeId: sampleCollege!._id,
      branchId: sampleBranch!._id,
    });
    assert(!!saved._id, "Save College to Bookmarks");

    // Duplicate check
    let duplicateCaught = false;
    try {
      await SavedCollege.create({
        userId: user._id,
        collegeId: sampleCollege!._id,
        branchId: sampleBranch!._id,
      });
    } catch {
      duplicateCaught = true;
    }
    assert(duplicateCaught, "Unique Constraint on duplicate saved college");

    // Delete
    const delRes = await SavedCollege.deleteOne({ _id: saved._id, userId: user._id });
    assert(delRes.deletedCount === 1, "Delete Saved College Bookmark");

    // Clean up test user
    await User.deleteOne({ _id: user._id });

    // 5. Predictor Logic
    console.log("\n--- Test 5: Admission Predictor Algorithm ---");
    const predictions = await runPredictor(2500, "General", "Maharashtra", "male");
    assert(Array.isArray(predictions) && predictions.length > 0, "Predictor returns non-empty result array", `Results count: ${predictions.length}`);
    
    if (predictions.length > 0) {
      const topPred = predictions[0];
      assert(["Safe", "Moderate", "Ambitious"].includes(topPred.probability), "Probability categorization valid");
      assert(typeof topPred.closingRank === "number", "Closing rank is a valid number");
    }

    // Edge case: Impossible rank
    const emptyPredictions = await runPredictor(9999999, "General", "Maharashtra", "male");
    assert(emptyPredictions.length === 0, "Predictor returns 0 results for out-of-range rank 9,999,999");

    // 6. Grounded AI Context Retriever
    console.log("\n--- Test 6: Grounded AI Context Retriever ---");
    const { context, contextString } = await buildChatContext("What is the cutoff for CSE in IIT Bombay?");
    assert(contextString.length > 50, "Chat context generated", `Context length: ${contextString.length} chars`);
    assert(context.colleges.length > 0, "Relevant colleges included in AI context");

    // 7. ChatLog CRUD
    console.log("\n--- Test 7: ChatLog Model ---");
    const chatLog = await ChatLog.create({
      userId: new mongoose.Types.ObjectId(),
      question: "Sample query",
      answer: "Sample answer",
      contextUsed: ["Context 1"],
    });
    assert(!!chatLog._id, "Chat log recorded");
    await ChatLog.deleteOne({ _id: chatLog._id });

    console.log("\n==========================================");
    console.log(`📊 TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("❌ Unexpected test execution error:", err);
    process.exit(1);
  }
}

runTests();
