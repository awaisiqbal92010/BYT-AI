import * as React from "react";
import { Navbar, UserData } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/supabase/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  let user = null;
  let profile: Profile | null = null;

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    user = authUser;

    if (authUser) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      profile = profileData as Profile | null;
    }
  } catch {
    // Graceful fallback for local development or disconnected state
  }

  const userData: UserData = {
    id: user?.id || "local-user",
    email: user?.email || "developer@forge.site",
    github_username:
      profile?.github_username ||
      user?.user_metadata?.user_name ||
      user?.user_metadata?.preferred_username ||
      user?.user_metadata?.name ||
      "Muhammad Iqbal",
    avatar_url:
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      undefined,
    plan: profile?.plan || "free",
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Navigation Bar with Real Supabase User Data */}
      <Navbar user={userData} />

      {/* Main Workspace Area */}
      <main className="relative flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
