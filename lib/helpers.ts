/** Read "a.b.c" from an object; undefined when any step is missing. */
export const getNestedProperty = (
  obj: Record<string, unknown> | null | undefined,
  path: string,
): unknown =>
  path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

/** True when the object has at least one defined value. */
export const hasObjectValues = (obj: object | null | undefined) =>
  !!obj && Object.values(obj).some((v) => v !== undefined && v !== null);

export const utility = {
  formatDate(value: string | Date): string {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  },
  currencyFormatter(value: number, currency = "USD", format = "en-US"): string {
    if (typeof value !== "number" || Number.isNaN(value)) return String(value);
    return new Intl.NumberFormat(format, { style: "currency", currency }).format(
      value,
    );
  },
};

/**
 * Best-effort decode of the host app's `?id=` token. Handles a JWT (payload = 2nd part)
 * or a plain base64(url) JSON string; returns null if it is neither (e.g. an opaque token).
 */
export function decodeToken(token: string): unknown {
  const b64 = (s: string) => {
    const std = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(std + "=".repeat((4 - (std.length % 4)) % 4));
    return decodeURIComponent(
      Array.from(bin, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
    );
  };
  const parts = token.split(".");
  for (const candidate of [parts.length === 3 ? parts[1] : "", token]) {
    if (!candidate) continue;
    try {
      return JSON.parse(b64(candidate));
    } catch {
      /* try the next shape */
    }
  }
  return null;
}
