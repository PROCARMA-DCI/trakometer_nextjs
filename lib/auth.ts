export const SESSION_COOKIE = "tk_session";
export const SESSION_VALUE = "authenticated";

export const DEMO_USERNAME = process.env.DEMO_USERNAME ?? "test";
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "123";

export function verifyCredentials(username: string, password: string): boolean {
  return username === DEMO_USERNAME && password === DEMO_PASSWORD;
}
