import {
  validateAddress,
  type Address,
  type AddressInput,
} from "@/lib/account/adapter";
export type CustomerAddress = Address;
export type CustomerAddressInput = AddressInput & {
  id?: string;
  isDefault: boolean;
};
export const customerOrderStatuses = {
  pending: "Ödeme bekleniyor",
  paid: "Ödeme onaylandı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
} as const;
export type CustomerOrder = {
  no: string;
  date: string;
  totalKurus: number;
  status: keyof typeof customerOrderStatuses;
  items: {
    name: string;
    weight: string;
    quantity: number;
    unitPriceKurus: number;
  }[];
  deliveryAddress: string;
  shipping: { carrier: string; trackingNo: string; url: string | null } | null;
};
export const customerPageSize = 20;
export const isCustomerId = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
export const isOrderNo = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9-]{2,39}$/.test(value);

export function parseCustomerAddressInput(
  value: unknown,
):
  | { ok: true; data: CustomerAddressInput }
  | { ok: false; fields: Record<string, string> } {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { ok: false, fields: {} };
  const input = value as Record<string, unknown>;
  const keys = [
    "title",
    "recipient",
    "phone",
    "city",
    "district",
    "line",
    "postalCode",
  ] as const;
  const data = Object.fromEntries(
    keys.map((key) => [
      key,
      typeof input[key] === "string" ? input[key].trim() : "",
    ]),
  ) as AddressInput;
  const fields = validateAddress(data);
  if (
    (input.id !== undefined && !isCustomerId(input.id)) ||
    typeof input.isDefault !== "boolean" ||
    Object.keys(input).some(
      (key) => ![...keys, "id", "isDefault"].includes(key),
    )
  )
    return { ok: false, fields };
  return Object.keys(fields).length
    ? { ok: false, fields }
    : {
        ok: true,
        data: {
          ...data,
          ...(input.id ? { id: input.id as string } : {}),
          isDefault: input.isDefault,
        },
      };
}

export function parseCustomerAddress(row: unknown): CustomerAddress | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  const parsed = parseCustomerAddressInput({
    id: value.id,
    title: value.title,
    recipient: value.recipient,
    phone: value.phone,
    city: value.city,
    district: value.district,
    line: value.line,
    postalCode: value.postal_code,
    isDefault: value.is_default,
  });
  return parsed.ok && parsed.data.id
    ? { ...parsed.data, id: parsed.data.id }
    : null;
}

export function parseCustomerOrder(value: unknown): CustomerOrder | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    !isOrderNo(row.order_no) ||
    typeof row.status !== "string" ||
    !Object.hasOwn(customerOrderStatuses, row.status) ||
    typeof row.created_at !== "string" ||
    !Number.isFinite(Date.parse(row.created_at)) ||
    typeof row.total_kurus !== "number" ||
    !Number.isSafeInteger(row.total_kurus) ||
    row.total_kurus < 0 ||
    !Array.isArray(row.order_items)
  )
    return null;
  const items: CustomerOrder["items"] = [];
  for (const item of row.order_items) {
    if (
      !item ||
      typeof item.product_name !== "string" ||
      !item.product_name.trim() ||
      typeof item.weight !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      !Number.isSafeInteger(item.unit_price_kurus) ||
      item.unit_price_kurus < 0
    )
      return null;
    items.push({
      name: item.product_name,
      weight: item.weight,
      quantity: item.quantity,
      unitPriceKurus: item.unit_price_kurus,
    });
  }
  const address =
    row.delivery_address && typeof row.delivery_address === "object"
      ? (row.delivery_address as Record<string, unknown>)
      : {};
  let url: string | null = null;
  try {
    const candidate = new URL(String(row.tracking_url));
    if (
      candidate.protocol === "https:" &&
      !candidate.username &&
      !candidate.password
    )
      url = candidate.href;
  } catch {
    /* No unsafe carrier link. */
  }
  return {
    no: row.order_no,
    date: row.created_at,
    totalKurus: row.total_kurus,
    status: row.status as CustomerOrder["status"],
    items,
    deliveryAddress: ["recipient", "line", "district", "city", "postalCode"]
      .map((key) => address[key])
      .filter(
        (part): part is string => typeof part === "string" && !!part.trim(),
      )
      .join(", "),
    shipping:
      typeof row.shipping_carrier === "string" &&
      row.shipping_carrier.trim() &&
      typeof row.tracking_no === "string" &&
      row.tracking_no.trim()
        ? { carrier: row.shipping_carrier, trackingNo: row.tracking_no, url }
        : null,
  };
}
