async function test() {
  try {
    let res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719");
    let data = await res.json();
    console.log("SCOREBOARD TEAM INFO:");
    if (data.events && data.events.length > 0) {
      const comp = data.events[0].competitions?.[0];
      const competitors = comp?.competitors || [];
      competitors.forEach(c => {
        console.log("Competitor Team:", JSON.stringify(c.team, null, 2));
      });
    }

    let teamsRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams");
    let teamsData = await teamsRes.json();
    console.log("\nTEAMS API TEAM INFO:");
    const teamObj = teamsData.sports?.[0]?.leagues?.[0]?.teams?.[0]?.team;
    if (teamObj) {
      console.log("Team:", JSON.stringify(teamObj, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

test();

