import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nanoid } from "nanoid";

import { db } from "@/db/client";
import { env } from "@/lib/env";

const socialProviders = {
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
};

// Email/password signup collects a username through the form, but OAuth
// signup has no form step — the provider only gives us name/email/image.
// Generate one so the NOT NULL/unique `username` column is always satisfied.
function generateUsername(seed: string) {
  const base =
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "user";
  return `${base}-${nanoid(6)}`;
}

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    // No transactional email provider configured for local dev yet;
    // accounts are considered verified on signup. Revisit once an
    // email provider (e.g. Resend) is wired up.
    autoSignIn: true,
  },
  socialProviders,
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          if (userData.username) return;
          return {
            data: { ...userData, username: generateUsername(userData.email.split("@")[0]) },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
      websiteUrl: {
        type: "string",
        required: false,
        input: true,
      },
      location: {
        type: "string",
        required: false,
        input: true,
      },
      isPublic: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
});
