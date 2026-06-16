import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    const event = searchParams.get("event");
    const team = searchParams.get("team");
    const dates = searchParams.get("dates");
    const season = searchParams.get("season") || "2026";

    let url = "";

    if (endpoint === "scoreboard") {
      url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
      if (dates) {
        url += `?dates=${dates}`;
      }
    } else if (endpoint === "summary") {
      if (!event) {
        return NextResponse.json({ error: "Missing event parameter" }, { status: 400 });
      }
      url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event}`;
    } else if (endpoint === "teams") {
      url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams`;
    } else if (endpoint === "roster") {
      if (!team) {
        return NextResponse.json({ error: "Missing team parameter" }, { status: 400 });
      }
      url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${team}/roster`;
    } else if (endpoint === "standings") {
      url = `https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=${season}`;
    } else {
      return NextResponse.json({ error: "Invalid endpoint parameter" }, { status: 400 });
    }

    const res = await fetch(url, {
      next: { revalidate: 10 } // Cache responses for 10 seconds for real-time scores updates
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `ESPN API returned status code ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Internal Server Error in ESPN proxy" },
      { status: 500 }
    );
  }
}
