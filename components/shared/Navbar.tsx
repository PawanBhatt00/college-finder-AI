"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";
import {
  GraduationCap, Moon, Sun, Menu, X, BookOpen,
  BarChart3, Heart, MessageSquare, LogOut, User
} from "lucide-react";

const navLinks = [
  { href: "/predict", label: "Predictor", icon: BarChart3 },
  { href: "/colleges", label: "Colleges", icon: BookOpen },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", height: "3.75rem", gap: "1.5rem" }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              background: "var(--gradient)",
              borderRadius: "8px",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            CollegeFinder{" "}
            <span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: "0.25rem", flex: 1, alignItems: "center" }} className="hidden sm:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.375rem",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s",
            }}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link href="/dashboard" className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>
                <User size={14} />
                {session.user?.name?.split(" ")[0] ?? "Dashboard"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "0.375rem",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.2s",
                }}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href="/login" className="btn-secondary" style={{ padding: "0.4rem 0.875rem", fontSize: "0.85rem" }}>
                Log in
              </Link>
              <Link href="/signup" className="btn-primary" style={{ padding: "0.4rem 0.875rem", fontSize: "0.85rem" }}>
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden"
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.375rem",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--bg-card)",
            borderTop: "1px solid var(--border)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
          className="sm:hidden"
        >
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
