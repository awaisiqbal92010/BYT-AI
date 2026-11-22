import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, ShieldCheck } from "@/components/icons/hugeicons";

export const metadata: Metadata = {
  title: "Privacy Policy — BYT AI Website Builder",
  description:
    "Learn how BYT AI collects, uses, and protects your personal data. Your privacy is our priority.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-emerald-600/10 via-teal-600/8 to-cyan-500/5 blur-[120px]" />
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
            <ShieldCheck className="h-7 w-7 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: <span className="font-medium text-foreground">August 27, 2026</span>
          </p>
        </div>

        <div className="space-y-10">
          <Section title="1. Introduction">
            <p>
              BYT Technologies (&quot;BYT&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the BYT AI Website Builder at{" "}
              <a href="https://byt-ai.vercel.app">https://byt-ai.vercel.app</a>. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your personal information when you use our Service. Please read
              this policy carefully. If you disagree with its terms, please discontinue use of the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>Information you provide directly:</strong></p>
            <ul>
              <li><strong>Account data:</strong> Email address, full name, and password when registering</li>
              <li><strong>Profile data:</strong> Display name, subscription tier, GitHub username (optional)</li>
              <li><strong>Project data:</strong> Prompts you enter, names of projects you create</li>
              <li><strong>Communications:</strong> Support requests, feedback, or correspondence with us</li>
            </ul>
            <p><strong>Information collected automatically:</strong></p>
            <ul>
              <li><strong>Usage data:</strong> Generation counts, sandbox sessions, features accessed, timestamps</li>
              <li><strong>Device data:</strong> IP address, browser type, operating system, referring URLs</li>
              <li><strong>Analytics:</strong> Page views, session duration, click-through data via Google Analytics 4</li>
              <li><strong>Cookies:</strong> Authentication session tokens, preference cookies (see Cookie Policy)</li>
            </ul>
            <p><strong>Information from third parties:</strong></p>
            <ul>
              <li>When you sign in with Google or GitHub, we receive your name, email, and avatar from those providers</li>
              <li>We do not receive your passwords from OAuth providers</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account and authenticate your identity</li>
              <li>Provide, operate, and improve the AI code generation Service</li>
              <li>Enforce subscription quotas and billing</li>
              <li>Detect and prevent fraud, bot activity, disposable email abuse, and security threats</li>
              <li>Send transactional emails (account confirmation, password resets, usage alerts)</li>
              <li>Analyze usage patterns to improve our AI models and platform features</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal data to third parties. We do <strong>not</strong> use your
              generated application code or prompts to train our AI models without your explicit consent.
            </p>
          </Section>

          <Section title="4. Legal Bases for Processing (GDPR)">
            <p>If you are located in the European Economic Area (EEA), we process your data under the following legal bases:</p>
            <ul>
              <li><strong>Contract performance:</strong> Processing necessary to deliver the Service you signed up for</li>
              <li><strong>Legitimate interests:</strong> Security, fraud prevention, platform analytics, and product improvement</li>
              <li><strong>Consent:</strong> Marketing communications and optional analytics (revocable at any time)</li>
              <li><strong>Legal obligation:</strong> Compliance with applicable law</li>
            </ul>
          </Section>

          <Section title="5. Data Sharing & Disclosure">
            <p>We share your information only in these circumstances:</p>
            <ul>
              <li>
                <strong>Service providers:</strong> Google Firebase (database, Firestore & auth), Vercel (hosting), E2B (sandbox compute),
                OpenRouter / Mistral AI (code generation inference) — each bound by data processing agreements
              </li>
              <li><strong>Google Analytics:</strong> Anonymized usage data for platform analytics</li>
              <li>
                <strong>Legal requirements:</strong> When required by law, court order, or governmental authority, or to
                protect the rights, property, or safety of BYT, our users, or the public
              </li>
              <li>
                <strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with
                appropriate notice to users
              </li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your personal data for as long as your account is active or as needed to provide the Service. If
              you delete your account, we will delete or anonymize your personal data within <strong>30 days</strong>,
              except where retention is required by law or for legitimate business purposes (e.g., fraud records).
            </p>
            <p>
              Generated project files stored in your account are retained until you delete them or your account. Sandbox
              sessions are ephemeral and are automatically terminated; no persistent data is stored in E2B sandboxes after
              session end.
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              We implement industry-standard security measures to protect your data:
            </p>
            <ul>
              <li>All data transmission is encrypted via TLS 1.2+</li>
              <li>Passwords are never stored in plain text (Supabase Auth uses bcrypt hashing)</li>
              <li>Row Level Security (RLS) policies on all database tables ensure users can only access their own data</li>
              <li>E2B sandboxes are fully isolated MicroVMs — your code runs in a private, containerized environment</li>
              <li>API keys and secrets are stored as environment variables, never exposed to the client</li>
            </ul>
            <p>
              No system is completely secure. In the event of a data breach, we will notify affected users within 72 hours
              as required by applicable law.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              <li><strong>Withdraw consent:</strong> Withdraw previously given consent for optional processing</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@byt-ai.vercel.app">privacy@byt-ai.vercel.app</a>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="9. International Data Transfers">
            <p>
              BYT operates globally through infrastructure hosted in the United States and European Union (Vercel, Supabase,
              E2B). If you are located outside these regions, your data will be transferred internationally. We rely on
              Standard Contractual Clauses (SCCs) and other appropriate safeguards for such transfers.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              BYT is not directed to children under 13 years of age. We do not knowingly collect personal information from
              children under 13. If we discover that a child under 13 has provided us with personal data, we will delete it
              immediately. Parents or guardians who believe their child has submitted personal information should contact us
              at <a href="mailto:privacy@byt-ai.vercel.app">privacy@byt-ai.vercel.app</a>.
            </p>
          </Section>

          <Section title="11. Third-Party Links">
            <p>
              Our Service may contain links to third-party websites or services. We are not responsible for the privacy
              practices of those sites and encourage you to review their policies independently.
            </p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via in-app
              notification or email. The &quot;Last updated&quot; date at the top of this page reflects when changes were made.
              Continued use of the Service after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Contact & Data Controller">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please
              contact our Data Protection Officer:
            </p>
            <p>
              <strong>BYT Technologies</strong><br />
              Attn: Privacy Team<br />
              Email: <a href="mailto:privacy@byt-ai.vercel.app">privacy@byt-ai.vercel.app</a><br />
              Website: <a href="https://byt-ai.vercel.app">https://byt-ai.vercel.app</a>
            </p>
          </Section>
        </div>

        <LegalFooter active="privacy" />
      </main>
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
