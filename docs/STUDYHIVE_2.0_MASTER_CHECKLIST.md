# StudyHive 2.0 — Master Implementation Checklist

> Status: Actionable execution checklist derived from PRD v2.0.0  
> Scope: End-to-end delivery plan covering engineering, security, QA, DevOps, and release readiness  
> Last Updated: 2026-04-09

---

## How to Use This Checklist

- Mark top-level tasks and subtasks as you complete them.
- Do not start feature phases before Phase 1 security + bug-hardening is complete.
- Every endpoint task must include: validator updates, controller logic, route wiring, permission checks, and tests.
- Every data model change must include: schema migration plan, index verification, and regression tests.
- Run lint + tests + smoke test after each major module merge.

---

## 0) Project Setup, Branching, and Delivery Governance

### 0.1 Repo Readiness

- [ ] Confirm Node.js runtime pinned to Node 20 LTS in project docs and CI.
- [ ] Confirm package manager and lockfile consistency (`npm` + `package-lock.json`).
- [ ] Confirm `.gitignore` includes `.env`, `node_modules/`, `public/temp/`.
- [ ] Add/verify `.dockerignore` includes `.env`, `node_modules/`, `.git/`.
- [ ] Ensure PR template exists with security/test checklist.

### 0.2 Branch and PR Strategy

- [ ] Create `release/studyhive-2.0` integration branch.
- [ ] Define branch naming convention: `feature/*`, `fix/*`, `security/*`, `test/*`, `ops/*`.
- [ ] Protect `main` with required checks (lint, test, coverage, audit).
- [ ] Enforce squash merge or merge strategy (team decision, documented).

### 0.3 Definition of Done (DoD)

- [ ] Create DoD document for backend changes.
- [ ] Include minimum requirements:
- [ ] Code merged with review approval.
- [ ] Unit + integration tests added/updated.
- [ ] Error responses conform to standard shape.
- [ ] Security and permission checks validated.
- [ ] Logs added at correct level for critical events.
- [ ] API docs updated.

---

## 1) Phase 1 — Critical Bug Fixes & Security Hardening (P0)

## 1.1 Authentication Security and Bug Corrections

### 1.1.1 Remove admin self-registration (SEC-01)

- [ ] Update registration validator to allow only `mentor` and `learner` roles.
- [ ] Ensure explicit rejection message for `admin` role input.
- [ ] Verify controller does not override validator behavior.
- [ ] Add test: register with role `admin` returns 400.

### 1.1.2 Login status code corrections (BUG-03, BUG-04, BUG-05)

- [ ] Ensure invalid credentials return 401 uniformly.
- [ ] Ensure no user enumeration in error messages.
- [ ] Ensure email-not-verified returns 403.
- [ ] Ensure internal login failures return 500.
- [ ] Add tests for all login branches.

### 1.1.3 Refresh token handling hardening (SEC-07)

- [ ] Remove refresh token acceptance from headers/body.
- [ ] Accept refresh token from cookie only.
- [ ] Compare stored token hash against incoming cookie token hash.
- [ ] Implement token rotation on each refresh.
- [ ] Add test: header-based refresh token is rejected.
- [ ] Add test: token reuse detection triggers 401.

### 1.1.4 Change password logout semantics

- [ ] Ensure password change clears persisted refresh token.
- [ ] Ensure response clears refresh cookie.
- [ ] Add regression test for forced re-login after password change.

### 1.1.5 Name collision fix in registration (QUAL-04)

- [ ] Ensure uniqueness checks are email-based only.
- [ ] Remove any blocking checks by `name` field.
- [ ] Add test: two users with same name, different emails can register.

### 1.1.6 Suspended account support

- [ ] Add `isSuspended` to user schema.
- [ ] Enforce suspended-user denial in auth middleware/JWT verification flow.
- [ ] Enforce suspended user login returns 403.
- [ ] Add tests for suspended login and token-auth flows.

## 1.2 App-Level Security Middleware (SEC-03, SEC-04, SEC-05)

### 1.2.1 Secure upload temp storage (SEC-03)

- [ ] Move multer temp destination to `os.tmpdir()`.
- [ ] Remove any static serving of temp upload directories.
- [ ] Ensure temp files are removed on success and failure.
- [ ] Add test/assertion for invalid upload path handling.

### 1.2.2 CORS env-driven allowlist (SEC-04)

- [ ] Replace hardcoded CORS origin with `CORS_ORIGIN` env parsing.
- [ ] Support comma-separated origins.
- [ ] Ensure `credentials: true` is set for cookie auth.
- [ ] Add tests/smoke checks for allowed and blocked origins.

### 1.2.3 NoSQL injection protection (SEC-05)

- [ ] Install and configure `express-mongo-sanitize` globally.
- [ ] Ensure middleware order places sanitize before routes.
- [ ] Add regression test for payload containing `$`/`.` keys.

### 1.2.4 HPP and body limits

- [ ] Ensure `hpp` middleware is present and early in chain.
- [ ] Ensure JSON/urlencoded size limits are `16kb`.
- [ ] Add checks for large payload rejection behavior.

## 1.3 Startup Validation and Process Reliability (SEC-06, OPS-01)

### 1.3.1 Required env validation

- [ ] Validate all required env vars before app listens on port.
- [ ] Add explicit startup failure log for each missing variable.
- [ ] Enforce min length (>=64) for token secrets.
- [ ] Add tests or startup script validation for env contract.

### 1.3.2 Graceful shutdown and fatal handlers

- [ ] Add shutdown function with 10-second forced exit timeout.
- [ ] Close HTTP server then MongoDB connection cleanly.
- [ ] Handle SIGINT/SIGTERM.
- [ ] Add `unhandledRejection` and `uncaughtException` handlers.
- [ ] Replace raw console logs with structured logger.

## 1.4 Error Handling and Validation Reliability (BUG-02, QUAL-06)

### 1.4.1 Validator middleware compatibility

- [ ] Update express-validator error extraction from `.param` to `.path`.
- [ ] Verify all route validators still map errors correctly.
- [ ] Add unit test for validator middleware output shape.

### 1.4.2 Error response standardization

- [ ] Ensure error responses include `statusCode` in body.
- [ ] Align all thrown errors to standardized `ApiError` usage.
- [ ] Map known Mongoose/JWT errors to expected HTTP codes.
- [ ] Add integration tests for 400/401/403/404/409/429/500 mappings.

### 1.4.3 404 catch-all route

- [ ] Add unknown-route catch-all after all route registrations.
- [ ] Ensure catch-all returns standard error shape.
- [ ] Add integration test for unknown endpoint behavior.

## 1.5 Data Integrity and Model Hardening (PERF-01, PERF-02, PERF-03, DATA-04)

### 1.5.1 User model indexes

- [ ] Add index on `emailVerificationToken`.
- [ ] Add index on `forgotPasswordToken`.
- [ ] Verify index creation via MongoDB introspection.

### 1.5.2 GroupMember uniqueness

- [ ] Add unique compound index `{ group: 1, user: 1 }`.
- [ ] Handle duplicate membership errors as 409.
- [ ] Add tests for concurrent join duplicate prevention.

### 1.5.3 Group schema cleanup

- [ ] Remove dead `members[]` array field from group model.
- [ ] Ensure codebase uses `GroupMember` as single source of membership truth.
- [ ] Regression test group member retrieval and joins.

## 1.6 Cloudinary and Submission Safety (DATA-03)

### 1.6.1 Resubmission file replacement order

- [ ] Upload new file first.
- [ ] Delete old Cloudinary file only after successful upload.
- [ ] Preserve existing file when new upload fails.
- [ ] Add integration test for failed upload rollback scenario.

## 1.7 Code Quality and Constants

### 1.7.1 Replace magic numbers (QUAL-05)

- [ ] Move shared constants into `constants.utils.js`.
- [ ] Centralize token expiry defaults, limits, and file-size values.
- [ ] Refactor modules to use constants.
- [ ] Add tests where constants impact behavior.

### 1.7.2 Remove incorrect dependency (DEP-01)

- [ ] Remove npm `crypto` package if present.
- [ ] Use Node built-in `crypto` module everywhere.
- [ ] Run dependency audit and lockfile refresh.

### 1.7.3 Logging consistency (QUAL-02)

- [ ] Replace stray `console.log` with pino logger in startup/db modules.
- [ ] Ensure log levels follow PRD policy.
- [ ] Verify no secrets are logged.

## 1.8 Route-level Security Hardening

### 1.8.1 Add missing auth-rate limiter on resend verification (SEC-02)

- [ ] Attach `ipAuthRate` to resend verification endpoint.
- [ ] Validate headers in 429 response.
- [ ] Add test for 6th request within window returns 429.

---

## 2) Phase 2 — API Completeness, Cascades, and Pagination (P0)

## 2.1 Pagination Standardization Across All List Endpoints

### 2.1.1 Pagination utility rollout

- [ ] Implement shared pagination parser (`page`, `limit`, clamp max 100).
- [ ] Standardize response metadata (`total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`).
- [ ] Validate invalid/negative pagination inputs.

### 2.1.2 Apply pagination endpoint-by-endpoint

- [ ] Groups list (`GET /groups`).
- [ ] Group members list (`GET /groups/:groupId/members`).
- [ ] Goals by group (`GET /goals/:groupId`).
- [ ] My goals (`GET /goals/me`).
- [ ] Assignments by goal (`GET /assignments/:goalId`).
- [ ] Submissions by assignment (`GET /submissions/assignments/:assignmentId/submissions`).
- [ ] Resources by group (`GET /resources/:groupId`).
- [ ] Announcements by group.
- [ ] Notifications list.
- [ ] Conversations/messages list.
- [ ] Admin users/groups lists.

### 2.1.3 Pagination test matrix

- [ ] Default values if params absent.
- [ ] Limit cap at 100.
- [ ] Page > totalPages behavior.
- [ ] Combined filtering + pagination.

## 2.2 Group Lifecycle Completeness

### 2.2.1 Leave group endpoint (FEAT-01)

- [ ] Add `POST /groups/:groupId/leave` route.
- [ ] Ensure caller is existing member.
- [ ] Prevent mentor from leaving their own group.
- [ ] Delete membership entry for learner.
- [ ] Add tests for member/non-member/mentor flows.

### 2.2.2 Invite code regeneration (FEAT-02)

- [ ] Add `PATCH /groups/:groupId/invite/regenerate` route.
- [ ] Restrict to group mentor.
- [ ] Generate cryptographically random new code.
- [ ] Ensure old code no longer joins group.
- [ ] Add tests for permission and uniqueness.

### 2.2.3 Get invite code endpoint review

- [ ] Validate mentor-only access.
- [ ] Ensure response shape matches API standard.
- [ ] Add tests for non-mentor denial.

## 2.3 Cascade Deletes and Atomicity (DATA-01, DATA-02)

### 2.3.1 Goal delete cascade

- [ ] On goal deletion, find assignments under goal.
- [ ] Delete submissions under those assignments (DB + Cloudinary).
- [ ] Delete assignments.
- [ ] Delete goal.
- [ ] Add integration test covering full cascade path.

### 2.3.2 Group delete cascade

- [ ] Restrict deletion to group mentor or global admin.
- [ ] Delete submissions (and Cloudinary files) for group assignments.
- [ ] Delete assignments, goals, resources, announcements.
- [ ] Delete group memberships.
- [ ] Delete group.
- [ ] Run in Mongoose transaction.
- [ ] Add failure rollback test.

### 2.3.3 Create group atomic transaction (ATOM-01)

- [ ] Create group + mentor membership in single session transaction.
- [ ] Ensure rollback if second write fails.
- [ ] Add integration test for atomicity.

## 2.4 Submission API Completeness (FEAT-04)

### 2.4.1 My submission endpoint

- [ ] Add `GET /submissions/assignments/:assignmentId/my-submission`.
- [ ] Restrict to learner role.
- [ ] Ensure only caller’s submission returned.
- [ ] Return 404 if none exists.
- [ ] Add tests for access and missing case.

---

## 3) Phase 3 — New Product Features (P1/P2)

## 3.1 Announcements Module

### 3.1.1 Data model and indexes

- [ ] Create Announcement schema with `group`, `createdBy`, `title`, `body`, `isPinned`, timestamps.
- [ ] Add index on `group`.

### 3.1.2 CRUD endpoints

- [ ] Create announcement (`POST /announcements/:groupId`) with mentor-only access.
- [ ] Get group announcements with pinned-first sorting + pagination.
- [ ] Update announcement with creator-only permissions.
- [ ] Delete announcement with creator/mentor/admin permissions.

### 3.1.3 Validation and tests

- [ ] Validate title/body lengths and required fields.
- [ ] Add full integration tests for auth, role, and ownership.

## 3.2 Notifications Module

### 3.2.1 Data model and indexes

- [ ] Create Notification schema with recipient/type/title/body/refId/refModel/isRead.
- [ ] Add compound index `{ recipient, isRead, createdAt: -1 }`.

### 3.2.2 Endpoints

- [ ] `GET /notifications` with pagination/filter/unread count.
- [ ] `PATCH /notifications/:notificationId/read` ownership-protected.
- [ ] `PATCH /notifications/mark-all-read` for current user.
- [ ] `DELETE /notifications/:notificationId` recipient-only.

### 3.2.3 Notification trigger wiring

- [ ] Trigger on assignment creation (`new_assignment`).
- [ ] Trigger on submission reviewed (`submission_reviewed`).
- [ ] Trigger on revision requested (`revision_required`).
- [ ] Trigger on goal assignment (`goal_assigned`).
- [ ] Trigger on announcement posted (`new_announcement`).
- [ ] Add placeholder/scheduler for deadline reminder notifications.

### 3.2.4 Tests

- [ ] Unit tests for notification creation helper/service.
- [ ] Integration tests for each trigger source.

## 3.3 Direct Messaging Module

### 3.3.1 Data model and indexes

- [ ] Create Message schema with sender, recipient, groupId, content, deletedAt.
- [ ] Add bidirectional conversation indexes.

### 3.3.2 Endpoints

- [ ] Send message (`POST /messages`) with shared-group membership validation.
- [ ] Get conversation (`GET /messages/:userId`) with pagination.
- [ ] Delete message (`DELETE /messages/:messageId`) sender-only soft delete.

### 3.3.3 Behavior rules

- [ ] Ensure deleted messages show placeholder semantics for recipient read flow.
- [ ] Ensure users cannot message non-shared-group users.

### 3.3.4 Tests

- [ ] Add tests for shared-group constraints.
- [ ] Add tests for soft-deleted message rendering behavior.

## 3.4 Leaderboard and Progress Tracking

### 3.4.1 Scoring engine

- [ ] Implement score calculation using reviewed submissions only.
- [ ] Compute `totalMarks`, `maxPossibleMarks`, `scorePercent`, rank.
- [ ] Handle zero-denominator case safely.

### 3.4.2 Endpoints

- [ ] `GET /leaderboard/:groupId` for members only.
- [ ] `GET /leaderboard/:groupId/me` for personal metrics.
- [ ] Include goals/assignments progress counters in personal endpoint.

### 3.4.3 Tests

- [ ] Ranking correctness with tied/untied scores.
- [ ] Exclusion of non-reviewed submissions.
- [ ] Membership and permission enforcement.

## 3.5 Admin Panel Endpoints

### 3.5.1 Admin auth framework

- [ ] Ensure all `/admin/*` routes require JWT + global `admin` role.
- [ ] Add guard tests for non-admin access.

### 3.5.2 User administration endpoints

- [ ] List users with pagination and filters (`role`, `isEmailVerified`, `search`).
- [ ] Get user by ID with profile + membership counts.
- [ ] Update user role (`PATCH /admin/users/:userId/role`).
- [ ] Suspend user endpoint clears refresh token.
- [ ] Unsuspend user endpoint.
- [ ] Delete user with required cascades.

### 3.5.3 Group administration endpoints

- [ ] List groups with pagination/search.
- [ ] Force delete group with full cascade.

### 3.5.4 Platform stats endpoint

- [ ] Implement aggregate stats endpoint (`/admin/stats`).
- [ ] Validate metric definitions align with PRD.

### 3.5.5 Tests

- [ ] Integration tests for each admin route.
- [ ] Tests for destructive-operation audit logging.

## 3.6 Mentor Dashboard Enhancements

### 3.6.1 Response and aggregation fixes

- [ ] Fix `ApiResponse` argument ordering in dashboard controller.
- [ ] Compute stats: groups, goals, assignments, submissions, pending reviews, learners.
- [ ] Include recent submissions and assignments.
- [ ] Compute completion rate string format.

### 3.6.2 Access control

- [ ] Restrict to mentor/admin.
- [ ] Ensure mentor sees own-scope data only.

### 3.6.3 Tests

- [ ] Add route integration tests for mentor/admin and denial cases.

---

## 4) Existing Core Module Completion Checklist

## 4.1 Authentication & Account Management

### 4.1.1 Register

- [ ] Validate name/email/password/role.
- [ ] Normalize email to lowercase.
- [ ] Hash password via model pre-save.
- [ ] Generate and store hashed email verification token + expiry.
- [ ] Send verification email.
- [ ] Return sanitized user object.

### 4.1.2 Verify email

- [ ] Hash incoming token and lookup non-expired token.
- [ ] Set `isEmailVerified=true`, clear token fields, clear refresh token.
- [ ] Redirect success/failure to frontend URL states.

### 4.1.3 Resend verification

- [ ] Always return generic success response.
- [ ] Regenerate token only for unverified existing users.

### 4.1.4 Login

- [ ] Validate credentials and check verification status.
- [ ] Issue access + refresh tokens.
- [ ] Persist hashed refresh token.
- [ ] Set secure httpOnly cookie.

### 4.1.5 Logout

- [ ] Clear persisted refresh token.
- [ ] Clear refresh cookie.

### 4.1.6 Me endpoint

- [ ] Return profile excluding sensitive fields.

### 4.1.7 Refresh token

- [ ] Cookie-only extraction.
- [ ] Verify JWT and DB token match.
- [ ] Rotate and persist new refresh token.
- [ ] Return new access token + refresh cookie.

### 4.1.8 Forgot/reset/change password

- [ ] Generic response for forgot-password.
- [ ] Token hashing + expiry handling.
- [ ] Reset clears reset token and refresh token.
- [ ] Change-password verifies old password and clears refresh session.

## 4.2 Study Group Management

### 4.2.1 Create/join/list/get/update/delete

- [ ] Implement role checks for mentor-only creation.
- [ ] Enforce invite-code join with duplicate membership protection.
- [ ] Ensure list/get require membership.
- [ ] Ensure update requires global mentor + specific group mentorship.
- [ ] Ensure delete enforces mentor/admin + cascade.

### 4.2.2 Membership management

- [ ] Member list endpoint with pagination.
- [ ] Mentor remove-member endpoint prevents self-removal.
- [ ] Leave-group flow blocks mentor leave.

### 4.2.3 Invite-code management

- [ ] Get current invite code mentor-only.
- [ ] Regenerate invite code mentor-only.

## 4.3 Goals Management

### 4.3.1 Create goals

- [ ] Validate assignment targets are actual group members.
- [ ] Validate optional future deadline.
- [ ] Trigger notifications for assigned learners.

### 4.3.2 Read goals

- [ ] Mentor sees all group goals.
- [ ] Learner sees only assigned goals.
- [ ] My-goals endpoint aggregates across groups.

### 4.3.3 Update/delete goals

- [ ] Validate partial updates with at least one field.
- [ ] Validate reassigned users.
- [ ] Delete goal with assignment/submission cascade.

## 4.4 Assignments Management

### 4.4.1 Create/read/update/soft-delete

- [ ] Ensure assignment belongs to existing goal.
- [ ] Ensure creator is mentor of owning group.
- [ ] Validate fields including optional URLs and maxMarks.
- [ ] Apply `isActive` filter support.
- [ ] Soft delete sets `isActive=false`.

### 4.4.2 Notifications

- [ ] Trigger assignment notifications to relevant learners.

## 4.5 Submissions Management

### 4.5.1 Submit assignment

- [ ] Require file or submitted text.
- [ ] Validate assignment active and deadline not passed.
- [ ] Enforce learner role + membership checks.
- [ ] Allow resubmission only if previous status is `revision_required`.

### 4.5.2 Review submission

- [ ] Restrict review to mentor of assignment’s group.
- [ ] Allow status only `reviewed`/`revision_required`.
- [ ] Validate marks within assignment max.
- [ ] Trigger learner notification.

### 4.5.3 Read submission endpoints

- [ ] Mentor list-by-assignment with status filters + pagination.
- [ ] Learner my-submission endpoint.

## 4.6 Resources Management

### 4.6.1 Upload resources

- [ ] Validate type-specific required fields (`file`, `link`, `note`).
- [ ] Restrict uploads to group mentor.
- [ ] Store Cloudinary metadata for file resources.

### 4.6.2 Read/delete resources

- [ ] Group members can list resources with filters/sorting + pagination.
- [ ] Creator/admin can delete.
- [ ] Cloudinary file deletion on file-type resource delete.

## 4.7 Healthcheck and Monitoring Endpoint

- [ ] Return status, DB connectivity, uptime, and timestamp.
- [ ] Return 503 when DB disconnected.
- [ ] Include health endpoint in uptime monitor.

---

## 5) Cross-Cutting Architecture and Platform Standards

## 5.1 Permission Matrix Enforcement

- [ ] Audit each route against PRD permission matrix.
- [ ] Add missing global role checks where required.
- [ ] Add missing ownership/group-membership checks.
- [ ] Add tests for role mismatch and ownership mismatch.

## 5.2 Validation Standards

- [ ] Ensure all string fields are trimmed and empty strings rejected.
- [ ] Ensure all ObjectId params validated.
- [ ] Ensure deadlines are future dates where required.
- [ ] Ensure marks bounds enforced.
- [ ] Ensure invite code format constraints enforced.

## 5.3 Error Mapping Consistency

- [ ] Verify status code matrix compliance across controllers.
- [ ] Standardize duplicate key handling to 409.
- [ ] Standardize cast/validation errors to 400.
- [ ] Standardize token errors to 401.

## 5.4 Security Standards

- [ ] Verify helmet configured.
- [ ] Verify cookie flags: `httpOnly`, `Secure`, `SameSite=None`.
- [ ] Verify no sensitive tokens/passwords in logs/responses.
- [ ] Verify upload MIME/type and size allowlist enforced.

---

## 6) Logging, Observability, and Operational Readiness

## 6.1 Pino and pino-http Rollout

- [ ] Create shared logger module.
- [ ] Use pino in app startup and DB connection modules.
- [ ] Add pino-http middleware with request ID generator.
- [ ] Ensure request success/error message formats are standardized.

## 6.2 Log Policy Compliance

- [ ] Ensure 4xx logs at `warn`, 5xx at `error`, fatal process events at `fatal`.
- [ ] Ensure stack traces only in development.
- [ ] Ensure no credentials or tokens are logged.

## 6.3 Request Tracing

- [ ] Ensure each request has stable `req.id`.
- [ ] Include `reqId`, method, URL, statusCode, userId in error logs.

## 6.4 Monitoring and Alerts

- [ ] Configure uptime monitor on healthcheck endpoint.
- [ ] Add alerts for elevated 5xx rate.
- [ ] Add alerts for DB connectivity failures.

---

## 7) Rate Limiting Implementation Checklist

## 7.1 Global and Route-Specific Limiters

- [ ] Implement `globalRate` (100 requests/15 min/IP).
- [ ] Implement `ipAuthRate` (5 requests/5 min/IP) for auth-sensitive routes.
- [ ] Implement `userRate` (20 requests/5 min/user or IP fallback).

## 7.2 Rate Limit Response Contract

- [ ] Ensure standard 429 error body shape.
- [ ] Ensure standard headers enabled (`standardHeaders: true`, `legacyHeaders: false`).

## 7.3 Redis Backed Store (Production)

- [ ] Add optional Redis store support (`rate-limit-redis`).
- [ ] Use fallback in-memory store with warning log when Redis unavailable.
- [ ] Validate behavior in single-instance and multi-instance deployments.

---

## 8) Email Delivery Checklist

## 8.1 Provider Integration

- [ ] Configure Mailtrap for development path.
- [ ] Configure Brevo for production path.
- [ ] Add provider selection logic by environment.

## 8.2 Email Templates and Triggers

- [ ] Build/verify Mailgen templates for all required email types.
- [ ] Wire verification and password reset links with correct URLs.
- [ ] Wire assignment/review/reminder notification email templates (if applicable).

## 8.3 Error Handling

- [ ] Ensure critical auth emails fail request when send fails.
- [ ] Ensure non-critical email failures are logged without request failure.

---

## 9) File Upload Pipeline Checklist

## 9.1 Multer Configuration

- [ ] Enforce MIME allowlist and 5MB size limit.
- [ ] Generate random filenames.
- [ ] Store temp files in OS temp directory.

## 9.2 Cloudinary Upload/Deletion

- [ ] Select resource type by MIME (`image` vs `raw`).
- [ ] Store `cloudinaryPublicId` and deletion-compatible metadata.
- [ ] Ensure temp file cleanup in success and failure paths.

## 9.3 Regression Cases

- [ ] Upload invalid MIME returns 400.
- [ ] Oversized file returns 400/413 per middleware behavior.
- [ ] Resubmission handles old/new file ordering safely.

---

## 10) Data and Index Validation Checklist

## 10.1 Collection-Level Index Verification

- [ ] Validate all required indexes exist for User collection.
- [ ] Validate Group inviteCode unique index.
- [ ] Validate GroupMember compound unique index.
- [ ] Validate Goal indexes (`group`, `assignedTo`, `title`).
- [ ] Validate Assignment indexes (including `{ goalId, isActive }`).
- [ ] Validate Submission indexes including unique `{ assignmentId, userId }`.
- [ ] Validate Notification and Message compound indexes.

## 10.2 Migration and Backfill Planning

- [ ] Create migration notes for schema additions (`isSuspended`, new collections).
- [ ] Plan backfill scripts for missing fields/defaults in existing records.
- [ ] Verify backward compatibility for existing API consumers.

---

## 11) API Documentation and Contract Sync

## 11.1 Route Catalogue Accuracy

- [ ] Ensure every implemented route exists in API docs.
- [ ] Ensure auth/role/rate-limit columns match actual middleware.
- [ ] Ensure request/response examples align to real response wrappers.

## 11.2 Error and Pagination Contracts

- [ ] Document error shape with `statusCode` consistently.
- [ ] Document pagination query params and metadata payload.

## 11.3 Postman Collection

- [ ] Update collection with all new routes (announcements, notifications, messages, leaderboard, admin).
- [ ] Add environment variables for base URL and tokens.
- [ ] Add positive and negative scenario requests.

---

## 12) Testing Strategy Execution Checklist (Phase 4)

## 12.1 Test Infra Setup

- [ ] Configure Vitest.
- [ ] Configure Supertest for HTTP integration tests.
- [ ] Configure MongoDB Memory Server.
- [ ] Configure coverage thresholds.

## 12.2 Unit Test Coverage Targets

- [ ] Middleware tests (target 100%).
- [ ] Validator tests (target 100%).
- [ ] Utility tests (>=90%).
- [ ] Model method tests (>=80%).
- [ ] Controller tests (>=85%).

## 12.3 Integration Test Coverage

- [ ] Add happy-path tests for each route.
- [ ] Add 401 tests for missing auth.
- [ ] Add 403 tests for role denial.
- [ ] Add 400 tests for invalid input.
- [ ] Add 404 tests for missing resource.
- [ ] Add 409 tests for duplicates.
- [ ] Add rate-limit tests for protected routes.

## 12.4 Critical Path Scenarios (Mandatory)

- [ ] Register → Verify → Login → Refresh → Logout.
- [ ] Register with admin role fails.
- [ ] Wrong password returns 401.
- [ ] Suspended account denied.
- [ ] Create group atomicity verified.
- [ ] Group cascade deletion verified.
- [ ] Submit/resubmit file flow safe ordering verified.
- [ ] Review creates notification.
- [ ] Auth limiter 6th request blocked.
- [ ] NoSQL injection payload sanitized.
- [ ] Expired email verification token failure redirect verified.

---

## 13) CI/CD and Security Gates Checklist

## 13.1 CI Pipeline

- [ ] Create/update GitHub Actions workflow for PR + main.
- [ ] Steps: checkout, setup Node 20, `npm ci`, lint, tests, coverage gate.
- [ ] Add `npm audit --audit-level=high` gate.
- [ ] Add secret scanning (`git-secrets`) gate.
- [ ] Add syntax/build sanity check.

## 13.2 Deployment Pipeline

- [ ] Configure deploy trigger for `main` only.
- [ ] Ensure env variables are present in deployment target.
- [ ] Ensure startup validation fails fast when env contract broken.

## 13.3 Containerization

- [ ] Add/update production Dockerfile.
- [ ] Verify runtime entrypoint and exposed port.
- [ ] Verify image excludes unnecessary files.

---

## 14) Performance and Load Testing Checklist

## 14.1 Baseline Measurement

- [ ] Capture baseline response times for auth, CRUD, listing, dashboard, upload.
- [ ] Record baseline CPU/memory under moderate load.

## 14.2 k6 Scenario Implementation

- [ ] Healthcheck high-concurrency test scenario.
- [ ] Login-to-read flow scenario.
- [ ] Concurrent file upload scenario.

## 14.3 Target Verification

- [ ] Validate PRD P99 targets by category.
- [ ] Identify bottlenecks and tune queries/indexes.
- [ ] Re-run after optimizations and store report artifact.

---

## 15) Security Audit and Compliance Checklist

## 15.1 Secret and Credential Safety

- [ ] Ensure no hardcoded secrets in repository.
- [ ] Verify `.env.example` has complete non-secret key list.
- [ ] Verify logs and errors never expose secrets.

## 15.2 JWT and Session Hardening

- [ ] Confirm secret length policy.
- [ ] Confirm refresh cookie flags and path behavior.
- [ ] Confirm refresh token rotation and invalidation.

## 15.3 Injection and Abuse Prevention

- [ ] Confirm mongo sanitize active.
- [ ] Confirm HPP active.
- [ ] Confirm body-size limit active.
- [ ] Confirm auth-sensitive endpoints rate-limited.

## 15.4 Pen-Test Checklist (Internal)

- [ ] Attempt NoSQL operator injection in auth and search-like endpoints.
- [ ] Attempt role escalation via request body tampering.
- [ ] Attempt IDOR on group/assignment/submission/message resources.
- [ ] Attempt invalid file upload and MIME spoofing.

---

## 16) Release Readiness and Go-Live Checklist

## 16.1 Functional Readiness

- [ ] All P0 and P1 tasks completed.
- [ ] All critical scenarios passed.
- [ ] Open defect list triaged and signed off.

## 16.2 Operational Readiness

- [ ] Monitoring dashboard live.
- [ ] Alerts configured and validated.
- [ ] Runbook for incident response prepared.

## 16.3 Rollout Readiness

- [ ] Deployment rollback plan documented and tested.
- [ ] Database migration plan reviewed.
- [ ] API backward compatibility notes shared with frontend.
- [ ] Stakeholder sign-offs collected (Eng, QA, Product, Security).

## 16.4 Post-Release Verification

- [ ] Smoke test authentication and core CRUD in production.
- [ ] Verify email flow and file upload.
- [ ] Verify no elevated 5xx and no auth anomalies.
- [ ] Verify healthcheck uptime and alerting.

---

## 17) Work Breakdown by Team Function (Optional Tracking View)

## 17.1 Backend Engineering

- [ ] Controllers/services/validators/routes implementation by module.
- [ ] Schema/index changes and migration scripts.
- [ ] Error handling, logging, and security middleware.

## 17.2 QA Engineering

- [ ] Test plan creation per endpoint and role matrix.
- [ ] Automation suite implementation.
- [ ] Regression and critical path execution.

## 17.3 DevOps/SRE

- [ ] CI/CD pipeline setup and enforcement.
- [ ] Monitoring + alerting + uptime configuration.
- [ ] Deployment environment variable governance.

## 17.4 Security

- [ ] Threat checklist execution.
- [ ] Dependency vulnerability monitoring.
- [ ] Release security sign-off.

---

## 18) Final Exit Criteria (Must All Be True)

- [ ] Zero unresolved critical/high security issues.
- [ ] Zero unresolved critical/high functional bugs.
- [ ] 80%+ total test coverage; required layer targets met.
- [ ] All list endpoints paginated and standardized.
- [ ] All PRD routes implemented and documented.
- [ ] CI green on lint, tests, coverage, audit, and secrets scan.
- [ ] Production monitoring and graceful shutdown verified.
- [ ] Security and product sign-off completed.

---

## 19) Suggested Execution Order (Practical Sequence)

- [ ] Complete all Phase 1 tasks (security + correctness) before feature work.
- [ ] Complete cascades and pagination (Phase 2) before advanced features.
- [ ] Implement announcements + notifications first (dependencies for other modules).
- [ ] Implement messaging + leaderboard + admin endpoints.
- [ ] Finish testing, CI gates, observability, and load testing.
- [ ] Conduct release readiness review and go-live checklist.

---

## 20) Notes Log

- [ ] Date:
- [ ] Owner:
- [ ] Update:

---

## 21) File-Level Implementation Map (Detailed)

## 21.1 App and Bootstrapping Files

### 21.1.1 `src/app.js`

- [ ] Verify middleware order exactly: security headers -> CORS -> sanitization -> parsers -> cookies -> rate limiting -> routes -> 404 catch-all -> global error handler.
- [ ] Add/verify `helmet` and `hpp` global usage.
- [ ] Add/verify `express-mongo-sanitize` before route mounting.
- [ ] Add/verify `express.json({ limit: "16kb" })` and urlencoded limit.
- [ ] Replace static temp serving risks (ensure no `public/temp` exposure).
- [ ] Ensure CORS uses env-driven allowlist parsing.
- [ ] Add pino-http middleware with request ID generation.

### 21.1.2 `src/index.js`

- [ ] Add strict startup env validation block.
- [ ] Enforce token secret length checks before startup.
- [ ] Fail fast with clear logs when env contract is broken.
- [ ] Implement graceful shutdown with max timeout and force-exit fallback.
- [ ] Handle SIGINT/SIGTERM/unhandledRejection/uncaughtException.
- [ ] Ensure logger (not console) is used for startup/shutdown logs.

### 21.1.3 `src/db/index.db.js`

- [ ] Standardize DB connection options: pool size, selection timeout, socket timeout.
- [ ] Replace all console output with logger calls.
- [ ] Add explicit disconnected/retry observability logs.

## 21.2 Authentication Module Files

### 21.2.1 `src/controllers/auth.controllers.js`

- [ ] Register flow blocks admin role and checks email-only uniqueness.
- [ ] Login flow returns correct status codes and generic invalid-credentials messages.
- [ ] Refresh flow accepts cookie token only and rotates token safely.
- [ ] Refresh flow compares hash-to-hash (stored vs incoming cookie token hash).
- [ ] Forgot/reset flows use hashed temporary tokens and expiries.
- [ ] Change-password clears persisted refresh token and clears cookie.
- [ ] Verify-email handles expired/invalid token redirects correctly.

### 21.2.2 `src/routes/auth.routes.js`

- [ ] Apply correct rate limiters to each auth endpoint.
- [ ] Ensure route protection middleware is consistent with PRD.
- [ ] Ensure refresh route is not expecting body/header token.

### 21.2.3 `src/validators/auth.validators.js`

- [ ] Restrict registration role enum to mentor/learner.
- [ ] Enforce strong password regex and length policy.
- [ ] Ensure fields are trimmed and normalized where applicable.

## 21.3 Group Module Files

### 21.3.1 `src/controllers/group.controllers.js`

- [ ] Implement transactional `createGroup` with mentor membership creation.
- [ ] Implement `leaveGroup` endpoint logic and mentor restriction.
- [ ] Implement invite code regeneration with secure randomness.
- [ ] Implement full `deleteGroup` cascade with transaction safety.
- [ ] Enforce ownership/member checks for every group operation.
- [ ] Add pagination logic to group listing and member listing.

### 21.3.2 `src/routes/group.routes.js`

- [ ] Wire leave-group and invite regeneration endpoints.
- [ ] Verify route ordering to avoid param collisions.
- [ ] Confirm role middleware attached where needed.

### 21.3.3 `src/models/group.models.js`

- [ ] Remove dead `members` array field.
- [ ] Verify invite code uniqueness index exists.

### 21.3.4 `src/models/groupMember.models.js`

- [ ] Add unique compound index `{ group, user }`.
- [ ] Ensure group and user indexes are present for lookups.

## 21.4 Goal and Assignment Module Files

### 21.4.1 `src/controllers/goal.controllers.js`

- [ ] Validate assigned users are current group members.
- [ ] Ensure `getGoalsByGroup` enforces mentor/all vs learner/assigned-only visibility.
- [ ] Implement delete-goal cascade: submissions -> assignments -> goal.
- [ ] Add pagination to group and personal goal queries.

### 21.4.2 `src/controllers/assignment.controllers.js`

- [ ] Ensure goal existence and mentor ownership checks before create.
- [ ] Validate maxMarks/deadline/referenceMaterials.
- [ ] Implement soft-delete (`isActive=false`) consistently.
- [ ] Add pagination + active filter for assignment listing.

### 21.4.3 `src/models/goal.models.js`

- [ ] Verify indexes for group, assignedTo, title, deadline.

### 21.4.4 `src/models/assignment.models.js`

- [ ] Add/verify compound index `{ goalId, isActive }`.
- [ ] Add/verify index for `groupId` and `deadline`.

## 21.5 Submission and Resource Module Files

### 21.5.1 `src/controllers/submission.controllers.js`

- [ ] Enforce submit preconditions: active assignment, deadline, membership, learner role.
- [ ] Enforce resubmission only for `revision_required`.
- [ ] Ensure new file upload completes before old file delete in resubmission.
- [ ] Add my-submission endpoint with caller-only scope.
- [ ] Ensure review endpoint validates marks within assignment max.
- [ ] Add pagination/filtering for submissions listing endpoint.

### 21.5.2 `src/controllers/resource.controllers.js`

- [ ] Enforce resource type-specific payload rules (`file`, `link`, `note`).
- [ ] Enforce creator/admin delete permissions.
- [ ] Ensure Cloudinary delete uses correct resource type metadata.
- [ ] Add pagination/filtering/sorting behavior.

### 21.5.3 `src/middlewares/multer.middlewares.js`

- [ ] Use `os.tmpdir()` destination and random filename strategy.
- [ ] Enforce MIME allowlist and max file size.
- [ ] Ensure middleware returns standardized invalid-file errors.

### 21.5.4 `src/models/submission.models.js`

- [ ] Verify unique compound index `{ assignmentId, userId }`.
- [ ] Ensure enum statuses include all PRD states.

## 21.6 New Feature Files (2.0)

### 21.6.1 Create new model/controller/route triplets

- [ ] Add announcement model/controller/routes.
- [ ] Add notification model/controller/routes.
- [ ] Add message model/controller/routes.
- [ ] Add leaderboard controller/routes (service helper as needed).
- [ ] Add admin controller/routes with role-guarded endpoints.

### 21.6.2 `src/app.js` route registration

- [ ] Register announcements, notifications, messages, leaderboard, admin routes under `/api/v1/*`.
- [ ] Verify route mount order and path consistency with PRD catalogue.

## 21.7 Shared Utilities and Middleware

### 21.7.1 `src/middlewares/error.middlewares.js`

- [ ] Include `statusCode` in every error response payload.
- [ ] Convert known mongoose/jwt errors to standard API errors.
- [ ] Hide stack traces in production responses.

### 21.7.2 `src/middlewares/validators.middlewares.js`

- [ ] Use `err.path` (not deprecated `err.param`) in validation response formatting.
- [ ] Return field-level error array consistently.

### 21.7.3 `src/middlewares/auth.middlewares.js`

- [ ] Enforce suspended-user check during token verification.
- [ ] Ensure user lookup + verification are robust against deleted users.

### 21.7.4 `src/middlewares/rateLimiter.middlewares.js`

- [ ] Implement/verify global, ipAuth, and user-based limiters.
- [ ] Ensure 429 body matches error standard.
- [ ] Add optional Redis store support with safe fallback.

### 21.7.5 `src/utils/constants.utils.js`

- [ ] Move all magic numbers and repeated literals to constants.
- [ ] Add constants for auth windows, file limits, pagination defaults/max.

---

## 22) Endpoint-Level Definition of Done (Per Endpoint Card)

Use this card for every endpoint before marking complete.

### 22.1 Endpoint Card Template

- [ ] Route and method match PRD catalogue.
- [ ] Request validation complete (required/optional/type/range/enum).
- [ ] Auth check complete (guest/authenticated).
- [ ] Role check complete (`admin`/`mentor`/`learner`/any).
- [ ] Ownership or membership check complete.
- [ ] Rate limiter attached correctly.
- [ ] Controller logic implemented for happy path.
- [ ] Controller logic implemented for all expected error paths.
- [ ] Response wrapper format matches API standard.
- [ ] Pagination/filter/sort implemented if list endpoint.
- [ ] Notifications/emails triggered where required.
- [ ] Audit log event added if action is destructive/sensitive.
- [ ] Unit tests added/updated.
- [ ] Integration tests added/updated.
- [ ] API docs and Postman updated.

### 22.2 Mandatory Error Cases Per Endpoint

- [ ] Invalid body/query/path validation -> 400.
- [ ] Missing/invalid token -> 401.
- [ ] Wrong role -> 403.
- [ ] Ownership/member mismatch -> 403.
- [ ] Missing entity -> 404.
- [ ] Duplicate conflict -> 409.
- [ ] Rate limit exceeded -> 429.
- [ ] Unexpected internal failure -> 500.

---

## 23) Detailed Test Case Matrix (Execution Ready)

## 23.1 Auth Test IDs

- [ ] AUTH-001 Register valid mentor account -> 201.
- [ ] AUTH-002 Register valid learner account -> 201.
- [ ] AUTH-003 Register with role admin -> 400.
- [ ] AUTH-004 Register duplicate email -> 409.
- [ ] AUTH-005 Login with unknown email -> 401 generic message.
- [ ] AUTH-006 Login with wrong password -> 401 generic message.
- [ ] AUTH-007 Login before verification -> 403.
- [ ] AUTH-008 Verify email with valid token -> redirect success.
- [ ] AUTH-009 Verify email with expired token -> redirect failed.
- [ ] AUTH-010 Refresh token from cookie -> 200 new access token.
- [ ] AUTH-011 Refresh token via header/body -> 401.
- [ ] AUTH-012 Refresh token reuse/replay attempt -> 401.
- [ ] AUTH-013 Change password clears refresh cookie/token.
- [ ] AUTH-014 Suspended account login -> 403.

## 23.2 Group/Goal/Assignment Test IDs

- [ ] GROUP-001 Mentor creates group -> group + mentor membership created atomically.
- [ ] GROUP-002 Join group with invalid invite -> 404.
- [ ] GROUP-003 Join group duplicate membership -> 409.
- [ ] GROUP-004 Learner leave group -> 200 and membership removed.
- [ ] GROUP-005 Mentor leave own group -> 400.
- [ ] GROUP-006 Regenerate invite code invalidates old code.
- [ ] GROUP-007 Group delete by non-owner non-admin -> 403.
- [ ] GROUP-008 Group delete cascade removes linked children.
- [ ] GOAL-001 Create goal with non-member assignee -> 400.
- [ ] GOAL-002 Learner sees only assigned goals.
- [ ] GOAL-003 Delete goal cascade removes assignments/submissions.
- [ ] ASSIGN-001 Create assignment with invalid maxMarks -> 400.
- [ ] ASSIGN-002 Soft delete assignment sets isActive false.

## 23.3 Submission/Resource Test IDs

- [ ] SUB-001 Submit assignment with text only -> 201.
- [ ] SUB-002 Submit assignment with file only -> 201.
- [ ] SUB-003 Submit after deadline -> 400.
- [ ] SUB-004 Resubmit when status is reviewed -> 400.
- [ ] SUB-005 Resubmit when status is revision_required -> 201.
- [ ] SUB-006 Upload failure does not delete old Cloudinary file.
- [ ] SUB-007 Review with marks > maxMarks -> 400.
- [ ] SUB-008 Learner fetches my-submission and sees own record only.
- [ ] RES-001 Upload resource type link without linkUrl -> 400.
- [ ] RES-002 Upload resource type note without description -> 400.
- [ ] RES-003 Delete resource by unauthorized user -> 403.

## 23.4 New Feature Test IDs

- [ ] ANN-001 Mentor creates announcement -> notifications created for group members.
- [ ] ANN-002 Announcement list sorted pinned-first and recent-first.
- [ ] NOTIF-001 Mark single notification as read (owned only).
- [ ] NOTIF-002 Mark-all-read updates all unread notifications for caller.
- [ ] MSG-001 Send message requires shared group membership.
- [ ] MSG-002 Soft-deleted message appears as deleted placeholder behavior.
- [ ] LEAD-001 Leaderboard excludes unreviewed submissions.
- [ ] LEAD-002 Leaderboard handles zero maxMarks denominator safely.
- [ ] ADMIN-001 Non-admin access to admin endpoints -> 403.
- [ ] ADMIN-002 Suspend user prevents future login.
- [ ] ADMIN-003 Force delete group executes full cascade.

---

## 24) Sprint-Wise Detailed Execution Plan

## 24.1 Sprint 1 (Security and Correctness Foundation)

- [ ] Complete all auth bug and status code corrections.
- [ ] Complete startup env validation and shutdown handlers.
- [ ] Complete app-level security middleware hardening.
- [ ] Complete error-handler standardization and validator compatibility fix.
- [ ] Complete critical model index additions and schema cleanup.
- [ ] Deliverables: merged code + passing tests + updated docs.

## 24.2 Sprint 2 (Cascades and Pagination)

- [ ] Complete create-group transaction and goal/group cascades.
- [ ] Complete leave-group and invite-regenerate endpoints.
- [ ] Roll out pagination across all list endpoints.
- [ ] Add my-submission endpoint.
- [ ] Deliverables: route-complete core modules + integration test suite updates.

## 24.3 Sprint 3 (Announcements and Notifications)

- [ ] Implement announcement CRUD + pagination/sorting.
- [ ] Implement notification CRUD + unread counters + mark-all-read.
- [ ] Wire notification triggers from goals/assignments/reviews/announcements.
- [ ] Deliverables: new models/routes/controllers + tests + Postman updates.

## 24.4 Sprint 4 (Messaging, Leaderboard, Admin)

- [ ] Implement direct messaging and shared-group validation.
- [ ] Implement leaderboard endpoints and scoring logic.
- [ ] Implement all admin routes + safeguards + cascades.
- [ ] Deliverables: all 2.0 feature endpoints complete.

## 24.5 Sprint 5 (Testing, CI/CD, Ops)

- [ ] Achieve target coverage and pass critical-path scenarios.
- [ ] Finalize CI security gates, lint, audit, coverage fail rules.
- [ ] Finalize logging, monitoring, health checks, and alert setup.
- [ ] Execute load tests and tune bottlenecks.
- [ ] Deliverables: release candidate + go-live signoff pack.

---

## 25) Release Signoff Packet Checklist

## 25.1 Engineering Signoff

- [ ] All PRD routes implemented.
- [ ] Breaking changes documented for frontend consumers.
- [ ] Open technical debt items documented with owner and due date.

## 25.2 QA Signoff

- [ ] Regression suite pass report attached.
- [ ] Critical-path pass report attached.
- [ ] Known issues list signed with severity and mitigation.

## 25.3 Security Signoff

- [ ] Security checklist complete.
- [ ] Dependency audit report attached.
- [ ] No hardcoded secrets scan report attached.

## 25.4 DevOps Signoff

- [ ] CI pipeline passing on protected branch.
- [ ] Deployment rollback tested.
- [ ] Monitoring and alerts confirmed.

## 25.5 Product Signoff

- [ ] Feature completeness reviewed against PRD.
- [ ] KPI measurement plan confirmed.
- [ ] Go-live approval recorded.

---

## 26) Notes Log (Extended)

- [ ] Date:
- [ ] Owner:
- [ ] Update:

- [ ] Date:
- [ ] Owner:
- [ ] Update:
