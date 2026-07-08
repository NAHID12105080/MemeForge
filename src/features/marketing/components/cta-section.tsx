import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="from-brand-from via-brand-via to-brand-to shadow-soft-lg relative overflow-hidden rounded-3xl bg-gradient-to-br px-8 py-16 text-center sm:px-16">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your next meme is a few clicks away
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/85">
          Jump into the editor or start from a template — no credit card, no download.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" variant="secondary" className="rounded-full" asChild>
            <Link href="/editor/new">
              Start creating
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
