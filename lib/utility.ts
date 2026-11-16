const formatDate = (date: Date) =>
  date
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replaceAll("/", "-");

// Unix timestamp (seconds) → Chicago time
export const showDateAndTime = (seconds: number | string) => {
  const date = new Date(Number(seconds) * 1000);

  return isNaN(date.getTime())
    ? ""
    : formatDate(
        new Date(
          date.toLocaleString("en-US", {
            timeZone: "America/Chicago",
          }),
        ),
      );
};

// Raw SQL datetime → format without timezone conversion
export const showDateAndTimeRaw = (rawdate: string) => {
  const date = new Date(rawdate.replace(" ", "T"));

  if (isNaN(date.getTime())) return "";

  return formatDate(date);
};

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
