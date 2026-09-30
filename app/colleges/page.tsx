"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  TrendingUp,
  DollarSign,
  X,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { CollegeListItem, CollegeType } from "@/types";

const COLLEGE_TYPES: CollegeType[] = [
  "IIT",
  "NIT",
  "IIIT",
  "GFTI",
  "State",
  "Private",
];

const TYPE_COLORS: Record<CollegeType, string> = {
  IIT: "#6366f1",
  NIT: "#10b981",
  IIIT: "#f59e0b",
  GFTI: "#8b5cf6",
  State: "#3b82f6",
  Private: "#ef4444",
};

function CollegeCard({
  college,
  index,
}: {
  college: CollegeListItem;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/colleges/${college._id}`}
        className="card card-hover"
        style={{
          display: "block",
          padding: "1.25rem 1.5rem",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: `${TYPE_COLORS[college.type]}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${TYPE_COLORS[college.type]}30`,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 900,
                color: TYPE_COLORS[college.type],
              }}
            >
              {college.type}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.975rem",
                  color: "var(--text)",
                  lineHeight: 1.3,
                }}
              >
                {college.name}
              </h3>

              {college.nirfRank && (
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    background: "var(--bg-muted)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                >
                  NIRF #{college.nirfRank}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                marginTop: "0.3rem",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              <MapPin size={12} />
              {college.city}, {college.state}
            </div>

            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                marginTop: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              {college.avgFee !== null && (
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-subtle)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <DollarSign size={10} /> Annual Fee
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--text)",
                    }}
                  >
                    ₹{(college.avgFee / 100000).toFixed(1)}L
                  </div>
                </div>
              )}

              {college.avgPlacement !== null && (
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-subtle)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <TrendingUp size={10} /> Avg Package
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--text)",
                    }}
                  >
                    {college.avgPlacement} LPA
                  </div>
                </div>
              )}
            </div>
          </div>

          <ChevronRight
            size={16}
            color="var(--text-subtle)"
            style={{
              flexShrink: 0,
              marginTop: "4px",
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div
          className="skeleton"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          <div
            className="skeleton"
            style={{
              height: "18px",
              width: "60%",
              marginBottom: "0.5rem",
            }}
          />

          <div
            className="skeleton"
            style={{
              height: "14px",
              width: "40%",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CollegesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  const params = new URLSearchParams();

  if (debouncedSearch) {
    params.set("search", debouncedSearch);
  }

  if (selectedType) {
    params.set("type", selectedType);
  }

  params.set("limit", "30");

  const { data, isLoading } = useQuery({
    queryKey: ["colleges", debouncedSearch, selectedType],
    queryFn: () => fetch(`/api/colleges?${params}`).then((r) => r.json()),
  });

  const colleges: CollegeListItem[] = data?.colleges ?? [];
  const total = data?.total ?? 0;

  return (
    <div
      className="page-enter"
      style={{ padding: "2.5rem 0" }}
    >
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
            College Explorer
          </h1>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
            }}
          >
            Browse {total > 0 ? `${total} ` : ""}engineering colleges across
            India
          </p>
        </div>

        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 280px",
              position: "relative",
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-subtle)",
              }}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleges, cities, states..."
              className="input-base"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className="btn-secondary"
            style={{
              flexShrink: 0,
              gap: "0.5rem",
            }}
          >
            <Filter size={15} />
            Filters

            {selectedType && (
              <span
                style={{
                  background: "var(--brand)",
                  color: "white",
                  borderRadius: "9999px",
                  width: "18px",
                  height: "18px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                1
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.875rem",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--text)",
                }}
              >
                Filter by Type
              </h3>

              {selectedType && (
                <button
                  onClick={() => setSelectedType("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--brand)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {COLLEGE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedType(selectedType === type ? "" : type)
                  }
                  style={{
                    padding: "0.375rem 1rem",
                    borderRadius: "9999px",
                    border: "1.5px solid",
                    borderColor:
                      selectedType === type
                        ? TYPE_COLORS[type]
                        : "var(--border)",
                    background:
                      selectedType === type
                        ? `${TYPE_COLORS[type]}12`
                        : "transparent",
                    color:
                      selectedType === type
                        ? TYPE_COLORS[type]
                        : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : colleges.length === 0 ? (
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
              🏫
            </div>

            <p
              style={{
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "0.375rem",
              }}
            >
              No colleges found
            </p>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {colleges.map((c, i) => (
              <CollegeCard key={c._id} college={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}