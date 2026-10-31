import {
  deleteCustomerAddress,
  listCustomerAddresses,
  saveCustomerAddress,
} from "@/lib/account/customer-server";
import { customerError, customerInput } from "@/lib/account/customer-http";
import { isCustomerId } from "@/lib/contracts/customer";
import {
  assertRequestOrigin,
  AuthCoreError,
  authResponseHeaders,
} from "@/lib/auth/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(
      { data: await listCustomerAddresses() },
      { headers: authResponseHeaders },
    );
  } catch (error) {
    return customerError(error);
  }
}
async function writeAddress(request: Request, update: boolean) {
  try {
    assertRequestOrigin(request);
    const input = await customerInput(request);
    if (update ? !isCustomerId(input.id) : input.id !== undefined)
      throw new AuthCoreError(400, "invalid_address");
    return Response.json(
      { data: await saveCustomerAddress(input) },
      { status: update ? 200 : 201, headers: authResponseHeaders },
    );
  } catch (error) {
    return customerError(error);
  }
}
export async function POST(request: Request) {
  return writeAddress(request, false);
}
export async function PATCH(request: Request) {
  return writeAddress(request, true);
}
export async function DELETE(request: Request) {
  try {
    assertRequestOrigin(request);
    await deleteCustomerAddress(new URL(request.url).searchParams.get("id"));
    return new Response(null, { status: 204, headers: authResponseHeaders });
  } catch (error) {
    return customerError(error);
  }
}
