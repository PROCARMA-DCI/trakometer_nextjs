// MOCK DATA — replace with real API calls once the backend is ready.
import type { Contact, Message, ChatRow, Dealer, FeedItem, ChannelId } from "./types";

export const TILES: [string, number, number][] = [
  ["AK", 1, 1], ["ME", 1, 11], ["WI", 2, 6], ["VT", 2, 10], ["NH", 2, 11], ["WA", 3, 1], ["ID", 3, 2], ["MT", 3, 3], ["ND", 3, 4], ["MN", 3, 5], ["IL", 3, 6], ["MI", 3, 7], ["NY", 3, 9], ["MA", 3, 10],
  ["OR", 4, 1], ["NV", 4, 2], ["WY", 4, 3], ["SD", 4, 4], ["IA", 4, 5], ["IN", 4, 6], ["OH", 4, 7], ["PA", 4, 8], ["NJ", 4, 9], ["CT", 4, 10], ["RI", 4, 11],
  ["CA", 5, 1], ["UT", 5, 2], ["CO", 5, 3], ["NE", 5, 4], ["MO", 5, 5], ["KY", 5, 6], ["WV", 5, 7], ["VA", 5, 8], ["MD", 5, 9], ["DE", 5, 10],
  ["AZ", 6, 2], ["NM", 6, 3], ["KS", 6, 4], ["AR", 6, 5], ["TN", 6, 6], ["NC", 6, 7], ["SC", 6, 8], ["DC", 6, 9],
  ["OK", 7, 4], ["LA", 7, 5], ["MS", 7, 6], ["AL", 7, 7], ["GA", 7, 8], ["HI", 8, 1], ["TX", 8, 4], ["FL", 8, 9],
];

export const ACTIVE_STATES = ["WA", "CA", "NV", "AZ", "CO", "TX", "OK", "LA", "MS", "AL", "GA", "FL", "TN", "KY", "WI", "OH", "PA", "NY", "VA", "NC", "WV", "NJ", "VT", "DE"];

const d = (account: string, state: string, classic: number, com: number, exp: number, redeem: number, redeemDelta: string, m: number, c: number): Dealer =>
  ({ account, state, classic, com, exp, redeem, redeemDelta, m, c });

export const DEALERS: Dealer[] = [
  d("AARON CDJR", "TX", 3, 0, 0, 0, "", 0, 0),
  d("ACURA OF BATON ROUGE", "LA", 12698, 0, 0, 115, "+9", 20, 0),
  d("ACURA OF CONCORD", "NC", 194, 0, 0, 0, "", 0, 0),
  d("ACURA OF LAFAYETTE", "LA", 1407, 0, 0, 0, "", 6, 0),
  d("AIRPORT CHRYSLER DODGE JEEP RAM", "FL", 48, 0, 0, 4, "+2", 0, 0),
  d("ALAN WEBB CHEVROLET", "WA", 10335, 0, 0, 0, "", 0, 0),
  d("ALAN WEBB MAZDA", "WA", 7229, 0, 0, 0, "", 0, 0),
  d("ALAN WEBB NISSAN", "WA", 10055, 0, 0, 0, "", 0, 0),
  d("ALL STAR AUTOPLEX - CHEVROLET, BUICK GMC (TX)", "TX", 119, 0, 0, 16, "+12", 0, 0),
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

export const PROGRAMS = ["Maintenance", "Loyalty", "GPS", "GPS (App Only)"] as const;

export const CONTACTS: Record<string, Contact> = {
  hunter: { key: "hunter", name: "HUNTER MANLEY", id: "520391859", dealer: "MOSSY OF PICAYUNE", phone: "571-814-0761", email: "manleyhunter@yahoo.com", initials: "HM", bg: "#DDF4EE", fg: "#0B6E5E" },
  todd: { key: "todd", name: "TODD COPELAND", id: "3406507575", dealer: "SPITZER CDJR BROOK PARK", phone: "216-555-0148", email: "tcopeland@gmail.com", initials: "TC", bg: "#E8E6FB", fg: "#4B3FB0" },
  jessica: { key: "jessica", name: "Jessica Detsch", id: "T00043726", dealer: "SPITZER CDJR ST. MARYS", phone: "419-555-0192", email: "jdetsch@outlook.com", initials: "JD", bg: "#FCE7EF", fg: "#A2285A" },
  william: { key: "william", name: "WILLIAM HOWARD III", id: "2853376282", dealer: "CHAMPION CDJR", phone: "334-555-0117", email: "whoward3@yahoo.com", initials: "WH", bg: "#FFF1DA", fg: "#8A5300" },
  skylar: { key: "skylar", name: "SKYLAR SUSSKEY", id: "3198518257", dealer: "SPITZER CHEVROLET NORTH CANTON", phone: "330-440-1461", email: "skylar.s@gmail.com", initials: "SS", bg: "#E1EEFA", fg: "#0D4F86" },
};

const MOSSY_TEL = "(601)-273-4183";
const MOSSY_SVC = "(601) 273-4183";

export const MESSAGES: Message[] = [
  { id: "h1", contact: "hunter", from: "cust", date: "Sep 24 2026", time: "04:35 PM", body: "Need an oil change", appt: { reqDate: "Friday, Sep 25 2026", reqTime: "01:00 PM", services: ["Oil change & filter change", "Tire rotation"] } },
  { id: "h2", contact: "hunter", from: "agent", date: "Sep 24 2026", time: "04:35 PM", body: "HI Hunter!\n\nThank you for reaching out to us, we will get back to you with an answer.", tel: MOSSY_TEL, service: MOSSY_SVC },
  { id: "h3", contact: "hunter", from: "agent", date: "Sep 24 2026", time: "04:40 PM", body: "Hunter!\n\nI have spoken with Courtney in our service department and have scheduled you for your desired time and services on Friday, September 25, at 1:00 PM. Please let us know if we can further assist through this chat. Have a great day!", tel: MOSSY_TEL, service: MOSSY_SVC },
  { id: "j1", contact: "jessica", from: "cust", date: "Sep 24 2026", time: "05:20 PM", body: "Can I use my plan for a tire rotation this week?" },
  { id: "j2", contact: "jessica", from: "agent", date: "Sep 24 2026", time: "05:21 PM", body: "Hi Jessica! Yes, a tire rotation is included in your plan." },
  { id: "j3", contact: "jessica", from: "agent", date: "Sep 24 2026", time: "05:25 PM", body: "I’ve passed your request to the service team. They’ll contact you with open times." },
  { id: "t1", contact: "todd", from: "agent", date: "Sep 24 2026", time: "04:42 PM", body: "Hi Todd, thanks for your message. I’m checking your contract details now." },
  { id: "t2", contact: "todd", from: "agent", date: "Sep 24 2026", time: "04:49 PM", body: "Your maintenance plan is active and covers your next two services." },
  { id: "t3", contact: "todd", from: "agent", date: "Sep 24 2026", time: "06:09 PM", body: "Following up: let us know if you’d like us to book the next visit for you." },
  { id: "w1", contact: "william", from: "agent", date: "Sep 24 2026", time: "03:52 PM", body: "Hi William, we received your location check-in. How can we help today?" },
  { id: "w2", contact: "william", from: "cust", date: "Sep 24 2026", time: "03:54 PM", body: "I’m at the dealership now for my appointment." },
  { id: "w3", contact: "william", from: "agent", date: "Sep 24 2026", time: "03:55 PM", body: "Great, the service desk has been notified you’ve arrived." },
  { id: "s1", contact: "skylar", from: "cust", topic: "GPS", date: "Sep 25 2026", time: "12:17 AM", body: "The GPS feature is not working. It worked for about a day and is now off." },
];

export const CHAT_ROWS: ChatRow[] = [
  { n: 1, msg: "s1", date: "09/25/2026", time: "12:17 AM", device: "mobile", unread: true },
  { n: 2, msg: "t3", date: "09/24/2026", time: "06:09 PM", device: "desktop" },
  { n: 3, msg: "j3", date: "09/24/2026", time: "05:25 PM", device: "desktop", g: true },
  { n: 4, msg: "j2", date: "09/24/2026", time: "05:21 PM", device: "desktop", g: true },
  { n: 5, msg: "j1", date: "09/24/2026", time: "05:20 PM", device: "mobile", g: true, unread: true },
  { n: 6, msg: "t2", date: "09/24/2026", time: "04:49 PM", device: "desktop" },
  { n: 7, msg: "t1", date: "09/24/2026", time: "04:42 PM", device: "desktop" },
  { n: 8, msg: "h3", date: "09/24/2026", time: "04:40 PM", device: "desktop" },
  { n: 9, msg: "h2", date: "09/24/2026", time: "04:35 PM", device: "desktop" },
  { n: 10, msg: "h1", date: "09/24/2026", time: "04:35 PM", device: "mobile", appt: true },
  { n: 11, msg: "w3", date: "09/24/2026", time: "03:55 PM", device: "desktop", pin: true },
  { n: 12, msg: "w2", date: "09/24/2026", time: "03:54 PM", device: "mobile", pin: true },
  { n: 13, msg: "w1", date: "09/24/2026", time: "03:52 PM", device: "desktop", pin: true },
];

export const INITIAL_FEED: FeedItem[] = [
  { id: "f1", dealer: "NAVARRE CHEVROLET - CADILLAC - HYUNDAI", text: "Contract Sold - Type:Classic", contract: "2960520833", date: "09-22-2026", time: "03:28 PM", state: "LA", from: "Admin" },
  { id: "f2", dealer: "SPITZER CDJR BROOK PARK", text: "Contract Sold - Type:Classic", contract: "D1193039", date: "09-22-2026", time: "03:28 PM", state: "OH", from: "Admin" },
  { id: "f3", dealer: "SPITZER CDJR BROOK PARK", text: "Contract Sold - Type:Classic", contract: "D1193040", date: "09-22-2026", time: "03:29 PM", state: "OH", from: "Admin" },
  { id: "f4", dealer: "SPITZER CDJR BROOK PARK", text: "Contract Sold - Type:Classic", contract: "D1193041", date: "09-22-2026", time: "03:29 PM", state: "OH", from: "Admin" },
  { id: "f5", dealer: "SPITZER CDJR BROOK PARK", text: "Contract Sold - Type:Classic", contract: "D1193042", date: "09-22-2026", time: "03:29 PM", state: "OH", from: "Admin" },
  { id: "f6", dealer: "SPITZER CDJR BROOK PARK", text: "Contract Sold - Type:Classic", contract: "D1193053", date: "09-22-2026", time: "03:30 PM", state: "OH", from: "Admin" },
];

// Demo stream used by the overview until a real websocket/SSE feed is connected.
export const DEMO_INCOMING: Omit<FeedItem, "id" | "date" | "time">[] = [
  { dealer: "MOSSY OF PICAYUNE", text: "Customer message · Schedule Appointment", contract: "520391859", state: "MS", from: "Customer" },
  { dealer: "ALL STAR CDJR OF MUSKOGEE (OK)", text: "Contract Sold - Type:Classic", contract: "D1193061", state: "OK", from: "Admin" },
  { dealer: "SPITZER CHEVROLET NORTH CANTON", text: "Customer message from SKYLAR SUSSKEY", contract: "3198518257", state: "OH", from: "Customer" },
  { dealer: "ACURA OF BATON ROUGE", text: "Contract Redeemed - Type:Classic", contract: "2960521140", state: "LA", from: "Admin" },
  { dealer: "CHAMPION CDJR", text: "Customer check-in at dealership", contract: "2853376282", state: "AL", from: "Customer" },
  { dealer: "ALAN WEBB CHEVROLET", text: "Contract Sold - Type:Classic", contract: "AW0045519", state: "WA", from: "Admin" },
];

export const RECENT_USERS = [
  { key: "skylar", seen: "2m ago", device: "mobile" },
  { key: "jessica", seen: "14m ago", device: "desktop" },
  { key: "hunter", seen: "41m ago", device: "mobile" },
  { key: "william", seen: "1h ago", device: "desktop" },
  { key: "todd", seen: "3h ago", device: "mobile" },
] as const;

export const CANNED = [
  { title: "Received — will follow up", text: "Thank you for reaching out to us, we will get back to you with an answer." },
  { title: "Appointment confirmed", text: "You’re all set! Your appointment is confirmed for the requested date and time. See you soon." },
  { title: "Need more details", text: "Could you share your vehicle’s current mileage so we can recommend the right service?" },
];

export const CHANNELS: { id: ChannelId; label: string; count?: number }[] = [
  { id: "ngauge", label: "N-Gauge" },
  { id: "trade", label: "Value My Trade" },
  { id: "service", label: "Service Plus" },
  { id: "dash", label: "Dashboard" },
  { id: "anon", label: "Anonymous", count: 0 },
  { id: "kanopi", label: "Kanopi", count: 66 },
  { id: "notif", label: "Notifications", count: 3 },
];

export const AGENT = { name: "AIZAH AWAIS", initials: "AA" };
