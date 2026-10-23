export const ACCESS_TOKEN_COOKIE = "access_token";

// The portal can run inside an iframe on another site, so in production the
// cookie is third-party: it needs SameSite=None + Secure to be sent at all.
const isProd = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
  path: "/",
  maxAge: 60 * 60 * 8,
};
