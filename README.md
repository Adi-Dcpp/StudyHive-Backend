# StudyHive Backend ⚡

> A production-grade REST API for collaborative learning. Built for real-world scale: auth, groups, goals, assignments, submissions, resources, notifications, and admin workflows with strict validation and a consistent response contract.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v9.1-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](LICENSE)

---

## 🧠 At a Glance

| ⚙️ Runtime | 🧩 Modules | 🔐 Security | ☁️ Storage | 🧪 Validation |
| --------- | --------- | ----------- | ---------- | ------------ |
| Node 18+  | Express 5 | JWT + RBAC  | Cloudinary | express-validator |

**TL;DR:** A sleek backend that turns study groups into full learning pipelines.

---

---

## 🚀 Live Demo

🔗 **App:** https://studyhive-web.vercel.app/
## 📂 Repositories

### Frontend
🔗 https://github.com/Adi-Dcpp/StudyHive-Frontend

### Backend
🔗 https://github.com/Adi-Dcpp/StudyHive-Backend

---

## 🎥 Demo Video

[Watch Demo Video](https://drive.google.com/file/d/1YQtmtUrsksFfZh7pja_TGxAtVxtVvlDO/view?usp=drivesdk)

---

## Project Insight ✨

StudyHive Backend is built to support a full academic workflow: mentors create groups, define learning goals, publish assignments, and review submissions; learners track goals, submit work, and access shared resources. The system enforces roles, validates every request, stores uploads in Cloudinary, and delivers consistent API responses.

Key outcomes this API enables:

- Safe onboarding with email verification and token rotation.
- Clear learning accountability with goals, deadlines, and submission reviews.
- Scalable file handling with strict limits and automatic cleanup.
- Reliable monitoring through a healthcheck and consistent error handling.

---

## Table of Contents 📌

- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Quick Repo Start Guide](#quick-repo-start-guide)
- [Configuration](#configuration)
- [API Design](#api-design)
- [Routes Reference (All Endpoints)](#routes-reference-all-endpoints)
- [Ideal API Responses](#ideal-api-responses)
- [Data Models (Mongoose Schemas)](#data-models-mongoose-schemas)
- [Project Structure](#project-structure)
- [Request Flow](#request-flow)
- [Scripts](#scripts)
- [Deployment Notes](#deployment-notes)
- [Support](#support)

---

## Feature Highlights 🚀

- Authentication with access + refresh tokens and email verification
- Role-based authorization (Admin, Mentor, Learner)
- Secure password hashing and token rotation
- Group management with invite codes and member control
- Learning goals and assignments with deadlines
- Assignment submissions with Cloudinary uploads and reviews
- Resource sharing (file, link, note) scoped per group
- Announcements, notifications, and messaging
- Rate limiting and request validation on critical routes
- Pagination helpers for list endpoints
- Centralized error handling with consistent API responses
- Healthcheck endpoint for uptime monitoring
- Admin tools for moderation and platform stat
- Cron Job for Notification 

### Why It Stands Out 🌟

- End-to-end learning workflow: goal -> assignment -> submission -> review
- Production-grade auth with verification and token rotation
- Clean modular architecture with strict validators and services separation
- Rich collaboration features (groups, announcements, resources, messaging)
- Cloud-native file handling with secure URLs and cleanup

---

## Tech Stack 🧰

| Layer              | Technology                |
| ------------------ | ------------------------- |
| Runtime            | Node.js v18+              |
| Framework          | Express.js v5.x           |
| Database           | MongoDB + Mongoose        |
| Auth               | JWT (jsonwebtoken)        |
| Security           | helmet, hpp, bcrypt       |
| File Upload        | Multer, Cloudinary        |
| Email              | Nodemailer, Mailgen       |
| Validation         | express-validator         |
| Logging            | pino, pino-http           |
| Dev Tools          | nodemon, dotenv, Prettier |

---

## Quick Start ⚡

```bash
git clone https://github.com/Adi-Dcpp/StudyHive-Backend.git
cd StudyHive-Backend
npm install
cp .env.example .env
npm run dev
```

---

## Quick Repo Start Guide ⚡

1. 📥 Clone and install

```bash
git clone https://github.com/Adi-Dcpp/StudyHive-Backend.git
cd StudyHive-Backend
npm install
```

2. 🔐 Configure environment

```bash
cp .env.example .env
```

3. 🧪 Start dev server

```bash
npm run dev
```

4. ✅ Smoke check

```bash
curl http://localhost:<PORT>/api/v1/healthcheck
```

---

## Configuration ⚙️

### Core Environment Variables

```env
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/studyhive

ACCESS_TOKEN_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_username
MAILTRAP_PASS=your_password

PROD_MAIL_HOST=smtp.gmail.com
PROD_MAIL_PORT=465
PROD_MAIL_USER=your_email@gmail.com
PROD_MAIL_PASS=your_app_password
```

---

## API Design 🧭

### Base URL

```
http://localhost:<PORT>/api/v1
```

### Conventions

- Auth uses JWT access tokens in `Authorization: Bearer <token>`
- Refresh token rotation is handled via the refresh endpoint
- All endpoints return a consistent response format
- Errors return an `errors` array with validation or domain details

---

## Routes Reference (All Endpoints) 🧾

### Auth (`/auth`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| POST   | /register                       | Register a new user and send verification email |
| POST   | /login                          | Login user and issue tokens |
| POST   | /logout                         | Logout current user (protected) |
| GET    | /me                             | Get current user profile (protected) |
| POST   | /refresh-token                  | Refresh access token |
| GET    | /verify-email/:token            | Verify email address |
| POST   | /resend-email-verification      | Resend verification email |
| POST   | /forgot-password                | Request a password reset email |
| POST   | /reset-password/:token          | Reset password by token |
| POST   | /change-password                | Change password (protected) |
| POST   | /refresh-token               | Refresh Access Token |
| POST   | /update-password                | Update Password(logged In) |

### Groups (`/groups`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| GET    | /                               | List groups the user belongs to |
| POST   | /                               | Create a new group |
| GET    | /:groupId                       | Fetch group details |
| PUT    | /:groupId                       | Update group details |
| DELETE | /:groupId                       | Delete a group |
| POST   | /join                           | Join group by invite code |
| POST   | /:groupId/invite                | Invite member to group |
| GET    | /:groupId/members               | List group members |
| DELETE | /:groupId/members/:userId       | Remove member from group |
| POST | /:groupId/leave     | Leave a group |
| PATCH | /:groupId/invite/regenerate       | Regenerate inviteCode |


### Goals (`/goals`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| GET    | /me                             | Get current learner goals |
| POST   | /:groupId                       | Create a goal in group (mentor) |
| GET    | /:groupId                       | List all goals in a group (mentor) |
| PUT    | /:goalId                        | Update a goal (mentor) |
| DELETE | /:goalId                        | Delete a goal (mentor) |

### Assignments (`/assignments`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| POST   | /goals/:goalId/assignments      | Create assignment for a goal (mentor) |
| GET    | /goals/:goalId/assignments      | List assignments for a goal |
| PUT    | /assignments/:assignmentId      | Update assignment (mentor) |
| DELETE | /assignments/:assignmentId      | Delete assignment (mentor) |

### Submissions (`/submissions`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| POST   | /assignments/:assignmentId/submit | Submit assignment (learner) |
| PUT    | /submissions/:submissionId/review | Review submission (mentor) |
| GET    | /assignments/:assignmentId/submissions | List submissions for assignment (mentor) |
| GET    | /assignments/:assignmentId/my-submission          | Get Submission |

### Resources (`/resources`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| POST   | /:groupId                       | Upload resource (file/link/note) |
| GET    | /:groupId                       | List resources for group |
| DELETE | /:resourceId                    | Delete resource |

### Announcements (`/announcements`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| POST   | /:groupId                       | Create announcement (mentor/admin) |
| GET    | /:groupId                       | List group announcements |
| PUT    | /:announcementId          | Update announcement |
| DELETE | /:announcementId                | Delete announcement |

### Messages (`/messages`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| POST   | /:groupId                       | Send message to group |
| GET    | /:groupId                       | List messages in group |
| DELETE    | /:messageId          | Delete any message |

### Notifications (`/notifications`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| GET    | /                               | List notifications for current user |
| PUT    | /clear-all          | Clear all notifications |
| PUT    | /:id           | Mark any notification as read |

### Leaderboard (`/leaderboard`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| GET    | /:groupId                       | Get group leaderboard |

### Dashboard (`/dashboard`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| GET    | /                               | Get dashboard stats for current user |

### Admin (`/admin`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| GET    | /stats                          | Platform stats overview |
| GET    | /users                          | List all users |
| PUT    | /users/:userId/role              | Update user role |
| DELETE | /users/:userId                   | Remove user |

### Healthcheck (`/healthcheck`)

| Method | Route                           | Purpose |
| ------ | ------------------------------- | ------- |
| GET    | /                               | Server + database health status |

---

## Ideal API Responses ✅

### Success (Generic)

```json
{
  "statusCode": 200,
  "message": "Request successful",
  "data": {},
  "success": true
}
```

### Validation Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "success": false
}
```

### Auth Error

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "errors": ["Missing or invalid access token"],
  "success": false
}
```

### Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "errors": ["Group not found"],
  "success": false
}
```

---

## Data Models (Mongoose Schemas) 🧬

### User

```js
{
  name: String,
  email: String,
  password: String,
  role: "admin" | "mentor" | "learner",
  isEmailVerified: Boolean,
  refreshToken: String,
  tokens: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Group

```js
{
  name: String,
  description: String,
  mentor: ObjectId,
  inviteCode: String,
  createdAt: Date,
  updatedAt: Date
}
```

### GroupMember

```js
{
  group: ObjectId,
  user: ObjectId,
  role: "mentor" | "learner",
  createdAt: Date,
  updatedAt: Date
}
```

### Goal

```js
{
  title: String,
  description: String,
  group: ObjectId,
  assignedTo: [ObjectId],
  status: "not_started" | "ongoing" | "completed",
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment

```js
{
  title: String,
  description: String,
  goalId: ObjectId,
  groupId: ObjectId,
  createdBy: ObjectId,
  deadline: Date,
  referenceMaterials: [String],
  maxMarks: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission

```js
{
  assignmentId: ObjectId,
  userId: ObjectId,
  submittedFile: String,
  cloudinaryPublicId: String,
  submittedText: String,
  status: "pending" | "submitted" | "reviewed" | "revision_required",
  marksObtained: Number,
  feedback: String,
  submittedAt: Date,
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Resource

```js
{
  title: String,
  description: String,
  type: "file" | "link" | "note",
  group: ObjectId,
  uploadedBy: ObjectId,
  fileUrl: String,
  linkUrl: String,
  fileSize: Number,
  fileName: String,
  cloudinaryPublicId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Announcement

```js
{
  title: String,
  body: String,
  group: ObjectId,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Message

```js
{
  group: ObjectId,
  sender: ObjectId,
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification

```js
{
  user: ObjectId,
  title: String,
  message: String,
  type: String,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Project Structure 🗂️

```
StudyHive-Backend/
├── docs/                               # PRDs and checklists
│   ├── prd.md
│   ├── STUDYHIVE_2.0_MASTER_CHECKLIST.md
│   └── STUDYHIVE_2.0_PRD.md
├── postman/                            # Postman collections + fixtures (AI Generated Scripts)
│   ├── generate-collection.js
│   ├── StudyHive-API.comprehensive.postman_collection.json
│   ├── StudyHive.postman_environment.json
│   └── fixtures/
│       └── sample-upload.txt
├── public/
│   └── temp/
│       ├── assignments/
│       ├── resources/
│       └── submissions/
├── src/
│   ├── app.js                          # Express app setup
│   ├── index.js                        # Server entry + DB connection
│   ├── controllers/
│   │   ├── admin.controllers.js
│   │   ├── announcement.controllers.js
│   │   ├── assignment.controllers.js
│   │   ├── auth.controllers.js
│   │   ├── dashboard.controllers.js
│   │   ├── goal.controllers.js
│   │   ├── group.controllers.js
│   │   ├── healthcheck.controllers.js
│   │   ├── leaderboard.controllers.js
│   │   ├── message.controllers.js
│   │   ├── notification.controllers.js
│   │   ├── resource.controllers.js
│   │   └── submission.controllers.js
│   ├── cron/
│   │   └── deadlineReminder.cron.js
│   ├── db/
│   │   └── index.db.js
│   ├── middlewares/
│   │   ├── admin.middlewares.js
│   │   ├── auth.middlewares.js
│   │   ├── authorizeRoles.middlewares.js
│   │   ├── error.middlewares.js
│   │   ├── multer.middlewares.js
│   │   ├── rateLimiter.middlewares.js
│   │   └── validators.middlewares.js
│   ├── models/
│   │   ├── announcement.models.js
│   │   ├── assignment.models.js
│   │   ├── goal.models.js
│   │   ├── group.models.js
│   │   ├── groupMember.models.js
│   │   ├── message.models.js
│   │   ├── notification.models.js
│   │   ├── resource.models.js
│   │   ├── submission.models.js
│   │   └── user.models.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── announcement.routes.js
│   │   ├── assignment.routes.js
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── goal.routes.js
│   │   ├── group.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── message.routes.js
│   │   ├── notification.routes.js
│   │   ├── resource.routes.js
│   │   └── submission.routes.js
│   ├── scripts/                         #AI generated DB seeding scripts
│   │   ├── seed-data.js
│   │   └── seed.js
│   ├── services/
│   │   └── notification.services.js
│   ├── utils/
│   │   ├── api-error.utils.js
│   │   ├── api-response.utils.js
│   │   ├── async-handler.utils.js
│   │   ├── cloudinary.utils.js
│   │   ├── constants.utils.js
│   │   ├── jwt.utils.js
│   │   ├── mail-template.utils.js
│   │   ├── pagination.utils.js
│   │   └── send-email.utils.js
│   └── validators/
│       ├── announcement.validators.js
│       ├── assignment.validators.js
│       ├── auth.validators.js
│       ├── goal.validators.js
│       ├── group.validators.js
│       ├── resource.validators.js
│       └── submission.validators.js
├── README.md
├── package.json
└── .env.example
```

---

## Request Flow 🔁

```
Client -> Routes -> Auth -> Validation -> Controller -> Model -> Response
```

---

## Scripts 🛠️

```bash
npm run dev        # Start dev server (nodemon)
npm start          # Start production server
npm run seed       # Seed database (dev)
npm run seed:fresh # Clear + seed
npm run seed:force # Force seed in production
npm run format     # Format with Prettier
```

---

## Deployment Notes 🌍

- Set `NODE_ENV=production` and use a production SMTP provider
- Use Atlas for `MONGO_URI` and whitelist your server IP
- Configure `CORS_ORIGIN` and `FRONTEND_URL` for your frontend domain
- Monitor `/healthcheck` for uptime checks

---

## Support 🤝

- Postman collection is included in [postman/](postman/)
- For docs and PRD, see [docs/](docs/)
- Issues and feature requests: https://github.com/Adi-Dcpp/StudyHive-Backend/issues

---

StudyHive Backend - Built for scalable, collaborative learning