"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, Moon, Sun, Menu, X, LogIn, LogOut, User, LayoutGrid } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { auth, UserProfile } from "@/lib/firebase";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Auth updates
    const unsubscribeAuth = auth.subscribeToAuthChanges((u) => {
      setUser(u);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogin = async () => {
    await auth.signInWithGoogle();
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/matches", label: "Match Center" },
    { href: "/standings", label: "Rankings" },
    { href: "/predictions", label: "AI Predictions" },
    { href: "/design-system", label: "Design System" }
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
          {user?.isAdmin && (
            <Link
              href="/admin"
              className={`transition-all duration-200 hover:text-primary ${
                pathname === "/admin" ? "text-primary border-b-2 border-primary py-1" : "text-muted-foreground"
              }`}
            >
              Admin
            </Link>
          )}
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

          {/* User Sign In Control */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-border/50">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-85 transition">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-primary/40 object-cover"
                />
                <span className="text-xs font-extrabold hidden lg:inline max-w-[85px] truncate text-foreground">{user.displayName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-muted/20 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded hover:opacity-95 transition-opacity pl-3 border-l border-border/50 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}

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
            {user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`transition-colors ${
                  pathname === "/admin" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
            {user && (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 mt-2 pt-2 border-t border-border/40"
              >
                <User className="w-4 h-4 text-primary" />
                <span>My Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
