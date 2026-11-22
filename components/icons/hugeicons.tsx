"use client";

import * as React from "react";
import { HugeiconsIcon, type HugeiconsProps } from "@hugeicons/react";
import {
  SparklesIcon,
  FlashIcon,
  Rocket01Icon,
  CodeCircleIcon,
  DashboardSquare01Icon,
  EyeIcon,
  EyeOffIcon,
  Message01Icon,
  SentIcon,
  Add01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ReloadIcon,
  Download01Icon,
  Copy01Icon,
  CheckIcon,
  CheckmarkCircle01Icon,
  SecurityCheckIcon,
  SecurityWarningIcon,
  SecurityLockIcon,
  Settings01Icon,
  User02Icon,
  Moon01Icon,
  Sun01Icon,
  Folder01Icon,
  Folder02Icon,
  File01Icon,
  File02Icon,
  SmartPhone01Icon,
  Package01Icon,
  QrCode01Icon,
  GithubIcon,
  TerminalIcon,
  Key01Icon,
  ScaleIcon,
  CookieIcon,
  Search01Icon,
  Cancel01Icon,
  CancelCircleIcon,
  HelpCircleIcon,
  Clock01Icon,
  HistoryIcon,
  CreditCardIcon,
  Logout01Icon,
  FilterIcon,
  Share01Icon,
  Attachment01Icon,
  Mic01Icon,
  MagicWand01Icon,
  Layers01Icon,
  ShoppingBag01Icon,
  KanbanIcon,
  ChartHistogramIcon,
  DatabaseIcon,
  ComputerIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon,
  Delete02Icon,
  Edit02Icon,
  FloppyDiskIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  MoreHorizontalIcon,
  Menu01Icon,
  Maximize01Icon,
  Minimize01Icon,
  SlidersHorizontalIcon,
  StarIcon,
  GitForkIcon,
  LaptopMinimalCheckIcon,
  FolderOpenIcon,
  FileAddIcon,
  FolderAddIcon,
  GlobeIcon,
  PaintBoardIcon,
  AiBrain01Icon,
  AiMail01Icon,
  CursorPointer01Icon,
  ChartIncreaseIcon,
  TextWrapIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  CloudServerIcon,
  CopyLinkIcon,
} from "@hugeicons/core-free-icons";

export interface IconProps extends Omit<HugeiconsProps, "icon"> {
  size?: number | string;
  className?: string;
}

function createHugeIcon(iconData: any, defaultStrokeWidth: number = 1.6) {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 18, strokeWidth = defaultStrokeWidth, className = "", color = "currentColor", ...props }, ref) => {
      return (
        <HugeiconsIcon
          ref={ref}
          icon={iconData}
          size={size}
          strokeWidth={strokeWidth}
          color={color}
          className={className}
          {...props}
        />
      );
    }
  );
  Component.displayName = "HugeIcon";
  return Component;
}

// Brand & Identity
export const Zap = createHugeIcon(FlashIcon);
export const Sparkles = createHugeIcon(SparklesIcon);
export const Rocket = createHugeIcon(Rocket01Icon);
export const Wand2 = createHugeIcon(MagicWand01Icon);

// Code & Workbench
export const Code = createHugeIcon(CodeCircleIcon);
export const Code2 = createHugeIcon(CodeCircleIcon);
export const FileCode = createHugeIcon(File02Icon);
export const FileCode2 = createHugeIcon(File02Icon);
export const Terminal = createHugeIcon(TerminalIcon);
export const Layers = createHugeIcon(Layers01Icon);
export const Layout = createHugeIcon(DashboardSquare01Icon);
export const Columns = createHugeIcon(DashboardSquare01Icon);
export const Eye = createHugeIcon(EyeIcon);
export const EyeOff = createHugeIcon(EyeOffIcon);
export const Play = createHugeIcon(PlayIcon);
export const Pause = createHugeIcon(PauseIcon);

// Files & Folders
export const Folder = createHugeIcon(Folder01Icon);
export const FolderGit2 = createHugeIcon(Folder02Icon);
export const FolderKanban = createHugeIcon(Folder01Icon);
export const File = createHugeIcon(File01Icon);
export const FileText = createHugeIcon(File01Icon);

// Communication & Chat
export const MessageSquare = createHugeIcon(Message01Icon);
export const Send = createHugeIcon(SentIcon);
export const Paperclip = createHugeIcon(Attachment01Icon);
export const Mic = createHugeIcon(Mic01Icon);
export const Bot = createHugeIcon(SparklesIcon);

// Actions & Navigation
export const Plus = createHugeIcon(Add01Icon);
export const ArrowRight = createHugeIcon(ArrowRight01Icon);
export const ArrowLeft = createHugeIcon(ArrowLeft01Icon);
export const ArrowDown = createHugeIcon(ArrowDown01Icon);
export const ArrowUp = createHugeIcon(ArrowUp01Icon);
export const ChevronDown = createHugeIcon(ArrowDown01Icon);
export const ChevronRight = createHugeIcon(ArrowRight01Icon);
export const ChevronUp = createHugeIcon(ArrowUp01Icon);
export const RotateCcw = createHugeIcon(ReloadIcon);
export const RefreshCw = createHugeIcon(ReloadIcon);
export const Download = createHugeIcon(Download01Icon);
export const Copy = createHugeIcon(Copy01Icon);
export const Check = createHugeIcon(CheckIcon);
export const CheckCircle2 = createHugeIcon(CheckmarkCircle01Icon);
export const X = createHugeIcon(Cancel01Icon);
export const XCircle = createHugeIcon(CancelCircleIcon);
export const Trash2 = createHugeIcon(Delete02Icon);
export const Edit2 = createHugeIcon(Edit02Icon);
export const Save = createHugeIcon(FloppyDiskIcon);
export const ExternalLink = createHugeIcon(Share01Icon);
export const Share2 = createHugeIcon(Share01Icon);
export const ArrowUpRight = createHugeIcon(ArrowUpRight01Icon);
export const MoreHorizontal = createHugeIcon(MoreHorizontalIcon);
export const MoreVertical = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className = "", ...props }, ref) => {
    const Component = createHugeIcon(MoreHorizontalIcon);
    return <Component ref={ref} className={`rotate-90 ${className}`} {...props} />;
  }
);
MoreVertical.displayName = "HugeIconMoreVertical";
export const Menu = createHugeIcon(Menu01Icon);
export const Search = createHugeIcon(Search01Icon);

// Security, Compliance & Legal
export const Shield = createHugeIcon(SecurityCheckIcon);
export const ShieldCheck = createHugeIcon(SecurityCheckIcon);
export const ShieldAlert = createHugeIcon(SecurityWarningIcon);
export const AlertCircle = createHugeIcon(SecurityWarningIcon);
export const Lock = createHugeIcon(SecurityLockIcon);
export const Key = createHugeIcon(Key01Icon);
export const Scale = createHugeIcon(ScaleIcon);
export const Cookie = createHugeIcon(CookieIcon);
export const HelpCircle = createHugeIcon(HelpCircleIcon);
export const Info = createHugeIcon(InformationCircleIcon);

// System, Device & Account
export const Smartphone = createHugeIcon(SmartPhone01Icon);
export const Package = createHugeIcon(Package01Icon);
export const QrCode = createHugeIcon(QrCode01Icon);
export const Github = createHugeIcon(GithubIcon);
export const Settings = createHugeIcon(Settings01Icon);
export const Sliders = createHugeIcon(SlidersHorizontalIcon);
export const Filter = createHugeIcon(FilterIcon);
export const User = createHugeIcon(User02Icon);
export const CreditCard = createHugeIcon(CreditCardIcon);
export const LogOut = createHugeIcon(Logout01Icon);
export const Moon = createHugeIcon(Moon01Icon);
export const Sun = createHugeIcon(Sun01Icon);
export const Clock = createHugeIcon(Clock01Icon);
export const History = createHugeIcon(HistoryIcon);
export const Cpu = createHugeIcon(CodeCircleIcon);
export const Database = createHugeIcon(DatabaseIcon);
export const BarChart3 = createHugeIcon(ChartHistogramIcon);
export const ShoppingBag = createHugeIcon(ShoppingBag01Icon);
export const Kanban = createHugeIcon(KanbanIcon);
export const Star = createHugeIcon(StarIcon);
export const GitFork = createHugeIcon(GitForkIcon);
export const Laptop = createHugeIcon(LaptopMinimalCheckIcon);
export const Monitor = createHugeIcon(ComputerIcon);
export const Tablet = createHugeIcon(SmartPhone01Icon);
export const RotateCw = createHugeIcon(ReloadIcon);
export const FolderOpen = createHugeIcon(FolderOpenIcon);
export const FilePlus = createHugeIcon(FileAddIcon);
export const FolderPlus = createHugeIcon(FolderAddIcon);
export const FileJson = createHugeIcon(File02Icon);
export const Palette = createHugeIcon(PaintBoardIcon);
export const Globe = createHugeIcon(GlobeIcon);
export const Maximize2 = createHugeIcon(Maximize01Icon);
export const Minimize2 = createHugeIcon(Minimize01Icon);
export const AlertTriangle = createHugeIcon(SecurityWarningIcon);
export const Radio = createHugeIcon(InformationCircleIcon);
export const Box = createHugeIcon(Package01Icon);
export const Command = createHugeIcon(CodeCircleIcon);

// Animated spinner component using Hugeicons SVG
export const Loader2 = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className = "", ...props }, ref) => {
    const Component = createHugeIcon(ReloadIcon);
    return <Component ref={ref} className={`animate-spin ${className}`} {...props} />;
  }
);
Loader2.displayName = "HugeiconsLoader";

export const Brain = createHugeIcon(AiBrain01Icon);
export const Mail = createHugeIcon(AiMail01Icon);
export const MousePointerClick = createHugeIcon(CursorPointer01Icon);
export const TrendingUp = createHugeIcon(ChartIncreaseIcon);
export const WrapText = createHugeIcon(TextWrapIcon);
export const GitBranch = createHugeIcon(GitBranchIcon);
export const GitCommit = createHugeIcon(GitCommitHorizontalIcon);
export const Server = createHugeIcon(CloudServerIcon);
export const Link2 = createHugeIcon(CopyLinkIcon);
export const KeyRound = createHugeIcon(Key01Icon);
export const CheckCheck = createHugeIcon(CheckmarkCircle01Icon);
export const RefreshCcw = createHugeIcon(ReloadIcon);
export const CornerDownLeft = createHugeIcon(ArrowLeft01Icon);
export const Minus = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className = "", size = 18, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
);
Minus.displayName = "HugeIconMinus";

