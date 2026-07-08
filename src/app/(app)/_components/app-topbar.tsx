"use client";

import { Search } from "lucide-react";

import { useCommandPaletteStore } from "@/components/composed/command-palette";
import { ThemeToggle } from "@/components/composed/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppTopbar() {
  const toggleCommandPalette = useCommandPaletteStore((state) => state.toggle);

  return (
    <header className="border-border/60 bg-background/70 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur-lg">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <Button
        variant="outline"
        className="text-muted-foreground h-8 flex-1 justify-start gap-2 sm:max-w-xs"
        onClick={toggleCommandPalette}
      >
        <Search className="size-3.5" />
        <span className="text-sm">Search...</span>
        <kbd className="bg-muted text-muted-foreground ml-auto hidden rounded px-1.5 py-0.5 text-xs sm:inline-block">
          ⌘K
        </kbd>
      </Button>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
