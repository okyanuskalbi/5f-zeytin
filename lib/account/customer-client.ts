import { MembershipError } from "@/lib/auth/adapter";
import type { AddressBookAdapter } from "@/components/account/AddressBook";
import type { CustomerAddress } from "@/lib/contracts/customer";

export async function customerRequest<T>(
  url: string,
  init: RequestInit = {},
  expectedStatus = 200,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new MembershipError(
      "İşlem tamamlanamadı. Bağlantınızı kontrol edip yeniden deneyin.",
    );
  }
  const body = await response.json().catch(() => null);
  if (
    response.status === expectedStatus &&
    (expectedStatus === 204 || (body && Object.hasOwn(body, "data")))
  )
    return body?.data as T;
  if (response.status === 401)
    throw new MembershipError("Oturumunuz doğrulanamadı. Yeniden giriş yapın.");
  if (response.status === 429)
    throw new MembershipError("Çok fazla deneme. Daha sonra yeniden deneyin.");
  if (response.status === 409)
    throw new MembershipError(
      "En fazla 20 adres saklayabilirsiniz. Adreslerinizi kontrol edin.",
    );
  if (
    response.status === 400 &&
    body?.error?.fields &&
    typeof body.error.fields === "object"
  ) {
    const allowed = [
      "name",
      "phone",
      "title",
      "recipient",
      "city",
      "district",
      "line",
      "postalCode",
      "currentPassword",
      "password",
    ];
    const fields = Object.fromEntries(
      Object.entries(body.error.fields).filter(
        ([key, value]) =>
          allowed.includes(key) &&
          typeof value === "string" &&
          value.length < 300,
      ),
    ) as Record<string, string>;
    throw new MembershipError("Lütfen alanları kontrol edin.", fields);
  }
  throw new MembershipError(
    "Bilgiler yüklenemedi veya işlem tamamlanamadı. Lütfen yeniden deneyin.",
  );
}
export const customerJson = (value: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value),
});

export function createCustomerAddressAdapter(): AddressBookAdapter {
  const listAddresses = () =>
    customerRequest<CustomerAddress[]>("/api/account/addresses");
  return {
    listAddresses,
    async saveAddress(input) {
      const prior = input.id
        ? (await listAddresses()).find((address) => address.id === input.id)
        : undefined;
      return customerRequest<CustomerAddress>(
        "/api/account/addresses",
        {
          method: input.id ? "PATCH" : "POST",
          ...customerJson({ ...input, isDefault: prior?.isDefault ?? false }),
        },
        input.id ? 200 : 201,
      );
    },
    async deleteAddress(id) {
      await customerRequest<void>(
        `/api/account/addresses?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
        204,
      );
    },
    async setDefaultAddress(id) {
      const address = (await listAddresses()).find((item) => item.id === id);
      if (!address)
        throw new MembershipError("Adres bulunamadı. Listeyi yenileyin.");
      await customerRequest<CustomerAddress>("/api/account/addresses", {
        method: "PATCH",
        ...customerJson({ ...address, isDefault: true }),
      });
    },
  };
}
