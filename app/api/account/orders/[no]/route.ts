import { readCustomerOrder } from "@/lib/account/customer-server";
import { customerError } from "@/lib/account/customer-http";
import { authResponseHeaders } from "@/lib/auth/server";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ no: string }> },
) {
  try {
    return Response.json(
      { data: await readCustomerOrder((await params).no) },
      { headers: authResponseHeaders },
    );
  } catch (error) {
    return customerError(error);
  }
}
