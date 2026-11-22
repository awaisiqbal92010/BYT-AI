"use client";

import * as React from "react";
import {
  Sparkles,
  Layers,
  Check,
  Plus,
  Search,
  Layout,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Shield,
  Zap,
} from "@/components/icons/hugeicons";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface BlockItem {
  id: string;
  name: string;
  category: "Hero" | "Features" | "Pricing" | "Testimonials" | "FAQ" | "Forms" | "Footers";
  description: string;
  prompt: string;
  gradient: string;
  badge?: string;
}

const BLOCKS: BlockItem[] = [
  {
    id: "blk-1",
    name: "Glassmorphism Hero with Glowing Badge",
    category: "Hero",
    description: "Modern hero section with animated gradient glow, two CTA buttons, and customer stats ribbon.",
    prompt: "Add a high-converting hero section with dark mode glowing violet background, dynamic headline, and customer count metrics.",
    gradient: "from-violet-600/30 via-indigo-600/20 to-transparent",
    badge: "Popular",
  },
  {
    id: "blk-2",
    name: "Interactive Monthly/Annual Pricing Table",
    category: "Pricing",
    description: "3-tier pricing calculator with 20% annual discount toggle, glowing Pro badge, and feature lists.",
    prompt: "Create an interactive pricing section with annual/monthly switch (-20% discount), 3 tiers (Starter, Pro, Enterprise), and glass hover effects.",
    gradient: "from-emerald-600/30 via-teal-600/20 to-transparent",
    badge: "Essential",
  },
  {
    id: "blk-3",
    name: "Bento Grid Feature Showcase",
    category: "Features",
    description: "Modern bento-style responsive feature grid with Lucide icons and hover highlight borders.",
    prompt: "Insert a modern Bento Grid feature layout with 4 cards showcasing fast performance, API integration, and edge deployment.",
    gradient: "from-blue-600/30 via-cyan-600/20 to-transparent",
  },
  {
    id: "blk-4",
    name: "Avatar Testimonial Carousel",
    category: "Testimonials",
    description: "Social proof review cards with 5-star rating stars, user avatars, and company badges.",
    prompt: "Add a customer testimonial grid with 5-star reviews, verified user badges, and company logos.",
    gradient: "from-amber-600/30 via-orange-600/20 to-transparent",
  },
  {
    id: "blk-5",
    name: "Animated Accordion FAQ",
    category: "FAQ",
    description: "Smooth expanding collapsible questions for pricing, security, and setup details.",
    prompt: "Generate an animated FAQ accordion section covering billing, team seats, and technical support.",
    gradient: "from-purple-600/30 via-pink-600/20 to-transparent",
  },
  {
    id: "blk-6",
    name: "Lead Capture & Waitlist Form",
    category: "Forms",
    description: "Minimalist email capture input with submit validation and success toast alert.",
    prompt: "Add a newsletter waitlist capture form with email input, submit button, and instant success confirmation.",
    gradient: "from-zinc-600/30 via-neutral-600/20 to-transparent",
  },
];

export interface ComponentInserterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock?: (prompt: string) => void;
  onInsert?: (component: BlockItem) => void;
}

export function ComponentInserterModal({
  isOpen,
  onClose,
  onInsertBlock,
  onInsert,
}: ComponentInserterModalProps) {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const categories = ["All", "Hero", "Features", "Pricing", "Testimonials", "FAQ", "Forms"];

  const filteredBlocks = BLOCKS.filter((b) => {
    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="UI Component Block Library"
      description="Choose a pre-built UI block to generate and insert into your active project."
      maxWidth="xl"
    >
      <div className="space-y-4 pt-2">
        {/* Search & Category filter */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-3.5 w-3.5" />}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredBlocks.map((block) => (
            <div
              key={block.id}
              className="group rounded-xl border border-border/80 bg-card/60 p-3.5 flex flex-col justify-between hover:border-primary/60 hover:bg-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {block.category}
                  </Badge>
                  {block.badge && (
                    <Badge variant="violet" className="text-[10px] py-0 px-1.5">
                      {block.badge}
                    </Badge>
                  )}
                </div>

                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {block.name}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {block.description}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onInsert) {
                      onInsert(block);
                    } else if (onInsertBlock) {
                      onInsertBlock(block.prompt);
                    }
                    onClose();
                  }}
                  className="h-7 text-xs gap-1 font-medium"
                >
                  <Plus className="h-3 w-3" />
                  <span>Insert with AI</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
