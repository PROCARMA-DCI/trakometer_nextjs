export interface Contact {
  key: string;
  name: string;
  id: string; // contract / account number
  dealer: string;
  phone: string;
  email: string;
  initials: string;
  bg: string; // avatar background
  fg: string; // avatar text
}

/** Who wrote a chat message. */
export type Party = "cust" | "agent";

export interface Dealer {
  id?: string;
  account: string;
  state: string;
  classic: number;
  com: number;
  exp: number;
  redeem: number;
  redeemDelta: string;
  m: number;
  c: number;
}

export interface FeedItem {
  id: string;
  dealer: string;
  text: string;
  contract: string;
  date: string;
  time: string;
  state: string;
  from: "Admin" | "Customer";
}

export type RangeKey = "ITD" | "YTD" | "MTD" | "30";
export type ChannelId =
  | "ngauge"
  | "trade"
  | "service"
  | "anon"
  | "kanopi"
  | "notif";
export type AlertFilter = "star" | "new" | "flag" | null;
export type ThreadMode = "reply" | "full";

/** Raw plan row from `react/Trakometer/dashboardData` — the backend sends every number as a string. */
export interface DashboardPlan {
  ShowOnTrakometer: string;
  DealerTitle: string;
  DealerID: string;
  totalNotification: string;
  totalContract: string;
  totalMature: string;
  totalCancel: string;
  comp: string;
  express: string;
  Gps: string;
  LpSaleContract: string;
  LpServiceContract: string;
  LoyaltyCash: string;
  TotalGps: string;
  totalRedemtion: string;
  prev_data: string;
}

/** Row of `notifications` in the dashboard payload. */
export interface DashboardNotification {
  noti_id: string;
  noti_message: string;
  ContractID: string;
  /** "YYYY-MM-DD HH:mm:ss" */
  noti_date: string;
  noti_status: string;
  DealerID: string;
  noti_type: string;
}

/** Row of `mobileuser` (recent users) in the dashboard payload. */
export interface DashboardMobileUser {
  user_profile_name: string;
  device_type: string;
  CustomerImage: string | null;
  /** File name only for now; backend will send a full URL. */
  DealerLogo: string | null;
  DealerTitle: string;
  /** "YYYY-MM-DD HH:mm:ss" */
  date_added: string;
}

export interface DashboardStateNotification {
  StateCode: string;
  StateTitle: string;
  CountryCode: string;
}

export interface DashboardData {
  success: number;
  message: string;
  pcp_user_id: number;
  FixedDateParaMater: string;
  count: number;
  serviceplus: number;
  trakoCategory: { TrakoCategoryID: string; TrakoCategoryName: string }[];
  sum: {
    TotalClasic: number;
    TotalRedeem: number;
    TotalComp: number;
    TotalExp: number;
    TotalCancel: number;
    TotalMatured: number;
  };
  plans: DashboardPlan[];
  notifications: DashboardNotification[];
  mobileuser: DashboardMobileUser[];
  notificationsbystate: DashboardStateNotification[];
}

export interface ChatListIcon {
  device: "desktop" | "mobile";
  gps_connected: boolean;
  guest: boolean;
  read_status: "grey_circle" | "green_circle";
  service_video: boolean;
}
export interface ChatListData {
  threadid: string;
  message_id: string;
  User1Image: string;
  user1Name: string;
  User2Name: string;
  message: string;
  ContractNo: string;
  /** "YYYY-MM-DD HH:mm:ss" */
  timestamp: string;
  user1read: string;
  user2read: string;
  device_type: string;
  notification_date: string;
  icons: ChatListIcon;
  IsGuest: "0" | "1";
}
export interface Pagination {
  limit: number;
  offset: number;
}

export interface ChatMessage {
  message_id: string;
  threadid: string;
  user1: string;
  user2: string;
  user1Name: string;
  User2Name: string;
  User1Image: string;
  User2Image: string;
  message: string;
  /** "YYYY-MM-DD HH:mm:ss" */
  timestamp: string;
  title: string;
  upload_img: string;
  device_type: "desktop" | "mobile";
  IsGuest: 0 | 1;
}

export interface ReplyLoadThreadMessage {
  success: boolean;
  message: string;
  data: {
    threadid: string;
    message_id: string;
    contract_id: string;
    messages: ChatMessage[];
  };
}
