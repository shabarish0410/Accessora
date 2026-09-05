# Accessora — Visitor Access & Approval App
### Build prompt for AI coding tools (Claude Code, Cursor, ChatGPT, bolt.new, v0, Replit AI, etc.)

I want to build **Accessora**, a mobile app that lets a security guard check in visitors, sends the request to a chairman/admin for real-time approval, and lets the guard manage entry and exit — all designed to be usable by people with low literacy through icons, color, and voice instead of text.

This is the complete specification. Read the whole thing before writing any code. If you're an agentic tool that can ask clarifying questions, confirm the tech stack and build order with me before scaffolding. If you're a tool that just generates code from a single prompt, build in the order listed at the bottom, one phase at a time, rather than trying to generate everything at once.

## Tech stack
Use **React Native (Expo)** for the mobile app and **Firebase** (Auth, Firestore, Cloud Functions, Cloud Messaging) for the backend, unless you recommend a better fit for a fast-to-build, real-time mobile app with push notifications. Ask me before locking in a stack if you think something else suits this better.

## User roles
1. **Security Guard** — checks visitors in and out
2. **Chairman / Admin** — approves, rejects, or delays visitors
3. **PA / Backup Approver** (optional secondary role) — receives escalated requests if the chairman doesn't respond in time

## Login and role separation
The Guard app and the Chairman app are **two completely separate experiences** built from the same codebase (or two apps, if that's simpler for you to scaffold), not two tabs inside one shared app.

- **Login screen** (first thing anyone sees): asks the person to sign in, then routes them based on their assigned role in the database — a guard account only ever sees the Guard Home/History/Settings; a chairman/PA account only ever sees the Chairman Waiting Queue/History/Settings. Don't show a manual "choose your role" selector after login — the role should already be attached to the account, so there's nothing to accidentally pick wrong.
- Auth can be phone number + OTP (fits guards who may not want to manage a password) or email + password for the chairman/PA — use whichever Firebase Auth method is simplest to implement first, and we can revisit.
- Each gate's guard account should be linked to exactly one chairman account (or more, if there's ever more than one approver on the org chart) so requests route to the right person.

## Core data model
- **Visitor Record**: id, temporary_id (4-digit, resets daily), photo_url, name (text + optional voice_clip_url), purpose (enum: VIP, Admissions, Delivery, Others), mobile_number, origin (place/organization, optional), status (pending, accepted, waiting, rejected), decided_by (chairman/PA), arrival_time, departure_time, gate_id
- **Guard**: id, name, photo_url, gate_id, shift info
- **Chairman/Admin**: id, name, photo_url, backup_approver_id, settings (response_timer_minutes, live_call_enabled, notifications_enabled)

## Guard app — screens
**Bottom navigation: Home | History | Settings**

### Home
- Greeting header (guard name, gate, shift) + live count of visitors currently inside
- Big primary button: **"Add New Visitor"** → opens check-in form
- Big secondary button: **"Visitor Leaving"** → opens list of currently-inside visitors with a one-tap "Exit" button per person, which records departure_time
- Small list: "Inside right now" preview

### Add New Visitor (check-in form)
Four fields only, in this order:
1. **Capture photo** — camera, one tap
2. **Speak name** — voice-to-text, then show the transcribed text back to the guard with a "replay" button and a retry option before confirming (voice-to-text on names is failure-prone, always confirm before submit)
3. **Tap purpose icon** — four large icon buttons: VIP (crown), Admissions (cap), Delivery (box), Others (question mark) — icon-first, minimal text
4. **Enter mobile number** — numeric keypad only, validate 10 digits
- On submit: generate a random unique 4-digit temporary_id for the day, save the record as `pending`, and send it to the chairman

### Check Visitor ID
- Numeric keypad (4 digits) to look up any visitor's current status by their temporary_id — for a different guard/checkpoint who wasn't there for check-in
- Shows photo, name, purpose, and current status (approved/rejected/waiting/not found)

### History
- Grouped by day, filterable (Today / This week / All), searchable by name or number
- Each entry: photo thumbnail with a status-colored badge, name, purpose tag, arrival → departure time, duration
- Tapping an entry opens a detail view: photo, purpose, "where they're from," mobile number, who decided (chairman or PA), and a simple arrival→departure timeline

### Settings
- Guard's own profile card (photo, name, gate)
- Notification sound / vibration toggles
- Language selector
- Linked chairman account (read-only display)
- Help & about, log out

## Chairman app — screens

### Waiting Queue (replaces a single pop-up when multiple visitors are pending)
- Header shows a live count: "N visitors waiting"
- List sorted by **priority**, using this logic:
  - Base category weight: VIP=1, Admissions=2, Delivery=3, Others=4 (lower = seen sooner)
  - **Aging formula** to prevent starvation: `effective_priority = category_weight − (minutes_waited ÷ 10)`. Recalculate on every render or via a periodic backend job, so a long-waiting low-priority visitor eventually surfaces near the top even if VIPs keep arriving.
  - Sort ascending by effective_priority; tie-break by earliest arrival_time
- Each row: rank, photo, name, purpose badge (color-coded), arrival time, "waited X min" badge (color escalates from green → amber → red the longer they wait), and inline Accept/Reject buttons
- Only the **top-ranked** pending visitor triggers a loud alert (push notification / optional live call); everyone else waits quietly in the list — don't spam multiple simultaneous alerts
- **Once a visitor is Accepted, their row doesn't disappear from view** — it updates in place to show a green "Inside" status badge next to an **Exit** button, so a decision-maker or guard looking at that same card can mark them as departed without hunting for a separate screen. This same "status badge + Exit button" pairing should appear anywhere a single accepted visitor is shown in detail (see Visitor Detail below) and in the guard's "Inside right now" list on Home.

### Notification behavior (per visitor request)
1. Send a rich push notification with the visitor's photo, name, purpose, and three inline actions: Accept / Wait / Reject — actionable directly from the lock screen where the OS supports it
2. If `live_call_enabled` is on, optionally ring a full-screen "incoming call" style UI instead of a static notification
3. If no response after 30 seconds, send a reminder push
4. If no response after `response_timer_minutes` (default 5, configurable in settings), escalate: mark the request visible to the backup approver (PA) with the same options
5. Cancel all pending reminders/escalation the moment a decision is recorded

### Visitor Detail (tap into a single request from the queue)
- Full photo, name (tap to hear voice clip), purpose, "where they're from," tap-to-call mobile number
- **While status is `pending`**: three big color-coded decision buttons — Accept (green check), Wait (amber clock), Reject (red cross). Optional fourth: Redirect (send to another staff member).
- **Once status is `accepted`**: replace the decision buttons with a status badge ("Inside since [arrival_time]") plus a single **Exit** button. Tapping Exit records `departure_time` on the same visitor record and flips the status to `completed`. This lets whoever is looking at this profile — guard or chairman — close out the visit from the exact same screen, instead of only being able to do it from a separate exit list.

### History
Same structure as the guard's History screen — the chairman should see the same visit log with photo, arrival/departure, purpose, and who decided.

### Settings
- Alerts: push notifications toggle, no-response timer (editable), live video call toggle
- People: backup approver / PA contact, linked security desk accounts
- Visit purposes: manage/edit the four purpose categories and their icons
- App: voice & language, app PIN lock, help & about

## On Accept — entry pass to the visitor
- Generate a pass (not a QR code — decided against it since there's no scanner/hardware in scope): visitor photo, name, purpose, "Approved by [Chairman name]" with timestamp, temporary_id, gate name
- Send an SMS to the visitor's mobile_number with a link to a simple, lightweight webpage showing this pass (no app install or PDF download required for the visitor)
- The pass page should clearly state: "Show this screen to security" and "This pass is single-use and tied to today's visit only"
- The guard's own app is the actual source of truth for letting someone in (a "Let Visitor In" button) — the visitor's pass is proof/receipt, not the access key itself

## Global rule: Exit button on every visitor profile card
This is not limited to one or two screens — build it as a **single reusable "Visitor Card" component** with a status-aware footer, and use that same component everywhere a visitor's profile appears:

- **Right after check-in, once Accepted** — when the guard submits a new visitor and the chairman accepts them, the confirmation screen the guard lands on (the same screen shown earlier as the "Entry pass ready" state) must show the Exit button immediately, next to the "Accepted / Inside" status. The guard should never have to navigate away to find it — if they're checking someone in and it turns out to be a quick in-and-out visit, they can mark the exit within seconds of entry, from the exact same screen.
- **Home screen "Inside right now" list** — Exit button on each row
- **Visitor Leaving screen** — Exit button on each row (this screen just filters the list to only show accepted/inside visitors)
- **Waiting Queue** (chairman) — once a row flips to Accepted, Exit button replaces the Accept/Reject buttons on that row
- **Visitor Detail** (either role) — Exit button replaces the decision buttons once status is Accepted
- **Check Visitor ID lookup result** — if the looked-up visitor is currently Accepted/Inside, show the Exit button in the result card too

Rule of thumb: **any time status = accepted, the Exit button is visible wherever that visitor's card is rendered — no exceptions, no separate screen required to find it.** Tapping Exit from any of these locations does the same thing: records `departure_time`, flips status to `completed`, and that update reflects instantly across every other screen (guard and chairman) since they all read from the same visitor record.


- Colors: near-black navy `#14181F` (ink/headers), warm paper background `#F4F0E6`, brass gold `#C9A227` (brand/primary), green `#2E8B4F` (accept), amber `#D98A2B` (wait), red `#C0392B` (reject), plus category colors: VIP gold `#B8860B`, Admissions blue `#2E5AAC`, Delivery teal `#1E8080`, Others gray `#6B6F76`
- Fonts: **Space Grotesk** for headings/numbers/labels, **Nunito** for body text
- Every decision is both color-coded AND shape-coded (check / clock / cross) so it's understandable without reading and works for colorblind users
- Large circular touch targets throughout, icon-first buttons with minimal required text
- Rounded, friendly card-based layout — not a dense enterprise-software look

## Build order (suggested)
1. Data models + Firebase setup + auth, with login screen that routes each account to its role-specific app (guard vs chairman/PA) — no manual role picker, the role lives on the account
2. Guard: Add New Visitor form + submission logic (photo, voice-to-text, purpose, number, temp ID generation)
3. Chairman: push notification handling + Waiting Queue screen with priority/aging sort
4. Decision flow: Accept/Wait/Reject, status sync back to guard in real time
5. Entry pass generation + SMS sending (start with a stub/mock SMS service, swap in a real provider like MSG91 or Twilio later)
6. Guard: Visitor Leaving (exit) flow, departure_time recording
7. History screens (both roles) + Check Visitor ID lookup
8. Settings screens for both roles
9. Escalation timer + backup approver flow

Start by scaffolding the project and the data models, then confirm the plan with me before building out all screens.