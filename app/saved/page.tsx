"use client";

import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, BarChart2, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SavedItem = {
  _id: string;
  college: { _id: string; name: string; type: string; nirfRank: number | null } | null;
  branch: { name: string } | null;
  savedAt: string;
};

export default function SavedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [removing, setRemoving] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/saved");
  }, [status, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["saved"],
    queryFn: () => fetch("/api/saved").then((r) => r.json()),
    enabled: !!session,
  });

  const handleRemove = async (id: string) => {
    setRemoving(id);
    await fetch(`/api/saved/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["saved"] });
    setRemoving(null);
    setCompareList((prev) => prev.filter((cid) => cid !== id));
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const saved: SavedItem[] = data?.saved ?? [];

  if (status === "loading" || isLoading) {
    return (
      <div style={{ padding: "3rem 0" }}>
        <div className="container" style={{ display: "grid", gap: "0.75rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "90px", borderRadius: "12px" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ padding: "2.5rem 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.375rem" }}>
              Saved Colleges
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {saved.length} college{saved.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          {compareList.length >= 2 && (
            <Link
              href={`/compare?ids=${compareList.join(",")}`}
              className="btn-primary"
            >
              <BarChart2 size={16} />
              Compare {compareList.length} Colleges
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {saved.length === 0 ? (
          <div className="card" style={{ padding: "4rem", textAlign: "center" }}>
            <Heart size={40} color="var(--text-subtle)" style={{ margin: "0 auto 1rem", display: "block" }} />
            <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: "0.5rem" }}>
              No saved colleges yet
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Save colleges while browsing or after running the predictor.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/predict" className="btn-primary">Run Predictor</Link>
              <Link href="/colleges" className="btn-secondary">Browse Colleges</Link>
            </div>
          </div>
        ) : (
          <>
            {compareList.length > 0 && (
              <div
                style={{
                  background: "var(--brand-bg)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                {compareList.length} selected for comparison {compareList.length < 4 && `· Select up to ${4 - compareList.length} more`}
              </div>
            )}

            <AnimatePresence>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {saved.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{
                      padding: "1.25rem 1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      border: compareList.includes(item._id) ? "1.5px solid var(--brand)" : undefined,
                      background: compareList.includes(item._id) ? "var(--brand-bg)" : undefined,
                    }}
                  >
                    {/* Compare checkbox */}
                    <button
                      onClick={() => item.college?._id && toggleCompare(item.college._id)}
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        border: `2px solid ${item.college?._id && compareList.includes(item.college._id) ? "var(--brand)" : "var(--border)"}`,
                        background: item.college?._id && compareList.includes(item.college._id) ? "var(--brand)" : "transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {item.college?._id && compareList.includes(item.college._id) ? "✓" : ""}
                    </button>

                    {/* Icon */}
                    <div style={{ width: "42px", height: "42px", background: "var(--brand-bg)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0 }}>
                      <TrendingUp size={18} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: "0.2rem" }}>
                        {item.college?.name ?? "Unknown College"}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                        <BookOpen size={12} />
                        {item.branch?.name ?? "Unknown Branch"}
                        {item.college?.type && <span className="badge-type">{item.college.type}</span>}
                        {item.college?.nirfRank && <span>NIRF #{item.college.nirfRank}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      {item.college && (
                        <Link
                          href={`/colleges/${item.college._id}`}
                          className="btn-secondary"
                          style={{ padding: "0.4rem 0.75rem", fontSize: "0.82rem" }}
                        >
                          View <ArrowRight size={13} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={removing === item._id}
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: "8px",
                          padding: "0.4rem 0.625rem",
                          cursor: "pointer",
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
