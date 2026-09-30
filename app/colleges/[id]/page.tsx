"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  Globe,
  MapPin,
  TrendingUp,
  DollarSign,
  Heart,
  BarChart3,
  BookOpen,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

type PageProps = {
  params: Promise<{ id: string }>;
};

type Placement = {
  _id: string;
  year: number;
  avgPackageLPA: number;
  medianPackageLPA: number;
  highestPackageLPA: number;
  placementPercent: number;
};

type Fee = {
  _id: string;
  year: number;
  tuitionPerYear: number;
  hostelPerYear: number;
  otherFeesPerYear: number;
};

type Branch = {
  _id: string;
  name: string;
  seatsTotal: number;
};

type CutoffData = {
  year: number;
  openingRank: number;
  closingRank: number;
};

type CutoffTrend = {
  branchId: string;
  branchName: string;
  data: CutoffData[];
};

type ChartValue = number | string | readonly (number | string)[] | undefined;

const formatChartValue = (value: ChartValue): string => {
  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
};

export default function CollegeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();

  const [saving, setSaving] = useState(false);
  const [savedBranchId, setSavedBranchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "cutoffs" | "fees" | "placements"
  >("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["college", id],
    queryFn: async () => {
      const response = await fetch(`/api/colleges/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch college");
      }

      return response.json();
    },
  });

  const handleSave = async (branchId: string) => {
    if (!session) return;

    setSaving(true);
    setSavedBranchId(branchId);

    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collegeId: id,
          branchId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save branch");
      }
    } catch (error) {
      console.error("Failed to save branch:", error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "3rem 0" }}>
        <div className="container">
          <div
            className="skeleton"
            style={{
              height: "200px",
              borderRadius: "16px",
              marginBottom: "1rem",
            }}
          />

          <div style={{ display: "grid", gap: "1rem" }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: "60px",
                  borderRadius: "12px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data?.college) {
    return (
      <div
        className="container"
        style={{
          padding: "4rem 0",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>
          College not found.
        </p>

        <Link
          href="/colleges"
          className="btn-primary"
          style={{
            marginTop: "1rem",
            display: "inline-flex",
          }}
        >
          Back to Colleges
        </Link>
      </div>
    );
  }

  const {
    college,
    branches = [],
    fees = [],
    placements = [],
    cutoffTrends = [],
  }: {
    college: {
      name: string;
      type: string;
      city: string;
      state: string;
      nirfRank?: number;
      website?: string;
      description?: string;
    };
    branches: Branch[];
    fees: Fee[];
    placements: Placement[];
    cutoffTrends: CutoffTrend[];
  } = data;

  const latestFee = fees[0];
  const latestPlacement = placements[0];

  const placementChartData = [...placements]
    .reverse()
    .map((p) => ({
      year: String(p.year),
      avg: p.avgPackageLPA,
      median: p.medianPackageLPA,
      highest: p.highestPackageLPA,
      placed: p.placementPercent,
    }));

  const feeChartData = [...fees]
    .reverse()
    .map((f) => ({
      year: String(f.year),
      tuition: f.tuitionPerYear / 1000,
      hostel: f.hostelPerYear / 1000,
      other: f.otherFeesPerYear / 1000,
    }));

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      icon: BookOpen,
    },
    {
      key: "cutoffs",
      label: "Cutoffs",
      icon: BarChart3,
    },
    {
      key: "fees",
      label: "Fees",
      icon: DollarSign,
    },
    {
      key: "placements",
      label: "Placements",
      icon: TrendingUp,
    },
  ] as const;

  return (
    <div
      className="page-enter"
      style={{ padding: "2rem 0" }}
    >
      <div className="container">
        <Link
          href="/colleges"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            textDecoration: "none",
            marginBottom: "1.25rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={15} />
          Back to Colleges
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            padding: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                background: "var(--gradient)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                }}
              >
                {college.type}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      color: "var(--text)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    {college.name}
                  </h1>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <MapPin size={14} />
                    {college.city}, {college.state}

                    {college.nirfRank && (
                      <>
                        {" "}
                        &middot;{" "}
                        <span style={{ fontWeight: 700 }}>
                          NIRF #{college.nirfRank}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  {college.website && (
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        padding: "0.4rem 0.875rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                </div>
              </div>

              {college.description && (
                <p
                  style={{
                    marginTop: "0.875rem",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    maxWidth: "680px",
                  }}
                >
                  {college.description}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  marginTop: "1.25rem",
                  flexWrap: "wrap",
                }}
              >
                {latestPlacement && (
                  <>
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-subtle)",
                        }}
                      >
                        Avg Package
                      </div>

                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "var(--text)",
                        }}
                      >
                        {latestPlacement.avgPackageLPA} LPA
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-subtle)",
                        }}
                      >
                        Placement %
                      </div>

                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "var(--text)",
                        }}
                      >
                        {latestPlacement.placementPercent}%
                      </div>
                    </div>
                  </>
                )}

                {latestFee && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-subtle)",
                      }}
                    >
                      Annual Fee
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: "var(--text)",
                      }}
                    >
                      ₹
                      {(
                        (latestFee.tuitionPerYear +
                          latestFee.hostelPerYear +
                          latestFee.otherFeesPerYear) /
                        100000
                      ).toFixed(1)}
                      L
                    </div>
                  </div>
                )}

                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-subtle)",
                    }}
                  >
                    Branches
                  </div>

                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      color: "var(--text)",
                    }}
                  >
                    {branches.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div
          style={{
            display: "flex",
            gap: "0.375rem",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0",
          }}
        >
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.625rem 1rem",
                border: "none",
                borderBottom: `2px solid ${
                  activeTab === key
                    ? "var(--brand)"
                    : "transparent"
                }`,
                background: "transparent",
                color:
                  activeTab === key
                    ? "var(--brand)"
                    : "var(--text-muted)",
                fontWeight: activeTab === key ? 700 : 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s",
                marginBottom: "-1px",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeTab === "overview" && (
            <div>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--text)",
                  marginBottom: "1rem",
                }}
              >
                Branches & Programmes
              </h2>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {branches.map((branch) => (
                  <div
                    key={branch._id}
                    className="card"
                    style={{
                      padding: "1rem 1.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "var(--brand-bg)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--brand)",
                          flexShrink: 0,
                        }}
                      >
                        <BookOpen size={16} />
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: "var(--text)",
                          }}
                        >
                          {branch.name}
                        </div>

                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {branch.seatsTotal} seats
                        </div>
                      </div>
                    </div>

                    {session && (
                      <button
                        onClick={() => handleSave(branch._id)}
                        disabled={
                          saving && savedBranchId === branch._id
                        }
                        className="btn-secondary"
                        style={{
                          padding: "0.4rem 0.875rem",
                          fontSize: "0.82rem",
                        }}
                      >
                        {saving &&
                        savedBranchId === branch._id ? (
                          <Loader2
                            size={13}
                            className="animate-spin"
                          />
                        ) : (
                          <Heart size={13} />
                        )}
                        Save
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "cutoffs" && (
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
              }}
            >
              {cutoffTrends
                .filter((trend) => trend.data.length > 0)
                .slice(0, 4)
                .map((trend) => (
                  <div
                    key={trend.branchId}
                    className="card"
                    style={{ padding: "1.5rem" }}
                  >
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--text)",
                        marginBottom: "1.25rem",
                      }}
                    >
                      {trend.branchName} — Cutoff Trend
                      (General · Gender-Neutral)
                    </h3>

                    <ResponsiveContainer
                      width="100%"
                      height={220}
                    >
                      <LineChart
                        data={[...trend.data].reverse()}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                        />

                        <XAxis
                          dataKey="year"
                          tick={{
                            fontSize: 12,
                            fill: "var(--text-muted)",
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 12,
                            fill: "var(--text-muted)",
                          }}
                          reversed
                        />

                        <Tooltip
                          contentStyle={{
                            background: "var(--bg-card)",
                            border:
                              "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                          }}
                          formatter={(value) => [
                            formatChartValue(value),
                            "",
                          ]}
                        />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="openingRank"
                          name="Opening Rank"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />

                        <Line
                          type="monotone"
                          dataKey="closingRank"
                          name="Closing Rank"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}

              {cutoffTrends.filter(
                (trend) => trend.data.length > 0
              ).length === 0 && (
                <div
                  className="card"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No cutoff data available for General /
                  Gender-Neutral category.
                </div>
              )}
            </div>
          )}

          {activeTab === "fees" && (
            <div>
              {feeChartData.length > 0 ? (
                <div
                  className="card"
                  style={{ padding: "1.5rem" }}
                >
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--text)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Fee Breakdown (₹ thousands/year)
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <BarChart data={feeChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />

                      <XAxis
                        dataKey="year"
                        tick={{
                          fontSize: 12,
                          fill: "var(--text-muted)",
                        }}
                      />

                      <YAxis
                        tick={{
                          fontSize: 12,
                          fill: "var(--text-muted)",
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-card)",
                          border:
                            "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                        }}
                        formatter={(value) => [
                          `₹${formatChartValue(value)}K`,
                          "",
                        ]}
                      />

                      <Legend />

                      <Bar
                        dataKey="tuition"
                        name="Tuition"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="hostel"
                        name="Hostel"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="other"
                        name="Other"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div
                    style={{
                      marginTop: "1.5rem",
                      overflowX: "auto",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.875rem",
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Year",
                            "Tuition",
                            "Hostel",
                            "Other",
                            "Total",
                          ].map((header) => (
                            <th
                              key={header}
                              className="compare-cell compare-header"
                              style={{ textAlign: "left" }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {fees.map((fee) => (
                          <tr key={fee._id}>
                            <td
                              className="compare-cell"
                              style={{ fontWeight: 700 }}
                            >
                              {fee.year}
                            </td>

                            <td className="compare-cell">
                              ₹
                              {(fee.tuitionPerYear / 1000).toFixed(
                                0
                              )}
                              K
                            </td>

                            <td className="compare-cell">
                              ₹
                              {(fee.hostelPerYear / 1000).toFixed(
                                0
                              )}
                              K
                            </td>

                            <td className="compare-cell">
                              ₹
                              {(fee.otherFeesPerYear / 1000).toFixed(
                                0
                              )}
                              K
                            </td>

                            <td
                              className="compare-cell"
                              style={{
                                fontWeight: 700,
                                color: "var(--brand)",
                              }}
                            >
                              ₹
                              {(
                                (fee.tuitionPerYear +
                                  fee.hostelPerYear +
                                  fee.otherFeesPerYear) /
                                100000
                              ).toFixed(2)}
                              L
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No fee data available.
                </div>
              )}
            </div>
          )}

          {activeTab === "placements" && (
            <div>
              {placementChartData.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gap: "1.5rem",
                  }}
                >
                  <div
                    className="card"
                    style={{ padding: "1.5rem" }}
                  >
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--text)",
                        marginBottom: "1.25rem",
                      }}
                    >
                      Package Trends (LPA)
                    </h3>

                    <ResponsiveContainer
                      width="100%"
                      height={240}
                    >
                      <LineChart
                        data={placementChartData}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                        />

                        <XAxis
                          dataKey="year"
                          tick={{
                            fontSize: 12,
                            fill: "var(--text-muted)",
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 12,
                            fill: "var(--text-muted)",
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "var(--bg-card)",
                            border:
                              "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                          }}
                          formatter={(value) => [
                            `${formatChartValue(value)} LPA`,
                            "",
                          ]}
                        />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="avg"
                          name="Avg Package"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />

                        <Line
                          type="monotone"
                          dataKey="median"
                          name="Median"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: "1.5rem",
                      overflowX: "auto",
                    }}
                  >
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--text)",
                        marginBottom: "1rem",
                      }}
                    >
                      Placement Statistics
                    </h3>

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.875rem",
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Year",
                            "Avg (LPA)",
                            "Median (LPA)",
                            "Highest (LPA)",
                            "% Placed",
                          ].map((header) => (
                            <th
                              key={header}
                              className="compare-cell compare-header"
                              style={{ textAlign: "left" }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {placements.map((placement) => (
                          <tr key={placement._id}>
                            <td
                              className="compare-cell"
                              style={{ fontWeight: 700 }}
                            >
                              {placement.year}
                            </td>

                            <td className="compare-cell">
                              {placement.avgPackageLPA}
                            </td>

                            <td className="compare-cell">
                              {placement.medianPackageLPA}
                            </td>

                            <td
                              className="compare-cell"
                              style={{
                                fontWeight: 700,
                                color: "#059669",
                              }}
                            >
                              {placement.highestPackageLPA}
                            </td>

                            <td className="compare-cell">
                              {placement.placementPercent}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  No placement data available.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}