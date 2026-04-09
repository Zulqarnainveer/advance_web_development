# 📚 TaskFlow — Student Task Manager

**CSC337 Advanced Web Technologies | Lab Mid Term Project**  
**BSSE | COMSATS University Islamabad, Vehari Campus**

\---

## 🗂️ Project Structure

```
student-task-manager/
├── backend/               ← Express.js Server (Node.js)
│   ├── bin/www            ← HTTP server startup (Express Generator)
│   ├── app.js             ← Main Express application
│   ├── models/
│   │   ├── User.js        ← Mongoose schema + JWT methods
│   │   └── Task.js        ← Mongoose schema + validations
│   ├── routes/
│   │   ├── index.js       ← EJS-rendered page routes
│   │   ├── taskRoutes.js  ← Full CRUD REST API for tasks
│   │   └── userRoutes.js  ← Auth routes (register/login)
│   ├── middleware/
│   │   ├── authMiddleware.js  ← JWT token verification
│   │   ├── requestLogger.js  ← Custom HTTP logger
│   │   └── errorHandler.js   ← Global error handler
│   ├── modules/
│   │   ├── dbConnect.js   ← MongoDB connection module
│   │   └── fileLogger.js  ← fs module file logging
│   ├── views/             ← EJS templates
│   │   ├── index.ejs      ← Landing page
│   │   ├── logs.ejs       ← Live logs viewer
│   │   └── partials/      ← Reusable header/footer
│   ├── public/css/        ← Static CSS
│   ├── logs/logs.txt      ← Auto-generated request logs
│   └── .env.example       ← Environment variable template
│
└── frontend/              ← React.js (Vite)
    ├── src/
    │   ├── App.jsx            ← Root component
    │   ├── main.jsx           ← ReactDOM entry
    │   ├── index.css          ← Global Glassmorphism styles
    │   ├── api/axios.js       ← Configured Axios instance
    │   ├── context/
    │   │   ├── AuthContext.jsx ← useContext for global auth state
    │   │   └── ToastContext.jsx← useContext for notifications
    │   ├── hooks/
    │   │   └── useTasks.js    ← Custom hook (useState, useEffect, useCallback, useRef)
    │   ├── components/
    │   │   ├── Navbar.jsx     ← Reusable navbar (props)
    │   │   ├── Sidebar.jsx    ← Navigation sidebar (props)
    │   │   ├── StatCard.jsx   ← Stats display card (props)
    │   │   ├── TaskCard.jsx   ← Task item card (props + events)
    │   │   └── TaskModal.jsx  ← Create/Edit modal form (props + events)
    │   └── pages/
    │       ├── AuthPage.jsx   ← Login \& Register
    │       └── Dashboard.jsx  ← Main dashboard (all hooks)
    └── vite.config.js
```

\---

## ⚙️ Prerequisites

* **Node.js** v18+ — [Download](https://nodejs.org)
* **MongoDB** running locally on port `27017` **OR** MongoDB Atlas URI
* **Git**

\---

## 🚀 Setup \& Run Instructions

### Step 1 — Clone the repository

```bash
git clone https://github.com/zulqarnaintabassum/advance\_web\_development/tree/main/student-task-manager.git
cd student-task-manager
```

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env

# Edit .env and fill in your MongoDB URI and JWT secret:
# MONGO\_URI=mongodb://localhost:27017/student\_task\_manager
# JWT\_SECRET=any\_long\_random\_string\_here

# Start the backend server (development with nodemon)
npm run dev
```

Backend runs at: **http://localhost:5000**

### Step 3 — Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the React dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Step 4 — Open in Browser

|URL|Description|
|-|-|
|http://localhost:5173|React App (main UI)|
|http://localhost:5000|EJS Landing Page|
|http://localhost:5000/logs|Live Server Logs|
|http://localhost:5000/api/health|API Health Check|

\---

## 📡 RESTful API Endpoints

Base URL: `http://localhost:5000/api`

### 👤 User / Authentication

|Method|Endpoint|Description|Auth Required|
|-|-|-|:-:|
|`POST`|`/users/register`|Register a new user|❌|
|`POST`|`/users/login`|Login \& receive JWT token|❌|
|`GET`|`/users/me`|Get current user profile|✅|
|`PUT`|`/users/me`|Update user profile|✅|
|`GET`|`/users`|Get all users (admin only)|✅|

### ✅ Tasks (Full CRUD)

|Method|Endpoint|Description|Auth Required|
|-|-|-|:-:|
|`GET`|`/tasks`|Get all tasks (supports filters \& search)|✅|
|`GET`|`/tasks/stats`|Get task counts by status \& priority|✅|
|`GET`|`/tasks/:id`|Get a single task by ID|✅|
|`POST`|`/tasks`|Create a new task|✅|
|`PUT`|`/tasks/:id`|Update task (all fields)|✅|
|`PATCH`|`/tasks/:id/status`|Quick status update only|✅|
|`DELETE`|`/tasks/:id`|Delete a task|✅|

### 🔍 Query Parameters for `GET /api/tasks`

|Parameter|Values|Example|
|-|-|-|
|`status`|`pending`, `in-progress`, `completed`|`?status=pending`|
|`priority`|`low`, `medium`, `high`|`?priority=high`|
|`search`|any text|`?search=assignment`|
|`sortBy`|`createdAt`, `-createdAt`, `dueDate`, `-priority`|`?sortBy=dueDate`|
|`page`|number|`?page=2`|
|`limit`|number|`?limit=5`|

### 📋 Example API Requests

**Register User:**

```json
POST /api/users/register
{
  "name": "Zulqarnain Tabassum",
  "email": "Zulqarnainveer23@gmail.com",
  "password": "secret123"
}
```

**Create Task:**

```json
POST /api/tasks
Authorization: Bearer <JWT\_TOKEN>
{
  "title": "Complete DSA Lab Report",
  "description": "Write sorting algorithms comparison",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-05-10",
  "subject": "Data Structures",
  "tags": \["lab", "algorithms"]
}
```

**Response format:**

```json
{
  "success": true,
  "message": "Task created successfully!",
  "data": {
    "\_id": "664a...",
    "title": "Complete DSA Lab Report",
    "status": "pending",
    "priority": "high",
    "assignedTo": { "\_id": "...", "name": "Ali Hassan", "email": "ali@example.com" },
    "createdAt": "2026-04-07T10:30:00.000Z"
  }
}
```

\---

## 🧪 Lab Concepts Implemented

|Lab|Concept|File|
|-|-|-|
|Lab 1|`fs` module — async read/write/append|`modules/fileLogger.js`|
|Lab 1|Custom modules|`modules/dbConnect.js`, `modules/fileLogger.js`|
|Lab 2|Express server + routing|`app.js`, `routes/`|
|Lab 2|GET and POST routes|`routes/taskRoutes.js`, `routes/userRoutes.js`|
|Lab 3|React functional components|All `components/\*.jsx`|
|Lab 3|Props|`StatCard`, `TaskCard`, `TaskModal`, `Navbar`, `Sidebar`|
|Lab 4|`useState`|All pages and components|
|Lab 4|`useEffect`|`AuthContext.jsx`, `hooks/useTasks.js`|
|Lab 4|Event handling|`Dashboard.jsx`, `TaskModal.jsx`, `AuthPage.jsx`|
|Lab 5|`useContext`|`AuthContext`, `ToastContext`|
|Lab 5|`useCallback`|`useTasks.js`, `Dashboard.jsx`|
|Lab 5|`useRef`|`TaskModal.jsx`, `useTasks.js`|
|Lab 5|`useMemo`|`Dashboard.jsx` (filters object)|
|Lab 6|MongoDB + Mongoose schemas|`models/User.js`, `models/Task.js`|
|Lab 6|Data validation|Both models — `required`, `minlength`, `maxlength`, `enum`, `match`|
|Lab 6|Relationships + `populate()`|`Task.assignedTo` refs `User`, used in routes|
|Lab 6|CRUD operations|`routes/taskRoutes.js`|
|Lab 7|Middleware|`requestLogger.js`, `authMiddleware.js`, `errorHandler.js`|
|Lab 7|Error handling|`middleware/errorHandler.js` handles all error types|
|Extra|JWT Authentication|`middleware/authMiddleware.js`, `models/User.js`|
|Extra|Search \& Filtering|`GET /api/tasks` with query params|
|Extra|Pagination|`page` + `limit` params in task query|

\---

## 🎨 Tech Stack

**Backend:** Node.js · Express.js · MongoDB · Mongoose · JWT · bcryptjs · Morgan  
**Frontend:** React 18 · Vite · Axios · React Router  
**UI:** Bootstrap 5 · Bootstrap Icons · Glassmorphism CSS · Google Fonts (Syne + DM Sans)

\---

*Submitted for CSC337 Lab Mid Term Exam — Spring 2026*

