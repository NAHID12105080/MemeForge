import { auth } from "@/lib/auth/auth";

const DEMO_USERS = [
  { name: "Ada Lovelace", username: "ada", email: "ada@memeforge.dev", password: "password123" },
  {
    name: "Grace Hopper",
    username: "grace",
    email: "grace@memeforge.dev",
    password: "password123",
  },
] as const;

export async function seedUsers() {
  if (process.env.NODE_ENV === "production") {
    console.log("Skipping demo user seed in production.");
    return;
  }

  for (const demoUser of DEMO_USERS) {
    try {
      await auth.api.signUpEmail({ body: demoUser });
      console.log(`Seeded demo user @${demoUser.username}`);
    } catch (error) {
      console.log(`Skipping @${demoUser.username}: ${(error as Error).message}`);
    }
  }
}
