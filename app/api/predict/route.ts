import { NextRequest, NextResponse } from "next/server";
import { calculatePrediction } from "@/lib/predictionEngine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const home = searchParams.get("home");
    const away = searchParams.get("away");

    if (!home || !away) {
      return NextResponse.json(
        { error: "Missing 'home' or 'away' query parameters" },
        { status: 400 }
      );
    }

    if (home === away) {
      return NextResponse.json(
        { error: "Home and away teams cannot be the same" },
        { status: 400 }
      );
    }

    const prediction = await calculatePrediction(home, away);
    return NextResponse.json(prediction);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during prediction" },
      { status: 500 }
    );
  }
}
