"use client";

import { useState } from "react";
import { CalendarCheck2, Calendar, Info, Send } from "lucide-react";
import { CONTACTS } from "@/lib/trakometer/data";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/trakometer/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  message: Message;
  onClose: () => void;
  onSubmit: (body: string, opts: { sms: boolean; email: boolean; newDate: string }) => void;
}

export default function ServicePlusModal({ message: m, onClose, onSubmit }: Props) {
  const c = CONTACTS[m.contact];
  const a = m.appt;
  const [newDate, setNewDate] = useState("");
  const [phone, setPhone] = useState(c.phone);
  const [email, setEmailAddr] = useState(c.email);
  const [body, setBody] = useState("");
  const [sms, setSms] = useState(false);
  const [mail, setMail] = useState(true);
  const via = [mail && "email", sms && "SMS"].filter(Boolean) as string[];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <CalendarCheck2 className="size-4 text-teal-600 dark:text-teal-400" />
            Service Plus Reply
          </DialogTitle>
          <DialogDescription>
            {c.name} &middot; {c.dealer}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Requested date / time</Label>
            <div className="flex items-center gap-1.5 rounded-md border border-teal-300 bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
              <Calendar className="size-3.5" />
              {a ? `${a.reqDate} at ${a.reqTime}` : "—"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-date">Change date / time</Label>
            <Input id="new-date" type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cust-phone">Customer phone</Label>
            <Input id="cust-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cust-email">Customer email</Label>
            <Input id="cust-email" type="email" value={email} onChange={(e) => setEmailAddr(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Message from customer</Label>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
              &ldquo;{m.body}&rdquo;
              {a && <span className="text-muted-foreground"> &middot; {a.services.join(" / ")}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="msg-to-cust">Message to customer</Label>
            <Textarea
              id="msg-to-cust"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Confirm the time and anything the customer should know&hellip;"
            />
          </div>
          <div className="flex items-start gap-1.5 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground sm:col-span-2">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            This message will be delivered to the customer {via.length ? `via ${via.join(" and ")} and ` : ""}to their app.
          </div>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <div className="flex gap-1.5">
            <button
              onClick={() => setSms(!sms)}
              aria-pressed={sms}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                sms ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              Send SMS
            </button>
            <button
              onClick={() => setMail(!mail)}
              aria-pressed={mail}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                mail
                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "text-muted-foreground"
              )}
            >
              Send Email
            </button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="text-destructive hover:text-destructive">
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(body.trim(), { sms, email: mail, newDate })}
              className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              <Send className="size-3.5" />
              Send and update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
