"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { auth, db, UserProfile } from "@/lib/firebase";
import { Team, Player } from "@/lib/mockData";
import { 
  User, LogOut, Star, Award, Shield, Users, 
  TrendingUp, BarChart2, Briefcase, ArrowLeft 
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar 
} from "recharts";

function ProfileContent() {
  const searchParams = useSearchParams();
  const playerId = searchParams.get("id");
  const teamId = searchParams.get("teamId") || "";

  // User Profile States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteTeams, setFavoriteTeams] = useState<Team[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Player Profile States
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<"career" | "form" | "compare">("career");
  const [loadingPlayer, setLoadingPlayer] = useState(false);

  const loadFavorites = async () => {
    const favIds = await db.getFavorites();
    const teamsList = await db.getTeams();
    setFavoriteTeams(teamsList.filter(t => favIds.includes(t.id)));
  };

  useEffect(() => {
    // Load User Auth
    const unsubscribe = auth.subscribeToAuthChanges(async (user) => {
      setProfile(user);
      setLoadingUser(false);
      if (user) {
        await loadFavorites();
      }
    });

    const unsubscribeFavs = db.subscribe("favorites", async () => {
      await loadFavorites();
    });

    return () => {
      unsubscribe();
      unsubscribeFavs();
    };
  }, []);

  useEffect(() => {
    if (playerId && teamId) {
      setLoadingPlayer(true);
      db.getPlayers(teamId).then(playersList => {
        const found = playersList.find(p => p.id === playerId);
        setPlayer(found || null);
        setLoadingPlayer(false);
      }).catch(err => {
        console.error("Failed to load player profile:", err);
        setLoadingPlayer(false);
      });
    } else {
      setPlayer(null);
    }
  }, [playerId, teamId]);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleGoogleLogin = async () => {
    await auth.signInWithGoogle();
  };

  const handleToggleFavorite = async (tId: string) => {
    await db.toggleFavorite(tId);
    await loadFavorites();
  };

  // 1. RENDER PLAYER PROFILE
  if (playerId) {
    if (loadingPlayer) {
      return (
        <div className="text-center py-24 text-xs text-muted-foreground">
          Loading player profile from ESPN roster...
        </div>
      );
    }

    if (!player) {
      return (
        <div className="text-center py-24">
          <p className="text-sm text-muted-foreground">Player profile not found on this team roster.</p>
          <Link href="/" className="text-primary font-bold text-xs mt-4 block hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      );
    }

    // Data for Form Trend
    const formTrendData = player.recentForm.map((score, index) => ({
      match: index + 1,
      rating: score
    }));

    // Data for Comparison (e.g. against a typical benchmark player in same position)
    const comparisonData = [
      { metric: "Goals Involv.", Player: player.stats.goals + player.stats.assists, Benchmark: 1.5 },
      { metric: "Appearances", Player: player.stats.appearances, Benchmark: 3 },
      { metric: "Yellow Cards", Player: player.stats.yellowCards, Benchmark: 0.5 }
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Section */}
        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full">
            <img
              src={player.image}
              alt={player.name}
              className="w-24 h-24 rounded-full border-2 border-primary/20 object-cover shadow-md"
            />
            
            <div className="space-y-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{player.name}</h1>
                <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded-lg w-fit mx-auto md:mx-0 uppercase tracking-wider h-fit">
                  {player.position}
                </span>
              </div>
              <p className="text-xs font-bold text-muted-foreground">
                {player.teamName} Squad • Shirt #{player.number}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] text-muted-foreground font-semibold">
                <span>Age: <span className="text-foreground font-bold">{player.age} yrs</span></span>
                <span>•</span>
                <span>Club: <span className="text-foreground font-bold">{player.club}</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-border flex gap-4 overflow-x-auto text-xs font-extrabold uppercase tracking-wider pb-0.5">
          <button
            onClick={() => setActiveTab("career")}
            className={`pb-2.5 transition cursor-pointer ${activeTab === "career" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Tournament Statistics
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`pb-2.5 transition cursor-pointer ${activeTab === "form" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Performance Trend
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`pb-2.5 transition cursor-pointer ${activeTab === "compare" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Benchmarking
          </button>
        </div>

        {/* Tab content panels */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm min-h-[200px]">
          {activeTab === "career" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>Season Stat Breakdown</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-bold">
                <div className="bg-muted/30 border border-border/50 p-4 rounded-xl">
                  <span className="block text-[8px] uppercase text-muted-foreground mb-1">Appearances</span>
                  <span className="text-lg font-mono text-foreground">{player.stats.appearances}</span>
                </div>
                <div className="bg-muted/30 border border-border/50 p-4 rounded-xl">
                  <span className="block text-[8px] uppercase text-muted-foreground mb-1">Goals</span>
                  <span className="text-lg font-mono text-primary">{player.stats.goals}</span>
                </div>
                <div className="bg-muted/30 border border-border/50 p-4 rounded-xl">
                  <span className="block text-[8px] uppercase text-muted-foreground mb-1">Assists</span>
                  <span className="text-lg font-mono text-foreground">{player.stats.assists}</span>
                </div>
                <div className="bg-muted/30 border border-border/50 p-4 rounded-xl">
                  <span className="block text-[8px] uppercase text-muted-foreground mb-1">Yellow Cards</span>
                  <span className="text-lg font-mono text-yellow-500">{player.stats.yellowCards}</span>
                </div>
                <div className="bg-muted/30 border border-border/50 p-4 rounded-xl">
                  <span className="block text-[8px] uppercase text-muted-foreground mb-1">Red Cards</span>
                  <span className="text-lg font-mono text-rose-500">{player.stats.redCards}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "form" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Player Match Rating Trend</span>
              </h3>
              
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="match" label={{ value: 'Matches Played', position: 'insideBottom', offset: -5 }} />
                    <YAxis domain={[0, 10]} label={{ value: 'Rating', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rating" stroke="#00BFA5" strokeWidth={2.5} name="Rating" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "compare" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-1.5 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span>Benchmarking stats vs Position Average</span>
              </h3>
              
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Player" fill="#00BFA5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Benchmark" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. RENDER USER DASHBOARD (FAVORITES & LOG OUTS)
  if (loadingUser) {
    return (
      <div className="text-center py-24 text-xs text-muted-foreground">
        Loading user profile dashboard...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 text-center shadow-sm animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Sign in to Football Score</h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            Create an account to pin your favorite teams, track custom stats, and save live match updates.
          </p>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-95 transition shadow cursor-pointer"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* User Info Header */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <img
            src={profile.photoURL}
            alt={profile.displayName}
            className="w-16 h-16 rounded-full border border-border/80 object-cover shadow-sm"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{profile.displayName}</h1>
            <p className="text-xs text-muted-foreground font-medium">{profile.email}</p>
            {profile.isAdmin && (
              <span className="inline-block bg-primary/15 text-primary border border-primary/30 text-[9px] font-black px-2.5 py-0.5 rounded mt-2 uppercase tracking-wider">
                Administrator
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-destructive/30 hover:bg-destructive/10 text-destructive text-xs font-black uppercase tracking-wider rounded-xl transition shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </section>

      {/* Favorites Table Dashboard */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <Star className="w-4 h-4 text-primary fill-current" />
          <span>Pinned Favorite Teams</span>
        </h3>

        {favoriteTeams.length > 0 ? (
          <div className="divide-y divide-border">
            {favoriteTeams.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3 hover:bg-muted/10 px-1 rounded transition text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.flag}</span>
                  <span className="font-extrabold text-foreground">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">FIFA Ranking Rank: #{t.fifaRanking}</span>
                </div>
                <button
                  onClick={() => handleToggleFavorite(t.id)}
                  className="p-1.5 text-primary hover:text-muted-foreground transition-colors cursor-pointer"
                  title="Unpin team"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground font-medium">
            <p>No favorite teams pinned yet.</p>
            <Link href="/" className="text-primary hover:underline font-bold block mt-1.5 uppercase tracking-wide">
              Pin your favorite squads from standings on the homepage &rarr;
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-xs text-muted-foreground">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
