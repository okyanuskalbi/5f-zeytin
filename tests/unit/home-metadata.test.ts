import { expect, it, vi } from "vitest";
import * as home from "@/app/page";

vi.mock("server-only", () => ({}));

it("uses a fixed homepage canonical for the landing and its product query URLs", () => {
  expect(home).toHaveProperty("metadata.alternates.canonical", "/");
});

it("reads admin category settings on every request instead of freezing the build fallback", () => {
  expect(home.dynamic).toBe("force-dynamic");
});
