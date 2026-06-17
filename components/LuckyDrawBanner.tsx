"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, Clock, CheckCircle2, Gift, Mail, 
  User, Phone, MapPin, Loader2, Sparkles, AlertCircle, 
  ExternalLink, ArrowRight, Check
} from "lucide-react";
import { enrollInLuckyDraw } from "@/lib/firebase";
import { db } from "@/lib/api";
import { Team } from "@/lib/mockData";

export default function LuckyDrawBanner() {
  const [stage, setStage] = useState<"banner" | "quests" | "form" | "success">("banner");
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Quests state
  const [task1, setTask1] = useState(false);
  const [task2, setTask2] = useState(false);
  const [task3, setTask3] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerCompleted, setTimerCompleted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    favoriteTeam: "",
    address: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [isMock, setIsMock] = useState(false);

  // Fetch teams on mount
  useEffect(() => {
    db.getTeams().then((data) => {
      setTeams(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, favoriteTeam: data[0].name }));
      }
    });

    // Check if already enrolled
    const savedTicket = localStorage.getItem("lucky_draw_enrolled_ticket");
    if (savedTicket) {
      setTicketId(savedTicket);
      setStage("success");
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (stage !== "quests") return;
    if (timerSeconds <= 0) {
      setTimerCompleted(true);
      return;
    }

    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setTimerCompleted(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, timerSeconds]);

  const handleEnrollClick = () => {
    setStage("quests");
  };

  const handleTask1 = () => {
    setTask1(true);
    // Smooth scroll down to news articles on homepage
    const newsSection = document.getElementById("trending-news-section") || document.body;
    newsSection.scrollIntoView({ behavior: "smooth" });
  };

  const handleTask2 = () => {
    setTask2(true);
    // Open predictions in a new window/tab
    window.open("/predictions", "_blank");
  };

  const handleTask3 = () => {
    setTask3(true);
    // Smooth scroll to standings table
    const standingsSection = document.getElementById("standings-section") || document.body;
    standingsSection.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError("Please fill in all details.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const result = await enrollInLuckyDraw(formData);
      if (result.success) {
        setTicketId(result.id);
        setIsMock(result.isMock || false);
        setStage("success");
      }
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "An error occurred during enrollment.");
    } finally {
      setSubmitting(false);
    }
  };

  const allQuestsCompleted = task1 && task2 && task3 && timerCompleted;

  // Format timer MM:SS
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg transition-all duration-300">
      {/* Background Decorative Blur */}
      <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 -z-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      {stage === "banner" && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusive Promotion</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
              Enroll in the <span className="teal-gradient-text">Lucky Draw</span> & Win Exclusive Gear!
            </h2>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete simple fan quests to unlock the enrollment form. We are giving away authentic team jerseys, official match balls, custom mugs, and more to lucky world cup hub fans!
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <button
                onClick={handleEnrollClick}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-md transition hover:scale-[1.02] hover:opacity-95 cursor-pointer"
              >
                <span>Enroll in Lucky Draw</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Reward Display grid */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md shrink-0">
            {/* Jersey Card */}
            <div className="group relative flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3 hover:border-primary/40 transition">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-card/60 flex items-center justify-center p-1.5">
                <img 
                  src="/lucky_jersey.png" 
                  alt="Player Jersey" 
                  className="h-full w-full object-contain filter drop-shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    // Fallback if image not loaded yet
                    e.currentTarget.src = "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150";
                  }}
                />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-foreground">Player Jersey</span>
            </div>

            {/* Ball Card */}
            <div className="group relative flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3 hover:border-primary/40 transition">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-card/60 flex items-center justify-center p-1.5">
                <img 
                  src="/lucky_football.png" 
                  alt="Official Football" 
                  className="h-full w-full object-contain filter drop-shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150";
                  }}
                />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-foreground">Match Ball</span>
            </div>

            {/* Mug Card */}
            <div className="group relative flex flex-col items-center rounded-xl border border-border bg-muted/20 p-3 hover:border-primary/40 transition">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-card/60 flex items-center justify-center p-1.5">
                <img 
                  src="/lucky_mug.png" 
                  alt="Championship Mug" 
                  className="h-full w-full object-contain filter drop-shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150";
                  }}
                />
              </div>
              <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-foreground">Premium Mug</span>
            </div>
          </div>
        </div>
      )}

      {stage === "quests" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 pb-4 gap-4">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Fan Verification Quests</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Complete all active fan tasks and wait for the security time-lock to complete.
              </p>
            </div>
            
            {/* Timer Badge */}
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black font-mono border transition ${
              timerCompleted 
                ? "bg-primary/10 border-primary/20 text-primary animate-pulse" 
                : "bg-muted/40 border-border text-foreground"
            }`}>
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span>TIME LOCK: {formatTime(timerSeconds)}</span>
            </div>
          </div>

          {/* Quests checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quest 1 */}
            <div className={`flex flex-col justify-between p-4 border rounded-xl bg-muted/10 transition ${
              task1 ? "border-primary/30 bg-primary/[0.02]" : "border-border"
            }`}>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-extrabold block">Quest 01</span>
                <h4 className="text-xs font-bold text-foreground">Read Latest News</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Browse the trending football news section at the bottom of the home page.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                {task1 ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <button
                    onClick={handleTask1}
                    className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Read News
                  </button>
                )}
              </div>
            </div>

            {/* Quest 2 */}
            <div className={`flex flex-col justify-between p-4 border rounded-xl bg-muted/10 transition ${
              task2 ? "border-primary/30 bg-primary/[0.02]" : "border-border"
            }`}>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-extrabold block">Quest 02</span>
                <h4 className="text-xs font-bold text-foreground">Check AI Predictions</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Open the AI Predictions tab to forecast upcoming World Cup fixture outcomes.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                {task2 ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <button
                    onClick={handleTask2}
                    className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Run Predictor</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Quest 3 */}
            <div className={`flex flex-col justify-between p-4 border rounded-xl bg-muted/10 transition ${
              task3 ? "border-primary/30 bg-primary/[0.02]" : "border-border"
            }`}>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-extrabold block">Quest 03</span>
                <h4 className="text-xs font-bold text-foreground">Pin Your Favorites</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Select and pin your favorite team in the league standing standings section.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                {task3 ? (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <button
                    onClick={handleTask3}
                    className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary/40 hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    View Standings
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end border-t border-border/60 pt-4">
            {allQuestsCompleted ? (
              <button
                onClick={() => setStage("form")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-md transition hover:scale-[1.02] hover:opacity-95 animate-bounce cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Open Enrollment Form</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-muted text-muted-foreground px-6 py-3 text-xs font-black uppercase tracking-wider border border-border cursor-not-allowed opacity-60"
              >
                <Clock className="w-4 h-4" />
                <span>Waiting for Quests & Time Lock</span>
              </button>
            )}
          </div>
        </div>
      )}

      {stage === "form" && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span>Lucky Draw Registration</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Submit your mailing and contact details. We will notify the winners by email.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full name */}
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Favorite Team */}
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Favorite World Cup Team</label>
                <div className="relative">
                  <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    name="favoriteTeam"
                    value={formData.favoriteTeam}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition outline-none appearance-none"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.name}>{t.flag} {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-1">
              <label className="font-extrabold text-muted-foreground uppercase text-[9px] tracking-wider">Mailing / Shipping Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  name="address"
                  required
                  rows={2}
                  placeholder="123 Championship Way, Suite 4B, New York, NY 10001"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/20 border border-border/80 rounded-xl font-bold focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStage("quests")}
                className="px-4 py-2.5 bg-muted text-foreground border border-border rounded-xl font-bold hover:bg-muted/65 transition cursor-pointer"
              >
                Back to Quests
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-black uppercase tracking-wider rounded-xl hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submit Enrollment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {stage === "success" && (
        <div className="space-y-6 text-center py-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
            <CheckCircle2 className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
              Enrolled Successfully!
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Thank you for participating! Your entry has been recorded in the database. We will notify the winners directly by email.
            </p>
          </div>

          {/* Clean Glassmorphic Confirmation Panel */}
          <div className="mx-auto max-w-sm rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 text-left text-xs font-semibold">
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Participant:</span>
              <span className="text-foreground font-bold">{formData.name || "Enrolled Fan"}</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground font-bold">{formData.email || "Registered Email"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Favorite Team:</span>
              <span className="text-foreground font-bold">{formData.favoriteTeam || "Selected Team"}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
