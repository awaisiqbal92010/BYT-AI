import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, Cookie } from "@/components/icons/hugeicons";

export const metadata: Metadata = {
  title: "Cookie Policy — BYT AI Website Builder",
  description:
    "Understand how BYT AI uses cookies and similar tracking technologies to provide and improve our Service.",
};

export default function CookiePolicyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-amber-600/10 via-orange-600/8 to-yellow-500/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 shadow-md">
              <Zap className="h-3.5 w-3.5 fill-white text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">BYT</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
            <Cookie className="h-7 w-7 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cookie Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: <span className="font-medium text-foreground">August 27, 2026</span>
          </p>
        </div>

        <div className="space-y-10">
          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files stored on your device (computer, tablet, or smartphone) by websites you visit.
              They are widely used to make websites work more efficiently and to provide information to website operators.
              In addition to traditional cookies, we use similar technologies such as local storage, session storage,
              and pixel tracking.
            </p>
          </Section>

          <Section title="2. How We Use Cookies">
            <p>BYT uses cookies and similar technologies for the following purposes:</p>

            <div className="mt-4 space-y-4">
              <CookieCategory
                name="Strictly Necessary Cookies"
                badge="Always Active"
                badgeColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                description="These cookies are essential for the operation of our Service. They enable core functionality such as authentication sessions, security tokens, and CAPTCHA verification. You cannot opt out of these cookies."
                examples={[
                  "sb-access-token — Supabase authentication session token",
                  "sb-refresh-token — Used to refresh your authentication session",
                  "__session — CSRF protection and server-side session integrity",
                ]}
              />
              <CookieCategory
                name="Analytics Cookies"
                badge="Optional"
                badgeColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
                description="We use Google Analytics 4 (GA4) to collect anonymized information about how visitors use our platform. This helps us understand usage patterns, improve features, and debug issues."
                examples={[
                  "_ga — Google Analytics client ID (2-year lifetime)",
                  "_ga_* — GA4 session counter (1-year lifetime)",
                  "_gid — Google Analytics session identifier (24-hour lifetime)",
                ]}
              />
              <CookieCategory
                name="Preference Cookies"
                badge="Optional"
                badgeColor="text-purple-500 bg-purple-500/10 border-purple-500/20"
                description="These cookies remember your settings and preferences to provide a personalized experience."
                examples={[
                  "byt-theme — Your selected color theme (dark/light/system)",
                  "byt-sidebar-collapsed — Whether the editor sidebar was open or closed",
                ]}
              />
            </div>
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>Some cookies are placed by third-party services that appear on our pages:</p>
            <ul>
              <li>
                <strong>Google Analytics (Google LLC)</strong> — Analytics and usage tracking. Google&apos;s privacy policy:{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  policies.google.com/privacy
                </a>
              </li>
              <li>
                <strong>Supabase</strong> — Authentication session management. Supabase privacy policy:{" "}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  supabase.com/privacy
                </a>
              </li>
              <li>
                <strong>Vercel</strong> — Edge network performance and deployment. Vercel privacy policy:{" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  vercel.com/legal/privacy-policy
                </a>
              </li>
            </ul>
          </Section>

          <Section title="4. Cookie Durations">
            <p>Cookies used by BYT fall into two duration categories:</p>
            <ul>
              <li>
                <strong>Session cookies:</strong> Temporary cookies that expire when you close your browser. Used for
                CSRF protection and temporary UI state.
              </li>
              <li>
                <strong>Persistent cookies:</strong> Cookies stored on your device for a specified period (typically
                1–2 years). Used for authentication sessions and analytics.
              </li>
            </ul>
          </Section>

          <Section title="5. How to Control Cookies">
            <p>You have several options for managing cookies:</p>
            <ul>
              <li>
                <strong>Browser settings:</strong> Most browsers allow you to refuse cookies, delete cookies, or
                receive warnings before cookies are stored. Refer to your browser&apos;s help documentation:
                <ul>
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer">
                      Apple Safari
                    </a>
                  </li>
                  <li>
                    <a href="https://support.microsoft.com/help/4468242/microsoft-edge-browsing-data-and-privacy" target="_blank" rel="noopener noreferrer">
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <strong>Google Analytics opt-out:</strong> Install the{" "}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                  Google Analytics Opt-out Browser Add-on
                </a>{" "}
                to prevent GA4 from collecting your data.
              </li>
            </ul>
            <p>
              <strong>Note:</strong> Disabling strictly necessary cookies will prevent you from signing in to BYT and
              using the Service. Disabling analytics cookies will not affect your ability to use the platform.
            </p>
          </Section>

          <Section title="6. Do Not Track">
            <p>
              Some browsers offer a &quot;Do Not Track&quot; (DNT) signal. We currently do not alter our data collection practices
              in response to DNT signals, as there is no uniform industry standard for how to respond to such signals.
              We will continue to monitor developments in this area.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this Cookie Policy as our use of cookies changes or as legal requirements evolve. We will
              notify you of material changes via in-app notice. The &quot;Last updated&quot; date at the top reflects the most
              recent revision.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p>
              <strong>BYT Technologies</strong><br />
              Email: <a href="mailto:privacy@byt-ai.vercel.app">privacy@byt-ai.vercel.app</a><br />
              Website: <a href="https://byt-ai.vercel.app">https://byt-ai.vercel.app</a>
            </p>
          </Section>
        </div>

        <LegalFooter active="cookies" />
      </main>
    </div>
  );
}

function CookieCategory({
  name,
  badge,
  badgeColor,
  description,
  examples,
}: {
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  examples: string[];
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">{name}</span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>{badge}</span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{description}</p>
      <div className="space-y-1">
        {examples.map((ex, i) => (
          <p key={i} className="font-mono text-[11px] text-muted-foreground/70">
            → {ex}
          </p>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-8 backdrop-blur-sm">
      <h2 className="mb-4 text-base font-bold text-foreground sm:text-lg">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground [&_strong]:text-foreground [&_a]:text-primary [&_a:hover]:underline [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

function LegalFooter({ active }: { active: string }) {
  const links = [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/acceptable-use", label: "Acceptable Use" },
  ];
  return (
    <div className="mt-12 border-t border-border/60 pt-8">
      <p className="mb-4 text-center text-xs text-muted-foreground">Related legal documents</p>
      <div className="flex flex-wrap justify-center gap-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition-colors ${
              active === l.href.replace("/", "")
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
