import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MemeCardProps {
  meme: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    exportedImageUrl: string | null;
    likeCount: number;
    user: { name: string; username: string; image: string | null } | null;
  };
}

export function MemeCard({ meme }: MemeCardProps) {
  const imageUrl = meme.exportedImageUrl ?? meme.thumbnailUrl;

  return (
    <Link
      href={`/editor/${meme.id}`}
      className="group border-border/60 bg-card shadow-soft-sm hover:shadow-soft-md relative block w-56 shrink-0 overflow-hidden rounded-2xl border transition-shadow"
    >
      <div className="bg-muted relative aspect-square overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={meme.title}
            fill
            sizes="224px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{meme.title}</p>
          {meme.user ? (
            <p className="text-muted-foreground truncate text-xs">@{meme.user.username}</p>
          ) : null}
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
          <Heart className="size-3.5" />
          {meme.likeCount}
        </div>
      </div>
    </Link>
  );
}
