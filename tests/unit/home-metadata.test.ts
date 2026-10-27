import { expect, it, vi } from "vitest";
import * as home from "@/app/page";

vi.mock("server-only", () => ({}));

it("uses a fixed homepage canonical for the landing and its product query URLs", () => {
  expect(home).toHaveProperty("metadata.alternates.canonical", "/");
});

it("prerenders the anonymous landing and revalidates its catalog every five minutes", () => {
  expect(home).toHaveProperty("dynamic", "force-static");
  expect(home).toHaveProperty("revalidate", 300);
});
