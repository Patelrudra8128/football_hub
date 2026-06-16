import { Team } from "./mockData";
import { db } from "./api";

export interface PredictionResult {
  homeTeam: Team;
  awayTeam: Team;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  confidence: "High" | "Medium" | "Low";
  homeXG: number;
  awayXG: number;
  reasoning: string;
}

// Predict match outcome
export async function calculatePrediction(homeTeamId: string, awayTeamId: string): Promise<PredictionResult> {
  const teams = await db.getTeams();
  const matches = await db.getMatches();

  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new Error("Invalid teams provided");
  }

  // 1. FIFA Ranking Factor (Accords 30%)
  const rankDiff = awayTeam.fifaRanking - homeTeam.fifaRanking; // Positive means Home is ranked better
  const rankWeight = 0.3;
  let homeRankScore = 0.5 + (rankDiff / 40); // Max cap at 1.0, min at 0.0
  homeRankScore = Math.max(0.1, Math.min(0.9, homeRankScore));

  // 2. Form Factor (Accords 30%)
  const getFormScore = (form: string[]): number => {
    const points = form.reduce((acc, match) => {
      if (match === "W") return acc + 3;
      if (match === "D") return acc + 1;
      return acc;
    }, 0);
    return points / 9; // Normalized to 0-1 (3 matches form)
  };
  const homeFormScore = getFormScore(homeTeam.form);
  const awayFormScore = getFormScore(awayTeam.form);
  const formDiff = homeFormScore - awayFormScore;
  const formWeight = 0.3;
  let homeFormVal = 0.5 + formDiff;
  homeFormVal = Math.max(0.1, Math.min(0.9, homeFormVal));

  // 3. Goal Metrics Factor (Accords 20%)
  const getAvgGoals = (team: Team) => {
    const played = team.stats.played || 1;
    return {
      scored: team.stats.goalsFor / played,
      conceded: team.stats.goalsAgainst / played
    };
  };

  const homeGoals = getAvgGoals(homeTeam);
  const awayGoals = getAvgGoals(awayTeam);

  // Home xG estimation
  const homeXG = Math.max(0.5, Math.min(4.0, parseFloat(((homeGoals.scored * 1.1 + awayGoals.conceded * 0.9) / 2 + 0.3).toFixed(2))));
  // Away xG estimation
  const awayXG = Math.max(0.5, Math.min(4.0, parseFloat(((awayGoals.scored * 1.1 + homeGoals.conceded * 0.9) / 2).toFixed(2))));

  const goalWeight = 0.2;
  const homeGoalScore = homeXG / (homeXG + awayXG || 1);

  // 4. Head-to-Head History (Accords 20%)
  const h2hMatches = matches.filter(
    m => m.status === "finished" &&
    ((m.homeTeamId === homeTeamId && m.awayTeamId === awayTeamId) ||
     (m.homeTeamId === awayTeamId && m.awayTeamId === homeTeamId))
  );

  let homeH2HPoints = 0;
  let awayH2HPoints = 0;

  h2hMatches.forEach(m => {
    const isHome = m.homeTeamId === homeTeamId;
    if (m.homeScore > m.awayScore) {
      if (isHome) homeH2HPoints += 3;
      else awayH2HPoints += 3;
    } else if (m.homeScore < m.awayScore) {
      if (isHome) awayH2HPoints += 3;
      else homeH2HPoints += 3;
    } else {
      homeH2HPoints += 1;
      awayH2HPoints += 1;
    }
  });

  const h2hWeight = 0.2;
  let homeH2HScore = 0.5;
  if (h2hMatches.length > 0) {
    homeH2HScore = homeH2HPoints / (homeH2HPoints + awayH2HPoints || 1);
  }

  // Combine Scores
  const homePower = 
    homeRankScore * rankWeight + 
    homeFormVal * formWeight + 
    homeGoalScore * goalWeight + 
    homeH2HScore * h2hWeight;

  // Derive Probabilities
  let homeWinProb = Math.round(homePower * 100);
  let drawProb = 25; // Base draw probability
  let awayWinProb = 100 - homeWinProb - drawProb;

  // Re-adjust draw based on closeness of power
  if (Math.abs(homePower - 0.5) < 0.1) {
    drawProb = 30;
    const rem = 100 - drawProb;
    homeWinProb = Math.round((homePower / (homePower + (1 - homePower))) * rem);
    awayWinProb = rem - homeWinProb;
  } else {
    // Distribute draw probability
    const scale = (100 - drawProb) / 100;
    homeWinProb = Math.round(homePower * 100 * scale);
    awayWinProb = 100 - homeWinProb - drawProb;
  }

  // Cap inputs to valid ranges
  if (homeWinProb < 5) homeWinProb = 5;
  if (awayWinProb < 5) awayWinProb = 5;
  drawProb = 100 - homeWinProb - awayWinProb;

  // Predicted score from xG
  let predictedHomeScore = Math.round(homeXG);
  let predictedAwayScore = Math.round(awayXG);

  // Match the predicted score with the win probabilities to avoid contradictions
  if (homeWinProb > awayWinProb && predictedHomeScore <= predictedAwayScore) {
    predictedHomeScore = predictedAwayScore + 1;
  } else if (awayWinProb > homeWinProb && predictedAwayScore <= predictedHomeScore) {
    predictedAwayScore = predictedHomeScore + 1;
  } else if (Math.abs(homeWinProb - awayWinProb) < 5 && predictedHomeScore !== predictedAwayScore) {
    predictedHomeScore = predictedAwayScore;
  }

  // Confidence Rating
  const spread = Math.abs(homeWinProb - awayWinProb);
  let confidence: "High" | "Medium" | "Low" = "Low";
  if (spread > 30) confidence = "High";
  else if (spread > 15) confidence = "Medium";

  // AI Reasoning Construction
  const rankRelation = rankDiff > 0 
    ? `${homeTeam.name} holds a higher FIFA Ranking (#${homeTeam.fifaRanking} vs #${awayTeam.fifaRanking})`
    : `${awayTeam.name} is ranked higher by FIFA (#${awayTeam.fifaRanking} vs #${homeTeam.fifaRanking})`;

  const formRelation = homeFormScore > awayFormScore
    ? `${homeTeam.name} has better recent form (${homeTeam.form.join("-")} vs ${awayTeam.form.join("-")})`
    : `${awayTeam.name} shows stronger momentum entering this matchup`;

  const goalsRelation = homeXG > awayXG
    ? `possesses a more clinical attack with an expected goals (xG) metric of ${homeXG.toFixed(1)} per game`
    : `has a slight edge in defensive resilience, restricting opponents effectively`;

  const reasoning = `Our AI model predicts a ${confidence.toLowerCase()} confidence outcome. ${rankRelation}. Furthermore, ${formRelation}. In terms of firepower, ${homeXG > awayXG ? homeTeam.name : awayTeam.name} ${goalsRelation}.`;

  return {
    homeTeam,
    awayTeam,
    homeWinProb,
    drawProb,
    awayWinProb,
    predictedHomeScore,
    predictedAwayScore,
    confidence,
    homeXG,
    awayXG,
    reasoning
  };
}
