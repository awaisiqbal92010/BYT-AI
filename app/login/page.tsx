"use client";

import * as React from "react";
import Link from "next/link";
import {
  Github,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  Mail,
  KeyRound,
  User,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CaptchaChallenge } from "@/components/CaptchaChallenge";
import { validateWorkEmail } from "@/lib/email-validator";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `Failed to initiate ${provider} authentication.`);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // 1. Strict Disposable/Temporary Email Validation
    const emailValidation = validateWorkEmail(email);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || "Temporary or invalid emails are not permitted.");
      return;
    }

    // 2. Captcha verification check
    if (!isCaptchaVerified) {
      setErrorMsg("Please complete the security captcha verification before proceeding.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const supabase = createClient();

      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;
        if (data.session) {
          router.push("/");
        } else {
          setSuccessMsg("Account created! Please check your email to confirm your sign-up.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.session) {
          router.push("/");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12 text-foreground selection:bg-primary/20">
      {/* Top right theme toggle */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* Background ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[520px] w-[600px] rounded-full bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-cyan-500/10 blur-[130px]" />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl backdrop-blur-xl transition-all">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-violet-500/25">
              <Zap className="h-6 w-6 fill-white" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <Sparkles className="h-3 w-3" />
                <span>BYT 2.0 Studio</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {authMode === "signin" ? "Welcome back to BYT" : "Create your BYT Account"}
              </h1>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {authMode === "signin"
                  ? "Access your AI website builder workspaces, projects, and cloud sandboxes."
                  : "Start creating full-stack web applications with multi-agent AI."}
              </p>
            </div>
          </div>

          {/* Auth Mode Toggle Tabs */}
          <div className="mt-6 flex rounded-lg bg-muted/60 p-1 border border-border/60 text-xs font-medium">
            <button
              onClick={() => {
                setAuthMode("signin");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                authMode === "signin"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                authMode === "signup"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error / Success Banners */}
          {errorMsg && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500 leading-relaxed">
              {successMsg}
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="mt-5 space-y-2.5">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
              className="flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/70 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading}
              className="flex h-10 w-full items-center justify-center gap-3 rounded-xl bg-foreground text-background px-4 text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
            >
              <Github className="h-4 w-4 fill-current" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-border/60" />
            <span className="absolute bg-card px-2 text-[10px] uppercase font-mono text-muted-foreground">
              Or with work email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {authMode === "signup" && (
              <div className="space-y-1">
                <label htmlFor="user-name" className="text-[11px] font-medium text-foreground">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    id="user-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    required
                    placeholder="Muhammad Iqbal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="user-email" className="text-[11px] font-medium text-foreground">Email address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  id="user-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="developer@company.com (No temp emails)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="user-password" className="text-[11px] font-medium text-foreground">Password</label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  id="user-password"
                  name="password"
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Interactive Captcha Challenge */}
            <div className="pt-1">
              <CaptchaChallenge
                onVerify={setIsCaptchaVerified}
                isVerified={isCaptchaVerified}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isCaptchaVerified}
              className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{authMode === "signin" ? "Sign In to BYT" : "Create Account"}</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>

            {/* Direct Guest Builder Entry */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:underline"
              >
                <span>Continue as Guest / Explore Builder Demo</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </button>
            </div>
          </form>

          {/* Feature Highlights */}
          <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Isolated E2B MicroVM Sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Multi-Model Auto-Fallback (Mistral + Nemotron)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Strict Bot & Disposable Email Protection</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-muted-foreground/80 leading-relaxed">
          By continuing, you agree to BYT&apos;s{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          . <br />
          Built with Next.js 14, Tailwind CSS, and Supabase.
        </p>
      </div>
    </div>
  );
}
