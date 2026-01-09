# 🔌 API Reference - Dashboard Authentication

## Base URL
```
https://restaurant-ordering-system-5jxm.onrender.com/api
```

---

## 🔐 Authentication Endpoints

### 1. Register Owner (First User Only)
```
POST /auth/dashboard/register
Content-Type: application/json

Request:
{
  "username": "owner1",
  "email": "owner@restaurant.com",
  "password": "password123"
}

Response (201):
{
  "message": "Owner registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "owner1",
    "email": "owner@restaurant.com",
    "role": "owner"
  }
}
```

### 2. Login
```
POST /auth/dashboard/login
Content-Type: application/json

Request:
{
  "username": "owner1",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "owner1",
    "email": "owner@restaurant.com",
    "role": "owner"
  }
}
```

---

## 👥 User Management (Owner Only)

### 3. Get All Users
```
GET /auth/dashboard/users
Authorization: Bearer {token}

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "owner1",
    "email": "owner@restaurant.com",
    "role": "owner",
    "isActive": true,
    "createdAt": "2026-01-09T10:00:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "username": "staff1",
    "email": "staff@restaurant.com",
    "role": "staff",
    "isActive": true,
    "createdAt": "2026-01-09T10:05:00Z"
  }
]
```

### 4. Add New User
```
POST /auth/dashboard/users
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "username": "staff1",
  "email": "staff@restaurant.com",
  "password": "password123",
  "role": "staff"
}

Response (201):
{
  "message": "User added successfully",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "username": "staff1",
    "email": "staff@restaurant.com",
    "role": "staff"
  }
}
```

### 5. Delete User
```
DELETE /auth/dashboard/users/{userId}
Authorization: Bearer {token}

Response (200):
{
  "message": "User deleted successfully"
}
```

---

## 🔑 Token Format

All authenticated requests require:
```
Authorization: Bearer {token}
```

Token contains:
- User ID
- Username
- Role
- Expiration (7 days)

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid credentials"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Only owner can add users"
}
```

---

## 📝 Notes

- Passwords are hashed with bcryptjs
- Tokens expire after 7 days
- Only owner can manage users
- First user must register as owner
- All timestamps in ISO 8601 format

---

**Last Updated**: 2026-01-09

