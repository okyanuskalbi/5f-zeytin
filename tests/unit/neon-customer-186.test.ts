// @vitest-environment node
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { query } from "@/lib/db";
import { deleteCustomerAddress, listCustomerAddresses, listCustomerOrders, readCustomerOrder, saveCustomerAddress } from "@/lib/account/customer-server";
import { readCatalog } from "@/lib/catalog/read";
vi.mock("server-only", () => ({}));
const auth = vi.hoisted(() => ({ user: vi.fn() }));
vi.mock("@/lib/auth/server", async original => ({ ...(await original<typeof import("@/lib/auth/server")>()), getVerifiedUser: auth.user }));
const owner = randomUUID();
const foreign = randomUUID();
const orderNo = `AF-${randomUUID().slice(0, 12)}`;
const productId = `task186-${randomUUID()}`;
const address = { title: "Ev", recipient: "Deniz Test", phone: "05321234567", city: "Osmaniye", district: "Düziçi", line: "Örnek sokak no 1", postalCode: "80000", isDefault: false };

describe("local D1 customer/catalog boundaries", () => {
  beforeAll(async () => {
    for (const id of [owner, foreign]) await query('INSERT INTO "user"(id,name,email) VALUES($1,$2,$3)', [id, "Local Test", `${id}@example.test`]);
    auth.user.mockResolvedValue({ id: owner, email: `${owner}@example.test` });
  });

  it("reads only published catalog entries and preserves a zero stock/price", async () => {
    await query("INSERT INTO products(id,name,category,weight,price_kurus,stock) VALUES($1,$2,$3,$4,$5,$6)", [productId, "Local test olive", "sofralik-zeytin", "1 kg", 0, 0]);
    expect((await readCatalog()).data.some(item => item.id === productId)).toBe(false);
    await query("UPDATE products SET is_active = $1 WHERE id = $2", [true, productId]);
    const catalog = await readCatalog();
    expect(catalog.source).toBe("database");
    expect(catalog.data.find(item => item.id === productId)).toMatchObject({ priceKurus: 0, stock: 0, showCategoryLabel: true, categoryLabel: null });
    await query("UPDATE products SET is_active = $1 WHERE id = $2", [false, productId]);
    expect((await readCatalog()).data.some(item => item.id === productId)).toBe(false);
  });

  it("keeps another customer's addresses unreadable and unchanged", async () => {
    auth.user.mockResolvedValue({ id: foreign });
    const foreignAddress = await saveCustomerAddress(address);
    auth.user.mockResolvedValue({ id: owner });
    expect(await listCustomerAddresses()).toEqual([]);
    await expect(saveCustomerAddress({ ...address, id: foreignAddress.id, recipient: "Forged User" })).rejects.toMatchObject({ status: 404 });
    await expect(deleteCustomerAddress(foreignAddress.id)).rejects.toMatchObject({ status: 404 });
    expect((await query("SELECT recipient FROM customer_addresses WHERE user_id = $1 AND id = $2", [foreign, foreignAddress.id])).rows).toEqual([{ recipient: address.recipient }]);
  });

  it("saves, changes, removes defaults atomically and rolls back rejected changes", async () => {
    const first = await saveCustomerAddress(address);
    expect(first.isDefault).toBe(true);
    const second = await saveCustomerAddress({ ...address, title: "İş", isDefault: true });
    expect((await listCustomerAddresses()).filter(item => item.isDefault).map(item => item.id)).toEqual([second.id]);
    // Unchecking the sole default leaves one default, preserving the old behavior.
    expect((await saveCustomerAddress({ ...address, id: second.id })).isDefault).toBe(true);
    await deleteCustomerAddress(second.id);
    expect((await listCustomerAddresses()).filter(item => item.isDefault).map(item => item.id)).toEqual([first.id]);
    await deleteCustomerAddress(first.id);
    expect(await listCustomerAddresses()).toEqual([]);
    // New first-address operations on the same owner; exactly one becomes default.
    await Promise.all([saveCustomerAddress(address), saveCustomerAddress({ ...address, title: "İş" })]);
    expect((await listCustomerAddresses()).filter(item => item.isDefault)).toHaveLength(1);
    for (let i = 2; i < 20; i++) await saveCustomerAddress({ ...address, title: `Adres ${i}` });
    await expect(saveCustomerAddress(address)).rejects.toMatchObject({ status: 409, code: "address_limit" });
    const addresses = await listCustomerAddresses();
    expect(addresses).toHaveLength(20); expect(addresses.filter(item => item.isDefault)).toHaveLength(1);
    // The rejected 21st address left nothing behind.
    expect((await query("SELECT count(*) AS n FROM customer_addresses WHERE user_id = $1", [owner])).rows[0].n).toBe(20);
  });

  it("filters order lists and details by session identity and includes item details", async () => {
    const id = randomUUID();
    await query("INSERT INTO orders(id,user_id,order_no,total_kurus,delivery_address,tracking_url) VALUES($1,$2,$3,$4,$5,$6)", [id, foreign, orderNo, 12345, { recipient: "Foreign", line: "Private" }, "https://tracking.example.test/1"]);
    await query("INSERT INTO order_items(order_id,product_name,weight,quantity,unit_price_kurus) VALUES($1,$2,$3,$4,$5)", [id, "Olive", "1 kg", 1, 12345]);
    expect(await listCustomerOrders()).toEqual({ orders: [], page: 1, total: 0 });
    await expect(readCustomerOrder(orderNo)).rejects.toMatchObject({ status: 404 });
    auth.user.mockResolvedValue({ id: foreign });
    const own = await readCustomerOrder(orderNo);
    expect(own).toMatchObject({ no: orderNo, totalKurus: 12345, deliveryAddress: "Foreign, Private", items: [{ name: "Olive", quantity: 1 }] });
    expect((await listCustomerOrders()).total).toBe(1);
    auth.user.mockResolvedValue({ id: owner });
  });
});
