import { NextRequest } from "next/server";
import { GET as getColleges } from "../app/api/colleges/route";
import { GET as getCollegeDetail } from "../app/api/colleges/[id]/route";
import { POST as postPredict } from "../app/api/predict/route";
import { POST as postSignup } from "../app/api/signup/route";
import { POST as postOnboarding } from "../app/api/onboarding/route";
import { GET as getSaved, POST as postSaved } from "../app/api/saved/route";
import { POST as postChat } from "../app/api/chat/route";
import { connectDB } from "../lib/db";
import College from "../models/College";

async function testApiEndpoints() {
  console.log("==========================================");
  console.log("🌐 STARTING HTTP ROUTE HANDLER TESTS");
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
    await connectDB();

    // 1. GET /api/colleges (Valid)
    console.log("\n--- Test 1: GET /api/colleges ---");
    const req1 = new NextRequest("http://localhost:3000/api/colleges?search=IIT&type=IIT&limit=5");
    const res1 = await getColleges(req1);
    const body1 = await res1.json();
    assert(res1.status === 200, "GET /api/colleges returns 200 OK");
    assert(Array.isArray(body1.colleges) && body1.colleges.length > 0, "Colleges list returned with filter", `Count: ${body1.colleges?.length}`);

    // Invalid search query params (e.g. invalid page number)
    const req1Err = new NextRequest("http://localhost:3000/api/colleges?page=-1");
    const res1Err = await getColleges(req1Err);
    assert(res1Err.status === 400, "GET /api/colleges with page=-1 returns 400 Bad Request");

    // 2. GET /api/colleges/[id]
    console.log("\n--- Test 2: GET /api/colleges/[id] ---");
    const firstCollege = await College.findOne();
    const validId = firstCollege!._id.toString();

    const req2 = new NextRequest(`http://localhost:3000/api/colleges/${validId}`);
    const res2 = await getCollegeDetail(req2, { params: Promise.resolve({ id: validId }) });
    const body2 = await res2.json();
    assert(res2.status === 200, "GET /api/colleges/[id] returns 200 OK");
    assert(body2.college?.name === firstCollege!.name, "Correct college detail returned");
    assert(Array.isArray(body2.branches), "Branches returned in college detail");

    // Invalid ObjectId format
    const req2Err = new NextRequest("http://localhost:3000/api/colleges/invalid-id-123");
    const res2Err = await getCollegeDetail(req2Err, { params: Promise.resolve({ id: "invalid-id-123" }) });
    assert(res2Err.status === 400, "GET /api/colleges/invalid-id returns 400 Bad Request");

    // 3. POST /api/predict
    console.log("\n--- Test 3: POST /api/predict ---");
    const req3 = new NextRequest("http://localhost:3000/api/predict", {
      method: "POST",
      body: JSON.stringify({
        rank: 3500,
        category: "General",
        homeState: "Maharashtra",
        gender: "Gender-Neutral",
      }),
    });
    const res3 = await postPredict(req3);
    const body3 = await res3.json();
    assert(res3.status === 200, "POST /api/predict valid payload returns 200 OK");
    assert(Array.isArray(body3.results) && body3.results.length > 0, "Prediction results generated");

    // Invalid Predictor payload (negative rank)
    const req3Err = new NextRequest("http://localhost:3000/api/predict", {
      method: "POST",
      body: JSON.stringify({
        rank: -50,
        category: "General",
        homeState: "Maharashtra",
        gender: "Gender-Neutral",
      }),
    });
    const res3Err = await postPredict(req3Err);
    assert(res3Err.status === 400, "POST /api/predict with negative rank returns 400 Bad Request");

    // 4. POST /api/signup
    console.log("\n--- Test 4: POST /api/signup ---");
    const uniqueEmail = `test_signup_${Date.now()}@example.com`;
    const req4 = new NextRequest("http://localhost:3000/api/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: uniqueEmail,
        password: "securePassword123!",
      }),
    });
    const res4 = await postSignup(req4);
    assert(res4.status === 201, "POST /api/signup returns 201 Created");

    // Duplicate email signup
    const req4Dup = new NextRequest("http://localhost:3000/api/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Duplicate User",
        email: uniqueEmail,
        password: "securePassword123!",
      }),
    });
    const res4Dup = await postSignup(req4Dup);
    assert(res4Dup.status === 409, "POST /api/signup duplicate email returns 409 Conflict");

    // Invalid signup payload (short password)
    const req4Short = new NextRequest("http://localhost:3000/api/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "valid@example.com",
        password: "123",
      }),
    });
    const res4Short = await postSignup(req4Short);
    assert(res4Short.status === 400, "POST /api/signup short password returns 400 Bad Request");

    // 5. Unauthenticated Protected Routes (Onboarding, Saved, Chat)
    console.log("\n--- Test 5: Protected Route Authentication Guards ---");
    const reqOnboarding = new NextRequest("http://localhost:3000/api/onboarding", {
      method: "POST",
      body: JSON.stringify({ examName: "JEE Main", category: "General", homeState: "Delhi", gender: "male" }),
    });
    const resOnboarding = await postOnboarding(reqOnboarding);
    assert(resOnboarding.status === 401, "Unauthenticated POST /api/onboarding returns 401 Unauthorized");

    const resGetSaved = await getSaved();
    assert(resGetSaved.status === 401, "Unauthenticated GET /api/saved returns 401 Unauthorized");

    const reqPostSaved = new NextRequest("http://localhost:3000/api/saved", {
      method: "POST",
      body: JSON.stringify({ collegeId: validId, branchId: validId }),
    });
    const resPostSaved = await postSaved(reqPostSaved);
    assert(resPostSaved.status === 401, "Unauthenticated POST /api/saved returns 401 Unauthorized");

    const reqChat = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ question: "What is CSE cutoff?" }),
    });
    const resChat = await postChat(reqChat);
    assert(resChat.status === 401, "Unauthenticated POST /api/chat returns 401 Unauthorized");

    console.log("\n==========================================");
    console.log(`📊 HTTP ROUTE TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("❌ Unexpected HTTP route test error:", err);
    process.exit(1);
  }
}

testApiEndpoints();
