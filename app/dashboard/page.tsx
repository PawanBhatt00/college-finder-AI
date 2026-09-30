"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, BookOpen, Heart, MessageSquare, ArrowRight, User, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard");
  }, [status, router]);

  const { data: savedData } = useQuery({
    queryKey: ["saved"],
    queryFn: () => fetch("/api/saved").then((r) => r.json()),
    enabled: !!session,
  });

  if (status === "loading") {
    return (
      <div style={{ padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gap: "1rem" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "12px" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const savedCount = savedData?.saved?.length ?? 0;
  const firstName = session.user?.name?.split(" ")[0] ?? "Student";

  const quickActions = [
    {
      icon: BarChart3,
      title: "Run Predictor",
      desc: "Get college predictions based on your rank",
      href: "/predict",
      color: "#6366f1",
      bg: "var(--brand-bg)",
    },
    {
      icon: BookOpen,
      title: "Browse Colleges",
      desc: "Explore IITs, NITs, IIITs and more",
      href: "/colleges",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      icon: Heart,
      title: `Saved (${savedCount})`,
      desc: "View and compare your shortlisted colleges",
      href: "/saved",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },
    {
      icon: MessageSquare,
      title: "AI Chat",
      desc: "Ask admission questions powered by real data",
      href: "/chat",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
  ];

  return (
    <div className="page-enter" style={{ padding: "2.5rem 0" }}>
      <div className="container">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                background: "var(--gradient)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>
                Welcome back, {firstName}! 👋
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {session.user?.email}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {quickActions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={action.href}
                  className="card card-hover"
                  style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem", textDecoration: "none" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      background: action.bg,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: action.color,
                    }}
                  >
                    <action.icon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: "0.2rem" }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {action.desc}
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-subtle)" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Saved */}
        {savedCount > 0 && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                Recent Saves
              </h2>
              <Link href="/saved" style={{ fontSize: "0.85rem", color: "var(--brand)", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {(savedData?.saved ?? []).slice(0, 3).map((item: { _id: string; college: { _id: string; name: string; type: string; nirfRank?: number } | null; branch: { name: string } | null }) => (
                <div key={item._id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "8px",
                    background: "var(--brand-bg)", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--brand)", flexShrink: 0,
                  }}>
                    <TrendingUp size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
                      {item.college?.name ?? "Unknown College"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {item.branch?.name}
                      {item.college?.nirfRank ? ` · NIRF #${item.college.nirfRank}` : ""}
                    </div>
                  </div>
                  {item.college && (
                    <Link href={`/colleges/${item.college._id}`} style={{ fontSize: "0.8rem", color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
                      View →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Profile CTA if no preferences set */}
        {!(session as { user?: { hasProfile?: boolean } }).user?.hasProfile && (
          <div
            style={{
              marginTop: "2rem",
              background: "var(--gradient-subtle)",
              border: "1px solid var(--brand)",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
                Complete your profile for better predictions
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Add your exam details, category, and home state to get personalised results.
              </p>
            </div>
            <Link href="/onboarding" className="btn-primary" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
              Complete Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
