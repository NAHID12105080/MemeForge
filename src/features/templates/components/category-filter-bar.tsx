"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryFilterBarProps {
  categories: { slug: string; name: string }[];
}

export function CategoryFilterBar({ categories }: CategoryFilterBarProps) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category");

  return (
    <div className="flex scrollbar-none gap-2 overflow-x-auto pb-1">
      <Link href="/templates">
        <Badge
          variant={!activeSlug ? "default" : "outline"}
          className={cn("cursor-pointer px-3 py-1.5 text-sm", !activeSlug && "shadow-soft-sm")}
        >
          All
        </Badge>
      </Link>
      {categories.map((category) => (
        <Link key={category.slug} href={`/templates?category=${category.slug}`}>
          <Badge
            variant={activeSlug === category.slug ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap",
              activeSlug === category.slug && "shadow-soft-sm",
            )}
          >
            {category.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
