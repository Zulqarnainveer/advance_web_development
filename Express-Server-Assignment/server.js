/**
 * ============================================================
 *   CSC337 - Advanced Web Technologies
 *   Assignment 2 | Spring-2026
 *   COMSATS University Islamabad, Vehari Campus
 *
 *   Middleware used:
 *    1. express.static()      → serves all HTML files from /public
 *    2. express.urlencoded()  → parses POST form data
 *    3. Custom logger         → logs every request to console + file
 *    4. Error handler         → returns JSON on server errors
 * ============================================================
 */

const express = require("express");
const fs      = require("fs");
const path    = require("path");

const app  = express();
const PORT = 4000;

// ─────────────────────────────────────────────
//  LOG FILE SETUP
// ─────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, "requests.log");

fs.writeFileSync(
  LOG_FILE,
  `===== Server Started: ${new Date().toISOString()} =====\n`,
  { flag: "a" }
);

// ══════════════════════════════════════════════
//  MIDDLEWARE 1 — Custom Request Logger
//  Logs every HTTP method + URL to console AND file
// ══════════════════════════════════════════════
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logEntry  = `[${timestamp}]  ${req.method.padEnd(6)}  ${req.originalUrl}\n`;

  // Print to console
  console.log(`📥  ${logEntry.trim()}`);

  // Save to log file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error("⚠️  Log write failed:", err.message);
  });

  next();
});

// ══════════════════════════════════════════════
//  MIDDLEWARE 2 — Serve Static Files from /public
//  This automatically serves:
//    /public/index.html   → accessible at  /  or /index.html
//    /public/about.html   → accessible at  /about.html
//    /public/contact.html → accessible at  /contact.html
//    /public/form.html    → accessible at  /form.html
// ══════════════════════════════════════════════
app.use(express.static(path.join(__dirname, "public")));

// ══════════════════════════════════════════════
//  MIDDLEWARE 3 — Parse URL-encoded Form Data
//  Required to read req.body from POST /submit
// ══════════════════════════════════════════════
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
//  NAMED ROUTES (for clean URLs without .html)
// ─────────────────────────────────────────────

// GET /  →  serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET /about  →  serve about.html
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

// GET /contact  →  serve contact.html
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// GET /form  →  serve form.html
app.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

// ─────────────────────────────────────────────
//  DYNAMIC ROUTE — GET /greet?name=
//  Cannot be a static file because it reads ?name query param
// ─────────────────────────────────────────────
app.get("/greet", (req, res) => {
  const name      = req.query.name ? req.query.name.trim() : null;
  const isStranger = !name;
  const message   = name ? `Hello, ${name}!` : "Hello, Stranger!";

  res.send(buildPage("Greet", "/greet", `
    <div class="card" style="max-width:520px;width:100%;text-align:center;">
      <div class="badge ${isStranger ? "" : "green"}">${isStranger ? "👤 Guest" : "✅ Personalized"}</div>
      <h1>${message}</h1>
      <p style="margin-bottom:28px;">
        ${isStranger
          ? 'No name provided. Try adding <code>?name=YourName</code> to the URL!'
          : `Personalized greeting generated for <strong style="color:var(--text);">${name}</strong>. Nice to meet you!`
        }
      </p>
      <div class="info-box" style="margin-bottom:28px;">
        <div style="color:var(--text);font-weight:600;margin-bottom:8px;">💡 Try these URLs:</div>
        <div style="margin-bottom:4px;">→ <code>/greet</code> — default greeting</div>
        <div>→ <code>/greet?name=Alice</code> — personalized greeting</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        ${isStranger
          ? `<a href="/greet?name=Developer" class="btn btn-primary">✨ Try with a Name</a>`
          : `<a href="/greet" class="btn btn-ghost">👤 Try as Stranger</a>`
        }
        <a href="/" class="btn btn-ghost">← Home</a>
      </div>
    </div>
  `));
});

// ─────────────────────────────────────────────
//  DYNAMIC ROUTE — POST /submit
//  Reads form data from req.body (parsed by middleware 3)
// ─────────────────────────────────────────────
app.post("/submit", (req, res) => {
  const { name, email } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).send(buildPage("Error", "", `
      <div class="card" style="max-width:460px;width:100%;text-align:center;">
        <div class="badge danger">⚠️ Validation Error</div>
        <h1 style="font-size:2rem;">Missing Fields</h1>
        <p style="margin-bottom:24px;">Both <strong style="color:var(--text);">name</strong> and <strong style="color:var(--text);">email</strong> are required.</p>
        <a href="/form" class="btn btn-primary">← Try Again</a>
      </div>
    `));
  }

  res.send(buildPage("Success", "", `
    <div class="card" style="max-width:520px;width:100%;text-align:center;">
      <div class="badge green">✅ Form Submitted</div>
      <h1 style="font-size:2.4rem;">All done!</h1>
      <p style="margin-bottom:28px;">
        Form submitted! Name: <strong style="color:var(--text);">${name}</strong>,
        Email: <strong style="color:var(--text);">${email}</strong>
      </p>
      <div class="result-card" style="margin-bottom:28px;">
        <div class="result-label">Submitted Details</div>
        <div class="result-row">
          <span>👤 Name</span>
          <strong>${name}</strong>
        </div>
        <div class="result-row">
          <span>📧 Email</span>
          <strong style="color:var(--accent);">${email}</strong>
        </div>
        <div class="result-row">
          <span>🕐 Time</span>
          <strong style="font-size:0.82rem;">${new Date().toLocaleString()}</strong>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <a href="/form" class="btn btn-primary">📬 Submit Another</a>
        <a href="/" class="btn btn-ghost">← Home</a>
      </div>
    </div>
  `));
});

// ─────────────────────────────────────────────
//  MIDDLEWARE 4 — Error Handler (4 params)
//  Catches any error passed via next(err)
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    success : false,
    status  : 500,
    message : "Internal Server Error",
    error   : err.message,
  });
});

// ─────────────────────────────────────────────
//  MIDDLEWARE 5 — 404 Catch-All
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success : false,
    status  : 404,
    message : `Route '${req.originalUrl}' was not found on this server.`,
  });
});

// ─────────────────────────────────────────────
//  START SERVER on PORT 4000
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log(`║  ✅  Server running on port ${PORT}           ║`);
  console.log(`║  🌐  http://localhost:${PORT}                ║`);
  console.log(`║  📁  Serving static files from /public     ║`);
  console.log(`║  📄  Logging to: requests.log              ║`);
  console.log("╚══════════════════════════════════════════╝\n");
});

// ─────────────────────────────────────────────
//  HELPER — shared page shell for dynamic routes
//  (Static pages have their own full HTML files)
// ─────────────────────────────────────────────
function buildPage(title, activePath, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title} — Express Server</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>"/>
  <link rel="stylesheet" href="/style.css"/>
</head>
<body>
  ${navbar(activePath)}
  <div class="wrapper">
    ${bodyContent}
  </div>
</body>
</html>`;
}

function navbar(activePath) {
  const links = [
    { href: "/",        label: "Home"    },
    { href: "/about",   label: "About"   },
    { href: "/contact", label: "Contact" },
    { href: "/greet",   label: "Greet"   },
    { href: "/form",    label: "Form"    },
  ];
  return `
  <nav>
    <a class="nav-logo" href="/">Express<span>Server</span></a>
    <div class="nav-links">
      ${links.map(l =>
        `<a href="${l.href}" ${activePath === l.href ? 'class="active"' : ""}>${l.label}</a>`
      ).join("")}
    </div>
  </nav>`;
}
