/* eslint-disable @typescript-eslint/no-explicit-any */
import { Team, Player, Match, NewsArticle, MOCK_NEWS, MOCK_MATCHES } from "./mockData";

const STORAGE_KEYS = {
  TEAMS: "football_score_teams",
  MATCHES: "football_score_matches",
  NEWS: "football_score_news",
  FAVORITES: "football_score_favorites"
};

const FLAG_MAP: Record<string, string> = {
  ARG: "🇦🇷", FRA: "🇫🇷", BRA: "🇧🇷", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", GER: "🇩🇪", ESP: "🇪🇸",
  MEX: "🇲🇽", USA: "🇺🇸", CAN: "🇨🇦", ITA: "🇮🇹", POR: "🇵🇹", URU: "🇺🇾",
  BEL: "🇧🇪", CRO: "🇭🇷", SEN: "🇸🇳", JPN: "🇯🇵", MAR: "🇲🇦", NED: "🇳🇱",
  KOR: "🇰🇷", CZE: "🇨🇿", CPV: "🇨🇻", KSA: "🇸🇦", COL: "🇨🇴", BEL_FLAG: "🇧🇪",
  CMR: "🇨🇲", ECU: "🇪🇨", GHA: "🇬🇭", IRN: "🇮🇷", POL: "🇵🇱", QAT: "🇶🇦",
  SRB: "🇷🇸", SUI: "🇨🇭", TUN: "🇹🇳", WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", AUS: "🇦🇺", DEN: "🇩🇰",
  CRC: "🇨🇷", GER_FLAG: "🇩🇪", JPN_FLAG: "🇯🇵", ESP_FLAG: "🇪🇸",
  MAR_FLAG: "🇲🇦", CRO_FLAG: "🇨🇷", BEL_FLAG2: "🇧🇪", CAN_FLAG: "🇨🇦"
};

const FALLBACK_TEAMS: Team[] = [
  { id: "164", name: "Spain", code: "ESP", flag: "🇪🇸", logo: "https://a.espncdn.com/i/teamlogos/countries/500/esp.png", group: "Group C", coach: "Luis de la Fuente", fifaRanking: 3, stats: { played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 5, goalsAgainst: 1, points: 7 }, previousPerformances: "Champions (2010)", form: ["W", "W", "D"], colorTheme: "from-red-600 to-yellow-500", squad: [] },
  { id: "202", name: "Argentina", code: "ARG", flag: "🇦🇷", logo: "https://a.espncdn.com/i/teamlogos/countries/500/arg.png", group: "Group A", coach: "Lionel Scaloni", fifaRanking: 1, stats: { played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 6, goalsAgainst: 2, points: 7 }, previousPerformances: "Champions (1978, 1986, 2022)", form: ["W", "W", "D"], colorTheme: "from-sky-400 to-blue-500", squad: [] },
  { id: "211", name: "France", code: "FRA", flag: "🇫🇷", logo: "https://a.espncdn.com/i/teamlogos/countries/500/fra.png", group: "Group A", coach: "Didier Deschamps", fifaRanking: 2, stats: { played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, points: 6 }, previousPerformances: "Champions (1998, 2018)", form: ["W", "L", "W"], colorTheme: "from-blue-700 to-indigo-900", squad: [] },
  { id: "204", name: "Brazil", code: "BRA", flag: "🇧🇷", logo: "https://a.espncdn.com/i/teamlogos/countries/500/bra.png", group: "Group B", coach: "Dorival Júnior", fifaRanking: 5, stats: { played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 8, goalsAgainst: 1, points: 9 }, previousPerformances: "Champions (1958, 1962, 1970, 1994, 2002)", form: ["W", "W", "W"], colorTheme: "from-yellow-400 to-green-600", squad: [] }
];

function initializeStorage() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(MOCK_NEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
  }
}

// Global caching layer to avoid duplicate HTTP requests within the same session
let cachedTeams: Team[] | null = null;
let cachedStandings: any = null;

export class ApiClient {
  private listeners: { [key: string]: ((data?: any) => void)[] } = {};

  constructor() {
    initializeStorage();
  }

  // Fetch helper that runs on browser (via proxy) or server (direct to ESPN)
  private async fetchApi(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    let url = "";
    if (typeof window === "undefined") {
      // Direct call on Server side to bypass host/origin resolution
      if (endpoint === "scoreboard") {
        url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`;
        if (params.dates) url += `?dates=${params.dates}`;
      } else if (endpoint === "summary") {
        url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${params.event}`;
      } else if (endpoint === "teams") {
        url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams`;
      } else if (endpoint === "roster") {
        url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${params.team}/roster`;
      } else if (endpoint === "standings") {
        url = `https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=${params.season || "2026"}`;
      }
    } else {
      // Proxy call on Client side
      const q = new URLSearchParams({ endpoint, ...params });
      url = `/api/espn?${q.toString()}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`ESPN API fetch failed for ${endpoint}:`, err);
      throw err;
    }
  }

  // TEAMS (with Standings stats merged in)
  async getTeams(): Promise<Team[]> {
    if (cachedTeams) return cachedTeams;

    try {
      // 1. Fetch standings to map groups and stats
      const teamStatsMap: Record<string, { group: string; stats: any; rank: number }> = {};
      try {
        const standings = await this.getStandingsData();
        standings.children?.forEach((group: any) => {
          group.standings?.entries?.forEach((entry: any) => {
            const statsObj: Record<string, number> = {};
            entry.stats?.forEach((st: any) => {
              statsObj[st.name] = st.value;
            });
            teamStatsMap[entry.team.id] = {
              group: group.name || "Group Stage",
              stats: {
                played: statsObj.gamesPlayed || 0,
                won: statsObj.wins || 0,
                drawn: statsObj.ties || 0,
                lost: statsObj.losses || 0,
                goalsFor: statsObj.pointsFor || 0,
                goalsAgainst: statsObj.pointsAgainst || 0,
                points: statsObj.points || 0
              },
              rank: statsObj.rank || 50
            };
          });
        });
      } catch (err) {
        console.warn("Could not load standings to merge stats, continuing with default stats.");
      }

      // 2. Fetch basic teams info
      const teamsData = await this.fetchApi("teams");
      const espnTeams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];

      if (espnTeams.length === 0) {
        return FALLBACK_TEAMS;
      }

      const mappedTeams: Team[] = espnTeams.map((item: any) => {
        const t = item.team;
        const std = teamStatsMap[t.id] || {
          group: "Group Stage",
          stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
          rank: 50
        };

        const codeUpper = t.abbreviation?.toUpperCase() || "";
        const flag = FLAG_MAP[codeUpper] || "🏳️";

        return {
          id: t.id,
          name: t.displayName,
          code: t.abbreviation || t.shortDisplayName,
          flag,
          logo: t.logos?.[0]?.href || t.logo || (t.abbreviation ? `https://a.espncdn.com/i/teamlogos/countries/500/${t.abbreviation.toLowerCase()}.png` : undefined),
          group: std.group,
          coach: "National Coach",
          fifaRanking: std.rank,
          stats: std.stats,
          previousPerformances: "World Cup Competitor",
          form: ["W", "D", "L"],
          colorTheme: `from-[#${t.color || "34d399"}] to-[#${t.alternateColor || "059669"}]`,
          squad: []
        };
      });

      cachedTeams = mappedTeams;
      return mappedTeams;
    } catch (err) {
      console.error("getTeams failed, falling back to static data:", err);
      return FALLBACK_TEAMS;
    }
  }

  async getStandingsData(): Promise<any> {
    if (cachedStandings) return cachedStandings;
    try {
      const data = await this.fetchApi("standings", { season: "2026" });
      cachedStandings = data;
      return data;
    } catch (err) {
      // Try with season 2022 if 2026 is not seeded
      try {
        const data = await this.fetchApi("standings", { season: "2022" });
        cachedStandings = data;
        return data;
      } catch (err2) {
        console.error("Standings endpoints failed:", err2);
        throw err2;
      }
    }
  }

  // MATCHES (Scoreboard)
  async getMatches(dates?: string): Promise<Match[]> {
    const params: Record<string, string> = {};
    params.dates = dates || "20260611-20260719";

    try {
      const data = await this.fetchApi("scoreboard", params);
      const events = data.events || [];

      const mappedMatches: Match[] = events.map((ev: any) => {
        const comp = ev.competitions?.[0];
        const homeComp = comp?.competitors?.find((c: any) => c.homeAway === "home");
        const awayComp = comp?.competitors?.find((c: any) => c.homeAway === "away");

        const statusName = comp?.status?.type?.name || "";
        const isCompleted = comp?.status?.type?.completed || false;
        const isLiveState = comp?.status?.type?.state === "in" || statusName.includes("LIVE");

        let status: Match["status"] = "scheduled";
        if (isCompleted) status = "finished";
        else if (isLiveState) status = "live";

        const minuteText = comp?.status?.displayClock || "0'";
        const minuteNum = parseInt(minuteText) || 0;

        return {
          id: ev.id,
          homeTeamId: homeComp?.team?.id || "home",
          awayTeamId: awayComp?.team?.id || "away",
          homeScore: parseInt(homeComp?.score) || 0,
          awayScore: parseInt(awayComp?.score) || 0,
          status,
          date: ev.date,
          group: comp?.altGameNote || "Group Stage",
          stage: "Group Stage",
          minute: minuteNum,
          events: []
        };
      });

      return mappedMatches;
    } catch (err) {
      console.error("getMatches failed, falling back to mock matches:", err);
      return MOCK_MATCHES;
    }
  }

  // MATCH DETAILS + LINEUPS + STATS
  async getMatchDetails(eventId: string): Promise<Match | null> {
    try {
      const data = await this.fetchApi("summary", { event: eventId });
      const header = data.header || {};
      const comp = header.competitions?.[0] || {};
      const homeComp = comp.competitors?.find((c: any) => c.homeAway === "home");
      const awayComp = comp.competitors?.find((c: any) => c.homeAway === "away");

      const statusName = comp.status?.type?.name || "";
      const isCompleted = comp.status?.type?.completed || false;
      const isLiveState = comp.status?.type?.state === "in" || statusName.includes("LIVE");

      let status: Match["status"] = "scheduled";
      if (isCompleted) status = "finished";
      else if (isLiveState) status = "live";

      const displayClock = comp.status?.displayClock || "0'";
      const minute = parseInt(displayClock) || 0;

      // Map statistics
      let stats: Match["stats"] = undefined;
      const teamsStats = data.boxscore?.teams || [];
      if (teamsStats.length >= 2) {
        const getStat = (tIndex: number, statName: string): number => {
          const valStr = teamsStats[tIndex]?.statistics?.find((s: any) => s.name === statName)?.displayValue || "0";
          return parseFloat(valStr) || 0;
        };

        stats = {
          possession: [getStat(0, "possessionPct"), getStat(1, "possessionPct")],
          shots: [getStat(0, "totalShots"), getStat(1, "totalShots")],
          shotsOnTarget: [getStat(0, "shotsOnTarget"), getStat(1, "shotsOnTarget")],
          corners: [getStat(0, "wonCorners"), getStat(1, "wonCorners")],
          fouls: [getStat(0, "foulsCommitted"), getStat(1, "foulsCommitted")],
          cards: {
            yellow: [getStat(0, "yellowCards"), getStat(1, "yellowCards")],
            red: [getStat(0, "redCards"), getStat(1, "redCards")]
          }
        };
      }

      // Map lineups
      let lineups: Match["lineups"] = undefined;
      const rosters = data.rosters || [];
      if (rosters.length >= 2) {
        const homeStarters = rosters[0].roster?.filter((p: any) => p.starter).map((p: any) => p.athlete?.displayName || p.athlete?.fullName) || [];
        const awayStarters = rosters[1].roster?.filter((p: any) => p.starter).map((p: any) => p.athlete?.displayName || p.athlete?.fullName) || [];
        lineups = {
          home: homeStarters,
          away: awayStarters
        };
      }

      // Map events timeline
      const keyEvents = data.keyEvents || [];
      const homeId = homeComp?.team?.id;
      const mappedEvents = keyEvents
        .filter((ev: any) => ev.type && ev.text)
        .map((ev: any) => {
          let type: "goal" | "yellow_card" | "red_card" | "substitution" = "goal";
          const eType = ev.type.type || "";
          if (eType.includes("card") && eType.includes("yellow")) type = "yellow_card";
          else if (eType.includes("card") && eType.includes("red")) type = "red_card";
          else if (eType.includes("sub")) type = "substitution";

          const eventText = ev.text || "";
          const isHomeEvent = eventText.toLowerCase().includes(homeComp?.team?.displayName?.toLowerCase() || "home");

          return {
            id: ev.id,
            type,
            minute: ev.clock?.value || 0,
            teamId: isHomeEvent ? homeId : (awayComp?.team?.id || "away"),
            playerName: ev.text,
            detail: ev.type.text || ""
          };
        });

      return {
        id: eventId,
        homeTeamId: homeId || "home",
        awayTeamId: awayComp?.team?.id || "away",
        homeScore: parseInt(homeComp?.score) || 0,
        awayScore: parseInt(awayComp?.score) || 0,
        status,
        date: comp.date || new Date().toISOString(),
        group: comp.altGameNote || "Group Stage",
        stage: "Group Stage",
        minute,
        events: mappedEvents,
        lineups,
        stats
      };
    } catch (err) {
      console.error(`getMatchDetails failed for event ${eventId}:`, err);
      return null;
    }
  }

  // LAZY-LOAD TEAM ROSTER PLAYERS
  async getPlayers(teamId?: string): Promise<Player[]> {
    if (!teamId) {
      return [];
    }

    try {
      const rosterData = await this.fetchApi("roster", { team: teamId });
      const athletes = rosterData.athletes || [];
      const teamName = rosterData.team?.displayName || "National Team";

      const getStatVal = (stats: any[], statName: string): number => {
        return stats?.find(s => s.name === statName)?.value || 0;
      };

      const mappedPlayers: Player[] = athletes.map((a: any) => {
        let position: Player["position"] = "Midfielder";
        const posGroup = a.position?.name || "";
        if (posGroup.includes("Goalkeeper")) position = "Goalkeeper";
        else if (posGroup.includes("Defender")) position = "Defender";
        else if (posGroup.includes("Forward") || posGroup.includes("Striker")) position = "Forward";

        return {
          id: a.id,
          teamId,
          teamName,
          name: a.displayName || a.fullName,
          position,
          age: a.age || 26,
          club: a.defaultTeam?.displayName || "National Squad",
          number: parseInt(a.jersey) || 10,
          image: a.links?.[0]?.href || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150",
          recentForm: [7, 8, 7, 8, 8],
          stats: {
            goals: getStatVal(a.stats, "totalGoals"),
            assists: getStatVal(a.stats, "goalAssists"),
            appearances: getStatVal(a.stats, "appearances"),
            yellowCards: getStatVal(a.stats, "yellowCards"),
            redCards: getStatVal(a.stats, "redCards")
          }
        };
      });

      return mappedPlayers;
    } catch (err) {
      console.error(`getPlayers failed for team ${teamId}:`, err);
      return [];
    }
  }

  // NEWS
  async getNews(): Promise<NewsArticle[]> {
    if (typeof window === "undefined") return MOCK_NEWS;
    const data = localStorage.getItem(STORAGE_KEYS.NEWS);
    return data ? JSON.parse(data) : MOCK_NEWS;
  }

  // FAVORITES
  async getFavorites(): Promise<string[]> {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  }

  async toggleFavorite(teamId: string): Promise<string[]> {
    if (typeof window === "undefined") return [];
    const favs = await this.getFavorites();
    const index = favs.indexOf(teamId);
    if (index === -1) {
      favs.push(teamId);
    } else {
      favs.splice(index, 1);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    this.triggerUpdate("favorites");
    return favs;
  }

  subscribe(topic: string, callback: (data?: any) => void) {
    if (!this.listeners[topic]) {
      this.listeners[topic] = [];
    }
    this.listeners[topic].push(callback);

    return () => {
      this.listeners[topic] = this.listeners[topic].filter(cb => cb !== callback);
    };
  }

  private triggerUpdate(topic: string, data?: any) {
    if (this.listeners[topic]) {
      this.listeners[topic].forEach(cb => cb(data));
    }
  }
}

export const db = new ApiClient();
