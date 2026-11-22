"use client";

import * as React from "react";

interface FileIconProps {
  filename: string;
  isFolder?: boolean;
  isOpen?: boolean;
  className?: string;
}

export function FileIcon({ filename, isFolder = false, isOpen = false, className = "h-4 w-4" }: FileIconProps) {
  if (isFolder) {
    if (isOpen) {
      return (
        <svg className={`${className} text-amber-400 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 20H4a2 2 0 0 1-2-2V6c0-1.11.89-2 2-2h6l2 2h7a2 2 0 0 1 2 2v1h-8a2 2 0 0 0-1.9 1.37L9.4 16H4V8h16v1.17c.59.35 1 .99 1 1.73l-1.9 8.27A2 2 0 0 1 17.16 21H19z" />
        </svg>
      );
    }
    return (
      <svg className={`${className} text-amber-500 shrink-0`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
      </svg>
    );
  }

  const name = filename.toLowerCase();

  // Special config files
  if (name === "package.json") {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#CB3837" />
        <path d="M4 8h16v8H4z" fill="#fff" />
        <path d="M9 11v3H7v-3h2zm4 0v3h-2v-3h2zm4 0v3h-2v-3h2z" fill="#CB3837" />
      </svg>
    );
  }

  if (name.includes("vite.config") || name.includes("next.config") || name.includes("metro.config")) {
    return (
      <svg className={`${className} text-emerald-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  if (name === "app.json" || name === "eas.json") {
    return (
      <svg className={`${className} text-purple-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  // HTML5: Authentic Orange Shield
  if (name.endsWith(".html") || name.endsWith(".htm")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <path d="M4 3l1.6 18 6.4 2 6.4-2L20 3H4z" fill="#E44D26" />
        <path d="M12 4.6v16.7l5.1-1.6L18.4 4.6H12z" fill="#F16529" />
        <path d="M7.4 7.6h9.2l-.3 3.3H9.8l.2 2.8h6.9l-.5 5.5-4.4 1.2-4.4-1.2-.3-3.6h2.2l.2 1.9 2.3.6 2.3-.6.3-2.6H7.1l.3-7.3z" fill="#fff" />
      </svg>
    );
  }

  // CSS3: Authentic Blue Shield
  if (name.endsWith(".css")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <path d="M4 3l1.6 18 6.4 2 6.4-2L20 3H4z" fill="#1572B6" />
        <path d="M12 4.6v16.7l5.1-1.6L18.4 4.6H12z" fill="#33A9DC" />
        <path d="M7.4 7.6h9.2l-.3 3.3H9.8l.2 2.8h6.9l-.5 5.5-4.4 1.2-4.4-1.2-.3-3.6h2.2l.2 1.9 2.3.6 2.3-.6.3-2.6H7.1l.3-7.3z" fill="#fff" />
      </svg>
    );
  }

  // TypeScript JSX (.tsx): Cyan React Atom with TS accent
  if (name.endsWith(".tsx")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#1e293b" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="#38bdf8" />
        <rect x="13" y="14" width="9" height="8" rx="2" fill="#3178C6" />
        <text x="14" y="20" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">TS</text>
      </svg>
    );
  }

  // JavaScript JSX (.jsx): Cyan React Atom with JS accent
  if (name.endsWith(".jsx")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#1e293b" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61dafb" strokeWidth="1.5" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61dafb" strokeWidth="1.5" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61dafb" strokeWidth="1.5" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill="#61dafb" />
      </svg>
    );
  }

  // TypeScript (.ts): Official Blue TS Badge
  if (name.endsWith(".ts")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path d="M6 9h6m-3 0v9M14 14.5c.8 1 2 1.5 3.3 1.5 1.2 0 2-.6 2-1.4 0-1-.8-1.4-2.2-1.9-1.8-.6-3.1-1.3-3.1-3 0-1.6 1.4-2.7 3.3-2.7 1.5 0 2.7.6 3.4 1.6l-1.3 1.2c-.5-.7-1.3-1.1-2.1-1.1-1 0-1.6.5-1.6 1.2 0 .8.6 1.1 2 1.6 2 .7 3.3 1.4 3.3 3.2 0 1.9-1.5 2.9-3.7 2.9-1.8 0-3.3-.8-4-2.1l1.4-1z" stroke="#fff" strokeWidth="1.2" fill="#fff" />
      </svg>
    );
  }

  // JavaScript (.js, .mjs, .cjs): Official Yellow JS Badge
  if (name.endsWith(".js") || name.endsWith(".mjs") || name.endsWith(".cjs")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path d="M7 16.5c.5.8 1.1 1.2 1.8 1.2 1 0 1.6-.6 1.6-1.8V9h1.8v7c0 2.2-1.3 3.2-3.2 3.2-1.5 0-2.6-.8-3.2-2l1.2-1.2zm8.5-.2c.8.9 1.9 1.4 3.1 1.4 1.3 0 2.2-.6 2.2-1.5 0-1-.8-1.5-2.2-2-1.8-.7-3-1.4-3-3.1 0-1.7 1.4-2.8 3.3-2.8 1.5 0 2.7.6 3.4 1.7l-1.3 1.1c-.5-.8-1.2-1.2-2.1-1.2-1 0-1.6.5-1.6 1.2 0 .8.7 1.2 2 1.7 2 .7 3.2 1.5 3.2 3.3 0 1.9-1.5 3-3.7 3-1.8 0-3.3-.8-4.1-2.2l1.4-1.2z" fill="#000" />
      </svg>
    );
  }

  // JSON: Amber Curly Brackets
  if (name.endsWith(".json")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#b45309" />
        <text x="5" y="17" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="monospace">{"{}"}</text>
      </svg>
    );
  }

  // Markdown (.md): Blue Markdown Arrow
  if (name.endsWith(".md") || name.endsWith(".mdx")) {
    return (
      <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0284c7" />
        <path d="M4 16V8h2.5l2.5 3 2.5-3H14v8h-2v-4.5L9.5 15 7 11.5V16H4zm13 0v-4h-2l3-4 3 4h-2v4h-2z" fill="#fff" />
      </svg>
    );
  }

  // SVG: Purple Vector Badge
  if (name.endsWith(".svg")) {
    return (
      <svg className={`${className} text-purple-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    );
  }

  // Images (.png, .jpg, .jpeg, .webp, .ico)
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp") || name.endsWith(".ico")) {
    return (
      <svg className={`${className} text-emerald-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    );
  }

  // Default File
  return (
    <svg className={`${className} text-slate-400 shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
