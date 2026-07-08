"use client";

import { ArrowRight, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeSlideUp, springGentle, staggerContainer } from "@/lib/motion/presets";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  }

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="from-brand-from via-brand-via to-brand-to pointer-events-none absolute inset-x-0 -top-64 -z-10 h-[48rem] bg-gradient-to-br opacity-25 blur-3xl"
      />
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer(0.1)}
        className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-24 text-center sm:py-32"
      >
        <motion.div
          variants={fadeSlideUp}
          transition={springGentle}
          className="border-border/60 bg-background/60 flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm backdrop-blur"
        >
          <Sparkles className="text-brand-via size-3.5" />
          <span>AI-powered caption generation, built in</span>
        </motion.div>

        <motion.h1
          variants={fadeSlideUp}
          transition={springGentle}
          className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Create memes that
          <br />
          <span className="text-gradient-brand">actually land</span>
        </motion.h1>

        <motion.p
          variants={fadeSlideUp}
          transition={springGentle}
          className="text-muted-foreground max-w-2xl text-lg text-balance"
        >
          A professional meme editor with layers, filters, and AI captioning — plus a searchable
          template library and a community to share your best work.
        </motion.p>

        <motion.form
          variants={fadeSlideUp}
          transition={springGentle}
          onSubmit={handleSearch}
          className="flex w-full max-w-lg items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates, tags, or ideas..."
              className="h-12 rounded-full pl-10"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 rounded-full px-6">
            Search
          </Button>
        </motion.form>

        <motion.div
          variants={fadeSlideUp}
          transition={springGentle}
          className="flex flex-wrap justify-center gap-3"
        >
          <Button size="lg" className="rounded-full" asChild>
            <Link href="/editor/new">
              Start creating
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full" asChild>
            <Link href="/templates">Browse templates</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
