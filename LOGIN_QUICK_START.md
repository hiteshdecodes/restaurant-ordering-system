# 🚀 Dashboard Login - Quick Start (5 Minutes)

## Step 1: Start the Application

### Terminal 1 - Backend
```bash
cd server
npm start
```

### Terminal 2 - Frontend
```bash
cd client
npm start
```

---

## Step 2: Register as Owner

1. Open: `http://localhost:3000/dashboard`
2. Click **"Register Owner"** tab
3. Fill in:
   ```
   Username: owner1
   Email: owner@restaurant.com
   Password: password123
   Confirm: password123
   ```
4. Click **"Register"**
5. ✅ Logged in automatically!

---

## Step 3: You're In! 🎉

You should see:
- Dashboard with all features
- Your username in top-right corner
- "👤 owner1 (owner)" displayed

---

## 🔑 Test Login/Logout

### Logout
1. Click **"Logout"** button (top-right)
2. Confirm logout

### Login Again
1. Click **"Login"** tab
2. Enter:
   ```
   Username: owner1
   Password: password123
   ```
3. Click **"Login"**

---

## 📸 Test Image Upload

### Upload Menu Item
1. Go to **"Menu Items"** tab
2. Click **"Add New Item"**
3. Fill in details
4. Click **"Choose Image"**
5. Select image file
6. Click **"Add Item"**

### Upload Logo
1. Go to **"Settings"** tab
2. Find **"Restaurant Logo"**
3. Click **"Choose Logo"**
4. Select image file
5. Click **"Save"**

---

## 👥 Add Staff Member (Optional)

1. In Dashboard, find **"User Management"**
2. Click **"Add New User"**
3. Fill in:
   ```
   Username: staff1
   Email: staff@restaurant.com
   Password: password123
   Role: staff
   ```
4. Click **"Add User"**

---

## 🧪 Test API (Optional)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/dashboard/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "owner1",
    "email": "owner@restaurant.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/dashboard/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "owner1",
    "password": "password123"
  }'
```

---

## 📚 Full Documentation

- **Complete Guide**: `DASHBOARD_LOGIN_GUIDE.md`
- **API Reference**: `API_REFERENCE.md`
- **Image Upload**: `IMAGE_UPLOAD_GUIDE.md`

---

## ✅ Checklist

- [ ] Backend running
- [ ] Frontend running
- [ ] Registered as owner
- [ ] Logged in successfully
- [ ] User info displayed
- [ ] Uploaded menu image
- [ ] Uploaded logo
- [ ] Logged out
- [ ] Logged back in

---

**Done!** You're ready to use the dashboard. 🎉

