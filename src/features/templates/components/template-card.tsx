"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { templates } from "@/db/schema";
import { toggleBookmarkAction } from "@/features/community/actions/toggle-bookmark.action";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: typeof templates.$inferSelect;
  initialFavorited?: boolean;
}

export function TemplateCard({ template, initialFavorited = false }: TemplateCardProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleFavorite(event: React.MouseEvent) {
    event.preventDefault();
    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      try {
        await toggleBookmarkAction({ targetType: "template", targetId: template.id });
      } catch {
        setFavorited(!next);
        toast.error("Sign in to save favorites.");
      }
    });
  }

  return (
    <Link
      href={`/editor/new?template=${template.slug}`}
      className="group border-border/60 bg-card shadow-soft-sm hover:shadow-soft-md relative block overflow-hidden rounded-2xl border transition-shadow"
    >
      <div className="bg-muted relative aspect-square overflow-hidden">
        <Image
          src={template.thumbnailUrl}
          alt={template.name}
          fill
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-4 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black">
            Use template
          </span>
        </div>
        <Button
          size="icon"
          variant="secondary"
          disabled={isPending}
          onClick={handleFavorite}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          className="shadow-soft-sm absolute top-2 right-2 size-8 rounded-full"
        >
          <Heart className={cn("size-4", favorited && "fill-destructive text-destructive")} />
        </Button>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium">{template.name}</p>
        <p className="text-muted-foreground text-xs">{template.usageCount.toLocaleString()} uses</p>
      </div>
    </Link>
  );
}
