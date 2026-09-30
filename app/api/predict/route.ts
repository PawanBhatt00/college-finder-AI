import { NextRequest, NextResponse } from "next/server";
import { predictorSchema } from "@/lib/validators";
import { runPredictor } from "@/lib/predictor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = predictorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues?.[0]?.message ?? "Validation error" }, { status: 400 });
    }

    const { rank, category, homeState, gender } = parsed.data;
    const genderMap: Record<string, string> = {
      "Gender-Neutral": "male",
      "Female-only": "female",
      "male": "male",
      "female": "female",
    };
    const genderPref = genderMap[gender] ?? "male";

    const results = await runPredictor(rank, category, homeState, genderPref);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Predictor error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
