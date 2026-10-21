<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes (trakometer-chat)

Next.js + Tailwind v4 + shadcn/ui + lucide-react. Portal pages in `app/(portal)/`, chat UI in `components/trakometer/chat/`, data/types/utils in `lib/trakometer/`. Check types with `npx tsc --noEmit`.

## Conventions

- **Buttons must show a pointer cursor.** Tailwind v4 defaults buttons to `cursor: default`, so `app/globals.css` (`@layer base`) sets `cursor: pointer` on `button:not(:disabled)` and `[role="button"]:not([aria-disabled="true"])`. Don't remove it.
- Most of `components/`, `lib/`, `app/(portal)/` is **untracked in git** (only the initial commit exists). Deleting a file there is not recoverable from git. Commit early or avoid deleting. (Once recovered a deleted file from `.next/dev/static/chunks/*.map`: `sections[].map.sourcesContent`.)

## API calls & loader (use these reusable helpers — don't hand-roll fetch/spinners)

Flow: **client component → `fetching()` → same-origin `/api/<resource>/...` → catch-all proxy `app/api/[...slug]/route.ts` → backend**. The browser never talks to the backend directly and never holds the token.

- **Client calls: always use `fetching()`** from `lib/api/client.ts`. Never write raw `fetch` + `res.json()` + manual loading state in components.
  - `fetching({ url: "/api/category", method, body })`. `method` defaults to **POST**; pass `"GET"` explicitly for reads.
  - GET/HEAD: `body` is turned into a query string (undefined/null/"" skipped). Other methods: `body` is sent as JSON, or as multipart with `isFormdata: true` (FastAPI `Form(...)` endpoints and file uploads). Don't build `FormData` by hand; use `objectToFormData` / `formDataToObject` if you need the conversion.
  - Result is `ApiResult<T>` = `T & { ok: boolean; status: number }`. The backend body is spread onto it, so read `res.data`, `res.total`, etc. directly. Check `res.ok` before using the data. Network failure returns `{ ok: false, status: 0 }` and never throws.
  - **Typing:** `T` is optional. Unknown response shape → `fetching({...})` (fields are `any`). Known shape → `fetching<{ data: User[] }>({...})`.
- **Loader is automatic.** `fetching()` shows the global full-screen loader by default (via the hook-free `setGlobalLoading` singleton in `providers/LoaderContext.tsx`). It is counter-based, so overlapping calls don't hide it early. Options per call:
  - `badgeLoading: "models"` → small named "Loading models…" badge instead of the full-screen spinner
  - `setLoading` → component-local spinner (e.g. from `useLoader()`); overrides the global loader and badge
  - `showLoader: false` → no loader (silent polling/background refresh)
- **Loader outside `fetching`:** `useLoader()` (`show`/`hide`/`setLoading`/`badgeLoading`/`isBadgeLoading`) in components, or `setGlobalLoading` / `setBadgeLoading` from plain functions. `LoaderProvider` must be mounted. These are client-only; calling them on the server is a no-op.
- **Server side** (Route Handlers, Server Components, server actions) use `lib/api/server.ts`: `backendFetch(path, init, baseUrl?)` and `authorizedFetch(path, token, init, baseUrl?)`. They throw `ApiError(status, message)` on non-2xx. Get the token with `getAccessToken()` from `providers/auth/session.ts` (httpOnly cookie, **server-only**, since it imports `next/headers`).
- **Proxy `app/api/[...slug]/route.ts`:** first slug segment is the backend resource, so `/api/category/5?x=1` → `<BASE_URL>/category/5?x=1`. It attaches `Authorization: <token>` and forwards the raw body and content-type. A resource served by a different backend goes in `RESOURCE_BACKENDS`. Add a dedicated route file under `app/api/<name>/` only when you need custom server logic; otherwise rely on the catch-all.
- Backend base URL comes from `config.ts` (`BASE_URL`). Don't hard-code backend URLs in components.

## Chat screen design (current state)

Files: `chat-screen.tsx` (state owner), `conversation-list.tsx`, `thread-panel.tsx`, `composer.tsx`, `message-bubble.tsx`, `appointment-card.tsx`, `quick-reply-modal.tsx`, `service-plus-modal.tsx`, `channel-bar.tsx`.

- **WhatsApp/Messenger-style layout, responsive.** At `md` and up, list and thread sit side by side. Below `md`, only one shows at a time:
  - list is `hidden` when `selected !== null`
  - thread shows full screen with a back arrow (`onBack` sets `selected` to null)
  - `ChannelBar` is hidden on mobile while a chat is open
  - initial `selected` is `null`, so the desktop right pane shows an empty-state hint
- **Composer (message-bar style) is shown only while replying** (`replyMsg` set via a message's Reply/Edit button). Row-card click and Eye click open the thread with **no composer footer** and the scroll stays at the **top** (reset on row/mode change). Enter sends, Shift+Enter adds a newline. After sending, `replyMsg` clears and the composer hides.
- **Row actions** (kept deliberately, user asked to revert to the original behavior):
  - Reply icon opens `QuickReplyModal`, which has an "Open thread" button
  - Eye icon calls `onOpen(n, "full")` and opens full history
  - Row click calls `onOpen(n, "reply")`, which shows only that thread (`m.id === root.id || m.replyOf === root.id`) with `replyMsg = null`
  - Confirm and decline buttons show on appointment rows
- `ThreadPanel` header has the "This thread / Full history" toggle (`mode`, `onMode`).
- `onSend` uses `replyOf = replyMsg ?? undefined`.

## Status / next steps

- Everything type-checks. Not yet visually tested in a browser (mobile width especially).
- The user said they might want the old **inline reply box under each message** back (instead of only the bottom composer). Ask before changing.
- `ThreadMode` type (`'reply' | 'full'`) lives in `lib/trakometer/types.ts`.
