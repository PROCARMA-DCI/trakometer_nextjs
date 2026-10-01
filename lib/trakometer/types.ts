export type Party = 'cust' | 'agent';

export interface Contact {
  key: string;
  name: string;
  id: string;          // contract / account number
  dealer: string;
  phone: string;
  email: string;
  initials: string;
  bg: string;          // avatar background
  fg: string;          // avatar text
}

export interface Appointment {
  reqDate: string;
  reqTime: string;
  services: string[];
}

export interface Message {
  id: string;
  contact: string;     // Contact.key
  from: Party;
  date: string;
  time: string;
  body: string;
  topic?: string;      // e.g. "GPS"
  appt?: Appointment;
  tel?: string;
  service?: string;
  replyOf?: string;    // root message id when a reply is added from a thread
}

export interface ChatRow {
  n: number;
  msg: string;         // Message.id
  date: string;
  time: string;
  device: 'mobile' | 'desktop';
  g?: boolean;         // Google-sourced
  pin?: boolean;       // location check-in
  unread?: boolean;
  appt?: boolean;
}

export interface Dealer {
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
  from: 'Admin' | 'Customer';
}

export type RangeKey = 'ITD' | 'YTD' | 'MTD' | '30 DAY';
export type ChannelId = 'ngauge' | 'trade' | 'service' | 'dash' | 'anon' | 'kanopi' | 'notif';
export type AlertFilter = 'star' | 'new' | 'flag' | null;
export type ThreadMode = 'reply' | 'full';
