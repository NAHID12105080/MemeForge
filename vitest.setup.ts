// Mock server-only for tests
import { readFileSync } from "node:fs";
import path from "node:path";

import { vi } from "vitest";

// Load .env file for tests
const envPath = path.join(__dirname, ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      let value = valueParts.join("=").trim();
      // Remove quotes if present
      if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
} catch {
  // .env file not found, that's ok
}

vi.mock("server-only", () => ({}));
