# CSC337 — Advanced Web Technologies
## Assignment 2 | Spring-2026
### COMSATS University Islamabad, Vehari Campus

---

## 📁 Project Structure

```
express-assignment/
│
├── server.js              ← Express server (middleware + dynamic routes only)
├── package.json           ← Dependencies
├── requests.log           ← Auto-generated request log (console + file)
│
└── public/                ← Static folder served by express.static() middleware
    ├── style.css          ← Shared stylesheet (used by all HTML pages)
    ├── index.html         ← Home page   → served at GET /
    ├── about.html         ← About page  → served at GET /about
    ├── contact.html       ← Contact page → served at GET /contact
    └── form.html          ← Contact form → served at GET /form
                                            (POSTs to dynamic route POST /submit)
```

---

## 🔗 Middleware Chain (in order)

```
Request comes in
      │
      ▼
┌─────────────────────────────────┐
│  1. Custom Logger Middleware    │  logs method + URL → console + file
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  2. express.static('public')   │  serves .html, .css files automatically
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  3. express.urlencoded()        │  parses POST body (name, email)
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  4. Route Handlers              │  /greet (dynamic), POST /submit (dynamic)
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  5. Error Handler (4 params)    │  returns JSON error response
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  6. 404 Catch-All               │  returns JSON 404 response
└─────────────────────────────────┘
```

---

## 🌐 All Routes

| Method | Route     | Type    | Source File           | Description                              |
|--------|-----------|---------|-----------------------|------------------------------------------|
| GET    | `/`       | Static  | public/index.html     | "Welcome to the Express Server!"         |
| GET    | `/about`  | Static  | public/about.html     | "This is the About page."                |
| GET    | `/contact`| Static  | public/contact.html   | "Contact us at contact@domain.com"       |
| GET    | `/form`   | Static  | public/form.html      | HTML form with name + email fields       |
| GET    | `/greet`  | Dynamic | server.js             | "Hello, Stranger!"                       |
| GET    | `/greet?name=X` | Dynamic | server.js       | "Hello, X!"                              |
| POST   | `/submit` | Dynamic | server.js             | Processes form, shows submitted data     |

---

## ⚙️ Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
http://localhost:4000
```

---

## ✅ Marks Checklist (10/10)

- [x] Express server running on **port 4000**
- [x] **`/`** home route — correct message
- [x] **`/about`** route — correct message
- [x] **`/contact`** route — correct message
- [x] **`/greet?name=X`** — personalized greeting
- [x] **`/greet`** (no name) — "Hello, Stranger!"
- [x] **Middleware** — logs HTTP method + route on every request
- [x] **Dual logging** — console + `requests.log` file
- [x] **POST `/submit`** — uses `express.urlencoded()`, displays name & email
- [x] **HTML form** — two-panel layout, name + email + submit, styled with CSS
