import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from "@/components/icons/hugeicons";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — BYT AI Website Builder",
  description:
    "BYT AI Acceptable Use Policy — understand what is and isn't allowed when using our AI code generation platform.",
};

export default function AcceptableUsePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-red-600/10 via-rose-600/8 to-pink-500/5 blur-[120px]" />
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
            <ShieldAlert className="h-7 w-7 text-rose-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Acceptable Use Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: <span className="font-medium text-foreground">August 27, 2026</span>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-xs text-muted-foreground leading-relaxed">
            This policy defines what you may and may not do with BYT&apos;s AI code generation platform, E2B sandbox
            infrastructure, and related services. Violations may result in immediate suspension.
          </p>
        </div>

        {/* Quick summary cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-emerald-400">What You CAN Do</h2>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                "Build legitimate web applications and SaaS products",
                "Generate portfolio sites, landing pages, and dashboards",
                "Create internal tools for your team or business",
                "Export and deploy your generated code anywhere",
                "Use BYT for educational and learning projects",
                "Build open-source projects (check licensing terms)",
                "Generate e-commerce, blog, and content platforms",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <h2 className="text-sm font-bold text-red-400">What You CANNOT Do</h2>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {[
                "Generate malware, ransomware, or spyware",
                "Build phishing pages or scam/fraud tools",
                "Create illegal gambling or adult content platforms",
                "Mine cryptocurrency using sandbox resources",
                "Conduct DDoS attacks or network scanning",
                "Violate third-party intellectual property rights",
                "Bypass our security systems or share accounts",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-red-500">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-10">
          <Section title="1. Purpose & Scope">
            <p>
              This Acceptable Use Policy (&quot;AUP&quot;) applies to all users of BYT AI Website Builder (&quot;Service&quot;), including the
              web application at <a href="https://byt-ai.vercel.app">https://byt-ai.vercel.app</a>, all APIs, sandbox
              environments, and any related services operated by BYT Technologies.
            </p>
            <p>
              This AUP supplements and is incorporated into our{" "}
              <Link href="/terms">Terms of Service</Link>. By using the Service, you agree to comply with this policy.
              BYT reserves the right to amend this policy at any time with appropriate notice.
            </p>
          </Section>

          <Section title="2. Prohibited Content">
            <p>You may not use BYT to generate, host, transmit, or deploy applications or content that:</p>
            <ul>
              <li>Is illegal under applicable local, national, or international law</li>
              <li>Promotes violence, terrorism, human trafficking, or exploitation of minors</li>
              <li>
                Constitutes hate speech targeting individuals or groups based on race, ethnicity, gender, religion,
                sexual orientation, disability, or national origin
              </li>
              <li>Violates the intellectual property rights of any third party (copyright, trademark, trade secret)</li>
              <li>Contains sexually explicit or obscene material</li>
              <li>Is defamatory, harassing, or constitutes cyberbullying against any individual</li>
              <li>Spreads misinformation, disinformation, or deliberately deceptive content at scale</li>
            </ul>
          </Section>

          <Section title="3. Prohibited Technical Activities">
            <p>You may not use our platform or sandbox infrastructure to:</p>
            <ul>
              <li>
                <strong>Malicious software:</strong> Develop, test, deploy, or distribute viruses, worms, trojans,
                ransomware, spyware, adware, keyloggers, or any other malicious code
              </li>
              <li>
                <strong>Phishing & fraud:</strong> Create pages designed to deceive users into providing credentials,
                financial information, or personal data under false pretenses
              </li>
              <li>
                <strong>Network attacks:</strong> Conduct port scanning, vulnerability scanning, DDoS attacks, or any
                form of offensive security testing against systems you do not own or have permission to test
              </li>
              <li>
                <strong>Cryptomining:</strong> Use E2B sandbox compute resources for cryptocurrency mining, blockchain
                validation, or proof-of-work computations
              </li>
              <li>
                <strong>Spam infrastructure:</strong> Build or operate email spam systems, SMS spam, or any bulk
                unsolicited communication tools
              </li>
              <li>
                <strong>Scraping & bots:</strong> Create scrapers, credential stuffing tools, or automated bots designed
                to harm other services
              </li>
              <li>
                <strong>Sandbox abuse:</strong> Attempt to escape sandbox isolation, access host system resources, or
                consume compute resources beyond your plan&apos;s quota through artificial means
              </li>
            </ul>
          </Section>

          <Section title="4. Account & Access Rules">
            <ul>
              <li>
                You may not share your account credentials or provide others access to your account&apos;s sandbox sessions
              </li>
              <li>You may not create multiple accounts to bypass generation quotas or subscription limits</li>
              <li>
                You may not register with disposable, temporary, or privacy relay email addresses (e.g., Mailinator,
                10-Minute Mail, Apple Hide My Email for fraud purposes)
              </li>
              <li>You may not impersonate BYT staff, employees, or other users</li>
              <li>Automated sign-up scripts or bots are strictly prohibited</li>
            </ul>
          </Section>

          <Section title="5. API & Rate Limits">
            <p>
              Our AI generation API is rate-limited and quota-controlled. You agree not to:
            </p>
            <ul>
              <li>Use automated scripts to repeatedly trigger generation beyond your plan&apos;s quota</li>
              <li>Attempt to circumvent rate limiting through IP rotation, proxy chains, or other technical means</li>
              <li>Resell or sublicense access to BYT&apos;s API or generation capabilities without written permission</li>
            </ul>
          </Section>

          <Section title="6. Responsibility for Generated Code">
            <p>
              AI-generated code is provided as-is. You are solely responsible for reviewing, testing, and validating any
              code generated by BYT before deploying it to a production environment. BYT does not warrant that
              generated code is free from security vulnerabilities, bugs, or licensing conflicts.
            </p>
            <p>
              If you deploy generated code that contains open-source components, you are responsible for complying with
              the applicable open-source licenses (MIT, Apache 2.0, GPL, etc.).
            </p>
          </Section>

          <Section title="7. Reporting Violations">
            <p>
              If you become aware of any violations of this policy — by other users or through discovered
              vulnerabilities in our platform — please report them immediately to:
            </p>
            <p>
              <strong>Abuse reports:</strong>{" "}
              <a href="mailto:abuse@byt-ai.vercel.app">abuse@byt-ai.vercel.app</a>
              <br />
              <strong>Security disclosures:</strong>{" "}
              <a href="mailto:security@byt-ai.vercel.app">security@byt-ai.vercel.app</a>
            </p>
            <p>
              We take all abuse and security reports seriously and will respond within 48 hours. Responsible disclosure
              of security vulnerabilities may be eligible for recognition in our Security Hall of Fame.
            </p>
          </Section>

          <Section title="8. Enforcement & Consequences">
            <p>
              BYT Technologies reserves the right to investigate any suspected violations of this AUP. Upon confirming a
              violation, we may take any or all of the following actions, at our sole discretion:
            </p>
            <ul>
              <li>Issue a formal warning and required remediation</li>
              <li>Temporarily suspend your account and sandbox access</li>
              <li>Permanently terminate your account without refund</li>
              <li>Delete generated projects associated with policy violations</li>
              <li>Report violations to appropriate law enforcement authorities</li>
              <li>Seek injunctive relief or pursue legal action for damages</li>
            </ul>
            <p>
              We may act without prior notice where violations are severe, ongoing, or present imminent risk to our
              infrastructure or other users.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>
              For questions about this Acceptable Use Policy, contact:
            </p>
            <p>
              <strong>BYT Technologies</strong><br />
              Email: <a href="mailto:legal@byt-ai.vercel.app">legal@byt-ai.vercel.app</a><br />
              Website: <a href="https://byt-ai.vercel.app">https://byt-ai.vercel.app</a>
            </p>
          </Section>
        </div>

        <LegalFooter active="acceptable-use" />
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
