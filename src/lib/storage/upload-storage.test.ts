import { describe, expect, it } from "vitest";

import { isB2Configured, refreshMediaUrl } from "@/lib/storage/upload-storage";

describe("isB2Configured", () => {
  it("returns true when all five B2 vars are present", () => {
    expect(
      isB2Configured({
        B2_ENDPOINT: "https://s3.us-west-004.backblazeb2.com",
        B2_REGION: "us-west-004",
        B2_KEY_ID: "key",
        B2_APPLICATION_KEY: "secret",
        B2_BUCKET_NAME: "bucket",
      }),
    ).toBe(true);
  });

  it("returns false when any single B2 var is missing", () => {
    expect(
      isB2Configured({
        B2_ENDPOINT: "https://s3.us-west-004.backblazeb2.com",
        B2_REGION: "us-west-004",
        B2_KEY_ID: "key",
        B2_APPLICATION_KEY: "secret",
        B2_BUCKET_NAME: undefined,
      }),
    ).toBe(false);
  });

  it("returns false when no B2 vars are set (local dev default)", () => {
    expect(
      isB2Configured({
        B2_ENDPOINT: undefined,
        B2_REGION: undefined,
        B2_KEY_ID: undefined,
        B2_APPLICATION_KEY: undefined,
        B2_BUCKET_NAME: undefined,
      }),
    ).toBe(false);
  });
});

describe("refreshMediaUrl", () => {
  it("returns non-B2 URLs unchanged (local-disk dev fallback, B2 unconfigured in tests)", async () => {
    await expect(refreshMediaUrl("/uploads/uploads/user1/abc.webp")).resolves.toBe(
      "/uploads/uploads/user1/abc.webp",
    );
  });
});
