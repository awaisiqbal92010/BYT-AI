"use client";

import * as React from "react";
import {
  Rocket,
  Globe,
  KeyRound,
  Terminal,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  Clock,
  GitBranch,
  Server,
  Layers,
} from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";

interface Deployment {
  id: string;
  projectName: string;
  url: string;
  environment: "Production" | "Preview";
  status: "Ready" | "Building" | "Failed";
  commitHash: string;
  branch: string;
  deployedAt: string;
  duration: string;
}

interface EnvVar {
  id: string;
  key: string;
  value: string;
  environment: "Production" | "All";
  isSecret: boolean;
}

const DEPLOYMENTS: Deployment[] = [
  {
    id: "dep-1",
    projectName: "AI Developer Portfolio",
    url: "https://dev-portfolio.byt-ai.vercel.app",
    environment: "Production",
    status: "Ready",
    commitHash: "8f29ac1",
    branch: "main",
    deployedAt: "12 mins ago",
    duration: "21s",
  },
  {
    id: "dep-2",
    projectName: "Nexus SaaS Landing",
    url: "https://nexus-saas.byt-ai.vercel.app",
    environment: "Production",
    status: "Ready",
    commitHash: "3b77da4",
    branch: "main",
    deployedAt: "2 hours ago",
    duration: "18s",
  },
  {
    id: "dep-3",
    projectName: "AI Developer Portfolio (v2-glassmorphism)",
    url: "https://preview-glass-8f29.byt-ai.vercel.app",
    environment: "Preview",
    status: "Ready",
    commitHash: "1e50fa2",
    branch: "feat/glass-pricing",
    deployedAt: "Yesterday",
    duration: "24s",
  },
  {
    id: "dep-4",
    projectName: "Hyperion Analytics Admin",
    url: "https://hyperion-analytics.byt-ai.vercel.app",
    environment: "Production",
    status: "Ready",
    commitHash: "9c12df8",
    branch: "main",
    deployedAt: "3 days ago",
    duration: "32s",
  },
];

const INITIAL_ENV_VARS: EnvVar[] = [
  {
    id: "env-1",
    key: "NEXT_PUBLIC_APP_URL",
    value: "https://dev-portfolio.byt-ai.vercel.app",
    environment: "All",
    isSecret: false,
  },
  {
    id: "env-2",
    key: "DATABASE_URL",
    value: "postgres://admin:secure_pass@db.byt.internal:5432/production",
    environment: "Production",
    isSecret: true,
  },
  {
    id: "env-3",
    key: "STRIPE_SECRET_KEY",
    value: "sk_test_mock_stripe_key_placeholder",
    environment: "Production",
    isSecret: true,
  },
  {
    id: "env-4",
    key: "NEXT_PUBLIC_ANALYTICS_ID",
    value: "ga_measurement_987410",
    environment: "All",
    isSecret: false,
  },
];

interface DnsRecord {
  id: string;
  domain: string;
  type: "CNAME" | "A";
  name: string;
  value: string;
  status: "Verified" | "Pending DNS Validation";
  ssl: "Active" | "Provisioning";
}

const INITIAL_DNS_RECORDS: DnsRecord[] = [
  {
    id: "dns-1",
    domain: "devportfolio.com",
    type: "CNAME",
    name: "www",
    value: "cname.byt-ai.vercel.app",
    status: "Verified",
    ssl: "Active",
  },
  {
    id: "dns-2",
    domain: "devportfolio.com",
    type: "A",
    name: "@",
    value: "76.76.21.21",
    status: "Verified",
    ssl: "Active",
  },
  {
    id: "dns-3",
    domain: "nexus-app.io",
    type: "CNAME",
    name: "app",
    value: "cname.byt-ai.vercel.app",
    status: "Pending DNS Validation",
    ssl: "Provisioning",
  },
];

export default function DeploymentsPage() {
  const [activeTab, setActiveTab] = React.useState("deployments");
  const [envVars, setEnvVars] = React.useState<EnvVar[]>(INITIAL_ENV_VARS);
  const [dnsRecords, setDnsRecords] = React.useState<DnsRecord[]>(INITIAL_DNS_RECORDS);
  const [verifyingDnsId, setVerifyingDnsId] = React.useState<string | null>(null);
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});
  const [isAddEnvModalOpen, setIsAddEnvModalOpen] = React.useState(false);
  const [newEnvKey, setNewEnvKey] = React.useState("");
  const [newEnvVal, setNewEnvVal] = React.useState("");
  const [newCustomDomain, setNewCustomDomain] = React.useState("");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const tabs = [
    { id: "deployments", label: "Active Deployments", icon: <Rocket className="h-3.5 w-3.5" />, badge: DEPLOYMENTS.length },
    { id: "domains", label: "Custom Domains", icon: <Globe className="h-3.5 w-3.5" />, badge: dnsRecords.length },
    { id: "env", label: "Environment Variables", icon: <KeyRound className="h-3.5 w-3.5" /> },
    { id: "logs", label: "Build Console Logs", icon: <Terminal className="h-3.5 w-3.5" /> },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddDomain = () => {
    if (!newCustomDomain.trim()) return;
    const cleanDomain = newCustomDomain.trim().toLowerCase().replace(/^https?:\/\//, "");
    const newRecord: DnsRecord = {
      id: `dns-${Date.now()}`,
      domain: cleanDomain,
      type: cleanDomain.startsWith("www.") ? "CNAME" : "A",
      name: cleanDomain.startsWith("www.") ? "www" : "@",
      value: cleanDomain.startsWith("www.") ? "cname.byt-ai.vercel.app" : "76.76.21.21",
      status: "Pending DNS Validation",
      ssl: "Provisioning",
    };
    setDnsRecords((prev) => [newRecord, ...prev]);
    setNewCustomDomain("");
  };

  const handleVerifyDns = (id: string) => {
    setVerifyingDnsId(id);
    setTimeout(() => {
      setDnsRecords((prev) =>
        prev.map((rec) =>
          rec.id === id ? { ...rec, status: "Verified", ssl: "Active" } : rec
        )
      );
      setVerifyingDnsId(null);
    }, 1000);
  };

  const handleAddEnv = () => {
    if (!newEnvKey.trim() || !newEnvVal.trim()) return;
    setEnvVars([
      ...envVars,
      {
        id: `env-${Date.now()}`,
        key: newEnvKey.trim().toUpperCase(),
        value: newEnvVal.trim(),
        environment: "Production",
        isSecret: true,
      },
    ]);
    setNewEnvKey("");
    setNewEnvVal("");
    setIsAddEnvModalOpen(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="success" dot className="text-xs">
                Global Edge Network Active
              </Badge>
              <span className="text-xs text-muted-foreground">35+ Regions • 99.99% Uptime</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Hosting & Deployments
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Manage live production domains, preview builds, SSL certificates, and environment secrets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 font-medium"
              onClick={() => setActiveTab("logs")}
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Trigger Manual Deploy</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs
          items={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underlined"
        />

        {/* Tab 1: Deployments Overview */}
        {activeTab === "deployments" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden">
              <div className="grid grid-cols-12 border-b border-border/80 bg-muted/40 p-3.5 text-xs font-semibold text-muted-foreground">
                <div className="col-span-5">Project & Deployment URL</div>
                <div className="col-span-2">Environment</div>
                <div className="col-span-2">Commit / Branch</div>
                <div className="col-span-2">Deployed At</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border/60">
                {DEPLOYMENTS.map((dep) => (
                  <div
                    key={dep.id}
                    className="grid grid-cols-12 items-center p-4 text-xs transition-colors hover:bg-muted/30"
                  >
                    {/* Project & URL */}
                    <div className="col-span-5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {dep.projectName}
                        </span>
                        <Badge variant="success" className="text-[10px] py-0 px-1.5">
                          {dep.status}
                        </Badge>
                      </div>
                      <a
                        href={dep.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-mono text-primary hover:underline mt-1 truncate"
                      >
                        <Globe className="h-3 w-3 shrink-0" />
                        <span className="truncate">{dep.url}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0 ml-0.5" />
                      </a>
                    </div>

                    {/* Environment */}
                    <div className="col-span-2">
                      <Badge
                        variant={dep.environment === "Production" ? "violet" : "outline"}
                        className="text-[10px]"
                      >
                        {dep.environment}
                      </Badge>
                    </div>

                    {/* Branch & Commit */}
                    <div className="col-span-2 font-mono text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1 text-foreground">
                        <GitBranch className="h-3 w-3 text-primary" />
                        <span>{dep.branch}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/80">{dep.commitHash}</span>
                    </div>

                    {/* Deployed At */}
                    <div className="col-span-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{dep.deployedAt}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70">Built in {dep.duration}</span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <Tooltip content="Redeploy build">
                        <Button variant="ghost" size="icon-sm" aria-label="Redeploy build">
                          <RotateCw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Visit live site">
                        <a
                          href={dep.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Visit live site"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Domains */}
        {activeTab === "domains" && (
          <div className="space-y-6">
            {/* Add Domain Input Card */}
            <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Connect Custom Domain
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Map your branded custom domain with automated Let&apos;s Encrypt SSL certificates.
                  </p>
                </div>
                <Badge variant="violet" className="text-xs gap-1">
                  <ShieldCheck className="h-3 w-3" /> Free SSL Included
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <Input
                  placeholder="e.g. mycompany.com or app.mybrand.io"
                  value={newCustomDomain}
                  onChange={(e) => setNewCustomDomain(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDomain();
                    }
                  }}
                  className="h-9 text-xs"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddDomain}
                  disabled={!newCustomDomain.trim()}
                  className="whitespace-nowrap font-medium"
                >
                  Add Domain
                </Button>
              </div>
            </div>

            {/* DNS Records Guide Table */}
            <div className="rounded-lg border border-border/80 bg-card overflow-hidden">
              <div className="p-4 border-b border-border/80 bg-muted/30">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Configured DNS Records
                </h3>
              </div>

              <div className="divide-y divide-border/60">
                {dnsRecords.map((dns) => (
                  <div key={dns.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{dns.domain}</span>
                        <Badge
                          variant={dns.status === "Verified" ? "success" : "warning"}
                          dot
                          className="text-[10px]"
                        >
                          {dns.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                        <span>Type: <strong className="text-foreground">{dns.type}</strong></span>
                        <span>Name: <strong className="text-foreground">{dns.name}</strong></span>
                        <span>Target: <strong className="text-foreground">{dns.value}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> SSL: {dns.ssl}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={dns.status === "Verified" || verifyingDnsId === dns.id}
                        onClick={() => handleVerifyDns(dns.id)}
                      >
                        {verifyingDnsId === dns.id ? "Verifying..." : dns.status === "Verified" ? "Verified" : "Verify DNS"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Environment Variables */}
        {activeTab === "env" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Environment Secrets & Variables
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Injected securely during server builds and client runtime.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 text-xs font-medium"
                onClick={() => setIsAddEnvModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Variable</span>
              </Button>
            </div>

            <div className="rounded-lg border border-border/80 bg-card overflow-hidden">
              <div className="grid grid-cols-12 border-b border-border/80 bg-muted/40 p-3.5 text-xs font-semibold text-muted-foreground">
                <div className="col-span-4">Variable Key</div>
                <div className="col-span-5">Value</div>
                <div className="col-span-2">Target</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border/60">
                {envVars.map((env) => {
                  const isRevealed = showSecrets[env.id];
                  return (
                    <div
                      key={env.id}
                      className="grid grid-cols-12 items-center p-3.5 text-xs font-mono transition-colors hover:bg-muted/30"
                    >
                      <div className="col-span-4 font-semibold text-foreground truncate pr-2">
                        {env.key}
                      </div>

                      <div className="col-span-5 text-muted-foreground truncate pr-4 flex items-center gap-2">
                        <span className="truncate">
                          {env.isSecret && !isRevealed
                            ? "••••••••••••••••••••••••••••"
                            : env.value}
                        </span>
                        {env.isSecret && (
                          <button
                            onClick={() =>
                              setShowSecrets((prev) => ({
                                ...prev,
                                [env.id]: !prev[env.id],
                              }))
                            }
                            className="text-muted-foreground hover:text-foreground p-0.5"
                            aria-label={isRevealed ? "Hide secret" : "Show secret"}
                          >
                            {isRevealed ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="col-span-2">
                        <Badge variant="outline" className="text-[10px]">
                          {env.environment}
                        </Badge>
                      </div>

                      <div className="col-span-1 flex items-center justify-end gap-1">
                        <Tooltip content="Copy value">
                          <button
                            onClick={() => handleCopy(env.value, env.id)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded"
                          >
                            {copiedKey === env.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </Tooltip>
                        <Tooltip content="Delete variable">
                          <button
                            onClick={() =>
                              setEnvVars(envVars.filter((e) => e.id !== env.id))
                            }
                            className="p-1 text-muted-foreground hover:text-red-500 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Env Modal */}
            <Modal
              isOpen={isAddEnvModalOpen}
              onClose={() => setIsAddEnvModalOpen(false)}
              title="Add Environment Variable"
              description="Define key-value pairs accessible to Next.js API routes and client code."
            >
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Key (e.g. STRIPE_API_KEY)
                  </label>
                  <Input
                    placeholder="KEY_NAME"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Value
                  </label>
                  <Input
                    type="password"
                    placeholder="Secret value or endpoint URL"
                    value={newEnvVal}
                    onChange={(e) => setNewEnvVal(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddEnvModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddEnv}
                    disabled={!newEnvKey.trim() || !newEnvVal.trim()}
                  >
                    Save Variable
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* Tab 4: Build Console Logs */}
        {activeTab === "logs" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-foreground font-mono">
                  Live Deployment Stream • Build #142
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="violet" className="text-[10px] font-mono">
                  Next.js 14.2 Production
                </Badge>
              </div>
            </div>

            {/* Terminal Emulator */}
            <div className="rounded-lg border border-border/90 bg-black p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-2xl leading-relaxed">
              <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-white/10 text-muted-foreground text-[11px]">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-muted-foreground/70">
                  byt-deploy-worker-us-east-1
                </span>
              </div>

              <div className="space-y-1 text-slate-300">
                <p className="text-muted-foreground">[02:54:01] Initializing build environment for project: &quot;ai-portfolio-builder&quot;...</p>
                <p className="text-muted-foreground">[02:54:03] Pulling commit hash 8f29ac1 from git main branch.</p>
                <p className="text-blue-400">[02:54:06] Installing dependencies with node 20.x runtime...</p>
                <p className="text-emerald-400">✓ Dependencies installed in 3.4s.</p>
                <p className="text-blue-400">[02:54:10] Running &quot;next build&quot; production bundle compiler...</p>
                <p className="text-slate-400">  ▲ Next.js 14.2.35</p>
                <p className="text-slate-400">  ✓ Compiled app router pages and server components (4/4)</p>
                <p className="text-slate-400">  ✓ Collecting static page data and generating serverless edge functions</p>
                <p className="text-slate-400">  ✓ Optimized CSS bundle (Tailwind) in 142ms</p>
                <p className="text-emerald-400">✓ Production build finalized (Total size: 101 kB).</p>
                <p className="text-blue-400">[02:54:19] Uploading static assets to Global CDN (35 edge regions)...</p>
                <p className="text-emerald-400">✓ Assets replicated across edge nodes.</p>
                <p className="text-blue-400">[02:54:21] Generating Automated SSL Certificate (Let&apos;s Encrypt)...</p>
                <p className="text-emerald-400">✓ SSL verified for https://dev-portfolio.byt-ai.vercel.app</p>
                <p className="text-violet-400 font-bold pt-2">
                  ✨ Deployment complete and LIVE at https://dev-portfolio.byt-ai.vercel.app in 21.4s!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
