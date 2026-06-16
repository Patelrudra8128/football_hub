"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage, languages, currentLanguageInfo } = useLanguage();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/matches", label: t("nav.matchCenter") },
    { href: "/standings", label: t("nav.rankings") },
    { href: "/predictions", label: t("nav.predictions") }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-foreground font-bold text-xl tracking-tight transition shrink-0">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="teal-gradient-text font-black uppercase">{t("brand")}</span>
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
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-foreground/85 hover:text-primary rounded-full hover:bg-muted/30 transition-all font-bold text-xs cursor-pointer select-none"
              aria-label="Select Language"
            >
              <span>{currentLanguageInfo.flag}</span>
              <span className="uppercase">{currentLanguageInfo.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {langDropdownOpen && (
              <>
                {/* Overlay to close dropdown */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setLangDropdownOpen(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl border border-border bg-card/95 backdrop-blur-md p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="py-0.5 space-y-0.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          language === lang.code 
                            ? "bg-primary/15 text-primary" 
                            : "text-foreground hover:bg-muted/50 hover:text-primary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm select-none">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme switcher */}
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

