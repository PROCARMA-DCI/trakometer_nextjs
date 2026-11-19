"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteServiceReply } from "@/lib/trakometer/chat-api";
import type { ServicePlanList } from "@/lib/trakometer/types";
import { useState } from "react";
import { toast } from "sonner";

/** Yes/No confirmation for declining (deleting) a service request. */
export function ServiceDeleteDialog({
  row,
  onClose,
  onDeleted,
}: {
  /** The service plan to delete; `null` = closed. */
  row: ServicePlanList | null;
  onClose: () => void;
  /** Called after the delete succeeded, so the list can reload. */
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!row) return;
    setBusy(true);
    const res = await deleteServiceReply(row.ScheduleServiceID, row.thread_id);
    setBusy(false);
    if (!res.ok) {
      return toast.error(res.error ?? "Could not delete the request.");
    }
    toast.success("Request deleted.");
    onDeleted();
    onClose();
  };

  return (
    <AlertDialog
      open={!!row}
      onOpenChange={(open) => !open && !busy && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this request?</AlertDialogTitle>
          <AlertDialogDescription>
            {row?.CustomerName
              ? `Service request from ${row.CustomerName}`
              : " "}
            <br />
            Are you sure you want to cancel Appointment?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            No
          </Button>
          <Button variant="destructive" disabled={busy} onClick={confirm}>
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
