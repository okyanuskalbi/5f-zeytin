// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, expect, it } from "vitest";
import { createLocalSupabase } from "../helpers/supabase-local";
let db: PGlite;
const owner = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const address = {
  title: "Ev",
  recipient: "Deniz Test",
  phone: "05321234567",
  city: "Osmaniye",
  district: "Düziçi",
  line: "Örnek sokak no 1",
  postalCode: "80000",
  isDefault: true,
};
beforeAll(async () => {
  db = await createLocalSupabase();
  await db.query("insert into auth.users(id) values ($1),($2)", [owner, other]);
}, 30000);
afterAll(async () => {
  await db?.close();
});
it("saves addresses atomically, keeps one default and rejects a foreign owner", async () => {
  await db.exec("set role service_role");
  const first = (
    await db.query<{ result: { id: string } }>(
      "select public.customer_save_address($1,null,$2::jsonb) as result",
      [owner, JSON.stringify(address)],
    )
  ).rows[0].result;
  await db.query("select public.customer_save_address($1,null,$2::jsonb)", [
    owner,
    JSON.stringify({ ...address, title: "İş" }),
  ]);
  expect(
    (
      await db.query(
        "select count(*)::int as n from public.customer_addresses where is_default",
      )
    ).rows,
  ).toEqual([{ n: 1 }]);
  await expect(
    db.query("select public.customer_save_address($1,$2,$3::jsonb)", [
      other,
      first.id,
      JSON.stringify(address),
    ]),
  ).rejects.toThrow();
  await expect(
    db.query("select public.customer_delete_address($1,$2)", [other, first.id]),
  ).rejects.toThrow();
  await db.query("select public.customer_delete_address($1,$2)", [
    owner,
    first.id,
  ]);
});
it.each(["anon", "authenticated"])(
  "denies %s all private customer relation and function access",
  async (role) => {
    await db.exec(`reset role; set role ${role}`);
    for (const table of ["customer_addresses", "orders", "order_items"])
      await expect(db.query(`select * from public.${table}`)).rejects.toThrow(
        /permission denied/,
      );
    await expect(
      db.query("select public.customer_save_address($1,null,$2::jsonb)", [
        owner,
        JSON.stringify(address),
      ]),
    ).rejects.toThrow(/permission denied/);
  },
);
it("explicitly grants service DML while denying every client table privilege with RLS enabled", async () => {
  await db.exec("reset role");
  for (const table of ["customer_addresses", "orders", "order_items"]) {
    for (const role of ["anon", "authenticated", "service_role"]) {
      for (const privilege of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
        const result = await db.query<{ allowed: boolean }>(
          "select has_table_privilege($1,$2,$3) as allowed",
          [role, `public.${table}`, privilege],
        );
        expect(result.rows[0].allowed).toBe(role === "service_role");
      }
    }
    const result = await db.query<{ enabled: boolean }>(
      "select relrowsecurity as enabled from pg_class where oid=$1::regclass",
      [`public.${table}`],
    );
    expect(result.rows[0].enabled).toBe(true);
  }
});
it("caps a customer's saved addresses without dropping the existing defaults", async () => {
  await db.exec("set role service_role");
  const count = (
    await db.query<{ n: number }>(
      "select count(*)::int as n from public.customer_addresses where user_id=$1",
      [other],
    )
  ).rows[0].n;
  for (let i = count; i < 20; i++)
    await db.query("select public.customer_save_address($1,null,$2::jsonb)", [
      other,
      JSON.stringify({ ...address, isDefault: false }),
    ]);
  await expect(
    db.query("select public.customer_save_address($1,null,$2::jsonb)", [
      other,
      JSON.stringify(address),
    ]),
  ).rejects.toThrow(/Address limit/);
  expect(
    (
      await db.query(
        "select count(*)::int as n from public.customer_addresses where user_id=$1 and is_default",
        [other],
      )
    ).rows,
  ).toEqual([{ n: 1 }]);
});
