import { describe, it, expect } from "vitest";
import ApiAccess from "@/client/api";
import { createAbortController } from "@/plugins";

const api = ApiAccess("https://api.alyvro.com", undefined, {
  PRIVATE_KEY: "12345",
  PUBLIC_KEY: "12345",
});

describe("API AbortController", () => {
  it("should abort a pending request", async () => {
    const controller = createAbortController();

    const promise = api.get("/blog/all-blogs", {
      signal: controller.signal,
    });

    controller.abort();

    // Flexible check: "abort" or "canceled"
    await expect(promise).rejects.toMatchObject({
      message: expect.stringMatching(/abort|canceled/i),
    });
  });
});
