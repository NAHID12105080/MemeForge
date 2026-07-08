import { generateTemplates } from "./generate-templates";
import { seedCategories } from "./seed-categories";
import { seedUsers } from "./seed-users";

async function main() {
  const seededCategories = await seedCategories();
  await generateTemplates(seededCategories);
  await seedUsers();
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
