declare module "next" {
  export type Metadata = {
    title?: string | { default: string; template: string };
    description?: string;
    [key: string]: any;
  };
  export type Viewport = {
    themeColor?: string;
    width?: string | number;
    initialScale?: number;
    [key: string]: any;
  };
}

declare module "next/link" {
  import React from "react";
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
  }
  const Link: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;
  export default Link;
}

declare module "next/navigation" {
  export interface AppRouterInstance {
    back(): void;
    forward(): void;
    refresh(): void;
    push(href: string, options?: { scroll?: boolean }): void;
    replace(href: string, options?: { scroll?: boolean }): void;
    prefetch(href: string): void;
  }
  export function useRouter(): AppRouterInstance;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams(): Record<string, string | string[]>;
  export function redirect(url: string, type?: any): never;
}

declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export type ResolvingMetadata = Promise<any>;
  export type ResolvingViewport = Promise<any>;
}

declare module "next/dist/lib/metadata/types/metadata-types.js" {
  export type Metadata = any;
  export type Viewport = any;
}
