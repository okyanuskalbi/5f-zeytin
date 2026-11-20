import type { D1DatabaseLike } from "@/lib/db/types";

declare global {
  interface CloudflareEnv {
    DB: D1DatabaseLike;
    ASSETS: { fetch(request: Request): Promise<Response> };
  }
}

export {};
