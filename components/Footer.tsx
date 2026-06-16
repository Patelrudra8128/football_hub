"use client";

import Link from "next/link";
import { Trophy, Globe, Play, MessageSquare } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto pb-20 xl:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo Section */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="teal-gradient-text font-black uppercase">Football Score</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Your ultimate live cricket scorecard and analytics platform. Stay updated with ball-by-ball commentary, player statistics, and AI prediction models.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter"><MessageSquare className="w-4 h-4" /></a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Youtube"><Play className="w-4 h-4" /></a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Github"><Globe className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/matches" className="hover:text-primary transition-colors font-medium">Match Center</Link></li>
              <li><Link href="/standings" className="hover:text-primary transition-colors font-medium">ICC Rankings</Link></li>
              <li><Link href="/predictions" className="hover:text-primary transition-colors font-medium">AI Predictions</Link></li>
            </ul>
          </div>

          {/* Guidelines / Admin links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors font-light">Football API Feed</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground">
          <span>&copy; {currentYear} Football Score. Developed for premium live sports tracking. All Rights Reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
