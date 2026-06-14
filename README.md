# RelationReminder

A personal relationship reminder app (mini CRM) — keep track of the people that matter and never let important relationships go cold.

Built with React + Vite + Tailwind CSS. All data is stored in `localStorage` — no backend, no sign-up.

---

## Features

- **Contact management** — add, edit, and delete contacts with name, category, contact frequency, notes, and last-contacted date
- **CSV import** — bulk-add people from a CSV of names; contacts missing details are highlighted so you can fill them in later
- **Auto-calculated next due date** — computed from last contacted + chosen frequency
- **Dashboard** — contacts sorted by most overdue first, with red / amber / green colour coding
- **"Mark contacted today"** — one-click reset of the last-contacted date
- **Email digest** — send yourself a summary of overdue and due-soon contacts via EmailJS

---

## Getting started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & run

```bash
git clone <repo-url>
cd relation-reminder
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Importing contacts from CSV

Adding people one at a time is slow, so you can bulk-import them instead.

1. On the **Dashboard**, click **Import CSV** and choose your file.
2. Each imported person is added to your list and flagged **"Needs details"** — they show an amber highlight and a **Missing:** notice until you set a contact frequency and last-contacted date.
3. Click **Add details** on a highlighted card (or use the **"Show only … needing details"** filter to focus on them) and complete the missing fields.

### Accepted formats

The simplest file is just **one name per line**:

```
Jane Smith
John Doe
Acme — Bob in procurement
```

You can also provide a header row to pre-fill more columns. Only `name` is
required; any of the others are optional and may be left blank:

```csv
name,category,frequency,notes,last contacted
Jane Smith,Friend,monthly,Met at the conference,2026-01-15
John Doe,Networking,,,
```

- `frequency` must be one of: `weekly`, `fortnightly`, `monthly`, `quarterly`, `half-yearly`, `yearly` (anything else is ignored and left blank).
- `last contacted` must be in `YYYY-MM-DD` format (anything else is ignored).
- Fields containing commas can be wrapped in double quotes, e.g. `"Smith, Jane"`.
- Duplicate names (already on your list) are skipped, and the import summary tells you how many were added vs. skipped.

---

## Setting up EmailJS (for reminder digests)

The app uses [EmailJS](https://www.emailjs.com/) to send email reminders directly from the browser — no server required. The free tier allows **200 emails per month**.

### Step-by-step

1. **Create an account** at [emailjs.com](https://www.emailjs.com/)

2. **Add an Email Service**
   - Go to **Email Services** → **Add New Service**
   - Choose your provider (Gmail, Outlook, etc.) and follow the OAuth / SMTP instructions
   - Copy the **Service ID** (looks like `service_xxxxxxx`)

3. **Create an Email Template**
   - Go to **Email Templates** → **Create New Template**
   - Use the following template variables in your template body:

     | Variable | Description |
     |---|---|
     | `{{subject}}` | Email subject line |
     | `{{message}}` | Plain-text digest of overdue/due-soon contacts |
     | `{{to_email}}` | Your recipient address |
     | `{{overdue_count}}` | Number of overdue contacts |
     | `{{due_soon_count}}` | Number of contacts due this week |

   - Example template body:
     ```
     Subject: {{subject}}

     {{message}}
     ```
   - Copy the **Template ID** (looks like `template_xxxxxxx`)

4. **Get your Public Key**
   - Go to **Account** → **API Keys**
   - Copy your **Public Key**

5. **Enter credentials in the app**
   - Open the app, click **Settings**
   - Paste the Service ID, Template ID, Public Key, and your email address
   - Click **Save settings**
   - Hit **Send reminder digest** to test

---

## Data model

Each contact stores:

| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated unique ID |
| `name` | string | Required |
| `category` | string | Free text (e.g. "Friend", "Networking") |
| `frequency` | string | One of: `weekly`, `fortnightly`, `monthly`, `quarterly`, `half-yearly`, `yearly` |
| `notes` | string | Free text notes |
| `lastContacted` | ISO date string | Defaults to today when adding |

`nextDue` is derived at render time from `lastContacted + frequency` — it is never stored.

---

## Tech stack

| Package | Purpose |
|---|---|
| React 19 | UI |
| Vite | Build tool & dev server |
| Tailwind CSS 3 | Styling |
| date-fns | Date arithmetic |
| emailjs-com | Email sending (browser-side) |

---

## License

MIT
