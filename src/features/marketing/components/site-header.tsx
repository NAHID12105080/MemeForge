"use client";

import { Search } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/composed/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/features/auth/components/user-menu";

const navLinks = [
  { label: "Templates", href: "/templates" },
  { label: "Explore", href: "/explore" },
  { label: "Trending", href: "/trending" },
  { label: "AI Generator", href: "/ai-generator" },
];

export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-40 border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
            MemeForge
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link href="/search">
              <Search className="size-4" />
            </Link>
          </Button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
