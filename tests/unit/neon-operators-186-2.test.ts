// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { getProducts } from "@/lib/catalog/static-products";
// @ts-expect-error Standalone operator scripts do not have generated declarations.
import { loadStaticCatalog, seedCatalog, parseSeedArguments, seedStatements } from "../../scripts/db-seed.mjs";
// @ts-expect-error Standalone operator script does not have generated declarations.
import { grantAdmin, parseAdminArguments } from "../../scripts/admin-grant.mjs";

describe("catalog and admin operator boundaries", () => {
  it("uses the approved static catalog as its only product value source", async () => {
    const products = await getProducts();
    const plan = await loadStaticCatalog();
    expect(plan.products.map((p: Record<string, unknown>) => ({ id: p.id, name: p.name, category: p.category, weight: p.weight, priceKurus: p.price_kurus, stock: p.stock })))
      .toEqual(products.map(({ id, name, category, weight, priceKurus, stock }) => ({ id, name, category, weight, priceKurus, stock })));
    expect(plan.products).toHaveLength(6);
    expect(plan.upsells).toEqual([]);
  });
  it("defaults to a dry plan and never runs a database command", async () => {
    const run = vi.fn();
    const result = await seedCatalog({ apply: false }, run);
    expect(result.mode).toBe("dry-run");
    expect(result.products).toHaveLength(6);
    expect(run).not.toHaveBeenCalled();
  });
  it("rejects ambiguous arguments and a missing target before running anything", () => {
    expect(parseSeedArguments([])).toEqual({ apply: false });
    expect(parseSeedArguments(["--apply", "--local"])).toMatchObject({ apply: true, target: { remote: false } });
    expect(parseSeedArguments(["--apply", "--remote"])).toMatchObject({ apply: true, target: { remote: true } });
    for (const args of [["--apply"], ["--force"], ["--apply", "--dry-run"], ["--apply", "--local", "--remote"]]) expect(() => parseSeedArguments(args)).toThrow();
    expect(parseAdminArguments(["--email", " A@Example.test "])).toBe("a@example.test");
    for (const args of [[], ["--email", "bad"], ["--email", "a@example.test", "--force"]]) expect(() => parseAdminArguments(args)).toThrow();
  });
  it("builds one upsert per product using bound-safe literals", async () => {
    const statements = seedStatements(await loadStaticCatalog());
    expect(statements).toHaveLength(6);
    expect(statements.every((sql: string) => sql.includes("ON CONFLICT (id) DO UPDATE"))).toBe(true);
    expect(statements.join("\n")).not.toMatch(/public\.|\$1/);
  });
  it("rejects unknown or ambiguous users without assigning any permission", () => {
    for (const results of [[], [{ id: "one" }, { id: "two" }]]) {
      const run = vi.fn(() => [{ results }]);
      expect(() => grantAdmin({ remote: false }, "nobody@example.test", run)).toThrow(results.length ? "ambiguous_user" : "user_not_found");
      expect(run).toHaveBeenCalledTimes(1);
      expect(String((run.mock.calls[0] as unknown[])[1] && JSON.stringify(run.mock.calls[0]))).not.toContain("admin_users");
    }
  });
});
