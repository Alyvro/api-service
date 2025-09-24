import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import ApiAccess from "@/client/api";

// Initialize the API client
const api = ApiAccess("https://api.alyvro.com", undefined, {
  PRIVATE_KEY: "12345",
  PUBLIC_KEY: "12345",
});

// Server setup
let failCount = 0;
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  failCount = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

/**
 * Utility to set a handler that fails N times before succeeding
 */
function setupFailThenSucceedHandler(url: string, failTimes: number = 2) {
  server.use(
    http.get(url, () => {
      failCount++;
      if (failCount <= failTimes) {
        return HttpResponse.json({ error: "Server Error" }, { status: 500 });
      }
      return HttpResponse.json({ message: "Success" }, { status: 200 });
    })
  );
}

/**
 * Utility to set a handler that always fails
 */
function setupAlwaysFailHandler(url: string) {
  server.use(
    http.get(url, () => {
      failCount++;
      return HttpResponse.json({ error: "Always Fail" }, { status: 500 });
    })
  );
}

describe("Retry Plugin", () => {
  it("should succeed after a few retries", async () => {
    setupFailThenSucceedHandler("https://api.alyvro.com/test", 2);

    const response = await api.get("/test", {
      plugins: { retry: { retries: 3, retryDelay: 10, backoff: false } },
    });

    expect(response.data.message).toBe("Success");
    expect(failCount).toBe(3); // initial attempt + 2 retries
  });

  it("should throw an error after max retries", async () => {
    setupAlwaysFailHandler("https://api.alyvro.com/test");

    await expect(
      api.get("/test", {
        plugins: { retry: { retries: 2, retryDelay: 10, backoff: false } },
      })
    ).rejects.toThrow();

    expect(failCount).toBe(3); // initial attempt + 2 retries
  });
});
