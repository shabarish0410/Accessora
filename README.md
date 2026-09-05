# Accessora — Visitor Management System

**Accessora** is a modern digital **Visitor Management System (VMS)** designed to replace traditional manual visitor registers with a secure, real-time, and easy-to-use digital workflow.

The system connects **Security Guards** and the **Chairman/Authorized Authority** to manage visitor registration, approval, rejection, and entry decisions in real time.

It is designed to improve **security, transparency, speed, and visitor experience** while maintaining a complete digital record of visitor activity.

---

## 📌 Project Overview

Traditional visitor management often depends on:

* Paper-based visitor registers
* Manual phone calls to authorities
* Long waiting times
* Difficulty tracking visitor history
* Lack of centralized records
* No real-time status updates

**Accessora** solves these problems by providing a centralized digital visitor-management platform.

A Security Guard can register a visitor, capture visitor information, and submit the visit request.

The Chairman can immediately receive the request, review the visitor's details, and:

* ✅ Accept
* ❌ Reject
* ⏳ Hold

The Guard is then notified of the Chairman's decision.

---

# 🎯 Objectives

The main objectives of Accessora are:

* Digitize visitor registration.
* Reduce manual paperwork.
* Improve security at entrances.
* Provide real-time visitor approval.
* Notify authorized personnel instantly.
* Maintain visitor history and records.
* Support multilingual visitor information.
* Provide a simple mobile-friendly experience.
* Allow installation as a PWA on mobile devices.
* Provide secure role-based access.

---

# 👥 User Roles

Accessora currently focuses on two primary roles.

## 🛡️ Security Guard

The Guard is responsible for registering and managing visitors.

### Guard capabilities

* Login securely.
* Register new visitors.
* Capture visitor information.
* Capture visitor photograph where supported.
* Enter visitor purpose and origin.
* Select preferred language.
* Submit visitor requests.
* View visitor status.
* Receive Chairman decisions.
* Receive notifications.
* View Chairman feedback.
* Track visitor history.

---

## 👔 Chairman

The Chairman/authorized authority is responsible for reviewing visitor requests.

### Chairman capabilities

* Login securely.
* View incoming visitors.
* Receive new visitor notifications.
* View visitor details.
* View visitor photograph.
* View visitor purpose and origin.
* Accept visitors.
* Reject visitors.
* Place visitors on Hold.
* Provide rejection/hold reasons.
* View visitor history.
* Manage the visitor approval queue.

---

# 🔄 Visitor Workflow

The core Accessora workflow is:

```text
                 VISITOR ARRIVES
                       │
                       ▼
               SECURITY GUARD
                       │
                       ▼
              Register Visitor
                       │
                       ▼
             Capture Information
                       │
                       ▼
                Submit Request
                       │
                       ▼
                  SUPABASE
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
       Realtime Update       Notification
             │                   │
             └─────────┬─────────┘
                       ▼
                   CHAIRMAN
                       │
              Review Visitor
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       ACCEPT        REJECT        HOLD
          │            │            │
          └────────────┼────────────┘
                       ▼
                 Guard Notified
                       │
                       ▼
                Visitor Status
```

---

# 🔔 Notification System

Accessora provides real-time notifications for important visitor events.

## Chairman Notification

When the Guard registers a new visitor:

```text
🚨 New Visitor

Rahul Kumar is waiting for approval.

Purpose: Meeting
Origin: Hyderabad
```

The Chairman can open the visitor directly from the notification.

---

## Guard Notification

When the Chairman makes a decision:

### Accept

```text
✅ Visitor Approved

Chairman has allowed Rahul Kumar to enter.
```

### Reject

```text
❌ Visitor Rejected

Chairman rejected Rahul Kumar.

Reason: Meeting not approved.
```

### Hold

```text
⏳ Visitor On Hold

Chairman placed Rahul Kumar on Hold.

Duration: 10 minutes
Reason: Currently unavailable.
```

---

# 💬 Chairman's Feedback

Every Chairman decision can contain feedback.

The Guard can view the feedback from the Visitor Detail page.

Example:

```text
┌─────────────────────────────────┐
│       CHAIRMAN'S FEEDBACK       │
├─────────────────────────────────┤
│ Decision: HOLD                  │
│                                 │
│ Duration: 10 minutes            │
│                                 │
│ Reason: Currently unavailable   │
│                                 │
│ Decision Time: 10:25 AM         │
└─────────────────────────────────┘
```

This ensures that the Guard clearly understands the Chairman's decision.

---

# 🌐 Multi-Language Support

Accessora supports visitor information entered in:

* 🇬🇧 English
* 🇮🇳 Hindi
* 🇮🇳 Telugu

The Guard can select the input language while registering a visitor.

Example:

```text
Language: తెలుగు

Purpose:
చైర్మన్ తో మాట్లాడాలి
```

The system can provide an English translation for the Chairman.

```text
English:
I want to speak with the chairman.
```

### Original information is preserved

Accessora should maintain both:

```text
Original Text
      +
English Translation
```

The visitor's **name should remain unchanged** rather than being automatically translated.

---

# ⚡ Real-Time Updates

Accessora uses **Supabase Realtime** to keep dashboards synchronized.

For example:

```text
Guard registers visitor
        ↓
Database INSERT
        ↓
Supabase Realtime
        ↓
Chairman Dashboard
        ↓
Visitor appears immediately
```

Similarly:

```text
Chairman accepts visitor
        ↓
Database UPDATE
        ↓
Supabase Realtime
        ↓
Guard Dashboard
        ↓
Status updated
```

This minimizes the need for manual page refreshes.

---

# 📱 Mobile Experience

Accessora is designed to be mobile-friendly.

The web application can be deployed as a **Progressive Web App (PWA)**.

Users can install it on supported mobile devices using:

```text
Browser
   ↓
Add to Home Screen
   ↓
Accessora
   ↓
📱 Mobile Application Experience
```

This allows Security Guards and Chairmen to access the system quickly from their mobile devices.

---

# 🏗️ System Architecture

```text
                     ACCESSORA
                         │
          ┌──────────────┴──────────────┐
          │                             │
       CHAIRMAN                       GUARD
          │                             │
          └──────────────┬──────────────┘
                         │
                    Web / PWA
                         │
                         ▼
                     VERCEL
                         │
                         ▼
                  Application Layer
                         │
                         ▼
                    SUPABASE
             ┌───────────┼───────────┐
             │           │           │
             ▼           ▼           ▼
          Database    Realtime     Auth
             │
             ▼
       Notification System
             │
             ▼
          Web Push
             │
             ▼
        Mobile Device
```

---

# 🛠️ Technology Stack

| Technology              | Purpose                        |
| ----------------------- | ------------------------------ |
| React / Next.js         | Frontend                       |
| Supabase                | Backend services               |
| PostgreSQL              | Database                       |
| Supabase Auth           | Authentication                 |
| Supabase Realtime       | Real-time updates              |
| Supabase Edge Functions | Server-side notification logic |
| Web Push                | System notifications           |
| Service Worker          | Background notifications       |
| PWA                     | Mobile installation            |
| Vercel                  | Deployment                     |
| Git / GitHub            | Version control                |

---

# 🔐 Security

Accessora uses role-based access control.

Users are assigned roles such as:

```text
chairman
guard
```

The application uses authentication to ensure that users can access only the functionality appropriate for their role.

Database access should be protected using **Supabase Row Level Security (RLS)**.

Sensitive credentials such as:

* API keys
* Push notification private keys
* Supabase service-role credentials

must never be exposed in frontend code.

---

# 🗄️ Core Data Model

A simplified visitor record can contain:

```text
Visitor
│
├── id
├── name
├── phone
├── photo
├── purpose_original
├── purpose_english
├── origin_original
├── origin_english
├── status
├── chairman_decision
├── chairman_feedback
├── hold_duration
├── decision_at
├── created_at
└── updated_at
```

Notification subscriptions can contain:

```text
Notification Subscription
│
├── id
├── user_id
├── role
├── endpoint
├── p256dh
├── auth
├── created_at
└── updated_at
```

The exact schema should follow the project's current Supabase migrations.

---

# 📂 Suggested Project Structure

```text
accessora/
│
├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   │   ├── visitors.ts
│   │   ├── notifications.ts
│   │   └── translation.ts
│   │
│   ├── hooks/
│   ├── utils/
│   └── ...
│
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── service-worker.js
│
├── supabase/
│   ├── migrations/
│   └── functions/
│       └── send-web-push/
│
├── package.json
├── .env.local
├── .gitignore
└── README.md
```

> The actual structure may differ depending on the current Accessora implementation.

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm
* Git

You will also need a Supabase project.

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd accessora
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create:

```text
.env.local
```

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

Never commit secret keys to GitHub.

Server-side secrets should be configured separately in Supabase/Vercel.

---

# ▶️ Run the Application

Start the development server:

```bash
npm start
```

or, if the project uses the standard Next.js development command:

```bash
npm run dev
```

Open the local application in your browser.

---

# 📱 Mobile Testing

For mobile/PWA testing:

1. Start the application.
2. Open the application using a supported mobile browser.
3. Log in as Guard or Chairman.
4. Grant notification permission.
5. Use **Add to Home Screen**.
6. Open the installed Accessora application.
7. Test visitor registration and notifications.

---

# 🔔 Notification Testing

## Chairman

```text
Guard
 ↓
Create Visitor
 ↓
Supabase INSERT
 ↓
Chairman Notification
 ↓
Chairman Reviews Visitor
```

## Guard

```text
Chairman
 ↓
Accept / Reject / Hold
 ↓
Supabase UPDATE
 ↓
Guard Notification
```

Test notifications both when the application is:

* Open
* Backgrounded
* Installed as PWA

Browser and operating-system support for background/closed-app notifications can vary.

---

# ☁️ Vercel Deployment

Accessora can be deployed to Vercel.

Typical deployment process:

```bash
npm run build
```

Then deploy through Vercel.

Configure the required environment variables in:

```text
Vercel
 → Project
 → Settings
 → Environment Variables
```

Make sure production uses the correct Supabase project and notification configuration.

---

# 🧪 Testing Checklist

### Authentication

* [ ] Guard can log in.
* [ ] Chairman can log in.
* [ ] Unauthorized users cannot access protected pages.
* [ ] Role-based routes work correctly.

### Visitor Registration

* [ ] Guard can create visitor.
* [ ] Visitor information is validated.
* [ ] Visitor photograph works where supported.
* [ ] Duplicate submissions are prevented.

### Chairman

* [ ] New visitors appear in realtime.
* [ ] Chairman receives notification.
* [ ] Chairman can accept.
* [ ] Chairman can reject.
* [ ] Chairman can place visitor on Hold.
* [ ] Chairman feedback is saved.

### Guard

* [ ] Guard receives Accept notification.
* [ ] Guard receives Reject notification.
* [ ] Guard receives Hold notification.
* [ ] Guard can view Chairman feedback.
* [ ] Visitor status updates correctly.

### Translation

* [ ] English input works.
* [ ] Hindi input works.
* [ ] Telugu input works.
* [ ] Original text is preserved.
* [ ] English translation is stored separately.
* [ ] Visitor names are not unnecessarily translated.

### Notifications

* [ ] Permission request works.
* [ ] Push subscription is registered.
* [ ] Notification appears in foreground.
* [ ] Notification appears in background where supported.
* [ ] Notification click opens the correct visitor.
* [ ] Duplicate notifications are prevented.

---

# 🔮 Future Enhancements

Potential future improvements include:

* Visitor QR codes
* Appointment scheduling
* Pre-approved visitors
* Employee directory
* Host notifications
* Visitor badges
* Digital visitor passes
* Face/photo verification
* Visitor blacklist/watchlist
* Emergency visitor reports
* Entry/exit timestamps
* Visitor analytics
* Daily/monthly reports
* SMS notifications
* WhatsApp notifications
* Email notifications
* Multi-building support
* Multi-security-gate support
* Admin dashboard
* Audit logs
* Advanced analytics

---

# 🌟 Key Benefits

### For Security Guards

* Faster visitor registration
* Less paperwork
* Clear approval status
* Immediate Chairman feedback
* Mobile-friendly interface
* Multilingual input

### For Chairman

* Instant visitor requests
* Faster decision-making
* Visitor information in one place
* Real-time updates
* Mobile notifications
* Complete visitor history

### For the Organization

* Improved security
* Digital records
* Reduced manual work
* Better accountability
* Faster visitor processing
* Centralized visitor management

---

# 📊 Project Vision

Accessora aims to transform traditional visitor registers into a **smart, secure, real-time visitor management platform**.

Instead of:

```text
Visitor
   ↓
Paper Register
   ↓
Phone Call
   ↓
Wait
   ↓
Manual Decision
```

Accessora provides:

```text
Visitor
   ↓
Digital Registration
   ↓
Real-Time Request
   ↓
Chairman Notification
   ↓
Accept / Reject / Hold
   ↓
Guard Notification
   ↓
Secure Entry
```

---

# 📄 License

This project is currently developed as a visitor-management application.

Add the appropriate open-source or proprietary license here depending on the project's distribution requirements.

---

# 👨‍💻 Contributors

**Accessora Development Team**

Built as a modern digital solution for secure and efficient visitor management.
