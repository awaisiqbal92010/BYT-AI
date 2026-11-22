import "server-only";

/**
 * Appetize.io Server-Side API Client
 *
 * Handles uploading app bundles to Appetize and generating signed embed configurations.
 * Keys are server-only — never exposed to the browser.
 *
 * Appetize API v1: https://api.appetize.io/v1/apps
 * JS SDK Docs: https://docs.appetize.io/javascript-sdk
 */

const APPETIZE_API_BASE = "https://api.appetize.io/v1";

function getApiKey(): string {
  const key = process.env.APPETIZE_API_KEY;
  if (!key) {
    throw new Error("APPETIZE_API_KEY is not configured. Set it in .env.local");
  }
  return key;
}

export interface AppetizeApp {
  publicKey: string;
  platform: "ios" | "android";
  created: string;
  updated: string;
  name?: string;
  note?: string;
  appVersionName?: string;
  appVersionCode?: string;
  bundle?: string;
  iconUrl?: string;
  buildId?: string;
}

export interface AppetizeUploadResult {
  publicKey: string;
  buildId: string;
  platform: "ios" | "android";
  created: string;
  versionCode: number;
}

export interface AppetizeEmbedConfig {
  embedUrl: string;
  buildId: string;
  device: string;
  platform: "ios" | "android";
  osVersion?: string;
  scale: number | "auto";
  orientation: "portrait" | "horizontal";
  screenOnly: boolean;
}

/**
 * Upload an app bundle to Appetize via public URL.
 * The URL must point to a downloadable .apk, .zip, or .tar.gz file.
 */
export async function uploadAppByUrl(params: {
  url: string;
  platform: "ios" | "android";
  note?: string;
  publicKey?: string; // If provided, updates an existing app
}): Promise<AppetizeUploadResult> {
  const apiKey = getApiKey();
  const endpoint = params.publicKey
    ? `${APPETIZE_API_BASE}/apps/${params.publicKey}`
    : `${APPETIZE_API_BASE}/apps`;

  const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      url: params.url,
      platform: params.platform,
      note: params.note || "Uploaded by BYT AI Builder",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Appetize upload failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return {
    publicKey: data.publicKey,
    buildId: data.buildId || data.publicKey,
    platform: data.platform,
    created: data.created,
    versionCode: data.versionCode ?? 1,
  };
}

/**
 * Upload an app bundle to Appetize via direct file upload (multipart/form-data).
 * Accepts a Buffer or Uint8Array of the app binary.
 */
export async function uploadAppByFile(params: {
  fileBuffer: Buffer | Uint8Array;
  fileName: string;
  platform: "ios" | "android";
  note?: string;
  publicKey?: string;
}): Promise<AppetizeUploadResult> {
  const apiKey = getApiKey();
  const endpoint = params.publicKey
    ? `${APPETIZE_API_BASE}/apps/${params.publicKey}`
    : `${APPETIZE_API_BASE}/apps`;

  const formData = new FormData();
  const blob = new Blob([params.fileBuffer as any], {
    type: "application/octet-stream",
  });
  formData.append("file", blob, params.fileName);
  formData.append("platform", params.platform);
  if (params.note) {
    formData.append("note", params.note);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Appetize file upload failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return {
    publicKey: data.publicKey,
    buildId: data.buildId || data.publicKey,
    platform: data.platform,
    created: data.created,
    versionCode: data.versionCode ?? 1,
  };
}

/**
 * List all apps in the Appetize account.
 */
export async function listApps(): Promise<AppetizeApp[]> {
  const apiKey = getApiKey();
  const response = await fetch(`${APPETIZE_API_BASE}/apps`, {
    method: "GET",
    headers: {
      "X-API-KEY": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Appetize list apps failed (${response.status})`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Delete an app from Appetize by its publicKey.
 */
export async function deleteApp(publicKey: string): Promise<void> {
  const apiKey = getApiKey();
  const response = await fetch(`${APPETIZE_API_BASE}/apps/${publicKey}`, {
    method: "DELETE",
    headers: {
      "X-API-KEY": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Appetize delete failed (${response.status}): ${errorText}`
    );
  }
}

export function hasAppetizeApiKey(): boolean {
  return Boolean(process.env.APPETIZE_API_KEY);
}

/**
 * Generate a signed embed configuration for the Appetize JS SDK or iframe.
 *
 * The client component uses this config to initialise the iframe.
 * Parameters are appended as query strings per official Appetize documentation:
 * https://docs.appetize.io/embed
 */
export function generateEmbedConfig(params: {
  buildId: string;
  platform?: "ios" | "android";
  device?: string;
  osVersion?: string;
  orientation?: "portrait" | "horizontal";
  scale?: number | "auto";
  screenOnly?: boolean;
  autoplay?: boolean;
}): AppetizeEmbedConfig {
  const platform = params.platform || "android";
  const device =
    params.device ||
    (platform === "ios" ? "iphone15pro" : "pixel7");
  const orientation = params.orientation || "portrait";
  const scale = params.scale ?? "auto";
  const screenOnly = params.screenOnly ?? false;

  const queryParams = new URLSearchParams({
    device,
    scale: String(scale),
    orientation,
    screenOnly: String(screenOnly),
    centered: "both",
  });

  if (params.osVersion) queryParams.set("osVersion", params.osVersion);
  if (params.autoplay !== false) queryParams.set("autoplay", "true");

  return {
    embedUrl: `https://appetize.io/embed/${params.buildId}?${queryParams.toString()}`,
    buildId: params.buildId,
    device,
    platform,
    osVersion: params.osVersion,
    scale,
    orientation,
    screenOnly,
  };
}
