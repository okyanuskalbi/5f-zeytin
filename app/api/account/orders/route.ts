import { listCustomerOrders } from "@/lib/account/customer-server";
import { customerError } from "@/lib/account/customer-http";
import { authResponseHeaders } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    return Response.json(
      {
        data: await listCustomerOrders(
          Number(new URL(request.url).searchParams.get("page") ?? "1"),
        ),
      },
      { headers: authResponseHeaders },
    );
  } catch (error) {
    return customerError(error);
  }
}
