import {
  AuthCoreError,
  authErrorResponse,
  authResponseHeaders,
} from "@/lib/auth/server";

export async function customerInput(
  request: Request,
): Promise<Record<string, unknown>> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") ?? "",
    )
  )
    throw new AuthCoreError(415, "unsupported_media_type");
  const reader = request.body?.getReader();
  if (!reader) throw new AuthCoreError(400, "invalid_request");
  let bytes = 0,
    text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        throw new AuthCoreError(413, "payload_too_large");
      }
      text += decoder.decode(value, { stream: true });
    }
    const input: unknown = JSON.parse(text + decoder.decode());
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new Error();
    return input as Record<string, unknown>;
  } catch (error) {
    throw error instanceof AuthCoreError
      ? error
      : new AuthCoreError(400, "invalid_request");
  } finally {
    reader.releaseLock();
  }
}
export function customerError(error: unknown) {
  if (
    error instanceof AuthCoreError &&
    error.status === 400 &&
    "fields" in error
  )
    return Response.json(
      {
        error: {
          code: "validation_error",
          message: "Lütfen alanları kontrol edin.",
          fields: error.fields,
        },
      },
      { status: 400, headers: authResponseHeaders },
    );
  return authErrorResponse(
    error instanceof AuthCoreError
      ? error
      : new AuthCoreError(503, "customer_data_unavailable", 5),
  );
}
