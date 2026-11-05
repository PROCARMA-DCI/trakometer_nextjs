export const showDateAndTime = (rawdate: string) => {
  const date = new Date(rawdate);

  // Format to MM-DD-YYYY HH:mm (local time)
  const formatted = date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 24-hour format
  });

  // Replace "/" with "-" for your format
  const final = formatted.replaceAll("/", "-");
  return final;
};

/** Unix timestamp in seconds (e.g. 1755778227) → showDateAndTime format. */
export const showDateAndTimeFromUnix = (seconds: number | string) =>
  showDateAndTime(new Date(Number(seconds) * 1000).toISOString());

/** "2026-11-02 09:00:00" → Date (local time; the T makes it parse the same everywhere). */
const parseLocal = (raw: string) => new Date(raw.replace(" ", "T"));

/** "Monday, Nov 02 2026 at 09:00 AM" */
export const showLongDateTime = (raw?: string | null) => {
  if (!raw) return "";
  const d = parseLocal(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const date = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date.replace(/, (\d{4})$/, " $1")} at ${time}`;
};

/** "11/01/2026 09:51 PM" */
export const showSlashDateTime = (raw?: string | null) => {
  if (!raw) return "";
  const d = parseLocal(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return `${d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
};
