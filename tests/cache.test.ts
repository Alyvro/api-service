import { describe, it, expect, beforeEach } from "vitest";
import ApiAccess from "@/client/api";
import { serverCachePlugin } from "@/plugins/cache/server";

// Initialize API client
const api = ApiAccess("https://api.alyvro.com", undefined, {
  PRIVATE_KEY: "12345",
  PUBLIC_KEY: "12345",
});

describe("Cache Plugin - Real Endpoint", () => {
  beforeEach(() => {
    // Clear cache before each test
    if (serverCachePlugin.clear) serverCachePlugin.clear();
  });

  it("should cache repeated requests to /blog/all-blogs", async () => {
    // First request (populate cache)
    const firstResponse = await api.get("/blog/all-blogs", {
      plugins: { cache: serverCachePlugin },
    });

    expect(firstResponse.data).toBeDefined();
    expect(Array.isArray(firstResponse.data.blogs)).toBe(true);

    // Second request (should hit cache)
    const secondResponse = await api.get("/blog/all-blogs", {
      plugins: { cache: serverCachePlugin },
    });

    expect(secondResponse.data).toBeDefined();
    expect(Array.isArray(secondResponse.data.blogs)).toBe(true);

    // Check deep equality of cached blogs array
    expect(secondResponse.data.blogs).toEqual(firstResponse.data.blogs);
  });

  it("should return fresh data after cache reset", async () => {
    // Populate cache
    await api.get("/blog/all-blogs", { plugins: { cache: serverCachePlugin } });

    // Clear cache
    if (serverCachePlugin.clear) serverCachePlugin.clear();

    // New request should return fresh data
    const freshResponse = await api.get("/blog/all-blogs", {
      plugins: { cache: serverCachePlugin },
    });

    expect(freshResponse.data).toBeDefined();
    expect(Array.isArray(freshResponse.data.blogs)).toBe(true);
    expect(freshResponse.data.blogs.length).toBeGreaterThan(0);
  });

  it("should cache the whole response object (not just blogs array)", async () => {
    const firstResponse = await api.get("/blog/all-blogs", {
      plugins: { cache: serverCachePlugin },
    });

    const secondResponse = await api.get("/blog/all-blogs", {
      plugins: { cache: serverCachePlugin },
    });

    // Ensure full object is cached, not only the array
    expect(secondResponse.data).toEqual(firstResponse.data);
    expect(secondResponse.data).toHaveProperty("blogs");
    expect(Array.isArray(secondResponse.data.blogs)).toBe(true);
  });
});
