"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signupSchema, SignupInput } from "@/lib/validators";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Signup failed"); return; }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.ok) router.push("/onboarding");
      else setError("Account created. Please log in.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/onboarding" });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "440px" }}
      >
        <div className="card" style={{ padding: "2.5rem" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{ background: "var(--gradient)", borderRadius: "8px", padding: "8px", display: "flex" }}>
                <GraduationCap size={20} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text)" }}>CollegeFinder AI</span>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.375rem" }}>
              Create your account
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Start your admission journey today
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", marginBottom: "1.25rem" }}
          >
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "0.625rem 0.875rem", fontSize: "0.875rem", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <div>
              <label className="label-base" htmlFor="name">Full Name</label>
              <input
                id="name"
                {...register("name")}
                placeholder="Aditya Kumar"
                className="input-base"
              />
              {errors.name && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.name.message}</p>}
            </div>

            <div>
              <label className="label-base" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className="input-base"
              />
              {errors.email && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="label-base" htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  placeholder="Min 8 characters"
                  className="input-base"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)" }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: "center", padding: "0.75rem" }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
