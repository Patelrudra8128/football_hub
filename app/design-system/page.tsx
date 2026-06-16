"use client";

import React, { useState } from "react";
import { Trophy, Bell, Sparkles, ChevronDown } from "lucide-react";

export default function DesignSystem() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const notifications = [
    { id: 1, title: "Goal Scored!", body: "Spain 2, Cabo Verde 1. Álvaro Morata (81') scores, assisted by Dani Olmo.", time: "1 min ago" },
    { id: 2, title: "Match Started", body: "Kickoff! Cape Verde vs Spain is now underway.", time: "2 hrs ago" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 max-w-5xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Design System & Component Library</h1>
        <p className="text-xs text-muted-foreground mt-1.5 font-semibold">
          Football Score&apos;s core design guidelines, color palettes, visual hierarchies, and premium soccer UI components.
        </p>
      </div>

      {/* Grid of Sections */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colors & Fonts */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b border-border pb-2">
            1. Brand Style Guide
          </h3>
          
          <div className="space-y-4">
            {/* Color swatches */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Color Swatches</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-white">
                <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                  Teal (Primary)
                </div>
                <div className="bg-destructive p-3 rounded-lg text-destructive-foreground">
                  Red Card (Coral)
                </div>
                <div className="bg-yellow-500 p-3 rounded-lg text-white">
                  Yellow Card
                </div>
              </div>
            </div>

            {/* Typography sample */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Typography System</span>
              <div className="space-y-2.5">
                <h1 className="text-xl font-black text-foreground uppercase">H1 Display Bold</h1>
                <h2 className="text-sm font-extrabold text-foreground uppercase">H2 Section Heading</h2>
                <p className="text-xs text-muted-foreground leading-normal font-semibold">
                  Paragraph style: Clean, legible, high-density soccer statistics description.
                </p>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary block">TINY UTILITY LABEL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Controls */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b border-border pb-2">
            2. UI Control Elements
          </h3>

          <div className="space-y-4">
            {/* Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Buttons</span>
              <div className="flex flex-wrap gap-2">
                <button className="bg-primary text-primary-foreground font-black text-xs px-3.5 py-1.5 rounded-lg hover:opacity-90 transition cursor-pointer">
                  Primary
                </button>
                <button className="border border-border text-foreground font-black text-xs px-3.5 py-1.5 rounded-lg hover:bg-muted/10 transition cursor-pointer">
                  Outline
                </button>
              </div>
            </div>

            {/* Inputs & Dropdowns */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Filters & Dropdowns</span>
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-muted/40 border border-border/80 px-3.5 py-1.5 rounded-lg text-xs font-bold flex justify-between items-center cursor-pointer"
                >
                  <span>Select Group Stage Filter</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 z-10 bg-card border border-border rounded-lg shadow-lg py-1 text-xs">
                    <button className="w-full text-left px-3 py-1.5 hover:bg-muted/20">Group A</button>
                    <button className="w-full text-left px-3 py-1.5 hover:bg-muted/20">Group B</button>
                    <button className="w-full text-left px-3 py-1.5 hover:bg-muted/20">Knockout Bracket</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Notification Center Widget */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b border-border pb-2 flex items-center justify-between">
            <span>3. Notification Center</span>
            <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
          </h3>

          <div className="space-y-3 max-h-48 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className="bg-muted/30 border border-border/60 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-primary" />
                    {n.title}
                  </span>
                  <span className="text-[8px] text-muted-foreground font-mono font-semibold">{n.time}</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold leading-normal">{n.body}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Widget Showcase */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <h3 className="text-xs font-black uppercase text-muted-foreground tracking-widest border-b border-border pb-2">
          4. Soccer Live Score Ticker Widget
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Live Score Widget mock */}
          <div className="bg-muted/15 border border-border/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative">
            <div className="flex justify-between items-center text-xs">
              <span className="bg-primary/10 border border-primary/20 text-primary font-black px-2 py-0.5 rounded text-[8px] uppercase tracking-wide">
                Live Match Telemetry
              </span>
              <span className="text-xs font-mono font-black text-primary animate-pulse">81&apos; mins</span>
            </div>

            <div className="flex justify-around items-center py-2 border-y border-border/40 font-bold">
              <div className="text-center">
                <span className="text-3xl">🇪🇸</span>
                <p className="text-[10px] text-muted-foreground uppercase">ESP</p>
                <p className="text-sm font-black font-mono">2</p>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">VS</span>
              <div className="text-center">
                <span className="text-3xl">🇨🇻</span>
                <p className="text-[10px] text-muted-foreground uppercase">CPV</p>
                <p className="text-sm font-black font-mono">1</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
              <span>Álvaro Morata 81&apos; ⚽</span>
              <span>Sidny Cabral 16&apos; 🟨</span>
            </div>
          </div>

          {/* AI Win Prob Mock */}
          <div className="bg-muted/15 border border-border/80 rounded-2xl p-5 flex flex-col justify-around space-y-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI Expected Goals (xG)</span>
            </span>

            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between text-[10px] text-foreground">
                <span>ESP: 2.14 xG</span>
                <span>CPV: 0.86 xG</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: "71%" }} />
                <div className="bg-secondary h-full" style={{ width: "29%" }} />
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
              Spain has controlled play with 74.4% possession and is highly predicted to win from this position.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
