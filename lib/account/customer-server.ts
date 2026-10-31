import "server-only";
import { AuthCoreError, getVerifiedUser } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  customerPageSize,
  isCustomerId,
  isOrderNo,
  parseCustomerAddress,
  parseCustomerAddressInput,
  parseCustomerOrder,
} from "@/lib/contracts/customer";

export async function requireCustomer() {
  const user = await getVerifiedUser();
  if (!user) throw new AuthCoreError(401, "unauthenticated");
  return user;
}
const deadline = () => AbortSignal.timeout(5000);
const addressColumns =
  "id,title,recipient,phone,city,district,line,postal_code,is_default";
const orderColumns =
  "order_no,status,created_at,total_kurus,delivery_address,shipping_carrier,tracking_no,tracking_url,order_items(product_name,weight,quantity,unit_price_kurus)";
const unavailable = () =>
  new AuthCoreError(503, "customer_data_unavailable", 5);

export async function listCustomerAddresses() {
  const user = await requireCustomer();
  const { data, error } = await createSupabaseServiceClient({ noStore: true })
    .from("customer_addresses")
    .select(addressColumns)
    .eq("user_id", user.id)
    .order("created_at")
    .limit(20)
    .retry(false)
    .abortSignal(deadline());
  if (error || !Array.isArray(data)) throw unavailable();
  const addresses = data.map(parseCustomerAddress);
  if (addresses.some((address) => !address)) throw unavailable();
  return addresses.filter((address) => address !== null);
}

export async function saveCustomerAddress(input: unknown) {
  const parsed = parseCustomerAddressInput(input);
  if (!parsed.ok)
    throw Object.assign(new AuthCoreError(400, "validation_error"), {
      fields: parsed.fields,
    });
  const user = await requireCustomer();
  const { id, ...address } = parsed.data;
  const { data, error } = await createSupabaseServiceClient({ noStore: true })
    .rpc("customer_save_address", {
      p_user_id: user.id,
      p_id: id ?? null,
      p_address: address,
    })
    .retry(false)
    .abortSignal(deadline());
  if (error?.code === "P0002")
    throw new AuthCoreError(404, "address_not_found");
  if (error?.code === "23514") throw new AuthCoreError(409, "address_limit");
  const result = parseCustomerAddress(data);
  if (error || !result) throw unavailable();
  return result;
}

export async function deleteCustomerAddress(id: unknown) {
  if (!isCustomerId(id)) throw new AuthCoreError(400, "invalid_address");
  const user = await requireCustomer();
  const { data, error } = await createSupabaseServiceClient({ noStore: true })
    .rpc("customer_delete_address", { p_user_id: user.id, p_id: id })
    .retry(false)
    .abortSignal(deadline());
  if (error?.code === "P0002")
    throw new AuthCoreError(404, "address_not_found");
  if (error || data !== true) throw unavailable();
}

export async function listCustomerOrders(page = 1) {
  if (!Number.isInteger(page) || page < 1 || page > 100000)
    throw new AuthCoreError(400, "invalid_page");
  const user = await requireCustomer();
  const { data, error, count } = await createSupabaseServiceClient({
    noStore: true,
  })
    .from("orders")
    .select(orderColumns, { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * customerPageSize, page * customerPageSize - 1)
    .retry(false)
    .abortSignal(deadline());
  if (
    error ||
    !Array.isArray(data) ||
    !Number.isSafeInteger(count) ||
    count! < 0
  )
    throw unavailable();
  const orders = data.map(parseCustomerOrder);
  if (orders.some((order) => !order)) throw unavailable();
  return {
    orders: orders.filter((order) => order !== null),
    page,
    total: count!,
  };
}

export async function readCustomerOrder(no: unknown) {
  if (!isOrderNo(no)) throw new AuthCoreError(404, "order_not_found");
  const user = await requireCustomer();
  const { data, error } = await createSupabaseServiceClient({ noStore: true })
    .from("orders")
    .select(orderColumns)
    .eq("user_id", user.id)
    .eq("order_no", no)
    .retry(false)
    .abortSignal(deadline())
    .maybeSingle();
  if (error) throw unavailable();
  if (data === null) throw new AuthCoreError(404, "order_not_found");
  const order = parseCustomerOrder(data);
  if (!order) throw unavailable();
  return order;
}
