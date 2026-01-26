# StudyHive Backend 🎓

> A comprehensive REST API for collaborative learning and academic management. StudyHive enables mentors and learners to organize study groups, define learning goals, manage assignments, and track progress with role-based access control.

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v9.1-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [File Upload System](#-file-upload-system)
- [Error Handling](#-error-handling)
- [Project Structure](#-project-structure)
- [Usage Examples](#-usage-examples)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **User Registration** with email validation
- **Email Verification** with temporary token links
- **JWT-based Authentication** with access & refresh tokens
- **Password Reset** with secure token-based flow
- **Change Password** functionality for logged-in users
- **Role-Based Access Control** (Admin, Mentor, Learner)
- **Automatic Token Refresh** mechanism
- **Logout** with token invalidation

### 👥 Study Group Management
- **Create Study Groups** (Mentors only)
- **Join Groups** via invite codes
- **Invite Members** to groups
- **View Group Members** with their roles
- **Remove Members** from groups
- **Update Group** details (Mentors only)
- **Delete Groups** (Admin only)
- **Unique Invite Codes** for easy group joining

### 🎯 Learning Goals
- **Create Learning Goals** within groups (Mentors only)
- **Assign Goals** to specific learners
- **Track Goal Status**: `not_started`, `ongoing`, `completed`
- **Update Goals** with new details (Mentors only)
- **Delete Goals** (Mentors only)
- **View Goals** based on user role and permissions

### 📝 Assignment Management
- **Create Assignments** under learning goals (Mentors only)
- **Set Deadlines** for assignments
- **Add Reference Materials** and resource links
- **Track Assignment Status**
- **Update Assignments** (Mentors only)
- **Delete Assignments** (Mentors only)
- **View Assignment Details** with context

### 📤 Assignment Submissions & Reviews
- **Submit Assignments** with file upload support (Learners only)
- **Support Multiple Submission Types**: File upload + text
- **Deadline Validation** - prevents late submissions
- **Resubmission Logic** - allows resubmission if revision required
- **Mentor Review System** - review and grade submissions
- **Provide Feedback** with marks and comments
- **Request Revisions** - send back for improvement
- **Track Submission Status**: `pending`, `submitted`, `reviewed`, `revision_required`

### ☁️ File Upload System
- **Secure File Upload** via Multer middleware
- **Cloud Storage** integration with Cloudinary
- **5MB File Size Limit** per submission
- **Automatic Cleanup** of temporary files
- **Secure HTTPS URLs** for all uploaded files
- **Error Handling** with fallback mechanisms

### 📧 Email System
- **Email Verification** - verify user accounts
- **Password Reset Emails** with secure links
- **HTML Email Templates** with Mailgen
- **Configurable Email Sending** via Nodemailer
- **Automatic Expiry** for email tokens

---

## 🛠️ Tech Stack

### Backend Framework
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **ES6 Modules** - Modern JavaScript syntax

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing and encryption
- **crypto** - Secure token generation

### File & Cloud Services
- **Multer** - File upload middleware
- **Cloudinary** - Cloud file storage and CDN

### Email Services
- **Nodemailer** - Email sending
- **Mailgen** - HTML email template generation

### Validation & Middleware
- **express-validator** - Input validation and sanitization
- **CORS** - Cross-origin resource sharing
- **cookie-parser** - Cookie handling

### Development Tools
- **dotenv** - Environment variable management
- **nodemon** - Auto-restart on file changes
- **Prettier** - Code formatting

---

## 📦 Installation

### Prerequisites
- Node.js v16 or higher
- MongoDB instance (local or cloud)
- Cloudinary account (for file uploads)
- Email service credentials (Nodemailer)

### Steps

1. **Clone the Repository**
```bash
git clone https://github.com/Adi-Dcpp/StudyHive-Backend.git
cd StudyHive-Backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Create `.env` File**
```bash
cp .env.example .env
```

4. **Configure Environment Variables** (see below)

5. **Start the Server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000` (or configured PORT)

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/studyhive

# JWT Tokens
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@studyhive.com
```

### Getting Credentials

**Cloudinary**:
1. Sign up at https://cloudinary.com
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, API Secret

**MongoDB**:
1. Create cluster at https://mongodb.com/cloud/atlas
2. Get connection string
3. Add to `MONGO_URI`

**Gmail SMTP**:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use in `SMTP_PASS`

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login user | ❌ |
| POST | `/logout` | Logout user | ✅ |
| GET | `/me` | Get current user | ✅ |
| POST | `/refresh-token` | Refresh access token | ✅ |
| POST | `/verify-email/:token` | Verify email | ❌ |
| POST | `/resend-email-verification` | Resend verification email | ❌ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/reset-password/:token` | Reset password | ❌ |
| POST | `/change-password` | Change password | ✅ |

### Study Groups (`/groups`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Get all joined groups | ✅ | All |
| POST | `/` | Create group | ✅ | Mentor |
| GET | `/:groupId` | Get group details | ✅ | Member |
| PUT | `/:groupId` | Update group | ✅ | Mentor |
| DELETE | `/:groupId` | Delete group | ✅ | Admin |
| POST | `/join` | Join group via invite code | ✅ | All |
| POST | `/:groupId/invite` | Invite members | ✅ | Mentor |
| GET | `/:groupId/members` | View group members | ✅ | Member |
| DELETE | `/:groupId/members/:userId` | Remove member | ✅ | Mentor |

### Learning Goals (`/goals`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/:groupId` | Create goal | ✅ | Mentor |
| GET | `/:groupId` | Get goals in group | ✅ | Mentor/Assigned |
| GET | `/:goalId` | Get goal details | ✅ | Mentor/Assigned |
| PUT | `/:goalId` | Update goal | ✅ | Mentor |
| DELETE | `/:goalId` | Delete goal | ✅ | Mentor |

### Assignments (`/assignments`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/:goalId` | Create assignment | ✅ | Mentor |
| GET | `/:goalId` | Get assignments | ✅ | Any |
| GET | `/:assignmentId` | Get assignment details | ✅ | Any |
| PUT | `/:assignmentId` | Update assignment | ✅ | Mentor |
| DELETE | `/:assignmentId` | Delete assignment | ✅ | Mentor |

### Submissions (`/submissions`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/assignments/:assignmentId/submit` | Submit assignment | ✅ | Learner |
| PUT | `/:submissionId/review` | Review submission | ✅ | Mentor |
| GET | `/assignments/:assignmentId/submissions` | Get all submissions | ✅ | Mentor |

---

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (admin | mentor | learner, default: learner),
  isEmailVerified: Boolean (default: false),
  refreshToken: String,
  emailVerificationToken: String,
  emailVerificationTokenExpiry: Date,
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Group Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  mentor: ObjectId (ref: User, required),
  inviteCode: String (unique, required),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### GroupMember Model
```javascript
{
  _id: ObjectId,
  group: ObjectId (ref: Group, required),
  user: ObjectId (ref: User, required),
  role: String (mentor | learner),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Goal Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  group: ObjectId (ref: Group, required),
  assignedTo: [ObjectId] (ref: User),
  status: String (not_started | ongoing | completed, default: not_started),
  createdBy: ObjectId (ref: User, required),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Assignment Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  goalId: ObjectId (ref: Goal, required),
  groupId: ObjectId (ref: Group, required),
  createdBy: ObjectId (ref: User, required),
  deadline: Date,
  referenceMaterials: [String],
  maxMarks: Number (default: 100),
  isActive: Boolean (default: true),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Submission Model
```javascript
{
  _id: ObjectId,
  assignmentId: ObjectId (ref: Assignment, required),
  userId: ObjectId (ref: User, required),
  submittedFile: String (Cloudinary URL),
  submittedText: String,
  status: String (pending | submitted | reviewed | revision_required),
  marksObtained: Number,
  feedback: String,
  submittedAt: Date,
  reviewedAt: Date,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔐 Authentication Flow

### Registration & Email Verification
```
1. User POSTs /auth/register with email, name, password
2. Validation checks for existing user
3. Password hashed with bcrypt (10 rounds)
4. User created in database
5. Temporary verification token generated
6. Email sent with verification link
7. User clicks link and POSTs /auth/verify-email/:token
8. Token validated and user marked as verified
```

### Login & Token Generation
```
1. User POSTs /auth/login with email and password
2. User must be email verified
3. Password compared with stored hash
4. Access token generated (15 min expiry)
5. Refresh token generated (7 days expiry)
6. Tokens stored in HTTP-only cookies
7. User receives tokens in response
```

### Token Refresh
```
1. Access token expires after 15 minutes
2. Frontend sends refresh token to POST /auth/refresh-token
3. Refresh token validated against stored token
4. New access token generated
5. New refresh token generated and stored
6. Tokens returned for future requests
```

### Protected Endpoint Access
```
1. Client sends request with Authorization: Bearer <accessToken>
2. Middleware verifies token signature
3. Middleware decodes token and fetches user
4. User attached to request object
5. Route handler proceeds with request
6. If token invalid/expired, 401 Unauthorized returned
```

---

## ☁️ File Upload System

### Upload Flow
```
1. Learner POSTs to /submissions/assignments/:id/submit with file
2. Multer middleware processes file
3. File saved to public/temp/ with unique name
4. Controller calls uploadToCloudinary()
5. File uploaded to Cloudinary cloud storage
6. Secure HTTPS URL returned
7. Temporary file deleted from server
8. URL stored in database (Submission.submittedFile)
9. Response sent with submission details
```

### Error Handling
- If file too large (>5MB): rejected
- If upload fails: temp file cleanup attempted
- If database save fails: Cloudinary URL still available
- Automatic cleanup prevents disk space issues

### Supported File Types
- Documents: `.pdf`, `.doc`, `.docx`
- Images: `.jpg`, `.jpeg`, `.png`
- Archives: `.zip`, `.rar`
- Any file type supported via Cloudinary

---

## ⚡ Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [],
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |

### Error Handling Examples

**Duplicate Email**
```json
{
  "success": false,
  "message": "User already exists",
  "statusCode": 409
}
```

**Missing Authorization**
```json
{
  "success": false,
  "message": "Unauthorized request",
  "statusCode": 401
}
```

**Insufficient Permission**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

---

## 📁 Project Structure

```
StudyHive-Backend/
├── public/
│   └── temp/                    # Temporary file storage
│       ├── assignments/
│       ├── resources/
│       └── submissions/
├── src/
│   ├── app.js                   # Express app setup
│   ├── index.js                 # Server entry point
│   ├── controllers/             # Business logic
│   │   ├── auth.controllers.js
│   │   ├── group.controllers.js
│   │   ├── goal.controllers.js
│   │   ├── assignment.controllers.js
│   │   └── submission.controllers.js
│   ├── models/                  # Database schemas
│   │   ├── user.models.js
│   │   ├── group.models.js
│   │   ├── groupMember.models.js
│   │   ├── goal.models.js
│   │   ├── assignment.models.js
│   │   └── submission.models.js
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js
│   │   ├── group.routes.js
│   │   ├── goal.routes.js
│   │   ├── assignment.routes.js
│   │   └── submission.routes.js
│   ├── middlewares/             # Middleware functions
│   │   ├── auth.middlewares.js
│   │   ├── authorizeRoles.middlewares.js
│   │   ├── error.middlewares.js
│   │   ├── multer.middlewares.js
│   │   └── validators.middlewares.js
│   ├── validators/              # Input validation
│   │   ├── auth.validators.js
│   │   ├── group.validators.js
│   │   ├── goal.validators.js
│   │   ├── assignment.validators.js
│   │   └── submission.validators.js
│   ├── utils/                   # Utility functions
│   │   ├── api-error.utils.js
│   │   ├── api-response.utils.js
│   │   ├── async-handler.utils.js
│   │   ├── cloudinary.utils.js
│   │   ├── jwt.utils.js
│   │   ├── send-email.utils.js
│   │   ├── mail-template.utils.js
│   │   └── constants.utils.js
│   └── db/
│       └── index.db.js          # Database connection
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── README.md                    # This file
├── prd.md                       # Product Requirements
├── PORTFOLIO_REVIEW.md          # Portfolio assessment
└── WORK_SUMMARY.md              # Complete work summary
```

---

## 💻 Usage Examples

### 1. Register a New User

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "learner"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully and verification email has been sent",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "learner"
    }
  }
}
```

### 2. Create a Study Group

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/groups \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development Bootcamp",
    "description": "Complete web development course"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Group successfully created",
  "data": {
    "groupId": "507f1f77bcf86cd799439012",
    "name": "Web Development Bootcamp",
    "inviteCode": "a1b2c3d4e5f6"
  }
}
```

### 3. Join a Study Group

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/groups/join \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "inviteCode": "a1b2c3d4e5f6"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined the group",
  "data": {
    "groupId": "507f1f77bcf86cd799439012",
    "name": "Web Development Bootcamp",
    "role": "learner"
  }
}
```

### 4. Create a Learning Goal

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/goals/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn React Basics",
    "description": "Master React fundamentals",
    "assignedTo": ["507f1f77bcf86cd799439013"]
  }'
```

### 5. Create an Assignment

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/assignments/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build a Todo App",
    "description": "Create a functional todo application",
    "deadline": "2024-02-15T23:59:59Z",
    "referenceMaterials": ["https://react.dev", "https://github.com"],
    "maxMarks": 100
  }'
```

### 6. Submit an Assignment with File

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/submissions/assignments/507f1f77bcf86cd799439015/submit \
  -H "Authorization: Bearer <accessToken>" \
  -F "file=@/path/to/submission.pdf" \
  -F "submittedText=I have completed the assignment"
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment submitted successfully",
  "data": {
    "submissionId": "507f1f77bcf86cd799439016",
    "status": "submitted"
  }
}
```

### 7. Review a Submission

**Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/submissions/507f1f77bcf86cd799439016/review \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reviewed",
    "feedback": "Great work! Only minor improvements needed.",
    "marksObtained": 85
  }'
```

---

## 🚀 Getting Started

### Quick Start
```bash
# 1. Clone and setup
git clone https://github.com/Adi-Dcpp/StudyHive-Backend.git
cd StudyHive-Backend
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start development server
npm run dev

# 4. Server running on http://localhost:3000
```

### Available Scripts
```bash
npm run dev      # Start with auto-reload (development)
npm start        # Start server (production)
npm run format   # Format code with Prettier
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

### Steps to Contribute
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the ISC License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aditya** - [@Adi-Dcpp](https://github.com/Adi-Dcpp)

---

## 🔗 Links

- **GitHub**: https://github.com/Adi-Dcpp/StudyHive-Backend
- **Issues**: https://github.com/Adi-Dcpp/StudyHive-Backend/issues
- **Product Requirements**: [PRD.md](prd.md)
- **Work Summary**: [WORK_SUMMARY.md](WORK_SUMMARY.md)
- **Portfolio Review**: [PORTFOLIO_REVIEW.md](PORTFOLIO_REVIEW.md)

---

## 📝 Notes

- This is a portfolio project demonstrating full-stack backend development
- Follows production-grade patterns and best practices
- Implements JWT authentication, role-based access control, and file uploads
- Ready for frontend integration

**Happy Learning! 🎓**