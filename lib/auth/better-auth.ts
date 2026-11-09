import "server-only";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware, getAuthoritativeSessionFromCtx } from "better-auth/api";
import { magicLink } from "better-auth/plugins";
import { getPool, query } from "@/lib/db";
import { getAuthConfig, requireEmailVerification } from "./server-config";
import { getAuthCookieOptions, safeAuthRedirect } from "./config";
import { validateCredentials } from "./adapter";
import { validateRegisterRequest } from "@/lib/contracts/register";
import { assertAuthEmailConfigured, sendAuthEmail } from "./email";
import { consumeAccountAttempt } from "./account-rate-limit";

function createAuth() {
  const { siteOrigin, secret } = getAuthConfig();
  const emailVerificationRequired = requireEmailVerification();
  const google = process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim();
  return betterAuth({
    database: getPool(), baseURL: siteOrigin, secret,
    trustedOrigins: [...new Set([siteOrigin, "https://afinazeytin.com", "https://www.afinazeytin.com"])],
    emailAndPassword: {
      enabled: true, minPasswordLength: 10, maxPasswordLength: 128, requireEmailVerification: emailVerificationRequired, autoSignIn: false,
      sendResetPassword: async ({ user, url }) => { await sendAuthEmail({ to: user.email, url, subject: "AFİNA şifre sıfırlama" }); },
    },
    emailVerification: {
      sendOnSignUp: emailVerificationRequired, autoSignInAfterVerification: false,
      sendVerificationEmail: async ({ user, url }) => { await sendAuthEmail({ to: user.email, url, subject: "AFİNA e-posta doğrulama" }); },
    },
    user: { additionalFields: {
      phone: { type: "string", required: false, input: true },
      metadata: { type: "json", required: false, input: false },
    } },
    databaseHooks: {
      user: { create: { before: async (user, ctx) => ({
        data: {
          ...user,
          metadata: ctx?.path === "/sign-up/email" ? {
            privacy_acknowledged: true, membership_consent: true,
            marketing_consent: ctx.body?.marketing === true,
            consent_recorded_at: new Date().toISOString(),
          } : null,
        },
      }) } },
    },
    session: { cookieCache: { enabled: false }, expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    socialProviders: google ? { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } } : {},
    rateLimit: { enabled: true, storage: "database", window: 60, max: 100,
      customRules: { "/sign-in/email": { window: 60, max: 5 }, "/sign-up/email": { window: 60, max: 5 }, "/sign-in/magic-link": { window: 60, max: 5 }, "/change-password": { window: 60, max: 5 }, "/request-password-reset": { window: 60, max: 5 }, "/reset-password": { window: 60, max: 5 }, "/forget-password": { window: 60, max: 5 } } },
    advanced: { defaultCookieAttributes: getAuthCookieOptions(), useSecureCookies: process.env.NODE_ENV === "production", ipAddress: { ipAddressHeaders: process.env.VERCEL === "1" ? ["x-vercel-forwarded-for"] : [] } },
    hooks: {
      before: createAuthMiddleware(async ctx => {
        const emailPaths = ["/sign-in/email", "/sign-up/email", "/sign-in/magic-link", "/request-password-reset", "/forget-password", "/send-verification-email"];
        let retryAfter: number;
        try {
          let accountEmail: unknown = emailPaths.includes(ctx.path) ? ctx.body?.email : undefined;
          if (ctx.path === "/reset-password") {
            // Match Better Auth's token precedence exactly, including an empty body token.
            const token = ctx.body?.token || ctx.query?.token;
            if (typeof token === "string" && token.length <= 256) {
              const result = await query<{email: string}>(`SELECT u.email FROM public.verification v JOIN public."user" u ON u.id = v.value WHERE v.identifier = $1 AND v."expiresAt" > CURRENT_TIMESTAMP LIMIT 1`, [`reset-password:${token}`]);
              accountEmail = result.rows[0]?.email;
            }
          }
          if (ctx.path === "/change-password") accountEmail = (await getAuthoritativeSessionFromCtx(ctx))?.user.email;
          retryAfter = await consumeAccountAttempt(accountEmail, secret);
        } catch {
          // Better Call can log non-API errors despite the auth logger setting.
          // Convert driver failures before they reach that boundary.
          throw new APIError("SERVICE_UNAVAILABLE", { code: "AUTH_UNAVAILABLE", message: "Üyelik hizmeti şu anda kullanılamıyor." });
        }
        if (retryAfter > 0) throw new APIError("TOO_MANY_REQUESTS", { code: "ACCOUNT_RATE_LIMITED", message: "Çok fazla deneme. Daha sonra yeniden deneyin." }, { "Retry-After": String(retryAfter) });
        if ((ctx.path === "/sign-up/email" && emailVerificationRequired) || ["/sign-in/magic-link", "/request-password-reset", "/forget-password", "/send-verification-email"].includes(ctx.path)) {
          try { assertAuthEmailConfigured(); } catch { throw new APIError("SERVICE_UNAVAILABLE", { code: "EMAIL_NOT_CONFIGURED", message: "E-posta ile giriş hizmeti henüz yapılandırılmadı. Şifreyle giriş yapabilirsiniz." }); }
        }
        if (ctx.path === "/sign-up/email") {
          const { callbackURL: _callback, ...registration } = ctx.body ?? {};
          void _callback;
          if (!validateRegisterRequest(registration).ok) throw new APIError("BAD_REQUEST", { code: "VALIDATION_ERROR", message: "Üyelik bilgilerini ve zorunlu onayları kontrol edin." });
        }
        if (["/sign-up/email", "/sign-in/email", "/sign-in/social", "/sign-in/magic-link"].includes(ctx.path)) {
          if (ctx.body?.callbackURL !== undefined && ctx.body.callbackURL !== safeAuthRedirect(ctx.body.callbackURL)) throw new APIError("BAD_REQUEST", { code: "INVALID_CALLBACK", message: "Geçersiz dönüş adresi." });
        }
        if (ctx.path === "/update-user") {
          const { name, phone, ...rest } = ctx.body ?? {};
          if (Object.keys(rest).length || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100 || typeof phone !== "string" || (phone && (!/^[+\d\s()-]{10,20}$/.test(phone) || phone.replace(/\D/g, "").length < 10 || phone.replace(/\D/g, "").length > 15))) throw new APIError("BAD_REQUEST", { code: "VALIDATION_ERROR", message: "Hesap bilgilerini kontrol edin." });
        }
        if (["/sign-up/email", "/change-password", "/reset-password"].includes(ctx.path)) {
          const password = ctx.path === "/sign-up/email" ? ctx.body?.password : ctx.body?.newPassword;
          if (typeof password !== "string" || validateCredentials({ email: "validation@example.test", password }, true).password) throw new APIError("BAD_REQUEST", { code: "WEAK_PASSWORD", message: "Şifre kurallarını kontrol edin." });
        }
      }),
    },
    plugins: [magicLink({ disableSignUp: true, storeToken: "hashed", sendMagicLink: async ({ email, url }) => { await sendAuthEmail({ to: email, url, subject: "AFİNA giriş bağlantısı" }); } })],
    logger: { disabled: true },
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() { return instance ??= createAuth(); }
