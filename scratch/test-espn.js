async function test() {
  try {
    let res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719");
    let data = await res.json();
    console.log("2026 RANGE (20260611-20260719) SCOREBOARD:");
    console.log("Count of events:", data.events?.length);
    if (data.events && data.events.length > 0) {
      console.log("First event date:", data.events[0].date);
      console.log("First event teams:", data.events[0].name);
      console.log("Last event date:", data.events[data.events.length - 1].date);
      console.log("Last event teams:", data.events[data.events.length - 1].name);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
