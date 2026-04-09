# StudyHive Backend – Product Requirements Document (PRD)

## Version

1.0.0

## Product Type

RESTful Backend API for Collaborative Study & Learning Management

---

## 1. Product Overview

**StudyHive Backend** is a RESTful API designed to support collaborative learning and academic planning.  
The platform enables mentors and learners to organize study groups, define learning goals, manage assignments, share resources, and track progress using role-based access control.

The system focuses on **education-centric collaboration**, unlike traditional project management tools.

---

## 2. Target Users

### Platform Admin

- Oversees the entire system
- Has full access to all study groups and users

### Group Mentor

- Creates and manages study groups
- Defines learning goals and assignments
- Reviews learner submissions

### Learner

- Joins study groups
- Completes assignments
- Tracks learning progress

---

## 3. Core Features

### 3.1 Authentication & Authorization

- User registration with email verification
- Secure login using JWT (access & refresh tokens)
- Logout and token rotation
- Forgot and reset password via email
- Role-based access control (Admin, Mentor, Learner)

---

### 3.2 Study Group Management

- Create study groups (Mentor only)
- Join groups via invite code or email
- View all joined groups
- Update group details (Mentor only)
- Delete groups (Admin only)

---

### 3.3 Member Management

- Invite users to study groups
- View group members
- Change member roles (Mentor only)
- Remove members from groups

---

### 3.4 Learning Goals

- Create learning goals within a study group
- Assign goals to learners
- Track goal status:
  - Not Started
  - Ongoing
  - Completed
- Update or delete goals (Mentor only)

---

### 3.5 Assignment Management

- Create assignments under learning goals
- Set deadlines
- Upload reference materials
- Assignment status tracking

---

### 3.6 Assignment Submissions

- Learners submit assignments
- File upload support
- Mentor feedback on submissions
- Submission status:
  - Pending
  - Submitted
  - Reviewed
  - Revision Required

---

### 3.7 Study Resources

- Upload shared resources (files, links, notes)
- Categorize resources
- Accessible to all group members

---

### 3.8 Announcements

- Create group-wide announcements
- Important updates from mentors
- Read/unread tracking

---

### 3.9 System Health

- Health check endpoint for monitoring service availability

---

## 4. API Endpoints

### 4.1 Authentication Routes (`/api/v1/auth`)

- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /me`
- `POST /refresh-token`
- `POST /forgot-password`
- `POST /reset-password/:token`
- `GET /verify-email/:token`

---

### 4.2 Study Group Routes (`/api/v1/groups`)

- `GET /`
- `POST /`
- `GET /:groupId`
- `PUT /:groupId`
- `DELETE /:groupId`
- `POST /:groupId/invite`
- `GET /:groupId/members`
- `DELETE /:groupId/members/:userId`

---

### 4.3 Learning Goals (`/api/v1/goals`)

- `POST /:groupId`
- `GET /:groupId`
- `PUT /:goalId`
- `DELETE /:goalId`

---

### 4.4 Assignments (`/api/v1/assignments`)

- `POST /:goalId`
- `GET /:goalId`
- `PUT /:assignmentId`
- `DELETE /:assignmentId`
- `POST /:assignmentId/submit`

---

### 4.5 Resources (`/api/v1/resources`)

- `POST /:groupId`
- `GET /:groupId`
- `DELETE /:resourceId`

---

### 4.6 Announcements (`/api/v1/announcements`)

- `POST /:groupId`
- `GET /:groupId`
- `DELETE /:announcementId`

---

### 4.7 Health Check (`/api/v1/healthcheck`)

- `GET /`

---

## 5. Permission Matrix

| Feature               | Admin | Mentor | Learner |
| --------------------- | ----- | ------ | ------- |
| Create Study Group    | ✗     | ✓      | ✗       |
| Delete Study Group    | ✓     | ✗      | ✗       |
| Invite Members        | ✗     | ✓      | ✗       |
| Create Learning Goals | ✗     | ✓      | ✗       |
| Create Assignments    | ✗     | ✓      | ✗       |
| Submit Assignments    | ✗     | ✗      | ✓       |
| Upload Resources      | ✗     | ✓      | ✗       |
| View Content          | ✓     | ✓      | ✓       |

---

## 6. Data Models (High-Level)

### User Roles

- `admin`
- `mentor`
- `learner`

### Goal Status

- `not_started`
- `ongoing`
- `completed`

### Assignment Status

- `pending`
- `submitted`
- `reviewed`
- `revision_required`

---

## 7. Security Features

- JWT-based authentication
- Refresh token rotation
- Role-based authorization middleware
- Input validation on all endpoints
- Secure file uploads
- Email verification and password reset
- CORS configuration

---

## 8. Success Criteria

- Secure authentication and RBAC
- Clear separation of roles and permissions
- Proper relational data modeling
- Stable file upload and submission flow
- Clean RESTful API design
- Production-ready backend architecture
