export interface PlayerStats {
  goals: number;
  assists: number;
  appearances: number;
  yellowCards: number;
  redCards: number;
  cleanSheets?: number;
}

export interface Player {
  id: string;
  teamId: string;
  teamName: string;
  name: string;
  position: "Goalkeeper" | "Defender" | "Midfielder" | "Forward";
  age: number;
  club: string;
  number: number;
  stats: PlayerStats;
  image: string;
  recentForm: number[]; // Last 5 matches ratings or goal contributions
}

export interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  logo?: string;
  group: string;
  coach: string;
  fifaRanking: number;
  stats: TeamStats;
  previousPerformances: string;
  form: ("W" | "D" | "L")[];
  colorTheme: string;
  squad: string[]; // Player IDs
  playingXI?: string[]; // Starter Names
}

export interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  minute: number;
  teamId: string;
  playerName: string;
  detail?: string; // e.g. Assist name, card reason
}

export interface MatchStats {
  possession: [number, number]; // [home, away]
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  cards: {
    yellow: [number, number];
    red: [number, number];
  };
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "finished";
  date: string;
  group?: string;
  stage: "Group Stage" | "Round of 16" | "Quarterfinals" | "Semifinals" | "Third Place" | "Final";
  minute?: number;
  events: MatchEvent[];
  lineups?: {
    home: string[];
    away: string[];
  };
  stats?: MatchStats;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: "Match Report" | "Injury News" | "Team Update" | "Analysis";
  date: string;
  readTime: string;
}

export const MOCK_TEAMS: Team[] = [
  {
    id: "arg",
    name: "Argentina",
    code: "ARG",
    flag: "🇦🇷",
    logo: "https://a.espncdn.com/i/teamlogos/countries/500/arg.png",
    group: "Group A",
    coach: "Lionel Scaloni",
    fifaRanking: 1,
    stats: { played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 6, goalsAgainst: 2, points: 7 },
    previousPerformances: "Champions (1978, 1986, 2022)",
    form: ["W", "W", "D"],
    colorTheme: "from-sky-400 to-blue-500",
    squad: ["messi", "martinez", "alvarez", "depaul", "enzo"],
    playingXI: ["E. Martínez", "Molina", "Romero", "Otamendi", "Tagliafico", "De Paul", "Enzo", "Mac Allister", "Messi", "Alvarez", "N. González"]
  },
  {
    id: "fra",
    name: "France",
    code: "FRA",
    flag: "🇫🇷",
    logo: "https://a.espncdn.com/i/teamlogos/countries/500/fra.png",
    group: "Group A",
    coach: "Didier Deschamps",
    fifaRanking: 2,
    stats: { played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 5, goalsAgainst: 3, points: 6 },
    previousPerformances: "Champions (1998, 2018)",
    form: ["W", "L", "W"],
    colorTheme: "from-blue-700 to-indigo-900",
    squad: ["mbappe", "griezmann", "maignan", "dembele"],
    playingXI: ["Maignan", "Koundé", "Upamecano", "Saliba", "Hernández", "Tchouaméni", "Camavinga", "Dembélé", "Griezmann", "Barcola", "Mbappé"]
  },
  {
    id: "bra",
    name: "Brazil",
    code: "BRA",
    flag: "🇧🇷",
    logo: "https://a.espncdn.com/i/teamlogos/countries/500/bra.png",
    group: "Group B",
    coach: "Dorival Júnior",
    fifaRanking: 5,
    stats: { played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 8, goalsAgainst: 1, points: 9 },
    previousPerformances: "Champions (1958, 1962, 1970, 1994, 2002)",
    form: ["W", "W", "W"],
    colorTheme: "from-yellow-400 to-green-600",
    squad: ["vinicius", "neymar", "alisson", "rodrygo"],
    playingXI: ["Alisson", "Danilo", "Marquinhos", "Gabriel", "Arana", "Guimarães", "Gomes", "Paquetá", "Rodrygo", "Neymar", "Vinícius"]
  },
  {
    id: "eng",
    name: "England",
    code: "ENG",
    flag: "🏴\u200D☠️",
    logo: "https://a.espncdn.com/i/teamlogos/countries/500/eng.png",
    group: "Group B",
    coach: "Thomas Tuchel",
    fifaRanking: 4,
    stats: { played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 7, goalsAgainst: 2, points: 7 },
    previousPerformances: "Champions (1966)",
    form: ["W", "D", "W"],
    colorTheme: "from-red-500 to-blue-700",
    squad: ["kane", "bellingham", "saka", "rice"],
    playingXI: ["Pickford", "Walker", "Stones", "Guehi", "Trippier", "Rice", "Mainoo", "Saka", "Bellingham", "Foden", "Kane"]
  },
  {
    id: "ger",
    name: "Germany",
    code: "GER",
    flag: "🇩🇪",
    logo: "https://a.espncdn.com/i/teamlogos/countries/500/ger.png",
    group: "Group C",
    coach: "Julian Nagelsmann",
    fifaRanking: 11,
    stats: { played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 6, goalsAgainst: 4, points: 6 },
    previousPerformances: "Champions (1954, 1974, 1990, 2014)",
    form: ["W", "W", "L"],
    colorTheme: "from-gray-700 to-black",
    squad: ["musiala", "havertz", "wirtz", "kroos"],
    playingXI: ["Ter Stegen", "Kimmich", "Rüdiger", "Tah", "Mittelstädt", "Andrich", "Kroos", "Musiala", "Gündoğan", "Wirtz", "Havertz"]
  },
  {
    id: "esp",
    name: "Spain",
    code: "ESP",
    flag: "🇪🇸",
    logo: "https://a.espncdn.com/i/teamlogos/countries/500/esp.png",
    group: "Group C",
    coach: "Luis de la Fuente",
    fifaRanking: 3,
    stats: { played: 3, won: 2, drawn: 1, lost: 0, goalsFor: 5, goalsAgainst: 1, points: 7 },
    previousPerformances: "Champions (2010)",
    form: ["W", "W", "D"],
    colorTheme: "from-red-600 to-yellow-500",
    squad: ["yamal", "williams", "rodri", "pedri"],
    playingXI: ["Simon", "Carvajal", "Le Normand", "Laporte", "Cucurella", "Rodri", "Ruiz", "Yamal", "Pedri", "Williams", "Morata"]
  }
];

export const MOCK_PLAYERS: Player[] = [
  {
    id: "messi",
    teamId: "arg",
    teamName: "Argentina",
    name: "Lionel Messi",
    position: "Forward",
    age: 38,
    club: "Inter Miami CF",
    number: 10,
    stats: { goals: 4, assists: 3, appearances: 3, yellowCards: 0, redCards: 0 },
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150",
    recentForm: [9, 8, 9, 7, 8]
  },
  {
    id: "mbappe",
    teamId: "fra",
    teamName: "France",
    name: "Kylian Mbappé",
    position: "Forward",
    age: 27,
    club: "Real Madrid",
    number: 10,
    stats: { goals: 5, assists: 1, appearances: 3, yellowCards: 1, redCards: 0 },
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    recentForm: [8, 9, 8, 9, 7]
  },
  {
    id: "vinicius",
    teamId: "bra",
    teamName: "Brazil",
    name: "Vinícius Júnior",
    position: "Forward",
    age: 25,
    club: "Real Madrid",
    number: 7,
    stats: { goals: 3, assists: 2, appearances: 3, yellowCards: 1, redCards: 0 },
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    recentForm: [8, 8, 7, 9, 8]
  },
  {
    id: "bellingham",
    teamId: "eng",
    teamName: "England",
    name: "Jude Bellingham",
    position: "Midfielder",
    age: 22,
    club: "Real Madrid",
    number: 10,
    stats: { goals: 2, assists: 1, appearances: 3, yellowCards: 1, redCards: 0 },
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    recentForm: [7, 8, 9, 8, 7]
  },
  {
    id: "musiala",
    teamId: "ger",
    teamName: "Germany",
    name: "Jamal Musiala",
    position: "Midfielder",
    age: 23,
    club: "Bayern Munich",
    number: 10,
    stats: { goals: 2, assists: 3, appearances: 3, yellowCards: 0, redCards: 0 },
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    recentForm: [9, 8, 8, 9, 9]
  },
  {
    id: "yamal",
    teamId: "esp",
    teamName: "Spain",
    name: "Lamine Yamal",
    position: "Forward",
    age: 18,
    club: "FC Barcelona",
    number: 19,
    stats: { goals: 2, assists: 4, appearances: 3, yellowCards: 0, redCards: 0 },
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    recentForm: [9, 9, 8, 9, 8]
  }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: "m1",
    homeTeamId: "arg",
    awayTeamId: "fra",
    homeScore: 2,
    awayScore: 0,
    status: "finished",
    date: "2026-06-11T18:00:00Z",
    group: "Group A",
    stage: "Group Stage",
    events: [
      { id: "e1", type: "goal", minute: 34, teamId: "arg", playerName: "Lionel Messi", detail: "Penalty" },
      { id: "e2", type: "yellow_card", minute: 45, teamId: "fra", playerName: "Kylian Mbappé" },
      { id: "e3", type: "goal", minute: 76, teamId: "arg", playerName: "Julian Alvarez", detail: "Lionel Messi assist" }
    ],
    lineups: {
      home: ["E. Martínez", "Molina", "Romero", "Otamendi", "Tagliafico", "De Paul", "Enzo", "Mac Allister", "Messi", "Alvarez", "N. González"],
      away: ["Maignan", "Koundé", "Upamecano", "Saliba", "Hernández", "Tchouaméni", "Camavinga", "Dembélé", "Griezmann", "Barcola", "Mbappé"]
    },
    stats: {
      possession: [58, 42],
      shots: [14, 6],
      shotsOnTarget: [6, 2],
      corners: [5, 3],
      fouls: [11, 14],
      cards: { yellow: [1, 2], red: [0, 0] }
    }
  },
  {
    id: "m_live",
    homeTeamId: "esp",
    awayTeamId: "ger",
    homeScore: 2,
    awayScore: 1,
    status: "live",
    date: "2026-06-15T18:00:00Z",
    group: "Group C",
    stage: "Group Stage",
    minute: 75,
    events: [
      { id: "e4", type: "goal", minute: 18, teamId: "esp", playerName: "Lamine Yamal", detail: "Pedri assist" },
      { id: "e5", type: "yellow_card", minute: 32, teamId: "ger", playerName: "Toni Kroos" },
      { id: "e6", type: "goal", minute: 51, teamId: "ger", playerName: "Kai Havertz", detail: "Jamal Musiala assist" },
      { id: "e7", type: "goal", minute: 68, teamId: "esp", playerName: "Nico Williams", detail: "Lamine Yamal assist" }
    ],
    lineups: {
      home: ["Simon", "Carvajal", "Le Normand", "Laporte", "Cucurella", "Rodri", "Ruiz", "Yamal", "Pedri", "Williams", "Morata"],
      away: ["Ter Stegen", "Kimmich", "Rüdiger", "Tah", "Mittelstädt", "Andrich", "Kroos", "Musiala", "Gündoğan", "Wirtz", "Havertz"]
    },
    stats: {
      possession: [52, 48],
      shots: [11, 9],
      shotsOnTarget: [5, 4],
      corners: [4, 6],
      fouls: [9, 11],
      cards: { yellow: [0, 1], red: [0, 0] }
    }
  },
  {
    id: "m3",
    homeTeamId: "bra",
    awayTeamId: "eng",
    homeScore: 0,
    awayScore: 0,
    status: "scheduled",
    date: "2026-06-18T19:00:00Z",
    group: "Group B",
    stage: "Group Stage",
    events: []
  }
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: "n1",
    title: "Messi Shines as Argentina Defeats France 2-0 in Opener",
    summary: "A masterclass performance from Lionel Messi inspires Argentina to a comfortable victory over France in their group opener.",
    content: "Lionel Messi showed that age is just a number with a stunning display at the World Cup. The 38-year-old maestro opened the scoring with a coolly converted penalty before providing a gorgeous defense-splitting assist for Julian Alvarez.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600",
    category: "Match Report",
    date: "2026-06-11T21:00:00Z",
    readTime: "4 min read"
  },
  {
    id: "n2",
    title: "Injury Update: French Midfielder Tchouaméni a Doubt for Next Match",
    summary: "Aurélien Tchouaméni picked up a knock in training, raising concerns about his availability for France.",
    content: "The French national team has been dealt a potential blow as midfielder Aurélien Tchouaméni was forced to leave training early due to a calf issue.",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600",
    category: "Injury News",
    date: "2026-06-12T10:00:00Z",
    readTime: "2 min read"
  }
];
