# BlogFlow Application Documentation

This document provides a comprehensive overview of the **BlogFlow** application's codebase, focusing primarily on the backend architecture, request lifecycle, data models, and authentication flow.

---

## 1. System Architecture Overview

The application follows the **Model-View-Controller (MVC)** architectural pattern, built on the robust Node.js and Express.js framework, with MongoDB as the database layer.

*   **Models (`/models`)**: Define the data structure, schema validation, and database interactions using Mongoose.
*   **Views (`/views`)**: Render the user interface server-side using the EJS templating engine.
*   **Controllers (`/controllers`)**: Handle the core business logic, act as the bridge between Models and Views, and process incoming requests.
*   **Routes (`/routes`)**: Define the API endpoints and map incoming HTTP requests to specific controller functions.
*   **Middleware (`/middleware`)**: Intercept and process requests before they reach the route handlers (e.g., authentication checks, request validation, file parsing).

---

## 2. Core Application Setup (`app.js`)

`app.js` serves as the entry point for the application, initializing the Express server and wiring up the global middleware and routing modules.

### Key Middleware Configured:
*   **express.json() & express.urlencoded()**: Parses incoming request bodies (JSON and URL-encoded form data).
*   **method-override**: Allows the use of HTTP verbs like `PUT` and `DELETE` in standard HTML forms using a query parameter (`_method=PUT`).
*   **express-session**: Manages user sessions securely using HTTP-only cookies, tracking login states across requests.
*   **connect-flash**: Stores temporary "flash" messages in the session (e.g., success or error notifications) to be displayed on the next rendered view.
*   **express-fileupload**: Parses multipart/form-data requests to handle image uploads, saving files temporarily before the routing logic handles them.
*   **Custom Request Logger (`/middleware/logger.js`)**: Logs details (method, URL, timestamp) of every incoming request for debugging and monitoring.

### Global Template Variables:
A custom middleware runs on every request to attach data to `res.locals`, making variables like `user` (if logged in) and flash messages globally accessible in all EJS templates.

---

## 3. Data Models (Mongoose Schemas)

The database layer consists of two primary models: `User` and `Post`.

### 3.1. User Model (`models/User.js`)
Handles user profiles and authentication data.
*   **Schema**: Includes `username`, `email`, `password`, `avatar` (file reference), `bio`, and `role` (`user` or `admin`).
*   **Security (Pre-save Hook)**: Before saving a user, a `pre('save')` hook intercepts the operation, hashes the plain-text password using **bcrypt**, and stores the securely hashed version.
*   **Security (Select: false)**: The `password` field is explicitly set to `select: false` by default, ensuring it is never accidentally returned in database queries unless explicitly requested (`.select('+password')`).
*   **Virtual Reference**: A virtual `posts` field establishes a one-to-many relationship, linking a user to all posts they have authored.
*   **Instance Methods**: Provides internal functions like `comparePassword` to securely check login attempts against the hashed password.

### 3.2. Post Model (`models/Post.js`)
Manages blog articles and metadata.
*   **Schema**: Includes `title`, `slug`, `content` (HTML string), `excerpt`, `coverImage`, `category`, `tags`, `author` (ObjectId referencing User), `status` (draft/published), `views`, and `readTime`.
*   **Data Integrity (Pre-save Hook)**: Automatically generates URL-friendly `slugs` from the title (using the `slugify` library), strips HTML from the content to auto-generate a plain-text `excerpt`, and calculates an estimated `readTime` based on word count.
*   **Search & Indexing**: Employs compound and text indexes (`{ title: 'text', content: 'text', tags: 'text' }`) to enable highly optimized full-text search capabilities across the database.

---

## 4. Authentication Flow & Security (`authController.js`)

Authentication is managed completely server-side via distinct HTTP endpoints.

### Registration Flow (`POST /auth/register`):
1.  **Validation**: Ensures the email and username do not already exist via a MongoDB `$or` query.
2.  **Creation**: Creates a new user instance, relying on the Mongoose model's pre-save hook to securely hash the password.
3.  **Redirection**: Redirects the user to the login screen with a success flash message.

### Login Flow (`POST /auth/login`):
1.  **Query**: Finds the user by email, explicitly pulling the password field (`.select('+password')`).
2.  **Verification**: Uses the model's `comparePassword` method to check the input against the stored hash.
3.  **Session Establishment**: If verified, a clean user object (excluding the password) is saved into `req.session.user`. Next time the user connects, Express recognizes the session cookie.

### Logout Flow (`POST /auth/logout`):
Destroys the session and clears the connection cookie (`connect.sid`), effectively tearing down the authentication state.

---

## 5. Blog and Content Management

### Public Blog Controller (`blogController.js`)
Handles public-facing content discovery and rendering.
*   **Feed and Pagination**: Queries all `status: 'published'` posts, limiting results per page using Mongoose's `.skip()` and `.limit()` methods for performance.
*   **Full-Text Search**: Uses a dynamic `$regex` search, taking care to sanitize incoming queries using a custom `escapeRegex()` function to prevent **ReDoS (Regular Expression Denial of Service)** attacks.
*   **View Tracking**: When fetching a single post detail view, the controller uses `findOneAndUpdate()` with `$inc: { views: 1 }` to atomically update the analytics counter without requiring specialized tracking modules.

### Protected Dashboard Controller (`dashboardController.js`)
Manages the specific capabilities provided to logged-in users.
*   **Protection**: The entire set of `/dashboard/*` routes is fronted by the `isAuthenticated` middleware (`middleware/auth.js`), checking for `req.session.user`.
*   **CRUD Operations**: Methods allowing users to create, read, update, and delete their own posts. Each query strictly enforces authorship checks (e.g., `Post.findOne({ _id: req.params.id, author: req.session.user._id })`) ensuring users cannot manipulate others' posts.
*   **WYSIWYG Sanitization**: The server receives raw HTML content from the rich-text editor. To prevent **XSS (Cross-Site Scripting)** attacks, the controller processes the input through the `sanitize-html` library before saving, enforcing an allowlist of safe tags and attributes.
*   **Asynchronous File Management**: When profile pictures or cover images are updated or deleted, a utility function performs non-blocking `fs.promises.unlink()` operations to handle file-system cleanup securely.

---

## 6. Request Validation Pipeline (`middleware/validator.js`)

To enforce data integrity and prevent malformed data from reaching controllers, the application uses **Express Validator**.

*   Detailed rule chains (e.g., `profileRules`, `passwordChangeRules`, `postRules`) define constraints (length, regex patterns, empty checks).
*   A centralized `handleValidation` middleware inspects the validation results. If it finds errors, it intercepts the request, maps the errors to flash messages, repopulates form inputs (saving user effort), and redirects backwards—preventing the controller logic from running on unhealthy data.

---

## 7. Media Upload Handling (`middleware/upload.js`)

Manages incoming image requests safely using custom middleware logic on top of `express-fileupload`.

*   **File Constraints**: Rejects images larger than 5MB or matching disallowed extensions, preventing abuse of server storage.
*   **Name Sanitization**: Strips dangerous or invalid characters from uploaded filenames to heavily mitigate **Directory Traversal** attacks. Formats names by prepending `Date.now()`, ensuring uniqueness and preventing file-overwrite collisions.
*   **Async Move Step**: Distinctly separates validation from the actual filesystem operation, explicitly isolating success/failure conditions.

---

### Conclusion

The BlogFlow platform demonstrates a secure, well-structured Express.js architecture optimized for performance, robust data integrity, and strict request lifecycle management. The isolation of distinct responsibilities into models, modular middleware pipelines, and focused controllers results in scalable and highly maintainable backend logic.
