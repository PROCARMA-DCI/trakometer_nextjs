"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatMessage } from "@/lib/trakometer/types";
import { ChevronDown, MessageSquareText, Star } from "lucide-react";

interface Props {
  /** Sources of `google_feedback` / `canned_messages`; the first non-empty list wins. */
  sources: (
    | Pick<ChatMessage, "google_feedback" | "canned_messages">
    | undefined
  )[];
  /** Append text (a feedback link or canned message) to the reply draft. */
  onInsert: (text: string) => void;
  /** Request-Google-Rating action (sends the app rating request). */
  onRate?: () => void;
  /** Current draft; items already in it are disabled so they can't be added twice. */
  draft?: string;
}

/** "Request Google Rating" and "Canned Message" dropdowns for reply forms. */
export default function ReplyTemplates({
  sources,
  onInsert,
  onRate,
  draft = "",
}: Props) {
  const added = (text: string) => !!text && draft.includes(text);
  const feedback =
    sources.find((s) => s?.google_feedback?.length)?.google_feedback ?? [];
  const canned =
    sources.find((s) => s?.canned_messages?.length)?.canned_messages ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!feedback.length}
            >
              <Star className="size-3.5 text-amber-500" />
              Request Google Rating
              <ChevronDown className="size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-64">
          {feedback.map((f) => (
            <DropdownMenuItem
              key={f.BitlyURL}
              disabled={added(f.BitlyURL)}
              onClick={() => onInsert(f.BitlyURL)}
              className="font-medium uppercase text-sky-600"
            >
              {f.Name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {onRate && (
        <Button type="button" variant="outline" size="sm" onClick={onRate}>
          <Star className="size-3.5 text-amber-500" />
          App Rating
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canned.length}
            >
              <MessageSquareText className="size-3.5 text-sky-500" />
              Canned Message
              <ChevronDown className="size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent
          align="start"
          className="max-h-64 w-80 overflow-y-auto"
        >
          {canned.map((c) => (
            <DropdownMenuItem
              key={c.CannedMessage}
              disabled={added(c.CannedMessage)}
              onClick={() => onInsert(c.CannedMessage)}
              className="items-start whitespace-normal text-sky-700"
            >
              {c.CannedMessage}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Append `text` to a draft on a new line (or as-is when the draft is empty). */
export const appendToDraft = (draft: string, text: string) =>
  draft.trim() ? `${draft.replace(/\s+$/, "")}\n${text}` : text;
