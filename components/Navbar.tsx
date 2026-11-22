"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Share2,
  Rocket,
  ChevronDown,
  Layout,
  FolderKanban,
  Settings,
  History,
  Search,
  User,
  CreditCard,
  LogOut,
  HelpCircle,
  Code2,
  Zap,
} from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip } from "@/components/ui/tooltip";
import { Dropdown } from "@/components/ui/dropdown";
import { CommandPalette } from "@/components/CommandPalette";
import { firebaseSignOut } from "@/lib/firebase";
import { downloadProjectAsZip } from "@/lib/export-zip";
import { getSavedProjects } from "@/lib/project-storage";

export interface UserData {
  id?: string;
  email?: string;
  github_username?: string;
  avatar_url?: string;
  plan?: string;
}

interface NavbarProps {
  user?: UserData;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);

  const displayName =
    user?.github_username || user?.email?.split("@")[0] || "Muhammad Iqbal";
  const userPlan = (user?.plan || "free").toUpperCase();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Builder", icon: <Layout className="h-3.5 w-3.5" /> },
    { href: "/projects", label: "Projects", icon: <FolderKanban className="h-3.5 w-3.5" /> },
    { href: "/templates", label: "Templates", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { href: "/deployments", label: "Deployments", icon: <Rocket className="h-3.5 w-3.5" /> },
    { href: "/history", label: "History", icon: <History className="h-3.5 w-3.5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-3.5 w-3.5" /> },
  ];

  const userMenuItems = [
    {
      id: "profile",
      label: displayName,
      icon: <User className="h-3.5 w-3.5" />,
      onClick: () => router.push("/settings"),
    },
    {
      id: "plan",
      label: `${userPlan} Plan`,
      icon: <CreditCard className="h-3.5 w-3.5 text-primary" />,
      shortcut: userPlan,
      onClick: () => router.push("/settings"),
    },
    { id: "div1", label: "", divider: true },
    {
      id: "docs",
      label: "Documentation & API",
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      onClick: () => router.push("/acceptable-use"),
    },
    {
      id: "export",
      label: "Export Workspace",
      icon: <Code2 className="h-3.5 w-3.5" />,
      onClick: async () => {
        try {
          const projects = getSavedProjects();
          if (projects.length > 0 && projects[0].files) {
            await downloadProjectAsZip(projects[0].files, projects[0].name);
          } else {
            router.push("/projects");
          }
        } catch {
          router.push("/projects");
        }
      },
    },
    { id: "div2", label: "", divider: true },
    {
      id: "logout",
      label: "Sign out",
      icon: <LogOut className="h-3.5 w-3.5" />,
      danger: true,
      onClick: handleSignOut,
    },
  ];

  // Listen for ⌘K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Hide on builder workbench page to allow full screen Bolt.new workbench
  if (pathname === "/") {
    return (
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/80 bg-card/85 px-4 backdrop-blur-md transition-colors select-none">
        {/* Left: Brand logo & Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white shadow-sm shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div className="flex items-center gap-1 font-bold tracking-tight text-foreground">
              <span className="text-base font-extrabold tracking-tight">BYT</span>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Command Palette Trigger Button */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:bg-muted/70 hover:text-foreground transition-all w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span>Search or jump to...</span>
            </div>
            <span className="flex items-center gap-0.5 rounded border border-border/60 bg-background/80 px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right: Actions, ThemeToggle, User Dropdown */}
        <div className="flex items-center gap-2">
          {/* Quick command search on smaller screens */}
          <button
            onClick={() => setIsCommandOpen(true)}
            aria-label="Open command palette"
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Dark/Light mode toggle */}
          <ThemeToggle />

          {/* User profile dropdown menu */}
          <Dropdown
            trigger={
              <button
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-full ml-1"
                aria-label="User profile menu"
              >
                <Avatar
                  src={user?.avatar_url}
                  fallback={displayName.slice(0, 2).toUpperCase()}
                  size="default"
                  status="online"
                />
              </button>
            }
            items={userMenuItems}
            align="right"
          />
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}
