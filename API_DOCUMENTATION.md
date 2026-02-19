# StudyHive Backend API Documentation

## Overview

This document describes the public HTTP API for StudyHive Backend (Node.js + Express + MongoDB, MVC). All successful responses use the `ApiResponse` wrapper, and all errors use the `ApiError` format handled by the global error middleware.

### Base URL

`http://localhost:<PORT>/api/v1`

### Success Response Wrapper

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "success": true
}
```

### Error Response Wrapper

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

### Authentication

- Access token is required for protected routes.
- Tokens are accepted from either:
  - `Authorization: Bearer <accessToken>` header, or
  - `accessToken` cookie.
- Refresh token is accepted from either:
  - `refreshToken` cookie, or
  - `refreshToken` in request body.
- Access and refresh cookies are HTTP-only and have explicit `maxAge` values.

### Roles

- `admin`
- `mentor`
- `learner`

---

# Auth

## Register User

### Endpoint Overview

| Item                    | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| HTTP Method             | `POST`                                                |
| Route                   | `/api/v1/auth/register`                               |
| Description             | Register a new user and send email verification link. |
| Authentication Required | No                                                    |
| Allowed Roles           | N/A                                                   |

### Request Structure

**Headers**

| Header         | Required | Notes              |
| -------------- | -------- | ------------------ |
| `Content-Type` | Yes      | `application/json` |

**Body Fields**

| Field      | Required | Type   | Notes                               |
| ---------- | -------- | ------ | ----------------------------------- |
| `name`     | Yes      | string | Min length 3                        |
| `email`    | Yes      | string | Valid email format                  |
| `password` | Yes      | string | Min length 8, strong password       |
| `role`     | No       | string | One of `admin`, `mentor`, `learner` |

**Validation Rules**

- `name` exists, trimmed, at least 3 characters.
- `email` exists and is a valid email.
- `password` exists, at least 8 characters, contains uppercase, lowercase, number, and symbol.
- `role` (optional) must be in `admin`, `mentor`, `learner`.

### Success Response

```json
{
  "statusCode": 201,
  "message": "User registered successfully and verification email has been sent to your mail",
  "data": {
    "user": {
      "_id": "<userId>",
      "name": "<string>",
      "email": "<string>",
      "role": "<admin|mentor|learner>",
      "isEmailVerified": false,
      "createdAt": "<isoDate>",
      "updatedAt": "<isoDate>"
    }
  },
  "success": true
}
```

**Field Notes**

- `user` excludes `password`, `refreshToken`, `emailVerificationToken`, `emailVerificationTokenExpiry`.

### Error Responses

**Validation Errors (400)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

**Business Logic Errors**

- `400` All fields are required
- `409` User already exists
- `404` User Not Created

### Example Request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@example.com","password":"Aa1!aaaa"}' \
  http://localhost:<PORT>/api/v1/auth/register
```

### Example Response (Success)

```json
{
  "statusCode": 201,
  "message": "User registered successfully and verification email has been sent to your mail",
  "data": {
    "user": {
      "_id": "65f0c9f6b2a1d3a9f9b7c111",
      "name": "Alex",
      "email": "alex@example.com",
      "role": "learner",
      "isEmailVerified": false,
      "createdAt": "2026-02-15T10:00:00.000Z",
      "updatedAt": "2026-02-15T10:00:00.000Z"
    }
  },
  "success": true
}
```

### Notes

- A verification email is sent to the user.
- Password is hashed before storage.

---

## Verify Email

### Endpoint Overview

| Item                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| HTTP Method             | `GET`                                           |
| Route                   | `/api/v1/auth/verify-email/:token`              |
| Description             | Verify user email using the verification token. |
| Authentication Required | No                                              |
| Allowed Roles           | N/A                                             |

### Request Structure

**Path Params**

| Param   | Required | Notes              |
| ------- | -------- | ------------------ |
| `token` | Yes      | Verification token |

**Validation Rules**

- `token` exists and is not empty.

### Success Response

- **Redirect** to `${FRONTEND_URL}/email-verified?status=success`

### Error Responses

- **Redirect** to `${FRONTEND_URL}/email-verified?status=failed` when token is missing or invalid/expired.

### Notes

- This endpoint does not return JSON.

---

## Login

### Endpoint Overview

| Item                    | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| HTTP Method             | `POST`                                                  |
| Route                   | `/api/v1/auth/login`                                    |
| Description             | Authenticate user and set access/refresh token cookies. |
| Authentication Required | No                                                      |
| Allowed Roles           | N/A                                                     |

### Request Structure

**Headers**

| Header         | Required | Notes              |
| -------------- | -------- | ------------------ |
| `Content-Type` | Yes      | `application/json` |

**Body Fields**

| Field      | Required | Type   | Notes              |
| ---------- | -------- | ------ | ------------------ |
| `email`    | Yes      | string | Valid email format |
| `password` | Yes      | string | Non-empty          |

**Validation Rules**

- `email` exists and is valid email.
- `password` exists and is not empty.

### Success Response

```json
{
  "statusCode": 200,
  "message": "User successfully logged In",
  "data": {
    "user": {
      "_id": "<userId>",
      "name": "<string>",
      "email": "<string>",
      "role": "<admin|mentor|learner>",
      "isEmailVerified": true,
      "createdAt": "<isoDate>",
      "updatedAt": "<isoDate>"
    }
  },
  "success": true
}
```

**Field Notes**

- `accessToken` and `refreshToken` are set as HTTP-only cookies.
- `user` excludes sensitive fields.

### Error Responses

**Validation Errors (400)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "password", "message": "Password is required" }]
}
```

**Business Logic Errors**

- `400` All field required
- `404` User not found
- `403` Please verify your email before logging in
- `400` Password is incorrect
- `400` failed to login

### Example Request

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"Aa1!aaaa"}' \
  http://localhost:<PORT>/api/v1/auth/login
```

### Example Response (Success)

```json
{
  "statusCode": 200,
  "message": "User successfully logged In",
  "data": {
    "user": {
      "_id": "65f0c9f6b2a1d3a9f9b7c111",
      "name": "Alex",
      "email": "alex@example.com",
      "role": "learner",
      "isEmailVerified": true,
      "createdAt": "2026-02-15T10:00:00.000Z",
      "updatedAt": "2026-02-15T10:00:00.000Z"
    }
  },
  "success": true
}
```

### Notes

- Cookies are set with `httpOnly` and `secure` in production.

---

## Get Current User

### Endpoint Overview

| Item                    | Value                                 |
| ----------------------- | ------------------------------------- |
| HTTP Method             | `GET`                                 |
| Route                   | `/api/v1/auth/me`                     |
| Description             | Get the currently authenticated user. |
| Authentication Required | Yes                                   |
| Allowed Roles           | Any authenticated user                |

### Request Structure

**Headers**

| Header          | Required | Notes                                       |
| --------------- | -------- | ------------------------------------------- |
| `Authorization` | No       | `Bearer <accessToken>` if not using cookies |

### Success Response

```json
{
  "statusCode": 200,
  "message": "current user fetched successfully",
  "data": {
    "user": {
      "_id": "<userId>",
      "name": "<string>",
      "email": "<string>",
      "role": "<admin|mentor|learner>",
      "isEmailVerified": true,
      "createdAt": "<isoDate>",
      "updatedAt": "<isoDate>"
    }
  },
  "success": true
}
```

### Error Responses

**Authentication Errors (401)**

- Unauthorized request
- Invalid access token

**Business Logic Errors**

- `400` User not found

---

## Logout

### Endpoint Overview

| Item                    | Value                               |
| ----------------------- | ----------------------------------- |
| HTTP Method             | `POST`                              |
| Route                   | `/api/v1/auth/logout`               |
| Description             | Clear access/refresh token cookies. |
| Authentication Required | Yes                                 |
| Allowed Roles           | Any authenticated user              |

### Success Response

```json
{
  "statusCode": 200,
  "message": "User logged out successfully",
  "data": {},
  "success": true
}
```

### Error Responses

**Authentication Errors (401)**

- Unauthorized request
- Invalid access token

**Business Logic Errors**

- `401` Failed to get user id
- `400` user not found

---

## Refresh Access Token

### Endpoint Overview

| Item                    | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| HTTP Method             | `POST`                                                |
| Route                   | `/api/v1/auth/refresh-token`                          |
| Description             | Issue a new access token using a valid refresh token. |
| Authentication Required | No                                                    |
| Allowed Roles           | N/A                                                   |

### Request Structure

**Headers**

| Header         | Required | Notes              |
| -------------- | -------- | ------------------ |
| `Content-Type` | Yes      | `application/json` |

**Body Fields**

| Field          | Required | Type   | Notes                             |
| -------------- | -------- | ------ | --------------------------------- |
| `refreshToken` | No       | string | Required if no cookie is provided |

**Validation Rules**

- Either `refreshToken` cookie or body value must be present.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Access token successfully refreshed",
  "data": {},
  "success": true
}
```

### Error Responses

**Validation Errors (400)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "", "message": "Refresh token is required" }]
}
```

**Authentication Errors (401)**

- Unauthorized access
- Invalid refresh token
- Refresh token expired or reused

### Notes

- New `accessToken` and `refreshToken` are set in cookies.

---

## Resend Email Verification

### Endpoint Overview

| Item                    | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| HTTP Method             | `POST`                                                              |
| Route                   | `/api/v1/auth/resend-email-verification`                            |
| Description             | Send a new verification email if the user exists and is unverified. |
| Authentication Required | No                                                                  |
| Allowed Roles           | N/A                                                                 |

### Request Structure

**Body Fields**

| Field   | Required | Type   | Notes              |
| ------- | -------- | ------ | ------------------ |
| `email` | Yes      | string | Valid email format |

**Validation Rules**

- `email` exists and is a valid email.

### Success Response

```json
{
  "statusCode": 200,
  "message": "If the email exists, a verification link has been sent",
  "data": {},
  "success": true
}
```

### Notes

- Always returns success to prevent email enumeration.

---

## Forgot Password (Request)

### Endpoint Overview

| Item                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| HTTP Method             | `POST`                                          |
| Route                   | `/api/v1/auth/forgot-password`                  |
| Description             | Send a reset password link if the email exists. |
| Authentication Required | No                                              |
| Allowed Roles           | N/A                                             |

### Request Structure

**Body Fields**

| Field   | Required | Type   | Notes              |
| ------- | -------- | ------ | ------------------ |
| `email` | Yes      | string | Valid email format |

**Validation Rules**

- `email` exists and is a valid email.

### Success Response

```json
{
  "statusCode": 200,
  "message": "If the email exists, reset link has been sent",
  "data": {},
  "success": true
}
```

### Notes

- Always returns success to prevent email enumeration.

---

## Reset Forgotten Password

### Endpoint Overview

| Item                    | Value                                |
| ----------------------- | ------------------------------------ |
| HTTP Method             | `POST`                               |
| Route                   | `/api/v1/auth/reset-password/:token` |
| Description             | Reset password using a valid token.  |
| Authentication Required | No                                   |
| Allowed Roles           | N/A                                  |

### Request Structure

**Path Params**

| Param   | Required | Notes       |
| ------- | -------- | ----------- |
| `token` | Yes      | Reset token |

**Body Fields**

| Field         | Required | Type   | Notes                         |
| ------------- | -------- | ------ | ----------------------------- |
| `newPassword` | Yes      | string | Min length 8, strong password |

**Validation Rules**

- `token` exists.
- `newPassword` exists, min length 8, strong password.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Password reset Successfully",
  "data": {},
  "success": true
}
```

### Error Responses

- `401` Forgot password session expired or invalid user

---

## Change Password (Authenticated)

### Endpoint Overview

| Item                    | Value                             |
| ----------------------- | --------------------------------- |
| HTTP Method             | `POST`                            |
| Route                   | `/api/v1/auth/change-password`    |
| Description             | Change the current user password. |
| Authentication Required | Yes                               |
| Allowed Roles           | Any authenticated user            |

### Request Structure

**Body Fields**

| Field         | Required | Type   | Notes                         |
| ------------- | -------- | ------ | ----------------------------- |
| `oldPassword` | Yes      | string | Current password              |
| `newPassword` | Yes      | string | Min length 8, strong password |

**Validation Rules**

- `oldPassword` exists and not empty.
- `newPassword` exists, min length 8, strong password.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Password Changed Successfully",
  "data": {},
  "success": true
}
```

### Error Responses

**Authentication Errors (401)**

- Unauthorized request
- Invalid access token

**Business Logic Errors**

- `400` New password is required
- `404` User not found
- `400` Invalid old Password

---

# Groups

## Create Group

### Endpoint Overview

| Item                    | Value               |
| ----------------------- | ------------------- |
| HTTP Method             | `POST`              |
| Route                   | `/api/v1/groups`    |
| Description             | Create a new group. |
| Authentication Required | Yes                 |
| Allowed Roles           | mentor              |

### Request Structure

**Body Fields**

| Field         | Required | Type   | Notes        |
| ------------- | -------- | ------ | ------------ |
| `name`        | Yes      | string | Min length 3 |
| `description` | Yes      | string | Non-empty    |

**Validation Rules**

- `name` exists, trimmed, min 3 characters.
- `description` exists and not empty.

### Success Response

```json
{
  "statusCode": 201,
  "message": "Group successfully created",
  "data": {
    "groupId": "<groupId>",
    "name": "<string>",
    "inviteCode": "<string>"
  },
  "success": true
}
```

### Error Responses

- `500` Failed to create group

---

## Join Group

### Endpoint Overview

| Item                    | Value                           |
| ----------------------- | ------------------------------- |
| HTTP Method             | `POST`                          |
| Route                   | `/api/v1/groups/join`           |
| Description             | Join a group using invite code. |
| Authentication Required | Yes                             |
| Allowed Roles           | Any authenticated user          |

### Request Structure

**Body Fields**

| Field        | Required | Type   | Notes     |
| ------------ | -------- | ------ | --------- |
| `inviteCode` | Yes      | string | Non-empty |

**Validation Rules**

- `inviteCode` exists and not empty.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Successfully joined the group",
  "data": {
    "groupId": "<groupId>",
    "name": "<string>",
    "role": "learner"
  },
  "success": true
}
```

### Error Responses

- `404` Invalid or Expired invite code
- `409` You are already a member

---

## View All Joined Groups

### Endpoint Overview

| Item                    | Value                                    |
| ----------------------- | ---------------------------------------- |
| HTTP Method             | `GET`                                    |
| Route                   | `/api/v1/groups`                         |
| Description             | List groups the current user has joined. |
| Authentication Required | Yes                                      |
| Allowed Roles           | Any authenticated user                   |

### Success Response

```json
{
  "statusCode": 200,
  "message": "All groups fetched successfully",
  "data": [
    {
      "groupId": "<groupId>",
      "name": "<string>",
      "role": "mentor"
    }
  ],
  "success": true
}
```

---

## Get Group Details

### Endpoint Overview

| Item                    | Value                                        |
| ----------------------- | -------------------------------------------- |
| HTTP Method             | `GET`                                        |
| Route                   | `/api/v1/groups/:groupId`                    |
| Description             | Get details for a group the user belongs to. |
| Authentication Required | Yes                                          |
| Allowed Roles           | Any group member                             |

### Request Structure

**Path Params**

| Param     | Required | Notes            |
| --------- | -------- | ---------------- |
| `groupId` | Yes      | MongoDB ObjectId |

**Validation Rules**

- `groupId` must be a valid MongoDB ID.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Group details fetched successfully",
  "data": {
    "groupId": "<groupId>",
    "name": "<string>",
    "description": "<string>",
    "createdAt": "<isoDate>"
  },
  "success": true
}
```

### Error Responses

- `403` Access Denied
- `404` Group does not exist

---

## Update Group

### Endpoint Overview

| Item                    | Value                                 |
| ----------------------- | ------------------------------------- |
| HTTP Method             | `PUT`                                 |
| Route                   | `/api/v1/groups/:groupId`             |
| Description             | Update group name and/or description. |
| Authentication Required | Yes                                   |
| Allowed Roles           | mentor                                |

### Request Structure

**Path Params**

| Param     | Required | Notes            |
| --------- | -------- | ---------------- |
| `groupId` | Yes      | MongoDB ObjectId |

**Body Fields**

| Field            | Required | Type   | Notes                 |
| ---------------- | -------- | ------ | --------------------- |
| `newName`        | No       | string | Non-empty if provided |
| `newDescription` | No       | string | Non-empty if provided |

**Validation Rules**

- `groupId` must be valid.
- At least one of `newName` or `newDescription` must be provided.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Group updated successfully",
  "data": {
    "name": "<string>",
    "description": "<string>"
  },
  "success": true
}
```

### Error Responses

- `404` Group not found
- `403` User not allowed to make changes

---

## Invite Members (Get Invite Code)

### Endpoint Overview

| Item                    | Value                              |
| ----------------------- | ---------------------------------- |
| HTTP Method             | `POST`                             |
| Route                   | `/api/v1/groups/:groupId/invite`   |
| Description             | Fetch the invite code for a group. |
| Authentication Required | Yes                                |
| Allowed Roles           | mentor                             |

### Request Structure

**Path Params**

| Param     | Required | Notes            |
| --------- | -------- | ---------------- |
| `groupId` | Yes      | MongoDB ObjectId |

**Validation Rules**

- `groupId` must be valid.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Invite code fetched successfully",
  "data": {
    "inviteCode": "<string>"
  },
  "success": true
}
```

### Error Responses

- `404` Failed to fetch group details
- `403` Not authorized to generate invite code

---

## View Group Members

### Endpoint Overview

| Item                    | Value                             |
| ----------------------- | --------------------------------- |
| HTTP Method             | `GET`                             |
| Route                   | `/api/v1/groups/:groupId/members` |
| Description             | List members in a group.          |
| Authentication Required | Yes                               |
| Allowed Roles           | Any group member                  |

### Request Structure

**Path Params**

| Param     | Required | Notes            |
| --------- | -------- | ---------------- |
| `groupId` | Yes      | MongoDB ObjectId |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Members data fetched successfully",
  "data": [
    {
      "userId": "<userId>",
      "name": "<string>",
      "email": "<string>",
      "role": "mentor",
      "joinedAt": "<isoDate>"
    }
  ],
  "success": true
}
```

### Error Responses

- `403` Not authorized to get members data

---

## Remove Group Member

### Endpoint Overview

| Item                    | Value                                     |
| ----------------------- | ----------------------------------------- |
| HTTP Method             | `DELETE`                                  |
| Route                   | `/api/v1/groups/:groupId/members/:userId` |
| Description             | Remove a group member (mentor only).      |
| Authentication Required | Yes                                       |
| Allowed Roles           | mentor                                    |

### Request Structure

**Path Params**

| Param     | Required | Notes            |
| --------- | -------- | ---------------- |
| `groupId` | Yes      | MongoDB ObjectId |
| `userId`  | Yes      | MongoDB ObjectId |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Member removed successfully",
  "data": {
    "groupId": "<groupId>",
    "removedUserId": "<userId>"
  },
  "success": true
}
```

### Error Responses

- `403` Only mentors can remove group members
- `400` Mentor cannot remove themselves
- `404` Group member not found

---

## Delete Group

### Endpoint Overview

| Item                    | Value                         |
| ----------------------- | ----------------------------- |
| HTTP Method             | `DELETE`                      |
| Route                   | `/api/v1/groups/:groupId`     |
| Description             | Delete a group (mentor only). |
| Authentication Required | Yes                           |
| Allowed Roles           | mentor                        |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Group deleted Successfully",
  "data": {
    "groupId": "<groupId>"
  },
  "success": true
}
```

### Error Responses

- `404` Group not found
- `403` Only mentors can delete the group

---

# Goals

## Create Goal

### Endpoint Overview

| Item                    | Value                                   |
| ----------------------- | --------------------------------------- |
| HTTP Method             | `POST`                                  |
| Route                   | `/api/v1/goals/:groupId`                |
| Description             | Create a goal in a group (mentor only). |
| Authentication Required | Yes                                     |
| Allowed Roles           | mentor                                  |

### Request Structure

**Path Params**

| Param     | Required | Notes            |
| --------- | -------- | ---------------- |
| `groupId` | Yes      | MongoDB ObjectId |

**Body Fields**

| Field         | Required | Type   | Notes                       |
| ------------- | -------- | ------ | --------------------------- |
| `title`       | Yes      | string | Non-empty                   |
| `description` | No       | string | Optional                    |
| `assignedTo`  | Yes      | array  | Non-empty array of user IDs |

**Validation Rules**

- `groupId` must be a valid MongoDB ID.
- `title` required, string.
- `assignedTo` required, non-empty array; each element must be valid user ID.

### Success Response

```json
{
  "statusCode": 201,
  "message": "New goal created successfully",
  "data": {
    "title": "<string>",
    "createdBy": "<userId>"
  },
  "success": true
}
```

### Error Responses

- `404` Group not found
- `403` User is not authorised to create new goal
- `400` At least one valid user must be assigned to the goal
- `400` One or more assigned users are not part of this group

---

## Get Goals By Group

### Endpoint Overview

| Item                    | Value                               |
| ----------------------- | ----------------------------------- |
| HTTP Method             | `GET`                               |
| Route                   | `/api/v1/goals/:groupId`            |
| Description             | Get goals of a group (mentor only). |
| Authentication Required | Yes                                 |
| Allowed Roles           | mentor                              |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Goals fetched successfully",
  "data": [
    {
      "goalId": "<goalId>",
      "title": "<string>",
      "description": "<string>",
      "group": "<groupId>",
      "assignedTo": [
        { "_id": "<userId>", "name": "<string>", "email": "<string>" }
      ],
      "status": "not_started",
      "createdBy": {
        "_id": "<userId>",
        "name": "<string>",
        "email": "<string>"
      },
      "createdAt": "<isoDate>",
      "updatedAt": "<isoDate>"
    }
  ],
  "success": true
}
```

### Error Responses

- `404` Group not found
- `403` User is not authorised to view goals of this group

---

## Get My Goals

### Endpoint Overview

| Item                    | Value                                      |
| ----------------------- | ------------------------------------------ |
| HTTP Method             | `GET`                                      |
| Route                   | `/api/v1/goals/me`                         |
| Description             | Get goals assigned to the current learner. |
| Authentication Required | Yes                                        |
| Allowed Roles           | learner                                    |

### Success Response

```json
{
  "statusCode": 200,
  "message": "My goals fetched successfully",
  "data": [
    {
      "goalId": "<goalId>",
      "title": "<string>",
      "description": "<string>",
      "group": { "_id": "<groupId>", "name": "<string>", "email": "<string>" },
      "assignedTo": ["<userId>"],
      "status": "not_started",
      "createdBy": {
        "_id": "<userId>",
        "name": "<string>",
        "email": "<string>"
      },
      "createdAt": "<isoDate>",
      "updatedAt": "<isoDate>"
    }
  ],
  "success": true
}
```

---

## Update Goal

### Endpoint Overview

| Item                    | Value                             |
| ----------------------- | --------------------------------- |
| HTTP Method             | `PUT`                             |
| Route                   | `/api/v1/goals/:goalId`           |
| Description             | Update goal fields (mentor only). |
| Authentication Required | Yes                               |
| Allowed Roles           | mentor                            |

### Request Structure

**Path Params**

| Param    | Required | Notes            |
| -------- | -------- | ---------------- |
| `goalId` | Yes      | MongoDB ObjectId |

**Body Fields**

| Field         | Required | Type   | Notes                                 |
| ------------- | -------- | ------ | ------------------------------------- |
| `title`       | No       | string | Non-empty if provided                 |
| `description` | No       | string | Optional                              |
| `status`      | No       | string | `not_started`, `ongoing`, `completed` |
| `assignedTo`  | No       | array  | Non-empty array of user IDs           |

**Validation Rules**

- At least one field must be provided.
- `status` must be one of `not_started`, `ongoing`, `completed`.
- `assignedTo` items must be valid user IDs.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Goal updated successfully",
  "data": {
    "title": "<string>",
    "createdBy": "<userId>"
  },
  "success": true
}
```

### Error Responses

- `404` Goal not found
- `403` User not authorized to update this goal
- `400` At least one field must be updated
- `400` Assigned users cannot be empty
- `400` One or more assigned users are not part of this group

---

## Delete Goal

### Endpoint Overview

| Item                    | Value                        |
| ----------------------- | ---------------------------- |
| HTTP Method             | `DELETE`                     |
| Route                   | `/api/v1/goals/:goalId`      |
| Description             | Delete a goal (mentor only). |
| Authentication Required | Yes                          |
| Allowed Roles           | mentor                       |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Goal deleted successfully",
  "data": null,
  "success": true
}
```

### Error Responses

- `404` Goal not found
- `403` User not authorized to delete this goal

---

# Assignments

## Create Assignment

### Endpoint Overview

| Item                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| HTTP Method             | `POST`                                          |
| Route                   | `/api/v1/assignments/goals/:goalId/assignments` |
| Description             | Create an assignment for a goal (mentor only).  |
| Authentication Required | Yes                                             |
| Allowed Roles           | mentor                                          |

### Request Structure

**Path Params**

| Param    | Required | Notes            |
| -------- | -------- | ---------------- |
| `goalId` | Yes      | MongoDB ObjectId |

**Body Fields**

| Field                | Required | Type   | Notes            |
| -------------------- | -------- | ------ | ---------------- |
| `title`              | Yes      | string | Non-empty        |
| `description`        | No       | string | Optional         |
| `deadline`           | No       | string | ISO8601 date     |
| `referenceMaterials` | No       | array  | Array of strings |

**Validation Rules**

- `goalId` must be valid.
- `title` required.
- `deadline` must be a valid date if provided.
- `referenceMaterials` must be an array of strings if provided.

### Success Response

```json
{
  "statusCode": 201,
  "message": "Assignment created successfully",
  "data": {
    "title": "<string>",
    "deadline": "<isoDate>"
  },
  "success": true
}
```

### Error Responses

- `404` Failed to get the goal
- `404` Failed to get the group
- `403` User not authorized to create assignment
- `400` Failed to create assignment

---

## Get Assignments By Goal

### Endpoint Overview

| Item                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| HTTP Method             | `GET`                                           |
| Route                   | `/api/v1/assignments/goals/:goalId/assignments` |
| Description             | Get active assignments for a goal.              |
| Authentication Required | Yes                                             |
| Allowed Roles           | Any authenticated user                          |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Assignment data fetched successfully",
  "data": [{ "title": "<string>", "deadline": "<isoDate>" }],
  "success": true
}
```

### Error Responses

- `404` Failed to get the assignments

---

## Update Assignment

### Endpoint Overview

| Item                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| HTTP Method             | `PUT`                                           |
| Route                   | `/api/v1/assignments/assignments/:assignmentId` |
| Description             | Update assignment fields (mentor only).         |
| Authentication Required | Yes                                             |
| Allowed Roles           | mentor                                          |

### Request Structure

**Path Params**

| Param          | Required | Notes            |
| -------------- | -------- | ---------------- |
| `assignmentId` | Yes      | MongoDB ObjectId |

**Body Fields**

| Field                | Required | Type    | Notes            |
| -------------------- | -------- | ------- | ---------------- |
| `title`              | No       | string  | Optional         |
| `description`        | No       | string  | Optional         |
| `deadline`           | No       | string  | ISO8601 date     |
| `referenceMaterials` | No       | array   | Array of strings |
| `maxMarks`           | No       | number  | Numeric          |
| `isActive`           | No       | boolean | true/false       |

**Validation Rules**

- At least one field must be present.
- `deadline` must be valid date if provided.
- `maxMarks` must be numeric if provided.
- `isActive` must be boolean if provided.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Assignment updated successfully",
  "data": {
    "title": "<string>",
    "deadline": "<isoDate>"
  },
  "success": true
}
```

### Error Responses

- `400` At least one field must be updated
- `404` Failed to get assignment
- `403` User not authorized to update assignment

---

## Delete Assignment

### Endpoint Overview

| Item                    | Value                                           |
| ----------------------- | ----------------------------------------------- |
| HTTP Method             | `DELETE`                                        |
| Route                   | `/api/v1/assignments/assignments/:assignmentId` |
| Description             | Soft-delete an assignment (mentor only).        |
| Authentication Required | Yes                                             |
| Allowed Roles           | mentor                                          |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Assignment deleted successfully",
  "data": {},
  "success": true
}
```

### Error Responses

- `404` Failed to get assignment
- `403` User not authorized to delete assignment

---

# Submissions

## Submit Assignment

### Endpoint Overview

| Item                    | Value                                                  |
| ----------------------- | ------------------------------------------------------ |
| HTTP Method             | `POST`                                                 |
| Route                   | `/api/v1/submissions/assignments/:assignmentId/submit` |
| Description             | Submit an assignment (learner only).                   |
| Authentication Required | Yes                                                    |
| Allowed Roles           | learner                                                |

### Request Structure

**Headers**

| Header         | Required | Notes                 |
| -------------- | -------- | --------------------- |
| `Content-Type` | Yes      | `multipart/form-data` |

**Path Params**

| Param          | Required | Notes            |
| -------------- | -------- | ---------------- |
| `assignmentId` | Yes      | MongoDB ObjectId |

**Body Fields**

| Field           | Required | Type   | Notes                       |
| --------------- | -------- | ------ | --------------------------- |
| `file`          | No       | file   | Upload field name is `file` |
| `submittedText` | No       | string | Optional text submission    |

**Validation Rules**

- `assignmentId` must be valid.
- `submittedText` must be a non-empty string if provided.

### Success Response

```json
{
  "statusCode": 201,
  "message": "Assignment submitted successfully",
  "data": {
    "submissionId": "<submissionId>",
    "status": "submitted"
  },
  "success": true
}
```

### Error Responses

- `404` Assignment not found or inactive
- `403` Assignment submission deadline has passed
- `403` User not authorized to submit this assignment
- `400` Either file or text submission is required
- `400` Assignment already submitted

### Notes

- If a previous submission is in `revision_required`, it can be resubmitted.
- If replacing a file submission, the old file is removed from Cloudinary.
- Allowed file types: JPEG, PNG, WEBP, PDF.

---

## Review Submission

### Endpoint Overview

| Item                    | Value                                                  |
| ----------------------- | ------------------------------------------------------ |
| HTTP Method             | `PUT`                                                  |
| Route                   | `/api/v1/submissions/submissions/:submissionId/review` |
| Description             | Review a submission (mentor only).                     |
| Authentication Required | Yes                                                    |
| Allowed Roles           | mentor                                                 |

### Request Structure

**Body Fields**

| Field           | Required | Type   | Notes                             |
| --------------- | -------- | ------ | --------------------------------- |
| `status`        | Yes      | string | `reviewed` or `revision_required` |
| `feedback`      | No       | string | Optional                          |
| `marksObtained` | No       | number | Optional                          |

**Validation Rules**

- `status` must be `reviewed` or `revision_required`.
- `marksObtained` must be numeric if provided.
- `feedback` must be string if provided.

### Success Response

```json
{
  "statusCode": 200,
  "message": "Submission reviewed successfully",
  "data": {
    "submissionId": "<submissionId>",
    "status": "reviewed",
    "reviewedAt": "<isoDate>"
  },
  "success": true
}
```

### Error Responses

- `400` Invalid review status
- `404` Submission not found
- `400` Submission is not in a reviewable state
- `404` Assignment not found or inactive
- `403` User not authorized to review this submission

---

## Get Submissions By Assignment

### Endpoint Overview

| Item                    | Value                                                       |
| ----------------------- | ----------------------------------------------------------- |
| HTTP Method             | `GET`                                                       |
| Route                   | `/api/v1/submissions/assignments/:assignmentId/submissions` |
| Description             | Get submissions for an assignment (mentor only).            |
| Authentication Required | Yes                                                         |
| Allowed Roles           | mentor                                                      |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Submissions fetched successfully",
  "data": {
    "count": 1,
    "submissions": [
      {
        "userId": {
          "_id": "<userId>",
          "name": "<string>",
          "email": "<string>"
        },
        "status": "submitted",
        "submittedAt": "<isoDate>",
        "reviewedAt": "<isoDate>",
        "marksObtained": 90,
        "feedback": "<string>"
      }
    ]
  },
  "success": true
}
```

### Error Responses

- `404` Assignment not found or inactive
- `403` User not authorized to view submissions

---

# Resources

## Upload Resource

### Endpoint Overview

| Item                    | Value                                        |
| ----------------------- | -------------------------------------------- |
| HTTP Method             | `POST`                                       |
| Route                   | `/api/v1/resources/:groupId`                 |
| Description             | Upload a resource for a group (mentor only). |
| Authentication Required | Yes                                          |
| Allowed Roles           | mentor                                       |

### Request Structure

**Headers**

| Header         | Required | Notes                 |
| -------------- | -------- | --------------------- |
| `Content-Type` | Yes      | `multipart/form-data` |

**Path Params**

| Param     | Required | Notes            |
| --------- | -------- | ---------------- |
| `groupId` | Yes      | MongoDB ObjectId |

**Body Fields**

| Field         | Required    | Type   | Notes                        |
| ------------- | ----------- | ------ | ---------------------------- |
| `title`       | Yes         | string | 1-200 chars                  |
| `type`        | Yes         | string | `file`, `link`, or `note`    |
| `description` | Conditional | string | Required when type is `note` |
| `linkUrl`     | Conditional | string | Required when type is `link` |
| `file`        | Conditional | file   | Required when type is `file` |

**Validation Rules**

- `groupId` must be valid.
- `title` length 1-200.
- `type` must be `file`, `link`, or `note`.
- `description` required if `type` is `note`.
- `linkUrl` required and valid URL if `type` is `link`.

### Success Response

```json
{
  "statusCode": 201,
  "message": "Resource created successfully",
  "data": {
    "resourceId": "<resourceId>",
    "title": "<string>",
    "type": "file",
    "uploadedBy": "<userId>",
    "createdAt": "<isoDate>"
  },
  "success": true
}
```

### Error Responses

- `400` All required fields must be present
- `404` Group not found
- `403` User not authorized
- `400` File is required for file type resource
- `400` linkUrl is required for link type resource
- `400` Description is required for note type resource

---

## Get Resources By Group

### Endpoint Overview

| Item                    | Value                        |
| ----------------------- | ---------------------------- |
| HTTP Method             | `GET`                        |
| Route                   | `/api/v1/resources/:groupId` |
| Description             | List resources for a group.  |
| Authentication Required | Yes                          |
| Allowed Roles           | Any group member             |

### Request Structure

**Query Params**

| Param    | Required | Notes                                 |
| -------- | -------- | ------------------------------------- |
| `sortBy` | No       | `recent` (default), `oldest`, `title` |
| `type`   | No       | `file`, `link`, `note`                |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Resources fetched successfully",
  "data": [
    {
      "_id": "<resourceId>",
      "title": "<string>",
      "description": "<string>",
      "type": "note",
      "group": "<groupId>",
      "uploadedBy": {
        "_id": "<userId>",
        "name": "<string>",
        "email": "<string>"
      },
      "fileUrl": "<string>",
      "linkUrl": "<string>",
      "createdAt": "<isoDate>",
      "updatedAt": "<isoDate>"
    }
  ],
  "success": true
}
```

### Error Responses

- `404` Group not found
- `403` User not authorized to get resources data

---

## Delete Resource

### Endpoint Overview

| Item                    | Value                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| HTTP Method             | `DELETE`                                                              |
| Route                   | `/api/v1/resources/:resourceId`                                       |
| Description             | Delete a resource. Admins can delete any, otherwise only the creator. |
| Authentication Required | Yes                                                                   |
| Allowed Roles           | admin or resource creator (must be group member)                      |

### Request Structure

**Path Params**

| Param        | Required | Notes            |
| ------------ | -------- | ---------------- |
| `resourceId` | Yes      | MongoDB ObjectId |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Resource deleted successfully",
  "data": {},
  "success": true
}
```

### Error Responses

- `404` Resource not found
- `403` User not authorized to delete the resource

### Notes

- If the resource is a file, the file is also removed from Cloudinary.
- Allowed file types: JPEG, PNG, WEBP, PDF.

---

# Healthcheck

## Healthcheck

### Endpoint Overview

| Item                    | Value                                       |
| ----------------------- | ------------------------------------------- |
| HTTP Method             | `GET`                                       |
| Route                   | `/api/v1/healthcheck`                       |
| Description             | Service health status with DB connectivity. |
| Authentication Required | No                                          |
| Allowed Roles           | N/A                                         |

### Success Response

```json
{
  "statusCode": 200,
  "message": "Service is healthy",
  "data": {
    "status": "UP",
    "database": "CONNECTED",
    "uptime": 123.45,
    "timestamp": "<isoDate>"
  },
  "success": true
}
```

### Error Response

If DB is disconnected, returns status `503` and `Service is unhealthy` with `database: "DISCONNECTED"`.

---

# Common Error Structures

## Validation Error (Example)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "groupId", "message": "Invalid Group ID" }]
}
```

## Authentication Error (Example)

```json
{
  "success": false,
  "message": "Unauthorized request",
  "errors": []
}
```

## Authorization Error (Example)

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "errors": []
}
```

## Business Logic Error (Example)

```json
{
  "success": false,
  "message": "Group not found",
  "errors": []
}
```
