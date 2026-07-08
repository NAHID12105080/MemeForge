import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-32 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
        <span className="text-gradient-brand">MemeForge</span>
      </h1>
      <p className="text-muted-foreground max-w-xl text-lg text-balance">
        An AI-powered meme creation platform. The full landing experience is under construction.
      </p>
      <div className="flex gap-3">
        <Button size="lg" asChild>
          <Link href="/templates">Browse templates</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/editor/new">Open editor</Link>
        </Button>
      </div>
    </div>
  );
}
