# StudyHive 2.0 — Product Requirements Document

> **Status:** Draft — v2.0.0  
> **Author:** Engineering Team  
> **Created:** 2026-04-09  
> **Last Updated:** 2026-04-09  
> **Audience:** Engineering, Product, QA, DevOps, Security  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Success Metrics (KPIs)](#4-success-metrics-kpis)
5. [User Personas](#5-user-personas)
6. [System Architecture Overview](#6-system-architecture-overview)
7. [Feature Specifications](#7-feature-specifications)
   - 7.1 Authentication & Account Management
   - 7.2 Study Group Management
   - 7.3 Member Management
   - 7.4 Learning Goals
   - 7.5 Assignment Management
   - 7.6 Assignment Submissions
   - 7.7 Study Resources
   - 7.8 Announcements
   - 7.9 Mentor Dashboard & Analytics
   - 7.10 Notifications (New)
   - 7.11 Direct Messaging (New)
   - 7.12 Leaderboard & Progress Tracking (New)
   - 7.13 Admin Panel Endpoints (New)
   - 7.14 Group Invite Code Management (New)
   - 7.15 Voluntary Group Exit (New)
   - 7.16 System Health & Monitoring
8. [Complete API Endpoint Catalogue](#8-complete-api-endpoint-catalogue)
9. [Data Models (Full Schema)](#9-data-models-full-schema)
10. [Permission Matrix](#10-permission-matrix)
11. [Security Requirements](#11-security-requirements)
12. [Validation Rules](#12-validation-rules)
13. [Error Handling Standard](#13-error-handling-standard)
14. [Performance & Scalability Requirements](#14-performance--scalability-requirements)
15. [File Upload Specification](#15-file-upload-specification)
16. [Email Notification Specification](#16-email-notification-specification)
17. [Infrastructure & DevOps Requirements](#17-infrastructure--devops-requirements)
18. [Testing Strategy](#18-testing-strategy)
19. [Pagination, Filtering & Sorting Standard](#19-pagination-filtering--sorting-standard)
20. [Logging & Observability Standard](#20-logging--observability-standard)
21. [Rate Limiting Policy](#21-rate-limiting-policy)
22. [Dependency & Risk Register](#22-dependency--risk-register)
23. [Release Milestones](#23-release-milestones)
24. [Open Issues from 1.0 Audit (Must Fix in 2.0)](#24-open-issues-from-10-audit-must-fix-in-20)
25. [Glossary](#25-glossary)

---

## 1. Executive Summary

StudyHive is a collaborative learning management backend API. Version 1.0 proved the core concept: role-based study groups, goals, assignments, submissions, and resource sharing all work end-to-end.

**StudyHive 2.0** is the production-grade rewrite of that foundation. Every known bug, security vulnerability, missing feature, performance gap, and operational blind spot discovered in the 1.0 audit is addressed here. In addition, the platform adds four new product-level features — in-app notifications, direct messaging between members, a leaderboard system, and a full admin control panel — that push it from "working prototype" to "product you can onboard real institutions on."

StudyHive 2.0 must pass a zero-flaw security audit, handle 10,000 concurrent users without degradation, and be continuously deployable with zero-downtime releases.

---

## 2. Problem Statement

### 2.1 Why 2.0 Exists

The 1.0 audit identified the following categories of unacceptable production risk:

| Category | Count of Issues |
|---|---|
| Breaking bugs | 9 |
| Security vulnerabilities | 8 |
| Data integrity gaps | 5 |
| Missing database indexes | 3 |
| Unbounded list endpoints (no pagination) | 5 |
| Missing env variables documented | 4 |
| Logging inconsistencies | 4 |
| Missing features (product gaps) | 8 |
| Dependency issues | 3 |
| Operational/DevOps gaps | 5 |

None of these are acceptable in a production system with real learner data.

### 2.2 Core User Pain Points

- **Mentors** have no single view of learner progress across all their groups.
- **Learners** have no visibility into their own progress score or how they compare to peers.
- **All users** receive no in-app notifications — every update requires manually polling the UI.
- **Admins** have no programmatic way to manage users, groups, or moderate content.
- **Ops team** has no structured logs, no request tracing, no alerting on errors.

---

## 3. Product Vision & Goals

**Vision:** StudyHive is the backend of record for structured collaborative learning — from small tutoring cohorts to university-scale deployments.

### 3.1 Goals for 2.0

| Goal ID | Goal | Priority |
|---|---|---|
| G-01 | Fix every confirmed bug from the 1.0 audit | P0 |
| G-02 | Close every security vulnerability | P0 |
| G-03 | Achieve 100% test coverage on critical paths | P0 |
| G-04 | All list endpoints paginated | P0 |
| G-05 | Structured, traceable, queryable logs in production | P0 |
| G-06 | CI/CD pipeline on every PR merge | P0 |
| G-07 | Real-time notifications system | P1 |
| G-08 | Learner progress scoring and leaderboard | P1 |
| G-09 | Admin management API | P1 |
| G-10 | Direct messaging (async) | P2 |

---

## 4. Success Metrics (KPIs)

| Metric | Target | How Measured |
|---|---|---|
| API error rate (5xx) | < 0.1% of all requests | Pino logs + alerting |
| P99 response time | < 300ms for all non-file-upload endpoints | pino-http response time |
| File upload P99 | < 5 seconds for ≤ 5MB | Cloudinary webhook |
| Authentication failure rate on brute force | 100% blocked after 5 attempts / 5 min | Rate limiter logs |
| Test coverage (unit + integration) | ≥ 80% line coverage | Vitest coverage report |
| Zero known CVEs in dependencies | 0 | `npm audit` in CI |
| Zero hardcoded secrets | 0 | git-secrets in CI |
| Uptime | 99.9% monthly | UptimeRobot / healthcheck |
| Graceful shutdown time | < 10 seconds | SIGTERM test in CI |
| Concurrent users without 429 on normal traffic | 10,000 | Load test (k6) |

---

## 5. User Personas

### 5.1 Platform Admin

- **Who:** Internal operator or institutional IT staff
- **Technical level:** Medium — uses API via admin dashboard
- **Needs:**
  - View, suspend, or delete any user account
  - Dissolve any group that violates platform policy
  - See platform-wide analytics (total users, active groups, submission rates)
  - Promote/demote user roles
  - View audit logs of all destructive actions

### 5.2 Group Mentor

- **Who:** Teacher, tutor, senior student, or subject-matter expert
- **Technical level:** Low — uses via frontend
- **Needs:**
  - Create and manage study groups with a single invite code
  - Set structured learning goals with deadlines
  - Create assignments, attach reference materials
  - Review learner submissions with marks and written feedback
  - Post announcements to the group
  - Upload shared resources (PDFs, links, notes)
  - See aggregate progress of all learners in a dashboard
  - Rotate a leaked invite code instantly

### 5.3 Learner

- **Who:** Student, junior professional, or self-learner
- **Technical level:** Low — uses via frontend
- **Needs:**
  - Join a group via invite code
  - See goals assigned to them
  - Submit assignments (file or text)
  - Resubmit if mentor requests revision
  - View their own progress score
  - Browse and download resources in the group
  - Receive notifications for new assignments, deadlines, feedback
  - Leave a group they no longer want to participate in

### 5.4 Guest (Unauthenticated)

- Can only access: `POST /register`, `POST /login`, `GET /verify-email/:token`, `POST /forgot-password`, `POST /reset-password/:token`, `GET /healthcheck`
- All other routes return 401

---

## 6. System Architecture Overview

```
Client (Browser / Mobile)
       │
       ▼
[Reverse Proxy / CDN — Cloudflare or Render's ingress]
       │
       ▼
[Express.js Application — Node.js 20 LTS]
 ├── Helmet (security headers)
 ├── CORS (env-configured allowlist)
 ├── HPP (HTTP parameter pollution)
 ├── express-mongo-sanitize (NoSQL injection)
 ├── express-rate-limit (global + per-route)
 ├── pino-http (structured request logging)
 ├── express.json + urlencoded (16kb body limit)
 ├── cookie-parser (httpOnly refresh token)
 ├── Multer → Cloudinary (file uploads)
 └── Routes → Validators → Controllers → Services
       │
       ▼
[MongoDB Atlas — mongoose ODM]
 ├── Users
 ├── Groups
 ├── GroupMembers
 ├── Goals
 ├── Assignments
 ├── Submissions
 ├── Resources
 ├── Announcements (NEW)
 ├── Notifications (NEW)
 ├── Messages (NEW)
 └── ProgressScores (NEW)
       │
       ▼
[Cloudinary — file storage]
[Brevo (Sendinblue) — transactional email, production]
[Mailtrap — email sandbox, development]
[Redis — optional, for rate limit persistence across instances]
```

### 6.1 Key Design Principles

1. **MVC + Service Layer** — Controllers are thin. All business logic lives in service modules, making it unit-testable.
2. **Async-first** — Every I/O operation is async. `asyncHandler` wraps all controllers.
3. **Fail fast at startup** — If any required env variable is missing, the process exits before binding the port.
4. **Defense in depth** — Every request passes: auth → role check → group-membership check → ownership check.
5. **Idempotent operations** — Retry-safe endpoints behave identically on repeated identical calls.
6. **Structured errors** — Every error has `statusCode`, `message`, and `errors[]`. No unstructured stack traces in production.
7. **Atomic writes** — Any operation creating multiple related documents uses a Mongoose session with a transaction.

---

## 7. Feature Specifications

---

### 7.1 Authentication & Account Management

#### 7.1.1 Register

**Route:** `POST /api/v1/auth/register`  
**Auth required:** No  
**Rate limit:** `ipAuthRate` — 5 requests / 5 min / IP

**Input:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required. 3–50 chars. Trimmed. |
| `email` | string | Required. Valid email. Normalized to lowercase. |
| `password` | string | Required. Min 8 chars. Must have 1 uppercase, 1 lowercase, 1 digit, 1 special char. |
| `role` | string | Optional. Must be `mentor` or `learner` only. **`admin` is not a valid value at registration.** |

**Behaviour:**

1. Validate all fields with express-validator.
2. Check uniqueness by email only (not name).
3. Hash password via bcrypt pre-save hook (rounds = 12).
4. Generate SHA-256-hashed email verification token (raw sent in email, hash stored in DB).
5. Store token + 10-minute expiry.
6. Send verification email via configured email provider.
7. Return 201 with user object (password, tokens excluded).

**Breaking change from 1.0:** `admin` role is no longer accepted at registration. Attempting it returns 400.

---

#### 7.1.2 Verify Email

**Route:** `GET /api/v1/auth/verify-email/:token`  
**Auth required:** No  
**Rate limit:** `globalRate`

**Behaviour:**

1. Hash the raw token from params with SHA-256.
2. Look up user by `emailVerificationToken` + `emailVerificationTokenExpiry > now`.
3. If not found or expired → redirect to `FRONTEND_URL/email-verified?status=failed`.
4. Clear token fields, set `isEmailVerified = true`, clear `refreshToken`.
5. Save with `validateBeforeSave: false`.
6. Redirect to `FRONTEND_URL/email-verified?status=success`.

---

#### 7.1.3 Resend Email Verification

**Route:** `POST /api/v1/auth/resend-email-verification`  
**Auth required:** No  
**Rate limit:** `ipAuthRate` — **5 requests / 5 min / IP** (was missing in 1.0)

**Input:** `email` (required, valid email)

**Behaviour:**

1. Always respond 200 with generic message (prevents user enumeration).
2. Internally: find user by email. If not found or already verified, do nothing.
3. If valid: generate new token, update expiry, send new verification email.

---

#### 7.1.4 Login

**Route:** `POST /api/v1/auth/login`  
**Auth required:** No  
**Rate limit:** `ipAuthRate`

**Input:** `email` (required), `password` (required)

**Behaviour:**

1. Normalize email. Find user by email with `+password` projection.
2. If not found → 401 (not 404 — prevents user enumeration).
3. If not email-verified → 403.
4. Verify password with bcrypt.
5. If wrong → **401** (not 400 — fixed from 1.0).
6. Generate access token (15 min) and refresh token (7 days).
7. Save refresh token hash to DB.
8. Return access token in JSON body + refresh token as `httpOnly; Secure; SameSite=None` cookie.

**Security note:** Do not differentiate "user not found" vs "wrong password" in the error message — both return 401 "Invalid credentials."

---

#### 7.1.5 Logout

**Route:** `POST /api/v1/auth/logout`  
**Auth required:** Yes  
**Rate limit:** `userRate`

**Behaviour:**

1. Verify JWT.
2. Find user by ID. Clear `refreshToken` field.
3. Save.
4. Clear `refreshToken` cookie in response.
5. Return 200.

---

#### 7.1.6 Get Current User

**Route:** `GET /api/v1/auth/me`  
**Auth required:** Yes  
**Rate limit:** `userRate`

**Response:** User object. Excludes password, refreshToken, emailVerificationToken, emailVerificationTokenExpiry.

---

#### 7.1.7 Refresh Access Token

**Route:** `POST /api/v1/auth/refresh-token`  
**Auth required:** No (uses refresh token)  
**Rate limit:** `ipAuthRate`

**Input:** `refreshToken` from httpOnly cookie only. Header-based refresh token acceptance is **removed** in 2.0 (security fix).

**Behaviour:**

1. Extract refresh token from cookie. If missing → 401.
2. Verify JWT signature against `REFRESH_TOKEN_SECRET`.
3. Look up user by decoded `_id`, select `+refreshToken`.
4. If `user.refreshToken !== incomingRefreshToken` → 401 "Refresh token reuse detected." (rotate invalidation)
5. Generate new access token + new refresh token (rotation).
6. Save new refresh token to DB.
7. Set new refresh token cookie.
8. Return new access token in body.

---

#### 7.1.8 Forgot Password

**Route:** `POST /api/v1/auth/forgot-password`  
**Auth required:** No  
**Rate limit:** `ipAuthRate`

**Input:** `email` (required, valid email)

**Behaviour:**

1. Always respond 200 with generic message.
2. Internally: find user. Generate SHA-256 token, set `forgotPasswordToken` + `forgotPasswordExpiry` (10 min).
3. Send reset email with link: `FORGOT_PASSWORD_REDIRECT_URL/<rawToken>`.

---

#### 7.1.9 Reset Password

**Route:** `POST /api/v1/auth/reset-password/:token`  
**Auth required:** No  
**Rate limit:** `ipAuthRate`

**Input:** `newPassword` (required, strong password rules)

**Behaviour:**

1. Hash token param. Look up by `forgotPasswordToken` + `forgotPasswordExpiry > now`.
2. If not found → 401.
3. Set new password (pre-save hook hashes it).
4. Clear `forgotPasswordToken`, `forgotPasswordExpiry`, `refreshToken`.
5. Clear `refreshToken` cookie.
6. Return 200.

---

#### 7.1.10 Change Password

**Route:** `POST /api/v1/auth/change-password`  
**Auth required:** Yes  
**Rate limit:** `userRate`

**Input:** `oldPassword` (required), `newPassword` (required, strong rules)

**Behaviour:**

1. Fetch user with `+password`.
2. Verify `oldPassword` via bcrypt.
3. If wrong → 400 "Invalid old password".
4. Set new password. Clear `refreshToken`.
5. Clear `refreshToken` cookie in response.
6. Return 200.

---

### 7.2 Study Group Management

#### 7.2.1 Create Group

**Route:** `POST /api/v1/groups`  
**Auth required:** Yes  
**Roles:** `mentor` only  
**Rate limit:** `userRate`

**Input:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required. 3–100 chars. |
| `description` | string | Optional. Max 500 chars. |

**Behaviour (atomic transaction):**

1. Validate input.
2. Open Mongoose session.
3. Generate cryptographically random 6-byte hex invite code.
4. Create `Group` document.
5. Create `GroupMember` document with `role: "mentor"`.
6. Commit transaction. On failure, abort and return 500.
7. Return 201 with `groupId`, `name`, `inviteCode`.

---

#### 7.2.2 Join Group

**Route:** `POST /api/v1/groups/join`  
**Auth required:** Yes  
**Roles:** Any authenticated user  
**Rate limit:** `userRate`

**Input:** `inviteCode` (required)

**Behaviour:**

1. Find group by `inviteCode`. If not found → 404.
2. Check if user is already a member → 409.
3. Create `GroupMember` document with `role: "learner"`.
4. Return 200.

---

#### 7.2.3 View All Joined Groups

**Route:** `GET /api/v1/groups`  
**Auth required:** Yes  
**Rate limit:** `userRate`  
**Pagination:** Yes — `?page=1&limit=20`

**Response:** Paginated list of groups the user is a member of, with the user's role in each.

---

#### 7.2.4 Get Group Details

**Route:** `GET /api/v1/groups/:groupId`  
**Auth required:** Yes  
**Rate limit:** `userRate`

**Behaviour:** Caller must be a member of the group. Returns group metadata.

---

#### 7.2.5 Update Group

**Route:** `PUT /api/v1/groups/:groupId`  
**Auth required:** Yes  
**Roles:** `mentor` (global role) AND must be the mentor of *this specific group*  
**Rate limit:** `userRate`

**Input:** `name` (optional), `description` (optional). At least one required.

---

#### 7.2.6 Delete Group

**Route:** `DELETE /api/v1/groups/:groupId`  
**Auth required:** Yes  
**Roles:** Mentor of the specific group OR global `admin`  
**Rate limit:** `userRate`

**Behaviour (cascade, atomic transaction):**

1. Verify caller is group mentor or admin.
2. Open session.
3. Delete all `Submission` documents for all assignments in all goals in this group (and their Cloudinary files).
4. Delete all `Assignment` documents under all goals.
5. Delete all `Goal` documents.
6. Delete all `Resource` documents (and their Cloudinary files).
7. Delete all `Announcement` documents.
8. Delete all `GroupMember` documents.
9. Delete the `Group` document.
10. Commit transaction. On failure, abort and return 500.
11. Return 200.

---

### 7.3 Member Management

#### 7.3.1 View Group Members

**Route:** `GET /api/v1/groups/:groupId/members`  
**Auth required:** Yes — must be a member  
**Pagination:** Yes — `?page=1&limit=50`

**Response:** `userId`, `name`, `email`, `role`, `joinedAt` per member.

---

#### 7.3.2 Remove Member

**Route:** `DELETE /api/v1/groups/:groupId/members/:userId`  
**Auth required:** Yes — must be mentor of this specific group  

**Behaviour:**

1. Confirm caller is mentor of this group.
2. Prevent mentor from removing themselves → 400.
3. Delete `GroupMember` document.
4. Return 200.

---

#### 7.3.3 Leave Group (NEW in 2.0)

**Route:** `POST /api/v1/groups/:groupId/leave`  
**Auth required:** Yes  
**Roles:** Any member, but **not the mentor** (mentor must delete or transfer the group)

**Behaviour:**

1. Confirm caller is a member of the group.
2. If caller is the mentor → 400 "Mentor cannot leave the group. Transfer ownership or delete the group."
3. Delete `GroupMember` document.
4. Return 200.

---

#### 7.3.4 Get Invite Code (Mentor Only)

**Route:** `POST /api/v1/groups/:groupId/invite`  
**Auth required:** Yes — mentor of this group  

**Response:** Current `inviteCode`.

---

#### 7.3.5 Regenerate Invite Code (NEW in 2.0)

**Route:** `PATCH /api/v1/groups/:groupId/invite/regenerate`  
**Auth required:** Yes — mentor of this group  

**Behaviour:**

1. Confirm caller is group mentor.
2. Generate a new 6-byte random hex invite code.
3. Save to group.
4. Return 200 with new `inviteCode`.

**Why:** If an invite link leaks publicly, the mentor must be able to invalidate it immediately.

---

### 7.4 Learning Goals

#### 7.4.1 Create Goal

**Route:** `POST /api/v1/goals/:groupId`  
**Auth required:** Yes — mentor of the specific group  
**Rate limit:** `userRate`

**Input:**

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required. 3–200 chars. |
| `description` | string | Optional. Max 1000 chars. |
| `assignedTo` | string[] | Required. Non-empty array of valid ObjectIds. All must be members of the group. |
| `deadline` | ISO date | Optional. Must be in the future. |

**Behaviour:**

1. Verify caller is group mentor.
2. Validate that every ID in `assignedTo` is a current group member.
3. Create `Goal` document.
4. Send in-app notification to each assigned learner (see §7.10).
5. Return 201.

---

#### 7.4.2 Get Goals by Group

**Route:** `GET /api/v1/goals/:groupId`  
**Auth required:** Yes — must be mentor OR an assigned learner in any goal in this group  
**Pagination:** Yes

**Behaviour:**

- Mentor sees all goals in the group.
- Learner sees goals they are assigned to only.

---

#### 7.4.3 Get My Goals

**Route:** `GET /api/v1/goals/me`  
**Auth required:** Yes  
**Pagination:** Yes

**Response:** All goals across all groups where `assignedTo` includes the caller.

---

#### 7.4.4 Update Goal

**Route:** `PUT /api/v1/goals/:goalId`  
**Auth required:** Yes — mentor of the group this goal belongs to  

**Input:** `title`, `description`, `status`, `assignedTo` — at least one required.

**Behaviour:**

- If `assignedTo` is being changed, validate new member IDs against group members.

---

#### 7.4.5 Delete Goal

**Route:** `DELETE /api/v1/goals/:goalId`  
**Auth required:** Yes — mentor of the group  

**Behaviour (cascade):**

1. Find all assignments under this goal.
2. For each assignment: delete all submissions (and their Cloudinary files).
3. Delete all assignments.
4. Delete the goal.

---

### 7.5 Assignment Management

#### 7.5.1 Create Assignment

**Route:** `POST /api/v1/assignments/:goalId`  
**Auth required:** Yes — mentor of the group this goal belongs to  

**Input:**

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required. 3–200 chars. |
| `description` | string | Optional. Max 2000 chars. |
| `deadline` | ISO date | Optional. Must be in the future. |
| `referenceMaterials` | string[] | Optional. Array of URLs. Each must be a valid URL. |
| `maxMarks` | number | Optional. Min 1. Default 100. |

**Behaviour:**

1. Verify goal exists.
2. Verify caller is mentor of the goal's group.
3. Create assignment.
4. Send notification to all learners in the group (assigned to the goal).
5. Return 201.

---

#### 7.5.2 Get Assignments by Goal

**Route:** `GET /api/v1/assignments/:goalId`  
**Auth required:** Yes — must be a member of the group  
**Pagination:** Yes — `?page=1&limit=20`

**Filter:** `?isActive=true|false` (default: true)

---

#### 7.5.3 Update Assignment

**Route:** `PUT /api/v1/assignments/:assignmentId`  
**Auth required:** Yes — original creator (verified against `createdBy`)  

**Input:** `title`, `description`, `deadline`, `referenceMaterials`, `maxMarks`, `isActive` — at least one required.

---

#### 7.5.4 Delete Assignment (Soft Delete)

**Route:** `DELETE /api/v1/assignments/:assignmentId`  
**Auth required:** Yes — creator of the assignment  

**Behaviour:** Sets `isActive = false`. No cascade needed since submissions are still historically valid.

---

### 7.6 Assignment Submissions

#### 7.6.1 Submit Assignment

**Route:** `POST /api/v1/submissions/assignments/:assignmentId/submit`  
**Auth required:** Yes  
**Roles:** `learner` (global role)  
**Rate limit:** `userRate`

**Input:** `file` (multipart, max 5MB, allowed: jpeg, png, webp, pdf) OR `submittedText` (string, max 5000 chars) — at least one required.

**Behaviour:**

1. Check assignment exists and is active.
2. Check deadline not passed.
3. Verify caller is a group member.
4. Check for existing submission:
   - No existing submission → create new.
   - Existing submission with `status: "revision_required"` → allow resubmission.
   - Any other existing status → 400 "Assignment already submitted."
5. **File handling (order matters):**
   a. If file provided: upload to Cloudinary first. On failure: throw error, old file untouched.
   b. Only after successful upload: delete old Cloudinary file (if resubmission).
6. Create or update `Submission` document.
7. Send notification to mentor.
8. Return 201.

---

#### 7.6.2 Review Submission

**Route:** `PUT /api/v1/submissions/submissions/:submissionId/review`  
**Auth required:** Yes  
**Roles:** `mentor` (global role)  

**Input:** `status` (required: "reviewed" | "revision_required"), `feedback` (optional), `marksObtained` (optional, number, 0 ≤ marks ≤ assignment.maxMarks)

**Behaviour:**

1. Find submission. If not found → 404.
2. Check submission status is `"submitted"` → else 400.
3. Find assignment. Verify caller is the mentor of the group.
4. Validate `marksObtained` ≤ `assignment.maxMarks`.
5. Update submission.
6. Send notification to learner with feedback.
7. Return 200.

---

#### 7.6.3 Get Submissions by Assignment

**Route:** `GET /api/v1/submissions/assignments/:assignmentId/submissions`  
**Auth required:** Yes  
**Roles:** `mentor`  
**Pagination:** Yes — `?page=1&limit=20`

**Filter:** `?status=submitted|reviewed|revision_required|pending`

**Behaviour:** Verify caller is mentor of the assignment's group.

---

#### 7.6.4 Get My Submission (NEW in 2.0)

**Route:** `GET /api/v1/submissions/assignments/:assignmentId/my-submission`  
**Auth required:** Yes  
**Roles:** `learner`  

**Response:** Learner's own submission for the assignment. If none → 404.

---

### 7.7 Study Resources

#### 7.7.1 Upload Resource

**Route:** `POST /api/v1/resources/:groupId`  
**Auth required:** Yes — mentor of the specific group  

**Input:**

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required. 3–200 chars. |
| `description` | string | Optional. Max 1000 chars. |
| `type` | string | Required. One of: `file`, `link`, `note`. |
| `linkUrl` | string | Required if `type === "link"`. Valid URL. |
| `file` | multipart | Required if `type === "file"`. Max 5MB. jpeg, png, webp, pdf. |

**Description required if `type === "note"`.**

---

#### 7.7.2 Get Resources by Group

**Route:** `GET /api/v1/resources/:groupId`  
**Auth required:** Yes — must be a group member  
**Pagination:** Yes — `?page=1&limit=20`

**Filters:** `?type=file|link|note`, `?sortBy=recent|oldest|title`

---

#### 7.7.3 Delete Resource

**Route:** `DELETE /api/v1/resources/:resourceId`  
**Auth required:** Yes — creator of the resource OR global `admin`  

**Behaviour:**

1. If file type: destroy Cloudinary asset.
2. Delete DB document.

---

### 7.8 Announcements

#### 7.8.1 Create Announcement

**Route:** `POST /api/v1/announcements/:groupId`  
**Auth required:** Yes — mentor of the group  

**Input:**

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required. 3–200 chars. |
| `body` | string | Required. Max 2000 chars. |
| `isPinned` | boolean | Optional. Default false. |

**Behaviour:**

1. Create `Announcement` document.
2. Create `Notification` for every member of the group.
3. Return 201.

---

#### 7.8.2 Get Announcements by Group

**Route:** `GET /api/v1/announcements/:groupId`  
**Auth required:** Yes — must be a group member  
**Pagination:** Yes — `?page=1&limit=20`

**Sort:** Pinned first, then `createdAt: -1`.

---

#### 7.8.3 Update Announcement

**Route:** `PUT /api/v1/announcements/:announcementId`  
**Auth required:** Yes — creator of the announcement  

**Input:** `title`, `body`, `isPinned` — at least one required.

---

#### 7.8.4 Delete Announcement

**Route:** `DELETE /api/v1/announcements/:announcementId`  
**Auth required:** Yes — creator OR group mentor OR admin  

---

### 7.9 Mentor Dashboard & Analytics

#### 7.9.1 Get Mentor Dashboard

**Route:** `GET /api/v1/dashboard`  
**Auth required:** Yes — `mentor` or `admin`  

**Response:**

```json
{
  "stats": {
    "groups": 3,
    "goals": 12,
    "assignments": 28,
    "totalSubmissions": 145,
    "reviewedSubmissions": 120,
    "pendingReviews": 25,
    "learners": 40
  },
  "recentSubmissions": [...],
  "recentAssignments": [...],
  "completionRate": "82.75%"
}
```

**Bug fix from 1.0:** `ApiResponse` arguments are in the correct order: `(statusCode, message, data)`.

---

### 7.10 Notifications (NEW in 2.0)

A lightweight in-app notification system. Not real-time (no WebSocket in 2.0 — deferred to 3.0). Polling-based.

#### 7.10.1 Get My Notifications

**Route:** `GET /api/v1/notifications`  
**Auth required:** Yes  
**Pagination:** Yes — `?page=1&limit=20`  
**Filter:** `?isRead=true|false`

**Response:**

```json
{
  "notifications": [
    {
      "_id": "...",
      "type": "new_assignment",
      "title": "New Assignment Posted",
      "body": "Your mentor posted 'Week 3 Quiz' in Data Structures.",
      "isRead": false,
      "createdAt": "..."
    }
  ],
  "unreadCount": 5
}
```

---

#### 7.10.2 Mark Notification as Read

**Route:** `PATCH /api/v1/notifications/:notificationId/read`  
**Auth required:** Yes — notification must belong to caller  

---

#### 7.10.3 Mark All Notifications as Read

**Route:** `PATCH /api/v1/notifications/mark-all-read`  
**Auth required:** Yes  

---

#### 7.10.4 Delete Notification

**Route:** `DELETE /api/v1/notifications/:notificationId`  
**Auth required:** Yes — must be the recipient  

---

#### 7.10.5 Notification Types

| Type | Triggered By |
|---|---|
| `new_assignment` | Mentor creates assignment |
| `submission_reviewed` | Mentor reviews submission |
| `revision_required` | Mentor requests revision |
| `new_announcement` | Mentor posts announcement |
| `goal_assigned` | Mentor assigns a goal to learner |
| `deadline_reminder` | Cron job 24h before deadline |

---

### 7.11 Direct Messaging (NEW in 2.0)

Asynchronous one-on-one messaging between members of the same group. Not a real-time chat — messages are fetched by polling.

#### 7.11.1 Send Message

**Route:** `POST /api/v1/messages`  
**Auth required:** Yes  
**Rate limit:** `userRate`

**Input:**

| Field | Type | Rules |
|---|---|---|
| `recipientId` | ObjectId | Required. Valid user ID. |
| `groupId` | ObjectId | Required. Both sender and recipient must be members. |
| `content` | string | Required. Max 2000 chars. |

**Behaviour:**

1. Verify both sender and recipient are members of the specified group.
2. Create `Message` document.
3. Create `Notification` for recipient.
4. Return 201.

---

#### 7.11.2 Get Conversation

**Route:** `GET /api/v1/messages/:userId`  
**Auth required:** Yes  
**Pagination:** Yes — `?page=1&limit=50`

**Response:** All messages between the caller and `userId`, ordered by `createdAt: -1`.

**Behaviour:** Only returns messages where both participants share at least one group.

---

#### 7.11.3 Delete Message

**Route:** `DELETE /api/v1/messages/:messageId`  
**Auth required:** Yes — sender only  

**Behaviour:** Soft delete — sets `deletedAt` timestamp. Recipient still sees "[message deleted]" placeholder.

---

### 7.12 Leaderboard & Progress Tracking (NEW in 2.0)

#### 7.12.1 Get Leaderboard by Group

**Route:** `GET /api/v1/leaderboard/:groupId`  
**Auth required:** Yes — must be a group member  

**Response:**

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "...",
      "name": "Alice",
      "totalMarks": 285,
      "maxPossibleMarks": 300,
      "scorePercent": 95.0,
      "submissionsReviewed": 3,
      "revisionsRequested": 0
    }
  ]
}
```

**Scoring formula:**

```
scorePercent = (sum of marksObtained across all reviewed submissions) /
               (sum of maxMarks for corresponding assignments) * 100
```

Only counts submissions with `status: "reviewed"`.

---

#### 7.12.2 Get My Progress in a Group

**Route:** `GET /api/v1/leaderboard/:groupId/me`  
**Auth required:** Yes — must be a group member  

**Response:** Same as a single leaderboard entry, plus: `goalsAssigned`, `goalsCompleted`, `assignmentsSubmitted`, `pendingAssignments`.

---

### 7.13 Admin Panel Endpoints (NEW in 2.0)

All routes under `/api/v1/admin` require JWT + global role `admin`.

#### 7.13.1 List All Users

**Route:** `GET /api/v1/admin/users`  
**Pagination:** Yes  
**Filter:** `?role=admin|mentor|learner`, `?isEmailVerified=true|false`, `?search=<name or email>`  

---

#### 7.13.2 Get User by ID

**Route:** `GET /api/v1/admin/users/:userId`  

**Response:** Full user profile including role, verification status, group memberships count.

---

#### 7.13.3 Update User Role

**Route:** `PATCH /api/v1/admin/users/:userId/role`  
**Input:** `role` (required, one of `admin | mentor | learner`)  

---

#### 7.13.4 Suspend User

**Route:** `PATCH /api/v1/admin/users/:userId/suspend`  

**Behaviour:**

1. Set `isSuspended = true` on user.
2. Clear their refresh token (force logout).
3. Future login attempts return 403 "Account suspended."

---

#### 7.13.5 Unsuspend User

**Route:** `PATCH /api/v1/admin/users/:userId/unsuspend`  

---

#### 7.13.6 Delete User

**Route:** `DELETE /api/v1/admin/users/:userId`  

**Behaviour (cascade):**

1. Remove all group memberships.
2. Soft-delete submissions (mark `deletedByAdmin: true`).
3. Delete their notifications and messages.
4. Delete user account.

---

#### 7.13.7 List All Groups

**Route:** `GET /api/v1/admin/groups`  
**Pagination:** Yes  
**Filter:** `?search=<name>`

---

#### 7.13.8 Force Delete Group

**Route:** `DELETE /api/v1/admin/groups/:groupId`  

Same cascade as normal group deletion (§7.2.6).

---

#### 7.13.9 Platform Stats

**Route:** `GET /api/v1/admin/stats`  

```json
{
  "totalUsers": 1200,
  "verifiedUsers": 1150,
  "suspendedUsers": 3,
  "totalGroups": 85,
  "totalGoals": 340,
  "totalAssignments": 820,
  "totalSubmissions": 4500,
  "reviewedSubmissions": 4100,
  "totalResources": 650,
  "activeUsersLast30Days": 870
}
```

---

### 7.14 System Health & Monitoring

#### 7.14.1 Healthcheck

**Route:** `GET /api/v1/healthcheck`  
**Auth required:** No  
**Rate limit:** `globalRate`

**Response:**

```json
{
  "status": "UP",
  "database": "CONNECTED",
  "uptime": 12345.67,
  "timestamp": "2026-04-09T13:53:49.717Z"
}
```

HTTP 200 if DB connected, 503 if disconnected.

---

## 8. Complete API Endpoint Catalogue

### Auth — `/api/v1/auth`

| Method | Path | Auth | Role | Rate Limit |
|---|---|---|---|---|
| POST | `/register` | No | Any | `ipAuthRate` |
| POST | `/login` | No | Any | `ipAuthRate` |
| POST | `/logout` | Yes | Any | `userRate` |
| GET | `/me` | Yes | Any | `userRate` |
| POST | `/refresh-token` | No (cookie) | Any | `ipAuthRate` |
| GET | `/verify-email/:token` | No | Any | `globalRate` |
| POST | `/resend-email-verification` | No | Any | `ipAuthRate` |
| POST | `/forgot-password` | No | Any | `ipAuthRate` |
| POST | `/reset-password/:token` | No | Any | `ipAuthRate` |
| POST | `/change-password` | Yes | Any | `userRate` |

### Groups — `/api/v1/groups`

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/` | Yes | Any |
| POST | `/` | Yes | mentor |
| POST | `/join` | Yes | Any |
| GET | `/:groupId` | Yes | group member |
| PUT | `/:groupId` | Yes | group mentor |
| DELETE | `/:groupId` | Yes | group mentor OR admin |
| GET | `/:groupId/members` | Yes | group member |
| DELETE | `/:groupId/members/:userId` | Yes | group mentor |
| POST | `/:groupId/leave` | Yes | group member (non-mentor) |
| POST | `/:groupId/invite` | Yes | group mentor |
| PATCH | `/:groupId/invite/regenerate` | Yes | group mentor |

### Goals — `/api/v1/goals`

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/:groupId` | Yes | group mentor |
| GET | `/:groupId` | Yes | group mentor or assigned learner |
| GET | `/me` | Yes | Any |
| PUT | `/:goalId` | Yes | group mentor |
| DELETE | `/:goalId` | Yes | group mentor |

### Assignments — `/api/v1/assignments`

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/:goalId` | Yes | group mentor |
| GET | `/:goalId` | Yes | group member |
| PUT | `/:assignmentId` | Yes | assignment creator |
| DELETE | `/:assignmentId` | Yes | assignment creator |

### Submissions — `/api/v1/submissions`

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/assignments/:assignmentId/submit` | Yes | learner |
| PUT | `/submissions/:submissionId/review` | Yes | mentor |
| GET | `/assignments/:assignmentId/submissions` | Yes | mentor |
| GET | `/assignments/:assignmentId/my-submission` | Yes | learner |

### Resources — `/api/v1/resources`

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/:groupId` | Yes | group mentor |
| GET | `/:groupId` | Yes | group member |
| DELETE | `/:resourceId` | Yes | creator or admin |

### Announcements — `/api/v1/announcements`

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/:groupId` | Yes | group mentor |
| GET | `/:groupId` | Yes | group member |
| PUT | `/:announcementId` | Yes | creator |
| DELETE | `/:announcementId` | Yes | creator or admin |

### Notifications — `/api/v1/notifications`

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/` | Yes | Any |
| PATCH | `/:notificationId/read` | Yes | recipient |
| PATCH | `/mark-all-read` | Yes | Any |
| DELETE | `/:notificationId` | Yes | recipient |

### Messages — `/api/v1/messages`

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/` | Yes | Any |
| GET | `/:userId` | Yes | Any |
| DELETE | `/:messageId` | Yes | sender |

### Leaderboard — `/api/v1/leaderboard`

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/:groupId` | Yes | group member |
| GET | `/:groupId/me` | Yes | group member |

### Admin — `/api/v1/admin`

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/users` | Yes | admin |
| GET | `/users/:userId` | Yes | admin |
| PATCH | `/users/:userId/role` | Yes | admin |
| PATCH | `/users/:userId/suspend` | Yes | admin |
| PATCH | `/users/:userId/unsuspend` | Yes | admin |
| DELETE | `/users/:userId` | Yes | admin |
| GET | `/groups` | Yes | admin |
| DELETE | `/groups/:groupId` | Yes | admin |
| GET | `/stats` | Yes | admin |

### Dashboard — `/api/v1/dashboard`

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/` | Yes | mentor or admin |

### Healthcheck — `/api/v1/healthcheck`

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/` | No | Any |

---

## 9. Data Models (Full Schema)

### 9.1 User

```js
{
  name:                         String,  // required, 3-50, trimmed, indexed
  email:                        String,  // required, unique, lowercase, indexed
  password:                     String,  // required, select: false
  role:                         String,  // enum: ["admin","mentor","learner"], default: "learner"
  isEmailVerified:              Boolean, // default: false
  isSuspended:                  Boolean, // default: false — NEW in 2.0
  refreshToken:                 String,  // select: false
  forgotPasswordToken:          String,  // indexed
  forgotPasswordExpiry:         Date,    // indexed
  emailVerificationToken:       String,  // indexed
  emailVerificationTokenExpiry: Date,
  createdAt, updatedAt          // timestamps
}
```

**Indexes:** `email` (unique), `emailVerificationToken`, `forgotPasswordToken`  
**Methods:** `generateAccessToken()`, `generateRefreshToken()`, `generateTemporaryToken()`, `isPasswordCorrect(password)`, `isSuspendedCheck()`  
**Pre-save hook:** Hash password on modify.

---

### 9.2 Group

```js
{
  name:        String,   // required, 3-100, trimmed, indexed
  description: String,   // optional, max 500
  mentor:      ObjectId, // ref: User, required, indexed
  inviteCode:  String,   // unique, indexed
  createdAt, updatedAt
}
```

**Removed from 1.0:** The dead `members: []` array field.

---

### 9.3 GroupMember

```js
{
  group:     ObjectId, // ref: Group, required
  user:      ObjectId, // ref: User, required
  role:      String,   // enum: ["mentor","learner"], required
  createdAt, updatedAt
}
```

**Indexes:** Compound `{ group: 1, user: 1 }` unique — prevents duplicate membership.

---

### 9.4 Goal

```js
{
  title:       String,     // required, 3-200, indexed
  description: String,     // optional, max 1000
  group:       ObjectId,   // ref: Group, required, indexed
  assignedTo:  ObjectId[], // ref: User
  status:      String,     // enum: ["not_started","ongoing","completed"], default: "not_started"
  deadline:    Date,       // optional, indexed
  createdBy:   ObjectId,   // ref: User, required
  createdAt, updatedAt
}
```

---

### 9.5 Assignment

```js
{
  title:              String,     // required, 3-200, indexed
  description:        String,     // optional, max 2000
  goalId:             ObjectId,   // ref: Goal, required, indexed
  groupId:            ObjectId,   // ref: Group, required, indexed
  createdBy:          ObjectId,   // ref: User, required
  deadline:           Date,       // optional, indexed
  referenceMaterials: String[],   // array of valid URLs
  maxMarks:           Number,     // default: 100, min: 1
  isActive:           Boolean,    // default: true
  createdAt, updatedAt
}
```

**Compound index:** `{ goalId: 1, isActive: 1 }`

---

### 9.6 Submission

```js
{
  assignmentId:       ObjectId, // ref: Assignment, required
  userId:             ObjectId, // ref: User, required
  submittedFile:      String,   // Cloudinary secure URL, optional
  cloudinaryPublicId: String,   // for deletion
  submittedText:      String,   // optional, max 5000, trimmed
  status:             String,   // enum: ["pending","submitted","reviewed","revision_required"]
  marksObtained:      Number,   // optional
  feedback:           String,   // optional, trimmed
  submittedAt:        Date,
  reviewedAt:         Date,
  deletedByAdmin:     Boolean,  // default: false — NEW in 2.0
  createdAt, updatedAt
}
```

**Compound unique index:** `{ assignmentId: 1, userId: 1 }`

---

### 9.7 Resource

```js
{
  title:              String,   // required, 3-200, trimmed
  description:        String,   // optional, max 1000
  type:               String,   // enum: ["file","link","note"], required
  group:              ObjectId, // ref: Group, required, indexed
  uploadedBy:         ObjectId, // ref: User, required
  linkUrl:            String,   // required if type===link
  fileUrl:            String,   // Cloudinary URL, required if type===file
  cloudinaryPublicId: String,
  createdAt, updatedAt
}
```

---

### 9.8 Announcement (NEW in 2.0)

```js
{
  group:     ObjectId, // ref: Group, required, indexed
  createdBy: ObjectId, // ref: User, required
  title:     String,   // required, 3-200
  body:      String,   // required, max 2000
  isPinned:  Boolean,  // default: false
  createdAt, updatedAt
}
```

---

### 9.9 Notification (NEW in 2.0)

```js
{
  recipient:  ObjectId, // ref: User, required, indexed
  type:       String,   // enum: [...notification types], required
  title:      String,   // required
  body:       String,   // required
  refId:      ObjectId, // polymorphic — the related document ID
  refModel:   String,   // "Assignment" | "Submission" | "Announcement" etc.
  isRead:     Boolean,  // default: false, indexed
  createdAt, updatedAt
}
```

**Compound index:** `{ recipient: 1, isRead: 1, createdAt: -1 }`

---

### 9.10 Message (NEW in 2.0)

```js
{
  sender:    ObjectId, // ref: User, required, indexed
  recipient: ObjectId, // ref: User, required, indexed
  groupId:   ObjectId, // ref: Group, required — constrains to shared group
  content:   String,   // required, max 2000, trimmed
  deletedAt: Date,     // soft delete, default: null
  createdAt, updatedAt
}
```

**Compound index:** `{ sender: 1, recipient: 1, createdAt: -1 }` and `{ recipient: 1, sender: 1, createdAt: -1 }`

---

## 10. Permission Matrix

| Feature | Admin | Mentor | Learner | Guest |
|---|---|---|---|---|
| Register | ✓ | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ | ✓ |
| Logout | ✓ | ✓ | ✓ | ✗ |
| Verify Email | ✓ | ✓ | ✓ | ✓ |
| Forgot/Reset Password | ✓ | ✓ | ✓ | ✓ |
| Create Study Group | ✓ | ✓ | ✗ | ✗ |
| Join Group | ✓ | ✓ | ✓ | ✗ |
| Update Group | ✓ | Own group only | ✗ | ✗ |
| Delete Group | ✓ | Own group only | ✗ | ✗ |
| Leave Group | ✗ (use delete) | ✗ | ✓ | ✗ |
| View Group Members | ✓ | ✓ (member) | ✓ (member) | ✗ |
| Remove Member | ✓ | Own group only | ✗ | ✗ |
| Regenerate Invite Code | ✓ | Own group only | ✗ | ✗ |
| Create Goal | ✓ | Own group only | ✗ | ✗ |
| View Goals | ✓ | Own groups | Assigned only | ✗ |
| Update/Delete Goal | ✓ | Own group only | ✗ | ✗ |
| Create Assignment | ✓ | Own group only | ✗ | ✗ |
| View Assignments | ✓ | Own groups | Group member | ✗ |
| Update/Delete Assignment | ✓ | Creator only | ✗ | ✗ |
| Submit Assignment | ✗ | ✗ | ✓ | ✗ |
| Review Submission | ✓ | Own group only | ✗ | ✗ |
| View All Submissions | ✓ | Own group only | ✗ | ✗ |
| View Own Submission | ✗ | ✗ | ✓ | ✗ |
| Upload Resource | ✓ | Own group only | ✗ | ✗ |
| View Resources | ✓ | Group member | Group member | ✗ |
| Delete Resource | ✓ | Creator only | ✗ | ✗ |
| Post Announcement | ✓ | Own group only | ✗ | ✗ |
| View Announcements | ✓ | Group member | Group member | ✗ |
| Update/Delete Announcement | ✓ | Creator only | ✗ | ✗ |
| View Notifications | ✓ | ✓ | ✓ | ✗ |
| Send Message | ✓ | ✓ | ✓ | ✗ |
| View Leaderboard | ✓ | ✓ (member) | ✓ (member) | ✗ |
| Admin: View All Users | ✓ | ✗ | ✗ | ✗ |
| Admin: Suspend User | ✓ | ✗ | ✗ | ✗ |
| Admin: Change Role | ✓ | ✗ | ✗ | ✗ |
| Admin: Platform Stats | ✓ | ✗ | ✗ | ✗ |
| Admin: Force Delete Group | ✓ | ✗ | ✗ | ✗ |
| View Dashboard | ✓ | ✓ (own data) | ✗ | ✗ |
| Healthcheck | ✓ | ✓ | ✓ | ✓ |

---

## 11. Security Requirements

### 11.1 Authentication

- **JWT access token** — 15-minute expiry — sent in `Authorization: Bearer` header.
- **JWT refresh token** — 7-day expiry — sent ONLY via `httpOnly; Secure; SameSite=None` cookie. Never accepted from request headers or body.
- **Refresh token rotation** — every `/refresh-token` call issues a new refresh token and invalidates the old one.
- **Refresh token stored hashed** in DB (SHA-256). On validation, compare stored hash to the incoming cookie's hash.
- **Token secret minimum entropy** — `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` must be at least 64 characters long. Validated at startup.
- **Suspended user check** — `verifyJwt` middleware must check `isSuspended` and return 403 if true.

### 11.2 Password Security

- bcrypt with `saltRounds = 12` (increased from 10 in 1.0).
- Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
- Password never returned in any API response (Mongoose `select: false`).
- Password hashed in pre-save hook — never in controller logic.

### 11.3 Input Sanitization

- **`express-mongo-sanitize`** — installed as global middleware before routes. Strips `$` and `.` from all request bodies, params, and query strings to prevent NoSQL injection.
- **`hpp`** — installed globally. Prevents HTTP parameter pollution.
- **`express.json({ limit: "16kb" })`** — prevents large-payload DoS.
- **`helmet`** — sets all recommended security HTTP headers.
- **`express-validator`** on every route — explicit allow-list of accepted fields.

### 11.4 CORS

```js
cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"]
})
```

`CORS_ORIGIN` is read from environment. Multiple origins supported as comma-separated list. Never hardcoded.

### 11.5 Role & Ownership Verification

Every protected operation applies a **three-layer check**:
1. JWT validity (auth middleware).
2. Global role check (authorizeRoles middleware) — where applicable.
3. Resource ownership / group-membership check (in controller) — always done against fresh DB data, never trusting JWT claims alone.

### 11.6 File Upload Security

- Allowlist of mime types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Max file size: 5MB.
- Temp files stored in `os.tmpdir()` (NOT under `public/` which is statically served).
- Temp files deleted immediately after Cloudinary upload or on upload failure.
- Filenames randomized — user-supplied `originalname` is never used as-is on disk.

### 11.7 Email Token Security

- Verification and password reset tokens: 20 random bytes → 40-char hex.
- Hash (SHA-256) stored in DB. Raw token sent in email link.
- Token expiry: 10 minutes.
- Tokens cleared from DB immediately after use.
- Login blocked until email is verified.

### 11.8 Startup Security Validation

On startup, before binding to port:

```js
const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "BASE_URL",
  "FRONTEND_URL",
  "FORGOT_PASSWORD_REDIRECT_URL",
  "CORS_ORIGIN",
  "NODE_ENV"
];

for (const v of REQUIRED_ENV_VARS) {
  if (!process.env[v]) {
    console.error(`❌ Missing required environment variable: ${v}`);
    process.exit(1);
  }
}

if (process.env.ACCESS_TOKEN_SECRET.length < 64) {
  console.error("❌ ACCESS_TOKEN_SECRET must be at least 64 characters");
  process.exit(1);
}
```

### 11.9 No Route 404 Fallthrough

A catch-all route handler after all route declarations:

```js
app.use((req, res, next) => next(new ApiError(404, "Route not found")));
```

---

## 12. Validation Rules

### Global Conventions

- All string inputs trimmed at validator level.
- Empty strings rejected (`.notEmpty()`).
- All ObjectId params validated with `.isMongoId()`.
- `express-validator` v7 — use `.path` not `.param` in `errors.array()`.

### Per-Entity Rules

| Field | Rule |
|---|---|
| `name` (user) | 3–50 chars |
| `name` (group) | 3–100 chars |
| `email` | Valid RFC 5322 email. Normalized to lowercase. |
| `password` | Min 8. 1 upper, 1 lower, 1 digit, 1 symbol. |
| `role` (at registration) | One of `mentor`, `learner`. **Not `admin`.** |
| `title` (goal/assignment) | 3–200 chars |
| `description` | Max 1000 or 2000 chars depending on entity |
| `deadline` | ISO 8601 date. Must be in the future at time of creation. |
| `maxMarks` | Number. Min 1. |
| `marksObtained` | Number. Min 0. Max `assignment.maxMarks`. |
| `type` (resource) | One of `file`, `link`, `note` |
| `content` (message) | 1–2000 chars |
| `inviteCode` | 12-char hex string |
| File size | ≤ 5 * 1024 * 1024 bytes |
| File mimetype | One of `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |

---

## 13. Error Handling Standard

### 13.1 Error Response Shape

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

`statusCode` is **always included** in the error response body in 2.0, matching the HTTP status code. This aligns with the success response wrapper.

### 13.2 HTTP Status Code Assignments

| Scenario | Code |
|---|---|
| Success with created resource | 201 |
| Success | 200 |
| Validation error | 400 |
| Wrong password / invalid credentials | 401 |
| Email not verified | 403 |
| Suspended account | 403 |
| Insufficient permissions | 403 |
| Resource not found | 404 |
| Duplicate resource (already member, etc.) | 409 |
| Rate limit exceeded | 429 |
| Internal server / DB error | 500 |
| Service unavailable (DB down) | 503 |

### 13.3 Error Handler Behaviour

- In **development**: includes `stack` in structured log.
- In **production**: `stack` is never logged or returned to client.
- Mongoose `CastError` (invalid ObjectId format) → mapped to 400.
- Mongoose `ValidationError` → mapped to 400 with field-level errors.
- Mongoose `E11000` (duplicate key) → mapped to 409.
- JWT `TokenExpiredError` → 401 "Access token expired."
- JWT `JsonWebTokenError` → 401 "Invalid access token."
- All unhandled errors logged via pino at `error` level.

---

## 14. Performance & Scalability Requirements

### 14.1 Response Time Targets

| Endpoint Category | P50 | P99 |
|---|---|---|
| Auth endpoints | < 50ms | < 200ms |
| CRUD (no file) | < 30ms | < 150ms |
| List/search with pagination | < 50ms | < 200ms |
| Dashboard aggregation | < 100ms | < 400ms |
| File upload (5MB) | < 2s | < 5s |
| Leaderboard calculation | < 80ms | < 300ms |

### 14.2 Pagination

All list endpoints return at most 100 records per page. Default page size: 20. See §19.

### 14.3 Database Indexes (Complete List)

| Collection | Index |
|---|---|
| User | `email` (unique) |
| User | `emailVerificationToken` |
| User | `forgotPasswordToken` |
| Group | `inviteCode` (unique) |
| Group | `mentor` |
| GroupMember | `{ group, user }` (unique compound) |
| GroupMember | `user` |
| Goal | `group` |
| Goal | `assignedTo` |
| Goal | `title` |
| Assignment | `{ goalId, isActive }` (compound) |
| Assignment | `groupId` |
| Assignment | `deadline` |
| Submission | `{ assignmentId, userId }` (unique compound) |
| Submission | `status` |
| Resource | `group` |
| Announcement | `group` |
| Notification | `{ recipient, isRead, createdAt: -1 }` (compound) |
| Message | `{ sender, recipient, createdAt: -1 }` (compound) |
| Message | `{ recipient, sender, createdAt: -1 }` (compound) |

### 14.4 Mongoose Connection Options

```js
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 14.5 Caching

In 2.0, leaderboard data is computed on request. In 3.0, a Redis layer will cache leaderboard results for 60 seconds per group.

---

## 15. File Upload Specification

### Storage Architecture

```
HTTP Request (multipart/form-data)
        │
        ▼
Multer diskStorage → os.tmpdir()/<random-filename>.<ext>
        │
        ▼
uploadToCloudinary(localPath, mimetype)
  ├── resource_type: "image" if mimetype starts with "image/"
  └── resource_type: "raw" for PDF
        │
        ▼
Cloudinary (folder: "studyhive/<groupId>")
        │
        ├── On success: unlink temp file, return { secureUrl, publicId }
        └── On failure: unlink temp file, rethrow
```

### File Deletion

When a resource or submission file is deleted:
```js
await cloudinary.uploader.destroy(publicId, { resource_type: ... });
```

Resource type must be preserved at upload time and stored alongside `cloudinaryPublicId` to enable correct deletion.

### Multer Configuration

```js
multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname))
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    cb(allowed.includes(file.mimetype) ? null : new ApiError(400, "Invalid file type"), allowed.includes(file.mimetype));
  }
})
```

---

## 16. Email Notification Specification

### Providers

| Environment | Provider | Configuration |
|---|---|---|
| Development | Mailtrap SMTP | `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USER`, `MAILTRAP_PASS` |
| Production | Brevo HTTP API | `BREVO_API_KEY`, `MAIL_FROM` |

### Email Types

| Type | Subject | Trigger |
|---|---|---|
| Email Verification | "Verify your StudyHive account" | Registration, Resend |
| Password Reset | "Reset your StudyHive password" | Forgot password |
| Submission Reviewed | "Your submission has been reviewed" | Mentor review |
| Revision Required | "Revision required for your submission" | Mentor revision request |
| New Assignment | "New assignment posted in [Group]" | Assignment creation |
| Deadline Reminder | "Assignment deadline tomorrow: [Title]" | Cron: 24h before deadline |

All emails use Mailgen templates with StudyHive branding.

### Error Handling

Email failures are **logged but do not fail the HTTP request**. Registration, verification, and password reset emails are exceptions — if they fail, a 500 is returned since the feature cannot function without email delivery.

---

## 17. Infrastructure & DevOps Requirements

### 17.1 Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Default: 3000 |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URI` | Yes | Full MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Yes | Min 64 chars, random |
| `ACCESS_TOKEN_EXPIRY` | No | Default: `15m` |
| `REFRESH_TOKEN_SECRET` | Yes | Min 64 chars, random |
| `REFRESH_TOKEN_EXPIRY` | No | Default: `7d` |
| `BASE_URL` | Yes | Full API base URL, e.g. `https://api.studyhive.app` |
| `FRONTEND_URL` | Yes | e.g. `https://studyhive-web.vercel.app` |
| `FORGOT_PASSWORD_REDIRECT_URL` | Yes | e.g. `https://studyhive-web.vercel.app/reset-password` |
| `CORS_ORIGIN` | Yes | Comma-separated allowed origins |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account |
| `CLOUDINARY_API_KEY` | Yes | |
| `CLOUDINARY_API_SECRET` | Yes | |
| `MAILTRAP_HOST` | Dev | SMTP for development |
| `MAILTRAP_PORT` | Dev | |
| `MAILTRAP_USER` | Dev | |
| `MAILTRAP_PASS` | Dev | |
| `BREVO_API_KEY` | Prod | Brevo transactional email |
| `MAIL_FROM` | Prod | From address in production |

### 17.2 CI/CD Pipeline (GitHub Actions)

`.github/workflows/ci.yml` — triggered on every PR and push to `main`:

```
Stages:
1. Checkout code
2. Set up Node.js 20 LTS
3. npm ci (clean install from lockfile)
4. npm audit --audit-level=high (fail on high/critical CVEs)
5. git-secrets scan (fail if secrets detected)
6. npm run lint (ESLint)
7. npm run test (Vitest with coverage)
8. Coverage check: fail if < 80%
9. Build check: node --check src/index.js
```

On `main` branch only:
```
10. Deploy to Render (or trigger deployment webhook)
```

### 17.3 Graceful Shutdown

```js
const shutdown = async (signal) => {
  const FORCE_EXIT_TIMEOUT = 10_000;

  const forceExit = setTimeout(() => {
    logger.error("Forced exit after timeout");
    process.exit(1);
  }, FORCE_EXIT_TIMEOUT);
  forceExit.unref();

  server.close(async () => {
    await mongoose.connection.close();
    logger.info("Clean shutdown complete");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled promise rejection");
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});
```

### 17.4 Dockerfile

```dockerfile
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### 17.5 .dockerignore & .gitignore

`.gitignore` must include: `.env`, `node_modules/`, `public/temp/`  
`.dockerignore` must include: `.env`, `node_modules/`, `.git/`

---

## 18. Testing Strategy

### 18.1 Test Stack

- **Framework:** Vitest
- **HTTP testing:** Supertest
- **DB:** MongoDB Memory Server (in-memory, no real DB needed in CI)
- **Coverage:** Vitest built-in V8 coverage

### 18.2 Coverage Targets

| Layer | Target |
|---|---|
| Controllers | ≥ 85% |
| Middleware | 100% |
| Validators | 100% |
| Utils | ≥ 90% |
| Models | ≥ 80% |
| **Overall** | **≥ 80%** |

### 18.3 Test Categories

#### Unit Tests

- All utility functions (`asyncHandler`, `ApiError`, `ApiResponse`, `jwt.utils`, `cloudinary.utils`).
- All validators — test each invalid input case.
- Mongoose model methods (`isPasswordCorrect`, `generateTemporaryToken`, `generateAccessToken`).
- Middleware in isolation: `verifyJwt`, `authorizeRoles`, `globalErrorHandler`.

#### Integration Tests (per route)

For every HTTP route, test:
- Happy path (200/201)
- Missing auth → 401
- Wrong role → 403
- Invalid input → 400 with field errors
- Resource not found → 404
- Duplicate → 409
- Rate limit (mock limiter in tests)

#### Critical Path Tests

These scenarios must have end-to-end test coverage:

1. Register → Verify Email → Login → Refresh Token → Logout
2. Register with `admin` role → must fail with 400
3. Login with wrong password → 401 (not 404)
4. Suspended user → login → 403
5. Mentor creates group (atomic) → GroupMember created in same transaction
6. Delete group → cascade clears all related documents
7. Learner submits → Cloudinary upload → submission created
8. Resubmission: old Cloudinary file deleted AFTER new upload succeeds
9. Mentor reviews → learner notification created
10. Rate limit: 6th request in 5-min window on auth routes → 429
11. NoSQL injection in email field → sanitized, no DB error
12. Verify email with expired token → redirect to failure URL

### 18.4 Load Testing

Tool: **k6**  
Scenarios:
- 100 concurrent users hitting `GET /healthcheck` for 60 seconds → P99 < 50ms
- 50 concurrent users doing full login→read flow → P99 < 300ms
- 10 concurrent file upload submissions → all succeed within 10s

---

## 19. Pagination, Filtering & Sorting Standard

All list endpoints support:

### Query Parameters

| Param | Type | Default | Max |
|---|---|---|---|
| `page` | number | 1 | — |
| `limit` | number | 20 | 100 |

### Response Shape

```json
{
  "statusCode": 200,
  "message": "...",
  "data": {
    "items": [...],
    "pagination": {
      "total": 145,
      "page": 1,
      "limit": 20,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "success": true
}
```

### Implementation

```js
const page = Math.max(1, parseInt(req.query.page) || 1);
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
const skip = (page - 1) * limit;

const [items, total] = await Promise.all([
  Model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
  Model.countDocuments(filter)
]);

const totalPages = Math.ceil(total / limit);
```

---

## 20. Logging & Observability Standard

### 20.1 Logger Configuration

```js
const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: process.env.NODE_ENV !== "production"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});
```

pino instance exported and used in `index.js`, `db/index.db.js`, and injected via `pinoHttp`.

### 20.2 Request Tracing

Every request gets a unique ID:

```js
app.use(pinoHttp({
  logger,
  genReqId: () => crypto.randomUUID(),
  customSuccessMessage: (req, res) => `${res.statusCode} ${req.method} ${req.url}`,
  customErrorMessage: (req, res, err) => `${res.statusCode} ${req.method} ${req.url} — ${err.message}`,
}));
```

The `req.id` is included in every log line automatically by pino-http.

### 20.3 Log Levels

| Event | Level |
|---|---|
| Server startup / shutdown | `info` |
| DB connected / disconnected | `info` |
| Successful requests | `info` |
| 4xx client errors | `warn` |
| 5xx server errors | `error` |
| Unhandled rejection / exception | `fatal` |
| Debug in development | `debug` |

### 20.4 Structured Log Fields

All error log entries include: `message`, `statusCode`, `method`, `url`, `userId` (if authenticated), `reqId` (from pino-http), `stack` (development only).

### 20.5 What Is Never Logged

- Passwords (plain or hashed)
- JWT tokens (access or refresh)
- Full request bodies (only field names on validation error)
- Cloudinary API secrets
- SMTP credentials

---

## 21. Rate Limiting Policy

### 21.1 Rate Limiters

| Limiter | Window | Max Requests | Applied To |
|---|---|---|---|
| `globalRate` | 15 min | 100 / IP | All routes (global) |
| `ipAuthRate` | 5 min | 5 / IP | `/register`, `/login`, `/forgot-password`, `/reset-password`, `/refresh-token`, `/resend-email-verification` |
| `userRate` | 5 min | 20 / user ID (falls back to IP if unauthenticated) | All authenticated write operations |

### 21.2 Rate Limit Headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1744205029
```

`standardHeaders: true`, `legacyHeaders: false` on all limiters.

### 21.3 Rate Limit Exceeded Response

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "errors": []
}
```

### 21.4 Redis-Backed Store (Production)

In production with multiple server instances, rate limit state is shared via `rate-limit-redis`:

```js
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });
```

If `REDIS_URL` is not set, fall back to in-memory store with a warning log. (For single-instance deployments like Render Free tier, in-memory is acceptable.)

---

## 22. Dependency & Risk Register

### 22.1 Production Dependencies

| Package | Purpose | Risk Level |
|---|---|---|
| express v5 | HTTP framework | Low |
| mongoose v9 | MongoDB ODM | Low |
| jsonwebtoken | JWT | Low |
| bcrypt | Password hashing | Low |
| express-validator | Input validation | Low |
| helmet | Security headers | Low |
| hpp | Parameter pollution | Low |
| express-rate-limit | Rate limiting | Low |
| express-mongo-sanitize | NoSQL injection | Low |
| cors | CORS policy | Low |
| cookie-parser | Cookie parsing | Low |
| multer | File uploads | Low |
| cloudinary | Cloud file storage | Medium (external dependency) |
| nodemailer | Dev email | Low |
| axios | HTTP client (Brevo API) | Low |
| mailgen | Email templates | Low |
| pino | Structured logging | Low |
| pino-http | Request logging | Low |
| dotenv | Environment config | Low |

**Removed from 1.0:**
- `crypto` npm package (use Node.js built-in)

**Added in 2.0:**
- `express-mongo-sanitize` — NoSQL injection protection
- `rate-limit-redis` — optional, for multi-instance deployments

### 22.2 Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cloudinary outage | Low | High | Log failure, return 503, retry with exponential backoff |
| Email provider outage | Medium | Medium | Queue emails if critical; non-critical emails fail silently |
| MongoDB Atlas outage | Low | Critical | Healthcheck returns 503; connection retry with backoff |
| JWT secret rotation | Rare | High | All sessions invalidated; users must re-login. Document process. |
| Invite code brute force | Medium | Medium | Rate limiting on join endpoint; codes are 12-char hex (281 trillion combos) |
| Large file DoS | Medium | Medium | 5MB limit enforced at multer level before Cloudinary |
| Data loss on cascade delete | Low | Critical | Mongoose session + transaction; test in CI |
| Temp file disk fill | Low | Medium | Store in os.tmpdir(); always clean up in finally block |

---

## 23. Release Milestones

### Phase 1 — Bug Fixes & Security Hardening (Week 1-2)

All items from the 1.0 audit. Zero new features. Must be complete before any 2.0 features ship.

- [ ] Fix admin self-registration (remove `admin` from registration validator)
- [ ] Fix `ApiResponse` argument order in dashboard controller
- [ ] Fix `err.path` vs `err.param` in validators middleware
- [ ] Fix HTTP status codes (wrong password → 401, not found → 404, etc.)
- [ ] Add `ipAuthRate` to `resendEmailVerification` route
- [ ] Move multer temp dir to `os.tmpdir()` — remove `public/temp` from static serving
- [ ] Read CORS origin from environment variable
- [ ] Add `express-mongo-sanitize`
- [ ] Remove dead `members[]` array from Group model
- [ ] Add startup env validation
- [ ] Remove refresh token acceptance from headers
- [ ] Fix cascade deletes (Group → Goal → Assignment → Submission + Cloudinary)
- [ ] Fix cascade deletes (Goal → Assignment → Submission + Cloudinary)
- [ ] Fix Cloudinary delete-before-upload order in submission resubmission
- [ ] Add DB indexes on `emailVerificationToken`, `forgotPasswordToken`
- [ ] Add compound index on `GroupMember { group, user }`
- [ ] Remove `crypto` npm package from `package.json`
- [ ] Add graceful shutdown timeout (10s forced exit)
- [ ] Add `process.on("unhandledRejection")` and `process.on("uncaughtException")`
- [ ] Replace `console.log` with pino logger in `index.js` and `db/index.db.js`
- [ ] Add 404 catch-all route handler
- [ ] Fix `changeCurrentPassword` to clear `refreshToken` cookie in response
- [ ] Fix name-uniqueness bug in registration (email-only deduplication)
- [ ] Add `statusCode` to error response body
- [ ] Move magic numbers to `constants.utils.js`
- [ ] Add request ID (`crypto.randomUUID()`) to pino-http config
- [ ] Add `FORGOT_PASSWORD_REDIRECT_URL`, `BASE_URL`, `BREVO_API_KEY`, `MAIL_FROM`, `CORS_ORIGIN` to `.env.example`
- [ ] Add `isSuspended` field and check in `verifyJwt`

### Phase 2 — Pagination & API Completeness (Week 2-3)

- [ ] Add pagination to all list endpoints
- [ ] Add `GET /submissions/assignments/:assignmentId/my-submission`
- [ ] Add `POST /groups/:groupId/leave`
- [ ] Add `PATCH /groups/:groupId/invite/regenerate`
- [ ] Add `DELETE /goals/:goalId` cascade
- [ ] Add `DELETE /groups/:groupId` cascade

### Phase 3 — New Features (Week 3-6)

- [ ] Announcements — full CRUD
- [ ] Notifications — create/read/mark-read
- [ ] Notification triggers wired to: assignment creation, submission review, goal assignment, announcement post
- [ ] Admin panel endpoints — all 9 routes
- [ ] Leaderboard — by group + personal stats
- [ ] Direct messaging — send/get/soft-delete
- [ ] Mentor dashboard — corrected + enhanced

### Phase 4 — Testing & CI (Week 6-8)

- [ ] Vitest + Supertest + MongoDB Memory Server set up
- [ ] Unit tests for all middleware, utils, validators
- [ ] Integration tests for all routes (happy path + error cases)
- [ ] 12 critical path scenarios covered
- [ ] Coverage ≥ 80%
- [ ] GitHub Actions CI pipeline
- [ ] `npm audit` gate in CI
- [ ] git-secrets scan in CI
- [ ] Dockerfile
- [ ] Load test with k6

### Phase 5 — Observability & Operations (Week 8)

- [ ] Pino logger fully consistent across entire codebase
- [ ] Request ID tracing
- [ ] Log level policy enforced
- [ ] UptimeRobot monitoring on healthcheck endpoint
- [ ] Render deployment with env vars validated at startup
- [ ] Redis-backed rate limiter for production (optional, if multi-instance)

---

## 24. Open Issues from 1.0 Audit (Must Fix in 2.0)

This section is a direct mapping from the 1.0 security and bug audit. Each item maps to Phase 1 above.

| ID | Severity | Description | File:Line | Status |
|---|---|---|---|---|
| SEC-01 | 🔴 Critical | Admin self-registration | `validators/auth.validators.js:31` | → Phase 1 |
| BUG-01 | 🔴 Critical | `ApiResponse` args swapped in dashboard | `controllers/dashboard.controllers.js:28,57,78,118` | → Phase 1 |
| SEC-02 | 🔴 Critical | No rate limit on resend-email-verification | `routes/auth.routes.js:62` | → Phase 1 |
| SEC-03 | 🔴 Critical | `public/temp` served as static files | `app.js:46`, `middlewares/multer.middlewares.js:14` | → Phase 1 |
| SEC-04 | 🔴 Critical | CORS origin hardcoded | `app.js:19` | → Phase 1 |
| BUG-02 | 🔴 High | `err.param` deprecated (v7 uses `err.path`) | `middlewares/validators.middlewares.js:9` | → Phase 1 |
| BUG-03 | 🔴 High | Wrong HTTP 400 on wrong password (should be 401) | `controllers/auth.controllers.js:166` | → Phase 1 |
| BUG-04 | 🔴 High | Wrong HTTP 400 on user not found (should be 404/401) | `controllers/auth.controllers.js:204,226` | → Phase 1 |
| BUG-05 | 🔴 High | Wrong HTTP 400 on login internal failure (should be 500) | `controllers/auth.controllers.js:178` | → Phase 1 |
| SEC-05 | 🟠 High | No NoSQL injection protection | `app.js` (missing middleware) | → Phase 1 |
| SEC-06 | 🟠 High | No startup env validation | `src/index.js` | → Phase 1 |
| SEC-07 | 🟠 High | Refresh token accepted via header | `controllers/auth.controllers.js:239-241` | → Phase 1 |
| DATA-01 | 🟠 High | Group delete no cascade | `controllers/group.controllers.js:176-178` | → Phase 2 |
| DATA-02 | 🟠 High | Goal delete no cascade | `controllers/goal.controllers.js:182` | → Phase 2 |
| DATA-03 | 🟠 High | Cloudinary destroy before new upload (wrong order) | `controllers/submission.controllers.js:53-54` | → Phase 1 |
| PERF-01 | 🟠 Medium | No index on `emailVerificationToken` | `models/user.models.js` | → Phase 1 |
| PERF-02 | 🟠 Medium | No index on `forgotPasswordToken` | `models/user.models.js` | → Phase 1 |
| PERF-03 | 🟠 Medium | No compound index on `GroupMember { group, user }` | `models/groupMember.models.js` | → Phase 1 |
| DATA-04 | 🟠 Medium | Dead `members[]` field in Group model | `models/group.models.js:23-28` | → Phase 1 |
| DEP-01 | 🟠 Medium | `crypto` npm package (should use Node built-in) | `package.json:40` | → Phase 1 |
| ATOM-01 | 🟠 Medium | `createGroup` non-atomic (no Mongoose session) | `controllers/group.controllers.js:13-28` | → Phase 1 |
| OPS-01 | 🟠 Medium | No graceful shutdown timeout | `src/index.js:31` | → Phase 1 |
| QUAL-01 | 🟡 Low | `getMyGoals` populates non-existent `email` on Group | `controllers/goal.controllers.js:99` | → Phase 1 |
| QUAL-02 | 🟡 Low | `console.log` in `index.js` and `db/index.db.js` | Multiple | → Phase 1 |
| QUAL-03 | 🟡 Low | No 404 route catch-all | `app.js` | → Phase 1 |
| QUAL-04 | 🟡 Low | Name collision blocks registration | `controllers/auth.controllers.js:50-56` | → Phase 1 |
| QUAL-05 | 🟡 Low | Magic numbers not in constants | Multiple | → Phase 1 |
| QUAL-06 | 🟡 Low | Error response missing `statusCode` field | `middlewares/error.middlewares.js:33` | → Phase 1 |
| ENV-01 | 🟡 Low | Missing env vars in `.env.example` | `.env.example` | → Phase 1 |
| FEAT-01 | Feature | No leave-group endpoint | — | → Phase 2 |
| FEAT-02 | Feature | No invite code regeneration | — | → Phase 2 |
| FEAT-03 | Feature | No pagination on list endpoints | Multiple | → Phase 2 |
| FEAT-04 | Feature | No "my submission" endpoint | — | → Phase 2 |

---

## 25. Glossary

| Term | Definition |
|---|---|
| **Access Token** | Short-lived JWT (15 min) used to authenticate API requests via Authorization header |
| **Refresh Token** | Long-lived JWT (7 days) stored in httpOnly cookie, used to issue new access tokens |
| **Group Mentor** | The user who created a study group and administers it |
| **Learner** | A user who joins a study group to receive goals and submit assignments |
| **Admin** | A platform-level superuser who can manage all users and groups |
| **Goal** | A learning objective assigned to one or more learners within a group |
| **Assignment** | A specific task created under a goal with an optional deadline and max marks |
| **Submission** | A learner's response to an assignment (file and/or text) |
| **Invite Code** | A 12-character random hex string used to join a group |
| **Cascade Delete** | The deletion of all related child documents when a parent document is deleted |
| **Soft Delete** | Marking a record as inactive/deleted without removing it from the database |
| **Atomic Transaction** | A set of DB operations that either all succeed or all fail together (Mongoose session) |
| **NoSQL Injection** | An attack using MongoDB operators (`$gt`, `$where`) in user input to manipulate queries |
| **HPP** | HTTP Parameter Pollution — sending duplicate query/body params to bypass validation |
| **P99** | The 99th percentile of response times — 99% of requests are faster than this |
| **MVC** | Model-View-Controller — architectural pattern used in this backend |
| **RBAC** | Role-Based Access Control — permissions determined by user role |
| **Pino** | A high-performance JSON logger for Node.js |
| **Cloudinary** | Cloud-based media storage and CDN used for file uploads |
| **Brevo** | Transactional email service used in production (formerly Sendinblue) |
| **Mailtrap** | Email sandbox used in development to catch and inspect outgoing emails |
| **Rate Limiter** | Middleware that restricts how many requests a client can make in a time window |
| **Compound Index** | A MongoDB index on multiple fields, used to speed up queries with multiple filters |
| **Salt Rounds** | The bcrypt cost factor — higher means more secure but slower hashing |
| **SHA-256** | A cryptographic hash function used to hash email verification and password reset tokens |
| **`select: false`** | Mongoose field option that excludes the field from query results by default |
| **pinoHttp** | Express middleware that logs every incoming request and its response time via pino |
