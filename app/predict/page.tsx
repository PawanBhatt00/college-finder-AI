"use client";

import { useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { predictorSchema, PredictorInput } from "@/lib/validators";
import { INDIAN_STATES } from "@/lib/constants";
import { PredictorResult } from "@/types";
import {
  BarChart3,
  Loader2,
  ArrowRight,
  MapPin,
  BookOpen,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

const CATEGORIES = ["General", "OBC-NCL", "SC", "ST", "EWS"] as const;
const states = Object.keys(INDIAN_STATES).sort();

function ProbabilityBadge({ probability }: { probability: string }) {
  const cls =
    probability === "Safe"
      ? "badge-safe"
      : probability === "Moderate"
        ? "badge-moderate"
        : "badge-ambitious";

  return <span className={cls}>{probability}</span>;
}

function ResultCard({
  result,
  index,
}: {
  result: PredictorResult;
  index: number;
}) {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);

    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: result.collegeId,
          branchId: result.branchId,
        }),
      });

      if (res.ok || res.status === 409) {
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card card-hover"
      style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          background: "var(--bg-muted)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Link
              href={`/colleges/${result.collegeId}`}
              style={{
                fontWeight: 700,
                fontSize: "0.975rem",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              {result.collegeName}
            </Link>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.25rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span className="badge-type">{result.collegeType}</span>

              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                }}
              >
                <MapPin size={11} /> {result.state}
              </span>

              {result.nirfRank && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  NIRF #{result.nirfRank}
                </span>
              )}
            </div>
          </div>

          <ProbabilityBadge probability={result.probability} />
        </div>

        <div
          style={{
            marginTop: "0.625rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
            }}
          >
            <BookOpen size={13} />
            {result.branchName}
          </div>
        </div>

        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-subtle)",
                display: "block",
              }}
            >
              Opening Rank
            </span>

            <span
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--text)",
              }}
            >
              {result.openingRank.toLocaleString()}
            </span>
          </div>

          <div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-subtle)",
                display: "block",
              }}
            >
              Closing Rank
            </span>

            <span
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--text)",
              }}
            >
              {result.closingRank.toLocaleString()}
            </span>
          </div>

          <div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-subtle)",
                display: "block",
              }}
            >
              Quota
            </span>

            <span
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--text)",
              }}
            >
              {result.quota}
            </span>
          </div>
        </div>
      </div>

      {session && (
        <button
          onClick={handleSave}
          disabled={saving || saved}
          title="Save this college"
          style={{
            background: saved
              ? "rgba(239,68,68,0.1)"
              : "var(--bg-muted)",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem",
            cursor: saved ? "default" : "pointer",
            color: saved ? "#ef4444" : "var(--text-subtle)",
            flexShrink: 0,
            transition: "all 0.2s",
            display: "flex",
          }}
        >
          <Heart size={16} fill={saved ? "#ef4444" : "none"} />
        </button>
      )}
    </motion.div>
  );
}

export default function PredictPage() {
  const [results, setResults] = useState<PredictorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const {
  register,
  handleSubmit,
  control,
  formState: { errors },
} = useForm({
  resolver: zodResolver(predictorSchema),
    defaultValues: {
      category: "General",
      gender: "Gender-Neutral",
    },
  });

  const selectedCategory = useWatch({
    control,
    name: "category",
  });

  const selectedGender = useWatch({
    control,
    name: "gender",
  });

  const onSubmit = async (data: PredictorInput) => {
    setLoading(true);
    setHasRun(true);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          rank: Number(data.rank),
        }),
      });

      const json = await res.json();
      setResults(json.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filters = ["All", "Safe", "Moderate", "Ambitious"];

  const filtered =
    activeFilter === "All"
      ? results
      : results.filter((r) => r.probability === activeFilter);

  const counts = {
    Safe: results.filter((r) => r.probability === "Safe").length,
    Moderate: results.filter((r) => r.probability === "Moderate").length,
    Ambitious: results.filter((r) => r.probability === "Ambitious").length,
  };

  return (
    <div className="page-enter" style={{ padding: "2.5rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "var(--text)",
              marginBottom: "0.375rem",
            }}
          >
            College Predictor
          </h1>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
            }}
          >
            Enter your JEE rank to discover realistic college + branch options
            from historical cutoff data.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
          className="predict-layout"
        >
          <div
            className="card"
            style={{
              padding: "1.75rem",
              position: "sticky",
              top: "80px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <BarChart3 size={20} color="var(--brand)" />

              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "var(--text)",
                }}
              >
                Your Details
              </h2>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="form-grid"
            >
              <div>
                <label className="label-base" htmlFor="rank">
                  JEE Rank
                </label>

                <input
                  id="rank"
                  type="number"
                  {...register("rank", { valueAsNumber: true })}
                  placeholder="e.g. 5000"
                  className="input-base"
                />

                {errors.rank && (
                  <p
                    style={{
                      color: "var(--danger)",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {errors.rank.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-base">Category</label>

                <div
                  style={{
                    display: "flex",
                    gap: "0.375rem",
                    flexWrap: "wrap",
                  }}
                >
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;

                    return (
                      <label
                        key={cat}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          {...register("category")}
                          value={cat}
                          style={{ display: "none" }}
                        />

                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.3rem 0.7rem",
                            borderRadius: "9999px",
                            border: "1.5px solid",
                            borderColor: isSelected
                              ? "var(--brand)"
                              : "var(--border)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            color: isSelected
                              ? "var(--brand)"
                              : "var(--text-muted)",
                            background: isSelected
                              ? "var(--brand-bg)"
                              : "var(--bg-card)",
                            transition: "all 0.2s",
                          }}
                        >
                          {cat}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {errors.category && (
                  <p
                    style={{
                      color: "var(--danger)",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-base" htmlFor="homeState">
                  Home State
                </label>

                <select
                  id="homeState"
                  {...register("homeState")}
                  className="input-base"
                >
                  <option value="">Select state</option>

                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {errors.homeState && (
                  <p
                    style={{
                      color: "var(--danger)",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {errors.homeState.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-base">Gender</label>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  {(["Gender-Neutral", "Female-only"] as const).map((g) => {
                    const isSelected = selectedGender === g;

                    return (
                      <label
                        key={g}
                        style={{
                          flex: 1,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          {...register("gender")}
                          value={g}
                          style={{ display: "none" }}
                        />

                        <span
                          style={{
                            display: "block",
                            textAlign: "center",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            border: "1.5px solid",
                            borderColor: isSelected
                              ? "var(--brand)"
                              : "var(--border)",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            color: isSelected
                              ? "var(--brand)"
                              : "var(--text-muted)",
                            background: isSelected
                              ? "var(--brand-bg)"
                              : "var(--bg-card)",
                            transition: "all 0.2s",
                          }}
                        >
                          {g === "Gender-Neutral"
                            ? "Neutral"
                            : "Female Only"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  justifyContent: "center",
                  padding: "0.75rem",
                }}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}

                {loading ? "Predicting..." : "Predict Colleges"}
              </button>
            </form>
          </div>

          <div>
            {hasRun && !loading && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  {(["Safe", "Moderate", "Ambitious"] as const).map((p) => (
                    <div
                      key={p}
                      className="card"
                      style={{
                        padding: "0.75rem 1rem",
                        flex: "1 1 120px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "1.4rem",
                          color:
                            p === "Safe"
                              ? "#059669"
                              : p === "Moderate"
                                ? "#d97706"
                                : "#dc2626",
                        }}
                      >
                        {counts[p]}
                      </div>

                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {p}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      style={{
                        padding: "0.375rem 1rem",
                        borderRadius: "9999px",
                        border: "1.5px solid",
                        borderColor:
                          activeFilter === f
                            ? "var(--brand)"
                            : "var(--border)",
                        background:
                          activeFilter === f
                            ? "var(--brand-bg)"
                            : "transparent",
                        color:
                          activeFilter === f
                            ? "var(--brand)"
                            : "var(--text-muted)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {f}{" "}
                      {f !== "All"
                        ? `(${counts[f as keyof typeof counts]})`
                        : `(${results.length})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{
                      height: "110px",
                      borderRadius: "12px",
                    }}
                  />
                ))}
              </div>
            )}

            {!loading && hasRun && filtered.length === 0 && (
              <div
                className="card"
                style={{
                  padding: "3rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  🔍
                </div>

                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "var(--text)",
                    marginBottom: "0.375rem",
                  }}
                >
                  No matches found
                </p>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  {activeFilter !== "All"
                    ? "Try a different filter"
                    : "Try adjusting your rank or category"}
                </p>
              </div>
            )}

            <AnimatePresence>
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                {filtered.map((r, i) => (
                  <ResultCard
                    key={`${r.collegeId}-${r.branchId}`}
                    result={r}
                    index={i}
                  />
                ))}
              </div>
            </AnimatePresence>

            {!hasRun && (
              <div
                className="card"
                style={{
                  padding: "3rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                  }}
                >
                  🎯
                </div>

                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Enter your details to get predictions
                </h3>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  We&apos;ll analyse 3 years of cutoff history to find your
                  best college options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .predict-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}