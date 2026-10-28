// MOCK DATA — replace with real API calls once the backend is ready.
import type {
  ChannelId,
  Dealer,
  FeedItem,
} from "./types";

export const TILES: [string, number, number][] = [
  ["AK", 1, 1],
  ["ME", 1, 11],
  ["WI", 2, 6],
  ["VT", 2, 10],
  ["NH", 2, 11],
  ["WA", 3, 1],
  ["ID", 3, 2],
  ["MT", 3, 3],
  ["ND", 3, 4],
  ["MN", 3, 5],
  ["IL", 3, 6],
  ["MI", 3, 7],
  ["NY", 3, 9],
  ["MA", 3, 10],
  ["OR", 4, 1],
  ["NV", 4, 2],
  ["WY", 4, 3],
  ["SD", 4, 4],
  ["IA", 4, 5],
  ["IN", 4, 6],
  ["OH", 4, 7],
  ["PA", 4, 8],
  ["NJ", 4, 9],
  ["CT", 4, 10],
  ["RI", 4, 11],
  ["CA", 5, 1],
  ["UT", 5, 2],
  ["CO", 5, 3],
  ["NE", 5, 4],
  ["MO", 5, 5],
  ["KY", 5, 6],
  ["WV", 5, 7],
  ["VA", 5, 8],
  ["MD", 5, 9],
  ["DE", 5, 10],
  ["AZ", 6, 2],
  ["NM", 6, 3],
  ["KS", 6, 4],
  ["AR", 6, 5],
  ["TN", 6, 6],
  ["NC", 6, 7],
  ["SC", 6, 8],
  ["DC", 6, 9],
  ["OK", 7, 4],
  ["LA", 7, 5],
  ["MS", 7, 6],
  ["AL", 7, 7],
  ["GA", 7, 8],
  ["HI", 8, 1],
  ["TX", 8, 4],
  ["FL", 8, 9],
];

const d = (
  account: string,
  state: string,
  classic: number,
  com: number,
  exp: number,
  redeem: number,
  redeemDelta: string,
  m: number,
  c: number,
): Dealer => ({ account, state, classic, com, exp, redeem, redeemDelta, m, c });

export const DEALERS: Dealer[] = [
  d("AARON CDJR", "TX", 3, 0, 0, 0, "", 0, 0),
  d("ACURA OF BATON ROUGE", "LA", 12698, 0, 0, 115, "+9", 20, 0),
  d("ACURA OF CONCORD", "NC", 194, 0, 0, 0, "", 0, 0),
  d("ACURA OF LAFAYETTE", "LA", 1407, 0, 0, 0, "", 6, 0),
  d("AIRPORT CHRYSLER DODGE JEEP RAM", "FL", 48, 0, 0, 4, "+2", 0, 0),
  d("ALAN WEBB CHEVROLET", "WA", 10335, 0, 0, 0, "", 0, 0),
  d("ALAN WEBB MAZDA", "WA", 7229, 0, 0, 0, "", 0, 0),
  d("ALAN WEBB NISSAN", "WA", 10055, 0, 0, 0, "", 0, 0),
  d(
    "ALL STAR AUTOPLEX - CHEVROLET, BUICK GMC (TX)",
    "TX",
    119,
    0,
    0,
    16,
    "+12",
    0,
    0,
  ),
  d("ALL STAR CDJR OF MUSKOGEE (OK)", "OK", 24, 0, 0, 0, "", 0, 0),
  d("ALL STAR CHEVROLET", "LA", 22755, 0, 0, 41, "+4", 40, 0),
  d("CHAMPION CDJR", "AL", 3120, 0, 0, 12, "+1", 3, 0),
  d("MOSSY OF PICAYUNE", "MS", 5812, 0, 0, 38, "+3", 11, 2),
  d("NAVARRE CHEVROLET - CADILLAC - HYUNDAI", "LA", 8940, 0, 0, 27, "+5", 9, 1),
  d("SPITZER CDJR BROOK PARK", "OH", 6433, 0, 0, 19, "+6", 14, 0),
  d("SPITZER CDJR ST. MARYS", "OH", 2087, 0, 0, 7, "", 2, 0),
  d("SPITZER CHEVROLET NORTH CANTON", "OH", 4410, 0, 0, 22, "+2", 5, 0),
];

export const SUMMARY = [
  { label: "Classic", value: "+40,006", dir: "up" },
  { label: "Com", value: "-290", dir: "down" },
  { label: "Exp", value: "+28", dir: "up" },
  { label: "Redeem", value: "+1,283", dir: "up" },
  { label: "M", value: "4,880", dir: "" },
  { label: "C", value: "107", dir: "" },
] as const;

export const PROGRAMS = [
  "Maintenance",
  "Loyalty",
  "GPS",
  "GPS (App Only)",
] as const;

// Demo stream used by the overview until a real websocket/SSE feed is connected.
export const DEMO_INCOMING: Omit<FeedItem, "id" | "date" | "time">[] = [
  {
    dealer: "MOSSY OF PICAYUNE",
    text: "Customer message · Schedule Appointment",
    contract: "520391859",
    state: "MS",
    from: "Customer",
  },
  {
    dealer: "ALL STAR CDJR OF MUSKOGEE (OK)",
    text: "Contract Sold - Type:Classic",
    contract: "D1193061",
    state: "OK",
    from: "Admin",
  },
  {
    dealer: "SPITZER CHEVROLET NORTH CANTON",
    text: "Customer message from SKYLAR SUSSKEY",
    contract: "3198518257",
    state: "OH",
    from: "Customer",
  },
  {
    dealer: "ACURA OF BATON ROUGE",
    text: "Contract Redeemed - Type:Classic",
    contract: "2960521140",
    state: "LA",
    from: "Admin",
  },
  {
    dealer: "CHAMPION CDJR",
    text: "Customer check-in at dealership",
    contract: "2853376282",
    state: "AL",
    from: "Customer",
  },
  {
    dealer: "ALAN WEBB CHEVROLET",
    text: "Contract Sold - Type:Classic",
    contract: "AW0045519",
    state: "WA",
    from: "Admin",
  },
];

export const RECENT_USERS = [
  { key: "skylar", seen: "2m ago", device: "mobile" },
  { key: "jessica", seen: "14m ago", device: "desktop" },
  { key: "hunter", seen: "41m ago", device: "mobile" },
  { key: "william", seen: "1h ago", device: "desktop" },
  { key: "todd", seen: "3h ago", device: "mobile" },
] as const;

export const CANNED = [
  {
    title: "Received — will follow up",
    text: "Thank you for reaching out to us, we will get back to you with an answer.",
  },
  {
    title: "Appointment confirmed",
    text: "You’re all set! Your appointment is confirmed for the requested date and time. See you soon.",
  },
  {
    title: "Need more details",
    text: "Could you share your vehicle’s current mileage so we can recommend the right service?",
  },
];

export const CHANNELS: {
  id: ChannelId;
  label: string;
  count?: number;
  link: string;
}[] = [
  { id: "ngauge", label: "N-Gauge", link: "/nguage" },
  { id: "trade", label: "Value My Trade", link: "/trade" },
  { id: "service", label: "Service Plus", link: "/service" },

  { id: "anon", label: "Anonymous", count: 0, link: "/anon" },
  { id: "kanopi", label: "Kanopi", count: 66, link: "/kanopi" },
  { id: "notif", label: "Notifications", count: 3, link: "/notif" },
];

export const AGENT = { name: "AIZAH AWAIS", initials: "AA" };
