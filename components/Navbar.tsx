"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/matches", label: "Match Center" },
    { href: "/standings", label: "Rankings" },
    { href: "/predictions", label: "AI Predictions" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-foreground font-bold text-xl tracking-tight transition shrink-0">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="teal-gradient-text font-black uppercase">Football Score</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-all duration-200 hover:text-primary ${
                pathname === link.href ? "text-primary border-b-2 border-primary py-1" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Settings Panel */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 text-foreground/85 hover:text-primary rounded-full hover:bg-muted/30 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-secondary" />}
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground xl:hidden hover:bg-muted/20 rounded transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-card border-b border-border py-4 px-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-wider">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

