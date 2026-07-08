import { db } from "@/db/client";
import { categories } from "@/db/schema";

export const CATEGORY_DEFINITIONS = [
  { name: "Reactions", slug: "reactions", icon: "Laugh", sortOrder: 0 },
  { name: "Classic Format", slug: "classic-format", icon: "LayoutTemplate", sortOrder: 1 },
  { name: "Wholesome", slug: "wholesome", icon: "Heart", sortOrder: 2 },
  { name: "Gaming", slug: "gaming", icon: "Gamepad2", sortOrder: 3 },
  { name: "Work & Office", slug: "work-office", icon: "Briefcase", sortOrder: 4 },
  { name: "Animals", slug: "animals", icon: "PawPrint", sortOrder: 5 },
  { name: "Minimal / Text-only", slug: "minimal", icon: "Type", sortOrder: 6 },
  { name: "Trending", slug: "trending", icon: "TrendingUp", sortOrder: 7 },
] as const;

export async function seedCategories() {
  const inserted = await db
    .insert(categories)
    .values(CATEGORY_DEFINITIONS.map((c) => ({ ...c, description: null })))
    .onConflictDoNothing({ target: categories.slug })
    .returning();

  console.log(`Seeded ${inserted.length} categories (${CATEGORY_DEFINITIONS.length} defined).`);

  return db.query.categories.findMany();
}
