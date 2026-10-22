import { expect, it } from "vitest";
import * as home from "@/app/page";

it("uses a fixed homepage canonical for the landing and its product query URLs", () => {
  expect(home).toHaveProperty("metadata.alternates.canonical", "/");
});
