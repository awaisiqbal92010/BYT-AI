"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Mail,
  KeyRound,
  User,
  AlertTriangle,
  Github,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CaptchaChallenge } from "@/components/CaptchaChallenge";
import { validateWorkEmail } from "@/lib/email-validator";
import { useRouter } from "next/navigation";
import { generateProjectId } from "@/lib/project-storage";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [authMode, setAuthMode] = React.useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<"google" | "github" | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [pendingPromptNotice, setPendingPromptNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const pendingRaw = sessionStorage.getItem("byt_pending_build");
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          if (pending?.prompt) {
            setPendingPromptNotice(
              `✨ Prompt saved! Sign in with Google or Email to generate your ${pending.framework || "application"} immediately.`
            );
          }
        }
      } catch {}
    }
  }, []);

  const handleGuestContinue = () => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        if (next && next.startsWith("/") && !next.startsWith("//")) {
          router.push(next);
          return;
        }
        const pendingRaw = sessionStorage.getItem("byt_pending_build");
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw);
          if (pending?.prompt) {
            const id = pending.projectId || pending.newId || generateProjectId();
            router.push(`/apps/${id}/editor/preview`);
            return;
          }
        }
      } catch (err) {
        console.warn("[Login] Guest redirect parse error:", err);
      }
    }
    router.push("/");
  };

  function clearMessages() {
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  async function handleGoogleSignIn() {
    setOauthLoading("google");
    clearMessages();
    const { error } = await signInWithGoogle();
    if (error) setErrorMsg(error);
    setOauthLoading(null);
  }

  async function handleGithubSignIn() {
    setOauthLoading("github");
    clearMessages();
    const { error } = await signInWithGithub();
    if (error) setErrorMsg(error);
    setOauthLoading(null);
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || (!password && authMode !== "reset")) return;

    const emailValidation = validateWorkEmail(email);
    if (!emailValidation.isValid) {
      setErrorMsg(emailValidation.error || "Temporary or invalid emails are not permitted.");
      return;
    }

    if (authMode !== "reset" && !isCaptchaVerified) {
      setErrorMsg("Please complete the security captcha verification before proceeding.");
      return;
    }

    setIsLoading(true);
    clearMessages();

    if (authMode === "reset") {
      const { error } = await resetPassword(email);
      if (error) setErrorMsg(error);
      else setSuccessMsg("Password reset email sent! Check your inbox.");
    } else if (authMode === "signup") {
      const { error } = await signUpWithEmail(email, password, name || email.split("@")[0]);
      if (error) setErrorMsg(error);
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) setErrorMsg(error);
    }

    setIsLoading(false);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12 text-foreground selection:bg-primary/20">
      {/* Top right controls */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[520px] w-[600px] rounded-full bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-cyan-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Brand */}
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
                {authMode === "signin" ? "Welcome back to BYT" : authMode === "signup" ? "Create your BYT Account" : "Reset Password"}
              </h1>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {authMode === "signin"
                  ? "Access your AI website builder workspaces, projects, and cloud sandboxes."
                  : authMode === "signup"
                  ? "Start creating full-stack web applications with multi-agent AI."
                  : "Enter your email and we'll send you a reset link."}
              </p>
            </div>
          </div>

          {/* Auth Mode Toggle */}
          {authMode !== "reset" && (
            <div className="mt-6 flex rounded-lg bg-muted/60 p-1 border border-border/60 text-xs font-medium">
              <button
                onClick={() => { setAuthMode("signin"); clearMessages(); }}
                className={`flex-1 py-1.5 rounded-md transition-all ${authMode === "signin" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode("signup"); clearMessages(); }}
                className={`flex-1 py-1.5 rounded-md transition-all ${authMode === "signup" ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Pending Prompt / Error / Success Banners */}
          {pendingPromptNotice && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary leading-relaxed flex items-center gap-2.5 shadow-xs">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-medium">{pendingPromptNotice}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500 leading-relaxed flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OAuth Buttons (not shown on reset) */}
          {authMode !== "reset" && (
            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={!!oauthLoading || isLoading}
                className="flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/70 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubSignIn}
                disabled={!!oauthLoading || isLoading}
                className="flex h-10 w-full items-center justify-center gap-3 rounded-xl bg-foreground text-background px-4 text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
              >
                {oauthLoading === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4 fill-current" />}
                <span>Continue with GitHub</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-border/60" />
                <span className="absolute bg-card px-2 text-[10px] uppercase font-mono text-muted-foreground">Or with email</span>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3 mt-4">
            {authMode === "signup" && (
              <div className="space-y-1">
                <label htmlFor="user-name" className="text-[11px] font-medium text-foreground">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                  <input id="user-name" type="text" placeholder="Your Name" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="user-email" className="text-[11px] font-medium text-foreground">Email address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                <input id="user-email" type="email" required placeholder="you@company.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            {authMode !== "reset" && (
              <div className="space-y-1">
                <label htmlFor="user-password" className="text-[11px] font-medium text-foreground">Password</label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                  <input id="user-password" type={showPassword ? "text" : "password"} required
                    placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {authMode === "signin" && (
                  <button type="button" onClick={() => { setAuthMode("reset"); clearMessages(); }}
                    className="text-[10px] text-primary hover:underline float-right">
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {authMode !== "reset" && (
              <div className="pt-1 clear-both">
                <CaptchaChallenge onVerify={setIsCaptchaVerified} isVerified={isCaptchaVerified} />
              </div>
            )}

            <button type="submit"
              disabled={isLoading || (authMode !== "reset" && !isCaptchaVerified)}
              className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <span>{authMode === "signin" ? "Sign In" : authMode === "signup" ? "Create Account" : "Send Reset Email"}</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>

            {authMode === "reset" && (
              <button type="button" onClick={() => { setAuthMode("signin"); clearMessages(); }}
                className="w-full text-center text-[11px] text-muted-foreground hover:text-primary transition-colors">
                Back to Sign In
              </button>
            )}

            <div className="pt-1 text-center">
              <button type="button" onClick={handleGuestContinue}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 hover:underline">
                <span>Continue as Guest / Build Application Immediately</span>
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
              <span>Firebase Auth — Google, GitHub & Email</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/80 leading-relaxed">
          By continuing, you agree to BYT&apos;s{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          <br />Built with Next.js 14, Firebase &amp; E2B Sandboxes.
        </p>
      </div>
    </div>
  );
}
