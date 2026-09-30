"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, MapPin } from "lucide-react";
import { motion } from "framer-motion";

type CollegeDetail = {
  _id: string;
  name: string;
  type: string;
  state: string;
  city: string;
  nirfRank: number | null;
  website: string;
};

type DetailData = {
  college: CollegeDetail;
  branches: Array<{
    _id: string;
    name: string;
    seatsTotal: number;
  }>;
  fees: Array<{
    year: number;
    tuitionPerYear: number;
    hostelPerYear: number;
    otherFeesPerYear: number;
  }>;
  placements: Array<{
    year: number;
    avgPackageLPA: number;
    medianPackageLPA: number;
    highestPackageLPA: number;
    placementPercent: number;
  }>;
};

function CompareCell({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: boolean;
}) {
  return (
    <td
      className={`compare-cell ${header ? "compare-header" : ""}`}
      style={{ verticalAlign: "top" }}
    >
      {children}
    </td>
  );
}

function useCollegeDetail(id: string) {
  return useQuery<DetailData>({
    queryKey: ["college", id],
    queryFn: async () => {
      const response = await fetch(`/api/colleges/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch college details");
      }

      return response.json();
    },
    enabled: Boolean(id),
  });
}

function CompareContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 4);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/compare");
    }
  }, [status, router]);

  const q1 = useCollegeDetail(ids[0] ?? "");
  const q2 = useCollegeDetail(ids[1] ?? "");
  const q3 = useCollegeDetail(ids[2] ?? "");
  const q4 = useCollegeDetail(ids[3] ?? "");

  const queries = [q1, q2, q3, q4].slice(0, ids.length);

  const colleges = queries
    .map((query) => query.data)
    .filter((data): data is DetailData => Boolean(data));

  const isLoading = queries.some((query) => query.isLoading);

  if (status === "loading" || isLoading) {
    return (
      <div style={{ padding: "3rem 0" }}>
        <div className="container">
          <div
            className="skeleton"
            style={{
              height: "400px",
              borderRadius: "16px",
            }}
          />
        </div>
      </div>
    );
  }

  if (ids.length < 2) {
    return (
      <div
        className="container"
        style={{
          padding: "4rem 0",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "0.75rem",
          }}
        >
          Select colleges to compare
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
          }}
        >
          Go to your saved colleges and select at least 2 to compare.
        </p>

        <Link href="/saved" className="btn-primary">
          Go to Saved
        </Link>
      </div>
    );
  }

  const rows = [
    {
      label: "Type",
      render: (data: DetailData) => (
        <span className="badge-type">{data.college.type}</span>
      ),
    },
    {
      label: "Location",
      render: (data: DetailData) => (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.875rem",
          }}
        >
          <MapPin size={12} />
          {data.college.city}, {data.college.state}
        </span>
      ),
    },
    {
      label: "NIRF Rank",
      render: (data: DetailData) =>
        data.college.nirfRank
          ? `#${data.college.nirfRank}`
          : "N/A",
    },
    {
      label: "Branches",
      render: (data: DetailData) => data.branches.length,
    },
    {
      label: "Latest Avg Pkg",
      render: (data: DetailData) => {
        const placement = data.placements[0];

        return placement
          ? `${placement.avgPackageLPA} LPA`
          : "N/A";
      },
    },
    {
      label: "Placement %",
      render: (data: DetailData) => {
        const placement = data.placements[0];

        return placement
          ? `${placement.placementPercent}%`
          : "N/A";
      },
    },
    {
      label: "Annual Fee",
      render: (data: DetailData) => {
        const fee = data.fees[0];

        return fee
          ? `₹${(
              (fee.tuitionPerYear +
                fee.hostelPerYear +
                fee.otherFeesPerYear) /
              100000
            ).toFixed(1)}L`
          : "N/A";
      },
    },
    {
      label: "Highest Pkg",
      render: (data: DetailData) => {
        const placement = data.placements[0];

        return placement
          ? `${placement.highestPackageLPA} LPA`
          : "N/A";
      },
    },
    {
      label: "Website",
      render: (data: DetailData) =>
        data.college.website ? (
          <a
            href={data.college.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--brand)",
              fontWeight: 600,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Globe size={12} />
            Visit
          </a>
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <div
      className="page-enter"
      style={{ padding: "2.5rem 0" }}
    >
      <div className="container">
        <Link
          href="/saved"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            textDecoration: "none",
            marginBottom: "1.5rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={15} />
          Back to Saved
        </Link>

        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: "1.75rem",
          }}
        >
          Compare Colleges
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ overflowX: "auto" }}
        >
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    className="compare-cell compare-header"
                    style={{
                      width: "160px",
                      textAlign: "left",
                    }}
                  >
                    Metric
                  </th>

                  {colleges.map((data) => (
                    <th
                      key={data.college._id}
                      className="compare-cell"
                      style={{ textAlign: "left" }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          color: "var(--text)",
                        }}
                      >
                        {data.college.name}
                      </div>

                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginTop: "0.2rem",
                        }}
                      >
                        {data.college.type}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map(({ label, render }) => (
                  <tr key={label}>
                    <CompareCell header>
                      {label}
                    </CompareCell>

                    {colleges.map((data) => (
                      <CompareCell key={data.college._id}>
                        {render(data)}
                      </CompareCell>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          {colleges.map((data) => (
            <Link
              key={data.college._id}
              href={`/colleges/${data.college._id}`}
              className="btn-secondary"
              style={{ fontSize: "0.85rem" }}
            >
              View{" "}
              {data.college.name.split(" ").slice(-1)[0]}{" "}
              Details →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "3rem 0" }}>
          <div className="container">
            <div
              className="skeleton"
              style={{
                height: "400px",
                borderRadius: "16px",
              }}
            />
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}