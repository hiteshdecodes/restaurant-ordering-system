# 🔐 Dashboard Login Feature - Complete Guide

## Overview
The Restaurant Dashboard now includes a secure login system with JWT authentication, user management, and role-based access control.

## ✨ Features Implemented

### 1. **User Authentication**
- ✅ Owner registration (first user only)
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcryptjs
- ✅ Token expiration (7 days)
- ✅ Session persistence in localStorage

### 2. **User Management**
- ✅ Owner can add staff members
- ✅ Owner can delete users
- ✅ Owner can view all users
- ✅ Role-based access control (owner/staff)
- ✅ User activation/deactivation

### 3. **Security**
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT token verification on protected routes
- ✅ Role-based authorization
- ✅ Secure logout with token cleanup

---

## 🚀 Getting Started

### Step 1: Register as Owner
1. Navigate to `/dashboard`
2. Click on **"Register Owner"** tab
3. Fill in:
   - Username (min 3 characters)
   - Email
   - Password (min 6 characters)
   - Confirm Password
4. Click **"Register"**
5. You'll be logged in automatically

### Step 2: Login
1. Navigate to `/dashboard`
2. Click on **"Login"** tab
3. Enter username and password
4. Click **"Login"**

### Step 3: Add Staff Members (Owner Only)
1. Go to Dashboard Settings
2. Find "User Management" section
3. Click "Add New User"
4. Fill in staff details
5. Select role: "staff"
6. Click "Add User"

---

## 📁 Files Created/Modified

### New Files:
- `server/models/User.js` - User schema with password hashing
- `client/src/components/DashboardLogin.js` - Login/Register UI

### Modified Files:
- `server/routes/auth.js` - Added dashboard login routes
- `client/src/components/Dashboard.js` - Added login protection

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/dashboard/register
POST /api/auth/dashboard/login
```

### User Management (Owner Only)
```
GET /api/auth/dashboard/users
POST /api/auth/dashboard/users
DELETE /api/auth/dashboard/users/:id
```

---

## 💾 Database Schema

### User Model
```javascript
{
  username: String (unique, min 3 chars),
  email: String (unique),
  password: String (hashed, min 6 chars),
  role: String (enum: 'owner', 'staff'),
  isActive: Boolean (default: true),
  timestamps: true
}
```

---

## 🔑 Environment Variables

Add to `.env`:
```
JWT_SECRET=your-secret-key-change-in-production
```

---

## 📱 Frontend Integration

### Login Component Props
```javascript
<DashboardLogin onLoginSuccess={(user) => {
  // Handle successful login
  // user = { id, username, email, role }
}} />
```

### Token Storage
- Token: `localStorage.dashboardToken`
- User: `localStorage.dashboardUser`

### Making Authenticated Requests
```javascript
const token = localStorage.getItem('dashboardToken');
axios.get('/api/auth/dashboard/users', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🧪 Testing

### Test Owner Registration
```bash
curl -X POST http://localhost:5000/api/auth/dashboard/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "owner1",
    "email": "owner@restaurant.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/dashboard/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "owner1",
    "password": "password123"
  }'
```

---

## ⚠️ Important Notes

1. **First User Only**: Only the first user can register as owner
2. **Password Security**: Passwords are hashed with bcryptjs (10 rounds)
3. **Token Expiry**: Tokens expire after 7 days
4. **Production**: Change JWT_SECRET in production environment
5. **HTTPS**: Always use HTTPS in production for authentication

---

## 🔄 User Flow

```
User visits /dashboard
    ↓
Check localStorage for token
    ↓
No token? → Show Login/Register
    ↓
Valid token? → Show Dashboard
    ↓
User clicks Logout → Clear token & localStorage
```

---

## 📊 Image Upload (Existing Feature)

Images are saved to `/uploads` folder:
- **Menu Items**: `menu-{timestamp}.{ext}`
- **Restaurant Logo**: `logo-{timestamp}.{ext}`
- **Max Size**: 5MB
- **Formats**: JPEG, PNG, GIF, WebP

---

## 🎯 Next Steps

1. Test the login feature thoroughly
2. Add user management UI to dashboard
3. Implement password reset functionality
4. Add email verification for new users
5. Set up proper JWT_SECRET in production

---

**Created**: 2026-01-09
**Status**: ✅ Complete and Ready for Testing

