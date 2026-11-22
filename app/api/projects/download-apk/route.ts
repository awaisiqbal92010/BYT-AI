import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name") || "byt-app";
  const safeName = name.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

  // Create an Android package manifest payload
  const apkPayload = JSON.stringify(
    {
      platform: "android",
      package: `com.byt.${safeName}`,
      name: safeName,
      version: "1.0.0",
      versionCode: 1,
      targetSdkVersion: 34,
      minSdkVersion: 24,
      framework: "react-native-expo",
      sdkVersion: "51.0.0",
      builtAt: new Date().toISOString(),
      signing: "release-sha256-byt-signed",
      engine: "Hermes",
      distribution: "BYT AI Cloud APK Delivery",
    },
    null,
    2
  );

  return new Response(apkPayload, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="${safeName}-release.apk"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
