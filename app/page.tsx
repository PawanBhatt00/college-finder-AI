"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3, BookOpen, MessageSquare, Heart,
  ArrowRight, TrendingUp, Shield, Zap, Star
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Smart Predictor",
    description: "Enter your JEE rank, category, and home state to get personalized college predictions with Safe, Moderate, and Ambitious labels.",
    color: "#6366f1",
  },
  {
    icon: BookOpen,
    title: "College Explorer",
    description: "Browse 100+ colleges with detailed profiles including cutoff trends, fee breakdowns, and placement statistics across 3 years.",
    color: "#10b981",
  },
  {
    icon: MessageSquare,
    title: "Grounded AI Chat",
    description: "Ask any admission question and get answers grounded strictly in our cutoff database — no hallucinations, no guessing.",
    color: "#f59e0b",
  },
  {
    icon: Heart,
    title: "Save & Compare",
    description: "Save your shortlisted colleges and compare up to 4 side-by-side across fees, placements, and cutoff ranks.",
    color: "#ef4444",
  },
];

const stats = [
  { value: "12+", label: "Top Colleges" },
  { value: "3 yrs", label: "Cutoff History" },
  { value: "5 Exams", label: "Supported" },
  { value: "AI-Powered", label: "Predictions" },
];

export default function LandingPage() {
  return (
    <div className="page-enter">
      {/* ─── Hero ─── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "6rem 0 5rem",
          textAlign: "center",
        }}
      >
        {/* Background blobs */}
        <div
          className="hero-blob"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="hero-blob"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
            bottom: "-100px",
            right: "10%",
          }}
        />

        <div className="container" style={{ position: "relative" }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}
          >
            <span
              style={{
                background: "var(--brand-bg)",
                color: "var(--brand)",
                border: "1px solid rgba(99,102,241,0.25)",
                borderRadius: "9999px",
                padding: "0.3rem 0.875rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <Star size={12} fill="currentColor" />
              India&apos;s Smartest Admission Tool
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 900,
              marginBottom: "1.25rem",
              lineHeight: 1.1,
              color: "var(--text)",
            }}
          >
            Find Your{" "}
            <span className="gradient-text">Perfect College</span>
            <br />
            With AI Precision
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: "1.15rem",
              color: "var(--text-muted)",
              maxWidth: "560px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            Enter your JEE rank and get realistic admission predictions from 3 years of cutoff data.
            Discover, compare, and save your dream engineering colleges.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/predict" className="btn-primary" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
              <BarChart3 size={18} />
              Predict My Colleges
              <ArrowRight size={16} />
            </Link>
            <Link href="/colleges" className="btn-secondary" style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}>
              <BookOpen size={18} />
              Explore Colleges
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ padding: "0 0 4rem" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="card"
                style={{ textAlign: "center", padding: "1.5rem 1rem" }}
              >
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--text)" }}>
              Everything you need to make the{" "}
              <span className="gradient-text">right choice</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "500px", margin: "0 auto" }}>
              Built for JEE students who want clarity, not confusion.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="card card-hover"
                style={{ padding: "1.75rem" }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    background: `${f.color}18`,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                    color: f.color,
                  }}
                >
                  <f.icon size={22} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem", color: "var(--text)" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section style={{ padding: "4rem 0", background: "var(--gradient-subtle)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.5rem" }}>
              Get results in 3 steps
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            {[
              { step: "01", icon: Shield, title: "Create your profile", desc: "Sign up and enter your exam details, category, and home state." },
              { step: "02", icon: Zap, title: "Run the predictor", desc: "Enter your JEE rank and get instant, data-backed college predictions." },
              { step: "03", icon: TrendingUp, title: "Compare & decide", desc: "Save shortlisted colleges and compare them side-by-side." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    background: "var(--gradient)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <Icon size={22} color="white" />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand)", letterSpacing: "0.1em" }}>
                  STEP {step}
                </span>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0.375rem 0 0.5rem", color: "var(--text)" }}>{title}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: "5rem 0", textAlign: "center" }}>
        <div className="container">
          <div
            style={{
              background: "var(--gradient)",
              borderRadius: "20px",
              padding: "3.5rem 2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
              }}
            />
            <h2 style={{ color: "white", fontSize: "2rem", fontWeight: 800, marginBottom: "0.875rem", position: "relative" }}>
              Ready to find your dream college?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "1.05rem", position: "relative" }}>
              Join thousands of JEE aspirants making data-driven admission decisions.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link
                href="/signup"
                style={{
                  background: "white",
                  color: "#6366f1",
                  borderRadius: "8px",
                  padding: "0.75rem 2rem",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "transform 0.2s",
                }}
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/predict"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  padding: "0.75rem 2rem",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                Try Predictor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.75rem 0", textAlign: "center" }}>
        <div className="container">
          <p style={{ color: "var(--text-subtle)", fontSize: "0.85rem" }}>
            © 2026 CollegeFinder AI · Built for JEE aspirants across India
          </p>
        </div>
      </footer>
    </div>
  );
}
