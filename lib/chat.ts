import { connectDB } from "@/lib/db";
import College from "@/models/College";
import Branch from "@/models/Branch";
import Cutoff from "@/models/Cutoff";
import Fee from "@/models/Fee";
import Placement from "@/models/Placement";

interface ChatContext {
  colleges: string[];
  branches: string[];
  cutoffs: string[];
  fees: string[];
  placements: string[];
}

function parseFilters(question: string) {
  const lower = question.toLowerCase();
  const filters: {
    collegeName?: string;
    branchName?: string;
    category?: string;
    rank?: number;
  } = {};

  // Try to detect rank
  const rankMatch = lower.match(/rank\s*(?:of|is|:)?\s*(\d+)/);
  if (rankMatch) filters.rank = parseInt(rankMatch[1]);

  // Category detection
  const categories = ["general", "obc-ncl", "obc", "sc", "st", "ews"];
  for (const cat of categories) {
    if (lower.includes(cat)) {
      filters.category = cat === "obc" ? "OBC-NCL" : cat.toUpperCase();
      break;
    }
  }

  // Branch detection
  const branches = [
    "computer science",
    "cse",
    "electronics",
    "ece",
    "mechanical",
    "civil",
    "electrical",
    "chemical",
    "biotechnology",
    "mathematics",
    "physics",
    "data science",
    "ai",
  ];
  for (const branch of branches) {
    if (lower.includes(branch)) {
      filters.branchName = branch;
      break;
    }
  }

  // College name detection (check known patterns)
  const collegePatterns = ["iit", "nit", "iiit", "bits", "vit", "srm"];
  for (const pattern of collegePatterns) {
    if (lower.includes(pattern)) {
      filters.collegeName = pattern;
      break;
    }
  }

  return filters;
}

export async function buildChatContext(question: string): Promise<{
  context: ChatContext;
  contextString: string;
}> {
  await connectDB();
  const filters = parseFilters(question);

  const context: ChatContext = {
    colleges: [],
    branches: [],
    cutoffs: [],
    fees: [],
    placements: [],
  };

  // Fetch relevant colleges
  const collegeQuery: Record<string, unknown> = {};
  if (filters.collegeName) {
    collegeQuery.$or = [
      { name: { $regex: filters.collegeName, $options: "i" } },
      { type: { $regex: filters.collegeName, $options: "i" } },
    ];
  }

  const colleges = await College.find(collegeQuery).limit(10).lean();
  context.colleges = colleges.map(
    (c) =>
      `College: ${c.name} | Type: ${c.type} | State: ${c.state} | City: ${c.city} | NIRF: ${c.nirfRank ?? "N/A"}`
  );

  const collegeIds = colleges.map((c) => c._id);

  // Fetch branches
  const branchQuery: Record<string, unknown> = { collegeId: { $in: collegeIds } };
  if (filters.branchName) {
    branchQuery.name = { $regex: filters.branchName, $options: "i" };
  }

  const branches = await Branch.find(branchQuery).limit(30).lean();
  context.branches = branches.map(
    (b) =>
      `Branch: ${b.name} | Seats: ${b.seatsTotal} | CollegeId: ${b.collegeId}`
  );

  // Fetch cutoffs
  const branchIds = branches.map((b) => b._id);
  const cutoffQuery: Record<string, unknown> = { branchId: { $in: branchIds } };
  if (filters.category) cutoffQuery.category = filters.category;

  const latestCutoff = await Cutoff.findOne({ branchId: { $in: branchIds } })
    .sort({ year: -1 })
    .lean();
  if (latestCutoff) {
    cutoffQuery.year = latestCutoff.year;
  }

  const cutoffs = await Cutoff.find(cutoffQuery).limit(50).lean();
  // Build branch lookup for cutoff context
  const branchMap = new Map(branches.map((b) => [b._id.toString(), b]));
  const collegeMap = new Map(colleges.map((c) => [c._id.toString(), c]));

  context.cutoffs = cutoffs.map((c) => {
    const branch = branchMap.get(c.branchId.toString());
    const college = branch ? collegeMap.get(branch.collegeId.toString()) : null;
    return `Cutoff ${c.year}: ${college?.name ?? "?"} - ${branch?.name ?? "?"} | Category: ${c.category} | Quota: ${c.quota} | Gender: ${c.gender} | Opening: ${c.openingRank} | Closing: ${c.closingRank}`;
  });

  // Fetch fees
  const fees = await Fee.find({ collegeId: { $in: collegeIds } })
    .sort({ year: -1 })
    .limit(20)
    .lean();
  context.fees = fees.map((f) => {
    const college = collegeMap.get(f.collegeId.toString());
    const total = f.tuitionPerYear + f.hostelPerYear + f.otherFeesPerYear;
    return `Fee ${f.year}: ${college?.name ?? "?"} | Tuition: ₹${f.tuitionPerYear.toLocaleString()} | Hostel: ₹${f.hostelPerYear.toLocaleString()} | Total/yr: ₹${total.toLocaleString()}`;
  });

  // Fetch placements
  const placements = await Placement.find({ collegeId: { $in: collegeIds } })
    .sort({ year: -1 })
    .limit(20)
    .lean();
  context.placements = placements.map((p) => {
    const college = collegeMap.get(p.collegeId.toString());
    return `Placement ${p.year}: ${college?.name ?? "?"} | Avg: ${p.avgPackageLPA} LPA | Median: ${p.medianPackageLPA} LPA | Highest: ${p.highestPackageLPA} LPA | Placed: ${p.placementPercent}%`;
  });

  const contextString = [
    "=== COLLEGES ===",
    ...context.colleges,
    "=== BRANCHES ===",
    ...context.branches,
    "=== CUTOFFS ===",
    ...context.cutoffs,
    "=== FEES ===",
    ...context.fees,
    "=== PLACEMENTS ===",
    ...context.placements,
  ].join("\n");

  return { context, contextString };
}

export async function callLLM(question: string, contextString: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "AI chat is not configured. Please add your OpenAI API key.";
  }

  const systemPrompt = `You are CollegeFinder AI, a helpful assistant for Indian engineering college admissions.
You MUST answer ONLY from the provided context data below.
Do NOT guess, invent, or use any information outside the provided context.
If the answer is not in the context, say exactly: "I don't have that data in my current database."
Be concise, helpful, and factual. Format responses clearly.

CONTEXT DATA:
${contextString}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        max_tokens: 600,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("LLM error:", err);
      return "Unable to get a response from the AI right now. Please try again.";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "No response generated.";
  } catch (err) {
    console.error("LLM call failed:", err);
    return "Unable to connect to AI service. Please try again later.";
  }
}
