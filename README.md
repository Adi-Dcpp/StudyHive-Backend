# StudyHive Backend 🎓

> A production-grade REST API for collaborative learning and academic management. StudyHive enables educators and students to organize study groups, define learning objectives, manage assignments, and track progress with enterprise-level security and scalability.

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v9.1-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Architecture](#-architecture)
- [Security](#-security)
- [Database Schema](#-database-schema)
- [Usage Examples](#-usage-examples)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization

- **User Registration** with email verification
- **JWT-based Authentication** with access & refresh tokens
- **Secure Password Reset** with email verification
- **Role-Based Access Control** (Admin, Mentor, Learner)
- **Token Refresh Mechanism** for seamless experience
- **Automatic Logout** with token invalidation

### 👥 Study Group Management

- **Create & Manage Study Groups** for collaborative learning
- **Invite System** with unique invite codes
- **Member Management** with role-based permissions
- **Group Details & Metadata** tracking
- **Easy Group Discovery** via invite codes

### 🎯 Learning Goals

- **Define Learning Objectives** within study groups
- **Track Progress** with status management (not_started, ongoing, completed)
- **Assign Goals** to specific learners
- **Update & Archive** goals as needed

### 📝 Assignment Management

- **Create & Manage Assignments** tied to learning goals
- **Set Deadlines** with enforcement
- **Add Reference Materials** for learner resources
- **Update & Deactivate** assignments
- **Assignment Tracking** and status management

### 📤 Assignment Submissions & Reviews

- **Submit Assignments** with file uploads or text
- **File Upload Support** with Cloudinary integration
- **Mentor Review System** with feedback and grades
- **Revision Requests** to improve submissions
- **Status Tracking** (pending, submitted, reviewed, revision_required)
- **Deadline Enforcement** to prevent late submissions

### ☁️ File Upload System

- **Secure Cloud Storage** via Cloudinary
- **Automatic Temp File Cleanup** for efficiency
- **5MB File Size Limit** for optimal performance
- **Multiple File Format Support**
- **HTTPS Secured URLs** for all uploads

### 📧 Email System

- **HTML Email Templates** with professional styling
- **Email Verification** for account security
- **Password Reset Emails** with secure links
- **Configurable Email Service** via Nodemailer

### 📚 Study Resources

- **Upload Shared Resources** to study groups
- **Resource Management** with mentor permissions
- **File Organization** by study group
- **Easy Resource Discovery** for learners
- **Cloud Storage** for all resources

### 🏥 Health Check System

- **Server Health Monitoring** via dedicated endpoint
- **Database Connection Status** verification
- **System Readiness** validation
- **Production Monitoring Support**

---

## 🛠️ Tech Stack

| Layer              | Technology                |
| ------------------ | ------------------------- |
| **Runtime**        | Node.js v16+              |
| **Framework**      | Express.js v5.2           |
| **Database**       | MongoDB + Mongoose        |
| **Authentication** | JWT (jsonwebtoken)        |
| **Security**       | bcrypt, crypto            |
| **File Upload**    | Multer, Cloudinary        |
| **Email**          | Nodemailer, Mailgen       |
| **Validation**     | express-validator         |
| **DevTools**       | nodemon, dotenv, Prettier |

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Adi-Dcpp/StudyHive-Backend.git
cd StudyHive-Backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Server runs on http://localhost:3000
```

---

## 📦 Installation

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** (local or cloud - MongoDB Atlas)
- **Cloudinary Account** (for file uploads)
- **Email Service** credentials (Gmail SMTP)

### Setup Steps

1. **Clone Repository**

```bash
git clone https://github.com/Adi-Dcpp/StudyHive-Backend.git
cd StudyHive-Backend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Environment**

```bash
cp .env.example .env
```

4. **Update .env with Your Credentials**

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/studyhive

ACCESS_TOKEN_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAILTRAP_SMTP_HOST=smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=your_username
MAILTRAP_SMTP_PASS=your_password
MAIL_FROM=noreply@studyhive.com
```

5. **Start Server**

```bash
npm run dev        # Development mode
npm start          # Production mode
```

---

## ⚙️ Configuration

### Environment Variables

| Variable                | Description        | Example                |
| ----------------------- | ------------------ | ---------------------- |
| `PORT`                  | Server port        | 3000                   |
| `NODE_ENV`              | Environment        | development/production |
| `MONGO_URI`             | MongoDB connection | mongodb+srv://...      |
| `ACCESS_TOKEN_SECRET`   | JWT secret         | your_secret_key        |
| `ACCESS_TOKEN_EXPIRY`   | Token lifetime     | 15m                    |
| `REFRESH_TOKEN_SECRET`  | Refresh secret     | your_secret_key        |
| `REFRESH_TOKEN_EXPIRY`  | Refresh lifetime   | 7d                     |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account | your_account           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key | your_api_key           |
| `CLOUDINARY_API_SECRET` | Cloudinary secret  | your_api_secret        |
| `MAILTRAP_SMTP_HOST`    | Email host         | smtp.mailtrap.io       |
| `MAILTRAP_SMTP_PORT`    | Email port         | 2525                   |
| `MAILTRAP_SMTP_USER`    | Email user         | username               |
| `MAILTRAP_SMTP_PASS`    | Email password     | password               |
| `MAIL_FROM`             | Sender email       | noreply@studyhive.com  |
| `CORS_ORIGIN`           | Allowed origins    | http://localhost:5173  |

### Getting Service Credentials

**MongoDB Atlas**

1. Visit https://mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Whitelist your IP

**Cloudinary**

1. Sign up at https://cloudinary.com
2. Go to Settings → API Keys
3. Copy Cloud Name, API Key, API Secret

**Gmail SMTP**

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use in SMTP_PASS

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication (`/auth`)

```
POST   /register                  - Register new user
POST   /login                     - Login user
POST   /logout                    - Logout user (Protected)
GET    /me                        - Get current user (Protected)
POST   /refresh-token             - Refresh access token
GET    /verify-email/:token       - Verify email
POST   /resend-email-verification - Resend verification
POST   /forgot-password           - Request password reset
POST   /reset-password/:token     - Reset password
POST   /change-password           - Change password (Protected)
```

### Groups (`/groups`)

```
GET    /                          - Get all user's groups
POST   /                          - Create new group
GET    /:groupId                  - Get group details
PUT    /:groupId                  - Update group
DELETE /:groupId                  - Delete group
POST   /join                      - Join via invite code
POST   /:groupId/invite           - Invite members
GET    /:groupId/members          - View members
DELETE /:groupId/members/:userId  - Remove member
```

### Learning Goals (`/goals`)

```
GET    /me                        - Get current learner's goals
POST   /:groupId                  - Create goal in group (Mentor)
GET    /:groupId                  - Get all goals in group (Mentor)
PUT    /:goalId                   - Update goal (Mentor)
DELETE /:goalId                   - Delete goal (Mentor)
```

### Assignments (`/assignments`)

```
POST   /goals/:goalId/assignments                 - Create assignment (Mentor)
GET    /goals/:goalId/assignments                 - Get assignments by goal
PUT    /assignments/:assignmentId                 - Update assignment (Mentor)
DELETE /assignments/:assignmentId                 - Delete assignment (Mentor)
```

### Submissions (`/submissions`)

```
POST   /assignments/:assignmentId/submit          - Submit assignment (Learner)
PUT    /submissions/:submissionId/review          - Review submission (Mentor)
GET    /assignments/:assignmentId/submissions     - Get submissions (Mentor)
```

### Resources (`/resources`)

```
POST   /:groupId                                  - Upload resource to group (Mentor)
GET    /:groupId                                  - Get all group resources
DELETE /:resourceId                               - Delete resource (Mentor)
```

### Health Check (`/healthcheck`)

```
GET    /                                          - Check server and database health
```

---

## 🏗️ Architecture

### Request Flow

```
Request → CORS → Body Parser → Routes → Auth → Validation → Controller
→ Business Logic → Database → Response Formatting → Response
```

### Key Design Patterns

- **MVC Architecture** - Controllers, Models, Routes separation
- **Middleware Chain** - Layered request processing
- **AsyncHandler** - Centralized error handling
- **Global Error Middleware** - Consistent error responses
- **Role-Based Authorization** - Granular access control

---

## 🔐 Security

### Authentication

- **JWT Tokens** with access & refresh separation
- **HTTP-Only Cookies** for XSS prevention
- **Secure Token Storage** in database
- **Token Rotation** on refresh
- **Email Verification** before activation

### Authorization

- **Role-Based Access Control** (Admin, Mentor, Learner)
- **Member Verification** for group operations
- **Creator Verification** for resource modification
- **Deadline Enforcement** for submissions

### Data Protection

- **Bcrypt Hashing** (10 salt rounds) for passwords
- **Input Validation** with express-validator
- **CORS** with configurable origins
- **MongoDB Indexing** for data constraints
- **Unique Constraints** on critical fields

### File Security

- **File Size Limits** (5MB per submission)
- **Cloud Storage** via Cloudinary (no server storage)
- **Automatic Cleanup** of temporary files
- **HTTPS URLs** for all file access

---

## 📊 Database Schema

### User

```javascript
{
  (_id,
    name,
    email,
    password(hashed),
    role,
    isEmailVerified,
    refreshToken,
    tokens,
    timestamps);
}
```

### Group

```javascript
{
  (_id, name, description, mentor(ref), inviteCode(unique), timestamps);
}
```

### GroupMember

```javascript
{
  (_id, group(ref), user(ref), role, timestamps);
}
```

### Goal

```javascript
{ _id, title, description, group(ref), assignedTo[], status,
  createdBy, timestamps }
```

### Assignment

```javascript
{
  (_id,
    title,
    description,
    goalId(ref),
    groupId(ref),
    createdBy,
    deadline,
    referenceMaterials,
    maxMarks,
    isActive,
    timestamps);
}
```

### Submission

```javascript
{
  (_id,
    assignmentId(ref),
    userId(ref),
    submittedFile(URL),
    submittedText,
    status,
    marksObtained,
    feedback,
    timestamps);
}
```

### Resource

```javascript
{
  (_id,
    title,
    description,
    groupId(ref),
    uploadedBy(ref),
    fileUrl(URL),
    fileSize,
    fileType,
    timestamps);
}
```

---

## 💻 Usage Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

### Create Study Group

```bash
curl -X POST http://localhost:3000/api/v1/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "description": "Learn modern web development"
  }'
```

### Join Group

```bash
curl -X POST http://localhost:3000/api/v1/groups/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "abc123"}'
```

### Submit Assignment

```bash
curl -X POST http://localhost:3000/api/v1/submissions/assignments/ASSIGNMENT_ID/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@submission.pdf" \
  -F "submittedText=My submission"
```

### Review Submission

```bash
curl -X PUT http://localhost:3000/api/v1/submissions/SUBMISSION_ID/review \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reviewed",
    "feedback": "Excellent work!",
    "marksObtained": 90
  }'
```

---

## 📁 Project Structure

```
StudyHive-Backend/
├── src/
│   ├── app.js                          # Express app setup with middleware chain
│   ├── index.js                        # Server entry point & DB connection
│   │
│   ├── controllers/                    # Business logic layer
│   │   ├── auth.controllers.js         # Authentication (register, login, token refresh, email verification, password reset)
│   │   ├── group.controllers.js        # Study group management (create, join, invite, member operations)
│   │   ├── goal.controllers.js         # Learning goals (CRUD, status tracking)
│   │   ├── assignment.controllers.js   # Assignment lifecycle (create, update, deadline enforcement)
│   │   ├── submission.controllers.js   # Submissions & reviews (file upload, mentor feedback, resubmission)
│   │   ├── resource.controllers.js     # Shared resources (upload, retrieval, deletion)
│   │   └── healthcheck.controllers.js  # System health monitoring
│   │
│   ├── models/                         # Mongoose schemas with relationships
│   │   ├── user.models.js              # User schema (email, password(hashed), role, verification)
│   │   ├── group.models.js             # Study group schema (mentor, inviteCode unique)
│   │   ├── groupMember.models.js       # Group membership junction table (many-to-many)
│   │   ├── goal.models.js              # Learning goals (title, status, assignedTo array)
│   │   ├── assignment.models.js        # Assignments (deadline, reference materials, maxMarks)
│   │   ├── submission.models.js        # Submissions (file + text, status, feedback)
│   │   └── resource.models.js          # Shared resources (title, fileUrl, uploadedBy)
│   │
│   ├── routes/                         # API route definitions
│   │   ├── auth.routes.js              # /api/v1/auth (register, login, verify, refresh token)
│   │   ├── group.routes.js             # /api/v1/groups (CRUD, members, invites)
│   │   ├── goal.routes.js              # /api/v1/goals (CRUD within groups)
│   │   ├── assignment.routes.js        # /api/v1/assignments (CRUD via goals)
│   │   ├── submission.routes.js        # /api/v1/submissions (submit, review, retrieval)
│   │   ├── resource.routes.js          # /api/v1/resources (upload, get, delete)
│   │   └── healthcheck.routes.js       # /api/v1/healthcheck (server status)
│   │
│   ├── middlewares/                    # Request processing layer
│   │   ├── auth.middlewares.js         # JWT verification & user extraction
│   │   ├── authorizeRoles.middlewares.js # Role-based access control (Admin, Mentor, Learner)
│   │   ├── error.middlewares.js        # Global error handler (ApiError -> response)
│   │   ├── multer.middlewares.js       # File upload config (5MB limit, disk storage)
│   │   └── validators.middlewares.js   # Input validation executor (express-validator)
│   │
│   ├── validators/                     # Input validation rules
│   │   ├── auth.validators.js          # Email, password, token validation
│   │   ├── group.validators.js         # Group CRUD validation
│   │   ├── goal.validators.js          # Goal CRUD validation
│   │   ├── assignment.validators.js    # Assignment CRUD validation
│   │   ├── submission.validators.js    # Submission validation
│   │   └── resource.validators.js      # Resource upload validation
│   │
│   ├── utils/                          # Utility functions & helpers
│   │   ├── api-error.utils.js          # Custom ApiError class with statusCode, message, errors
│   │   ├── api-response.utils.js       # Consistent response wrapper (statusCode, data, message)
│   │   ├── async-handler.utils.js      # Try-catch wrapper to avoid repetition
│   │   ├── cloudinary.utils.js         # Cloud upload with temp file cleanup
│   │   ├── constants.utils.js          # App-wide constants
│   │   ├── jwt.utils.js                # Token generation (access & refresh)
│   │   ├── mail-template.utils.js      # HTML email template generators
│   │   └── send-email.utils.js         # Nodemailer integration with error handling
│   │
│   ├── db/
│   │   └── index.db.js                 # MongoDB connection & pooling config
│   │
│   └── public/
│       └── temp/                       # Temporary file storage (auto-cleanup after upload)
│
├── package.json                        # Dependencies (Express, MongoDB, JWT, Cloudinary, etc)
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── README.md                           # Project documentation
└── README_STRUCTURE.md                 # (This detailed structure breakdown)
```

### 📋 Folder Descriptions

| Folder           | Purpose                         | Key Features                                                      |
| ---------------- | ------------------------------- | ----------------------------------------------------------------- |
| **controllers/** | Business logic for each feature | Handles requests, validates, calls models, returns responses      |
| **models/**      | Database schemas                | Defines data structure, relationships, pre-hooks (bcrypt hashing) |
| **routes/**      | API endpoint mapping            | Maps HTTP methods to controller functions                         |
| **middlewares/** | Request processing pipeline     | Auth verification, role checking, error handling, file upload     |
| **validators/**  | Input sanitization rules        | Prevents invalid data from reaching controllers                   |
| **utils/**       | Reusable helper functions       | Error handling, response formatting, email, JWT, cloud upload     |
| **db/**          | Database configuration          | Connection pooling, retry logic                                   |
| **public/temp/** | Temporary storage               | Files before Cloudinary upload (auto-cleaned)                     |

### 🔄 Request Flow Through Folders

```
Client Request
    ↓
routes/ → (maps to endpoint)
    ↓
middlewares/ → (CORS, body-parser, auth check, role check)
    ↓
validators/ → (input sanitization)
    ↓
controllers/ → (business logic)
    ↓
models/ → (database operations)
    ↓
utils/ → (response formatting, error handling)
    ↓
Response to Client
```

---

## 🚀 Available Scripts

```bash
npm run dev      # Start with hot-reload (development)
npm start        # Start server (production)
npm run format   # Format code with Prettier
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

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

**Aditya Sharma** - [@Adi-Dcpp](https://github.com/Adi-Dcpp)

---

## 🔗 Resources

- **GitHub**: https://github.com/Adi-Dcpp/StudyHive-Backend
- **Issues**: https://github.com/Adi-Dcpp/StudyHive-Backend/issues
- **Product Requirements**: [PRD.md](prd.md)
- **Work Summary**: [WORK_SUMMARY.md](WORK_SUMMARY.md)

---

**StudyHive Backend** - Making collaborative learning simple and effective. 🎓
