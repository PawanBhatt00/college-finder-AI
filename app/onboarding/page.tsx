"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { onboardingSchema, OnboardingInput } from "@/lib/validators";
import { INDIAN_STATES } from "@/lib/constants";
import { GraduationCap, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["General", "OBC-NCL", "SC", "ST", "EWS"] as const;
const EXAMS = ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEEE"];
const states = Object.keys(INDIAN_STATES).sort();

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { examName: "JEE Main" },
  });

  const onSubmit = async (data: OnboardingInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to save"); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "520px" }}
      >
        <div className="card" style={{ padding: "2.5rem" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: "56px", height: "56px", background: "var(--brand-bg)", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
              color: "var(--brand)",
            }}>
              <GraduationCap size={26} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.375rem" }}>
              Set up your profile
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              This helps us give you personalised predictions
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* Exam */}
            <div>
              <label className="label-base" htmlFor="examName">Primary Exam</label>
              <select id="examName" {...register("examName")} className="input-base">
                {EXAMS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              {errors.examName && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.examName.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="label-base">Category</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {CATEGORIES.map((cat) => (
                  <label key={cat} style={{ cursor: "pointer" }}>
                    <input type="radio" {...register("category")} value={cat} style={{ display: "none" }} />
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.375rem 0.875rem",
                        borderRadius: "9999px",
                        border: "1.5px solid var(--border)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        background: "var(--bg-card)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
              {errors.category && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.category.message}</p>}
            </div>

            {/* Home State */}
            <div>
              <label className="label-base" htmlFor="homeState">Home State</label>
              <select id="homeState" {...register("homeState")} className="input-base">
                <option value="">Select your state</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.homeState && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.homeState.message}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="label-base">Gender</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["male", "female", "other"] as const).map((g) => (
                  <label key={g} style={{ flex: 1, cursor: "pointer" }}>
                    <input type="radio" {...register("gender")} value={g} style={{ display: "none" }} />
                    <span
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "0.5rem",
                        borderRadius: "8px",
                        border: "1.5px solid var(--border)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        textTransform: "capitalize",
                        color: "var(--text-muted)",
                        background: "var(--bg-card)",
                      }}
                    >
                      {g}
                    </span>
                  </label>
                ))}
              </div>
              {errors.gender && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.gender.message}</p>}
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: "center", padding: "0.875rem" }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
