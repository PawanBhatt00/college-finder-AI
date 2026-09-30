async function runLiveServerTests() {
  console.log("==========================================");
  console.log("🌐 STARTING LIVE SERVER HTTP INTEGRATION TESTS");
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

  const BASE = "http://localhost:3000";

  try {
    // 1. Frontend Pages
    console.log("\n--- Section 1: Frontend Route Accessibility ---");
    const pages = ["/", "/colleges", "/predict", "/login", "/signup", "/onboarding", "/dashboard", "/saved", "/compare", "/chat"];
    for (const page of pages) {
      const res = await fetch(`${BASE}${page}`);
      assert(res.status === 200, `Page HTTP GET ${page} returns 200 OK`);
    }

    // 2. GET /api/colleges
    console.log("\n--- Section 2: College Search & Filtering API ---");
    const resColleges = await fetch(`${BASE}/api/colleges?search=IIT&type=IIT`);
    const dataColleges = await resColleges.json();
    assert(resColleges.status === 200, "GET /api/colleges returns 200 OK");
    assert(Array.isArray(dataColleges.colleges) && dataColleges.colleges.length > 0, "Colleges search returns matches", `Count: ${dataColleges.colleges?.length}`);

    const firstCollegeId = dataColleges.colleges?.[0]?._id;

    // 3. GET /api/colleges/[id]
    console.log("\n--- Section 3: College Detail API ---");
    const resDetail = await fetch(`${BASE}/api/colleges/${firstCollegeId}`);
    const dataDetail = await resDetail.json();
    assert(resDetail.status === 200, "GET /api/colleges/[id] returns 200 OK");
    assert(!!dataDetail.college && dataDetail.college._id === firstCollegeId, "Valid college detail object returned");
    assert(Array.isArray(dataDetail.branches), "Branches array returned");
    assert(Array.isArray(dataDetail.fees), "Fees array returned");
    assert(Array.isArray(dataDetail.placements), "Placements array returned");

    // Invalid ID
    const resDetailErr = await fetch(`${BASE}/api/colleges/invalid-id-xyz`);
    assert(resDetailErr.status === 400, "GET /api/colleges/invalid-id returns 400 Bad Request");

    // 4. POST /api/predict
    console.log("\n--- Section 4: Admission Predictor API ---");
    const resPredict = await fetch(`${BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rank: 4500,
        category: "General",
        homeState: "Maharashtra",
        gender: "Gender-Neutral",
      }),
    });
    const dataPredict = await resPredict.json();
    assert(resPredict.status === 200, "POST /api/predict returns 200 OK");
    assert(Array.isArray(dataPredict.results) && dataPredict.results.length > 0, "Predictions array returned", `Count: ${dataPredict.results?.length}`);

    // Invalid Predictor Input (rank = 0)
    const resPredictErr = await fetch(`${BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rank: 0,
        category: "General",
        homeState: "Maharashtra",
        gender: "Gender-Neutral",
      }),
    });
    assert(resPredictErr.status === 400, "POST /api/predict with rank=0 returns 400 Bad Request");

    // 5. POST /api/signup
    console.log("\n--- Section 5: Auth & Registration API ---");
    const testEmail = `test_live_${Date.now()}@example.com`;
    const resSignup = await fetch(`${BASE}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Live Test Student",
        email: testEmail,
        password: "SuperSecretPassword123!",
      }),
    });
    assert(resSignup.status === 201, "POST /api/signup returns 201 Created");

    // Duplicate email
    const resSignupDup = await fetch(`${BASE}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Live Test Student",
        email: testEmail,
        password: "SuperSecretPassword123!",
      }),
    });
    assert(resSignupDup.status === 409, "POST /api/signup duplicate email returns 409 Conflict");

    // 6. Security Guards & Protected Endpoints
    console.log("\n--- Section 6: Security & Protected Routes Guards ---");
    const resProtectedOnboarding = await fetch(`${BASE}/api/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examName: "JEE Main", category: "General", homeState: "Maharashtra", gender: "male" }),
    });
    assert(resProtectedOnboarding.status === 401, "Protected /api/onboarding rejects unauthenticated request with 401");

    const resProtectedSavedGet = await fetch(`${BASE}/api/saved`);
    assert(resProtectedSavedGet.status === 401, "Protected GET /api/saved rejects unauthenticated request with 401");

    const resProtectedChat = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Tell me about IIT Bombay" }),
    });
    assert(resProtectedChat.status === 401, "Protected POST /api/chat rejects unauthenticated request with 401");

    console.log("\n==========================================");
    console.log(`📊 LIVE SERVER TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("❌ Live server test execution error:", err);
    process.exit(1);
  }
}

runLiveServerTests();
