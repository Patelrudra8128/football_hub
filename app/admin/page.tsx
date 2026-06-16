"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { db, auth, UserProfile } from "@/lib/firebase";
import { Match, Team, MatchEvent } from "@/lib/mockData";
import { Activity, ShieldAlert, Plus, Play, Pause, RefreshCw } from "lucide-react";

export default function AdminPanel() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSimMatchId, setActiveSimMatchId] = useState<string | null>(null);

  // Form states - Add Match
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [stage, setStage] = useState("Group Stage");
  const [group, setGroup] = useState("Group A");
  const [matchDate, setMatchDate] = useState("2026-06-16T19:00:00Z");

  const [notifMsg, setNotifMsg] = useState("");

  const loadMatchesList = () => {
    db.getMatches().then(list => {
      setMatches(list);
      const live = list.find(m => m.status === "live");
      if (live && !activeSimMatchId) {
        setActiveSimMatchId(live.id);
      }
    });
  };

  useEffect(() => {
    auth.subscribeToAuthChanges(setProfile);

    db.getTeams().then(list => {
      setTeams(list);
      if (list.length > 1) {
        setHomeId(list[0].id);
        setAwayId(list[1].id);
      }
    });

    loadMatchesList();
  }, []);

  // Background Match Ticking Engine simulation loop
  useEffect(() => {
    if (!isSimulating || !activeSimMatchId) return;

    const timer = setInterval(async () => {
      // 1. Fetch current details
      const matchToTick = await db.getMatchDetails(activeSimMatchId);
      if (!matchToTick) {
        setIsSimulating(false);
        setNotifMsg("Active match details not found.");
        return;
      }

      // Check if finished
      let currentMinute = matchToTick.minute || 0;
      if (currentMinute >= 90) {
        setIsSimulating(false);
        const finishedMatch: Match = {
          ...matchToTick,
          status: "finished",
          minute: 90
        };
        await db.updateMatch(finishedMatch);
        setNotifMsg(`Match simulation finished! Final score: ${finishedMatch.homeScore} - ${finishedMatch.awayScore}`);
        loadMatchesList();
        return;
      }

      // 2. Increment minute (+1 to +2 minutes per tick)
      const inc = Math.random() > 0.5 ? 2 : 1;
      currentMinute = Math.min(90, currentMinute + inc);

      // Create mutable stats and events
      const nextStats = matchToTick.stats ? { ...matchToTick.stats } : {
        possession: [50, 50] as [number, number],
        shots: [0, 0] as [number, number],
        shotsOnTarget: [0, 0] as [number, number],
        corners: [0, 0] as [number, number],
        fouls: [0, 0] as [number, number],
        cards: { yellow: [0, 0] as [number, number], red: [0, 0] as [number, number] }
      };
      
      const nextEvents = [...(matchToTick.events || [])];
      let homeScore = matchToTick.homeScore;
      let awayScore = matchToTick.awayScore;

      // Resolve home/away team displayNames for event logs
      const homeTeamName = teams.find(t => t.id === matchToTick.homeTeamId)?.name || "Home Team";
      const awayTeamName = teams.find(t => t.id === matchToTick.awayTeamId)?.name || "Away Team";

      // Resolve random starting XI name
      const hStarters = matchToTick.lineups?.home || ["Player A", "Player B", "Player C"];
      const aStarters = matchToTick.lineups?.away || ["Player X", "Player Y", "Player Z"];

      const getRandomPlayer = (starters: string[]) => starters[Math.floor(Math.random() * starters.length)];

      // Event Generation probabilities
      const rand = Math.random();

      if (rand < 0.05) {
        // Goal scored!
        const isHomeGoal = Math.random() > 0.5;
        const scorer = isHomeGoal ? getRandomPlayer(hStarters) : getRandomPlayer(aStarters);
        const assister = isHomeGoal ? getRandomPlayer(hStarters) : getRandomPlayer(aStarters);
        
        let detailText = "";
        if (isHomeGoal) {
          homeScore += 1;
          detailText = `Goal! ${homeTeamName} ${homeScore}, ${awayTeamName} ${awayScore}. ${scorer} score, assisted by ${assister}.`;
        } else {
          awayScore += 1;
          detailText = `Goal! ${homeTeamName} ${homeScore}, ${awayTeamName} ${awayScore}. ${scorer} score, assisted by ${assister}.`;
        }

        const newGoal: MatchEvent = {
          id: `sim_event_${Date.now()}`,
          type: "goal",
          minute: currentMinute,
          teamId: isHomeGoal ? matchToTick.homeTeamId : matchToTick.awayTeamId,
          playerName: detailText,
          detail: "Goal Action"
        };
        nextEvents.unshift(newGoal);

        // Stats increments
        if (isHomeGoal) {
          nextStats.shots[0] += 1;
          nextStats.shotsOnTarget[0] += 1;
        } else {
          nextStats.shots[1] += 1;
          nextStats.shotsOnTarget[1] += 1;
        }

      } else if (rand < 0.12) {
        // Yellow Card
        const isHomeCard = Math.random() > 0.5;
        const player = isHomeCard ? getRandomPlayer(hStarters) : getRandomPlayer(aStarters);
        const cardText = `${player} (${isHomeCard ? homeTeamName : awayTeamName}) is shown the yellow card for a bad foul.`;

        const newCard: MatchEvent = {
          id: `sim_event_${Date.now()}`,
          type: "yellow_card",
          minute: currentMinute,
          teamId: isHomeCard ? matchToTick.homeTeamId : matchToTick.awayTeamId,
          playerName: cardText,
          detail: "Yellow Card"
        };
        nextEvents.unshift(newCard);

        if (isHomeCard) nextStats.cards.yellow[0] += 1;
        else nextStats.cards.yellow[1] += 1;

      } else if (rand < 0.20) {
        // Substitution
        const isHomeSub = Math.random() > 0.5;
        const playerOut = isHomeSub ? getRandomPlayer(hStarters) : getRandomPlayer(aStarters);
        const playerIn = isHomeSub ? "Merino" : "Duarte";
        const subText = `Substitution, ${isHomeSub ? homeTeamName : awayTeamName}. ${playerIn} replaces ${playerOut}.`;

        const newSub: MatchEvent = {
          id: `sim_event_${Date.now()}`,
          type: "substitution",
          minute: currentMinute,
          teamId: isHomeSub ? matchToTick.homeTeamId : matchToTick.awayTeamId,
          playerName: subText,
          detail: "Substitution"
        };
        nextEvents.unshift(newSub);
      }

      // Randomly update other stats slightly
      nextStats.possession[0] = Math.max(35, Math.min(65, nextStats.possession[0] + (Math.random() > 0.5 ? 1 : -1)));
      nextStats.possession[1] = 100 - nextStats.possession[0];
      if (Math.random() > 0.6) {
        const isHome = Math.random() > 0.5;
        if (isHome) {
          nextStats.shots[0] += 1;
          if (Math.random() > 0.5) nextStats.shotsOnTarget[0] += 1;
        } else {
          nextStats.shots[1] += 1;
          if (Math.random() > 0.5) nextStats.shotsOnTarget[1] += 1;
        }
      }
      if (Math.random() > 0.7) {
        const isHome = Math.random() > 0.5;
        if (isHome) nextStats.corners[0] += 1;
        else nextStats.corners[1] += 1;
      }
      if (Math.random() > 0.5) {
        const isHome = Math.random() > 0.5;
        if (isHome) nextStats.fouls[0] += 1;
        else nextStats.fouls[1] += 1;
      }

      // 3. Update match details object
      const updatedMatch: Match = {
        ...matchToTick,
        status: currentMinute >= 90 ? "finished" : "live",
        minute: currentMinute,
        homeScore,
        awayScore,
        stats: nextStats,
        events: nextEvents
      };

      await db.updateMatch(updatedMatch);
      loadMatchesList();
    }, 4500); // simulation ticks every 4.5 seconds

    return () => clearInterval(timer);
  }, [isSimulating, activeSimMatchId, teams]);

  const handleStartSim = async () => {
    if (!activeSimMatchId) return;
    
    const match = matches.find(m => m.id === activeSimMatchId);
    if (!match) return;

    // Load initial team rosters if empty lineups to populate scorers
    const rosters = match.lineups || {
      home: ["Simon", "Carvajal", "Laporte", "Cucurella", "Rodri", "Ruiz", "Yamal", "Pedri", "Williams", "Morata", "Olmo"],
      away: ["Maignan", "Saliba", "Hernández", "Tchouaméni", "Dembele", "Griezmann", "Mbappe", "Koundé", "Saliba", "Hernández", "Rabiot"]
    };

    const liveMatch: Match = {
      ...match,
      status: "live",
      minute: 0,
      homeScore: 0,
      awayScore: 0,
      lineups: rosters,
      events: [],
      stats: {
        possession: [50, 50],
        shots: [0, 0],
        shotsOnTarget: [0, 0],
        corners: [0, 0],
        fouls: [0, 0],
        cards: { yellow: [0, 0], red: [0, 0] }
      }
    };

    await db.updateMatch(liveMatch);
    setIsSimulating(true);
    setNotifMsg("Simulation match engine started! Ticking scoreboard updates...");
    loadMatchesList();
  };

  const handlePauseSim = () => {
    setIsSimulating(false);
    setNotifMsg("Simulation paused.");
  };

  const handleResetOverrides = async () => {
    setIsSimulating(false);
    await db.resetSimulationOverrides();
    setNotifMsg("All simulation overrides cleared. scores reverted to live ESPN feeds!");
    loadMatchesList();
  };

  const getTeam = (teamId: string) => {
    return teams.find(t => t.id === teamId);
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeId || !awayId || homeId === awayId) return;

    const newMatch: Match = {
      id: `custom_match_${Date.now()}`,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      date: matchDate,
      group: group,
      stage: stage as Match["stage"],
      minute: 0,
      events: []
    };

    await db.updateMatch(newMatch);
    setNotifMsg("New soccer matchup fixture added to schedule!");
    loadMatchesList();
  };

  if (!profile || !profile.isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-card border border-border rounded-xl p-6 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-lg font-black uppercase tracking-wider">Access Restricted</h2>
        <p className="text-xs text-muted-foreground font-semibold">Please sign in as an administrator to access controls.</p>
        <Link href="/profile" className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl block hover:opacity-95 shadow cursor-pointer">
          Go to Sign In Page
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight">
            <ShieldAlert className="w-6 h-6 text-primary animate-pulse" />
            <span className="teal-gradient-text">Admin Control Panel</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Simulate live football telemetry actions and override scoreboard fixtures locally.</p>
        </div>

        <button
          onClick={handleResetOverrides}
          className="flex items-center gap-1 text-xs text-destructive hover:underline font-bold shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Overrides</span>
        </button>
      </div>

      {/* Banner notifications */}
      {notifMsg && (
        <div className="bg-primary/10 border border-primary/25 rounded-xl p-3.5 text-xs text-primary font-bold flex justify-between items-center">
          <span>{notifMsg}</span>
          <button onClick={() => setNotifMsg("")} className="hover:underline text-[10px] uppercase font-extrabold tracking-wide cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Admin Modules grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module 1: Live Engine Simulator */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-destructive animate-pulse" />
              <span>Soccer Live Engine Simulator</span>
            </h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Select Match to Simulate</label>
                <select
                  value={activeSimMatchId || ""}
                  onChange={(e) => setActiveSimMatchId(e.target.value)}
                  className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 outline-none focus:border-primary font-bold text-xs"
                >
                  <option value="">-- Choose Match --</option>
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>
                      {getTeam(m.homeTeamId)?.name || m.homeTeamId} vs {getTeam(m.awayTeamId)?.name || m.awayTeamId} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-muted/20 p-4 rounded-xl border border-border/60 space-y-1.5 shadow-inner">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider block">Simulation Status</span>
                <p className="font-extrabold text-foreground text-sm">
                  {isSimulating ? "Running (Clock ticking...)" : "Idle / Stopped"}
                </p>
                {activeSimMatchId && (
                  <p className="text-[10px] text-muted-foreground mt-1 text-xs">
                    Current Minute: <span className="font-mono text-primary font-extrabold text-xs">
                      {matches.find(m => m.id === activeSimMatchId)?.minute || 0}&apos;
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border mt-4">
            {isSimulating ? (
              <button
                onClick={handlePauseSim}
                className="flex-1 py-2.5 bg-amber-500 text-white font-black uppercase tracking-wider rounded-xl hover:opacity-95 transition flex items-center justify-center gap-1.5 text-xs shadow cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Sim</span>
              </button>
            ) : (
              <button
                onClick={handleStartSim}
                disabled={!activeSimMatchId}
                className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-black uppercase tracking-wider rounded-xl hover:opacity-95 transition flex items-center justify-center gap-1.5 text-xs shadow disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Sim</span>
              </button>
            )}
          </div>
        </div>

        {/* Module 2: Add Match Fixture */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" />
            <span>Create Match Fixture</span>
          </h3>

          <form onSubmit={handleCreateMatch} className="space-y-3.5 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Home Team</label>
                <select
                  value={homeId}
                  onChange={(e) => setHomeId(e.target.value)}
                  className="w-full bg-muted/30 border border-border/80 rounded-lg px-2.5 py-2 outline-none focus:border-primary font-bold text-xs"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Away Team</label>
                <select
                  value={awayId}
                  onChange={(e) => setAwayId(e.target.value)}
                  className="w-full bg-muted/30 border border-border/80 rounded-lg px-2.5 py-2 outline-none focus:border-primary font-bold text-xs"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 outline-none font-bold text-xs"
                >
                  <option value="Group Stage">Group Stage</option>
                  <option value="Round of 16">Round of 16</option>
                  <option value="Quarterfinals">Quarterfinals</option>
                  <option value="Semifinals">Semifinals</option>
                  <option value="Final">Final</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Group (if Group Stage)</label>
                <input
                  type="text"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 outline-none font-bold text-xs"
                  placeholder="Group A"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Scheduled Date</label>
              <input
                type="text"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 outline-none font-mono text-xs font-semibold"
                placeholder="YYYY-MM-DDTHH:MM:SSZ"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-primary-foreground font-black uppercase tracking-wider rounded-lg hover:opacity-95 transition text-xs shadow mt-2 cursor-pointer"
            >
              Add Match to Schedule
            </button>
          </form>
        </div>

      </section>

    </div>
  );
}
