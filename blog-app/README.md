# 📝 BlogFlow — Full-Stack MVC Blog Application

> Built with **Node.js**, **Express**, and **MongoDB** following strict MVC architecture.

---

## 🏗 Architecture Overview

```
browser  →  Routes  →  Middleware  →  Controllers  →  Models  →  MongoDB
                                            ↓
                                         Views (EJS)
```

## 📁 Project Structure

```
blog-app/
├── app.js                    # Entry point — Express setup, middleware, routes
├── .env                      # Environment variables (copy from .env.example)
├── config/
│   └── db.js                 # Mongoose connection with graceful shutdown
├── middleware/
│   ├── logger.js             # Request logger (timestamp, method, route, IP)
│   ├── auth.js               # Session-based route protection
│   ├── upload.js             # Image validation & file movement
│   └── validator.js          # express-validator rule sets
├── models/
│   ├── User.js               # Mongoose schema (bcrypt, virtuals, pre-save hook)
│   └── Post.js               # Mongoose schema (slugify, full-text index, virtuals)
├── controllers/
│   ├── authController.js     # Register, Login, Logout
│   ├── blogController.js     # Public listing, search, single post
│   └── dashboardController.js# Protected CRUD + populate() demo
├── routes/
│   ├── authRoutes.js         # /auth/*
│   ├── blogRoutes.js         # /blog/*
│   └── dashboardRoutes.js    # /dashboard/* (all protected)
├── views/ (EJS Templates)
│   ├── partials/             # header, navbar, flash, footer
│   ├── auth/                 # register.ejs, login.ejs
│   ├── blog/                 # index.ejs, show.ejs, search.ejs
│   ├── dashboard/            # index.ejs, create.ejs, edit.ejs, profile.ejs
│   ├── 404.ejs
│   └── 500.ejs
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   ├── img/                  # Default placeholder images
│   └── uploads/              # User-uploaded images (runtime)
└── logs/
    └── requests.log          # Auto-generated request log
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set MONGO_URI and SESSION_SECRET

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

## ✅ Features Implemented

### Authentication
- [x] User registration with bcrypt password hashing (salt rounds: 12)
- [x] Login with session management (express-session)
- [x] `isAuthenticated` middleware protects all `/dashboard` routes
- [x] `isGuest` middleware redirects logged-in users away from auth pages
- [x] Secure session cookies (`httpOnly`, `secure` in production)

### Blog Management (CRUD)
- [x] Create posts with WYSIWYG editor (Quill.js)
- [x] Cover image upload (express-fileupload, 5MB limit, validated types)
- [x] Rich content display with safe HTML rendering
- [x] Update posts (title, content, category, tags, cover image, status)
- [x] Delete posts with file cleanup
- [x] Draft / Published status

### Middleware
- [x] **logger.js** — Colour-coded console + file logging with timestamp, method, route, IP, user
- [x] **auth.js** — Session guard (`isAuthenticated` / `isGuest`)
- [x] **upload.js** — Type check (.jpg/.jpeg/.png/.gif/.webp), size limit (5MB), directory traversal prevention
- [x] **validator.js** — Full express-validator rule sets for register, login, and post forms

### Database Design (Mongoose)
- [x] **User schema** — validation, `select:false` on password, pre-save bcrypt hook, `comparePassword` method
- [x] **Post schema** — slug auto-generation (slugify), excerpt & readTime virtuals, full-text indexes
- [x] **`.populate()`** — Dashboard displays full author objects populated from User collection
- [x] Virtual reverse-populate: User has a `posts` virtual

### Security & Validation
- [x] express-validator on all forms with redirect + flash error display
- [x] Session secrets via environment variables
- [x] Passwords never stored/returned in plaintext (`select: false`)
- [x] method-override for PUT/DELETE via HTML forms
- [x] Graceful error pages (404, 500)
- [x] Pagination, search, category filtering

## 🔑 Key Environment Variables

| Variable        | Description                        | Example                              |
|-----------------|------------------------------------|--------------------------------------|
| PORT            | Server port                        | 3000                                 |
| MONGO_URI       | MongoDB connection string          | mongodb://localhost:27017/blogapp    |
| SESSION_SECRET  | Secret for session signing         | (use a long random string)           |
| NODE_ENV        | Environment mode                   | development / production             |

## 📦 Dependencies

| Package           | Purpose                              |
|-------------------|--------------------------------------|
| express           | Web framework                        |
| mongoose          | MongoDB ODM                          |
| bcryptjs          | Password hashing                     |
| express-session   | Session management                   |
| connect-flash     | Flash messages                       |
| express-fileupload| File upload handling                 |
| express-validator | Input validation                     |
| ejs               | Templating engine                    |
| slugify           | URL-friendly slugs from titles       |
| method-override   | PUT/DELETE via POST forms            |
| dotenv            | Environment variable loading         |

---
*Built for academic submission — demonstrating MVC, REST, MongoDB, and Node.js best practices.*
