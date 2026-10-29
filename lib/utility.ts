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
