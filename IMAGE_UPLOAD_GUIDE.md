# 📸 Image Upload System - Complete Guide

## Overview
The Restaurant Ordering System supports image uploads for menu items and restaurant logo. Images are stored on the server's file system and served via HTTP.

---

## 📁 Storage Location

### Server-Side
```
/server/uploads/
├── menu-1763254419117-573111602.jpg
├── menu-1763254419118-573111603.png
├── logo-1763254419119-573111604.jpg
└── ...
```

### Database Storage
Only the **URL path** is stored in MongoDB:
```javascript
{
  image: "/uploads/menu-1763254419117-573111602.jpg",
  logo: "/uploads/logo-1763254419119-573111604.jpg"
}
```

---

## 🖼️ Image Types

### 1. Menu Item Images
- **Prefix**: `menu-`
- **Naming**: `menu-{timestamp}-{random}.{ext}`
- **Example**: `menu-1763254419117-573111602.jpg`
- **Used in**: MenuItem model

### 2. Restaurant Logo
- **Prefix**: `logo-`
- **Naming**: `logo-{timestamp}.{ext}`
- **Example**: `logo-1763254419119.jpg`
- **Used in**: Restaurant model

---

## ⚙️ Configuration

### File Size Limit
```javascript
limits: { fileSize: 5 * 1024 * 1024 } // 5MB
```

### Allowed Formats
```javascript
const allowedMimes = [
  'image/jpeg',  // .jpg, .jpeg
  'image/png',   // .png
  'image/gif',   // .gif
  'image/webp'   // .webp
];
```

### Multer Configuration
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

---

## 🔌 API Endpoints

### Upload Menu Item Image
```
POST /api/menu-items
Content-Type: multipart/form-data

Form Data:
- name: "Biryani"
- description: "Delicious rice dish"
- price: 250
- category: "507f1f77bcf86cd799439011"
- image: <file>
- isVeg: true
- spiceLevel: 2

Response:
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Biryani",
  "image": "/uploads/menu-1763254419117-573111602.jpg",
  "price": 250,
  ...
}
```

### Upload Restaurant Logo
```
PUT /api/restaurant
Content-Type: multipart/form-data

Form Data:
- name: "My Restaurant"
- primaryColor: "#ff6b35"
- secondaryColor: "#2d5016"
- logo: <file>

Response:
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "My Restaurant",
  "logo": "/uploads/logo-1763254419119.jpg",
  "primaryColor": "#ff6b35",
  ...
}
```

---

## 🌐 Accessing Images

### Frontend URL
```
https://restaurant-ordering-system-5jxm.onrender.com/uploads/menu-1763254419117-573111602.jpg
```

### In React Component
```javascript
<img 
  src={`https://restaurant-ordering-system-5jxm.onrender.com${menuItem.image}`}
  alt={menuItem.name}
/>
```

### In HTML
```html
<img src="/uploads/menu-1763254419117-573111602.jpg" alt="Menu Item">
```

---

## 📤 Upload Examples

### Using cURL
```bash
curl -X POST http://localhost:5000/api/menu-items \
  -F "name=Biryani" \
  -F "price=250" \
  -F "category=507f1f77bcf86cd799439011" \
  -F "image=@/path/to/image.jpg"
```

### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('name', 'Biryani');
formData.append('price', 250);
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/menu-items', {
  method: 'POST',
  body: formData
});
```

### Using Axios
```javascript
const formData = new FormData();
formData.append('name', 'Biryani');
formData.append('price', 250);
formData.append('image', fileInput.files[0]);

const response = await axios.post('/api/menu-items', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## ✅ Best Practices

1. **Validate File Type**: Check MIME type on frontend
2. **Compress Images**: Optimize before upload
3. **Use Unique Names**: Prevents overwriting
4. **Error Handling**: Catch upload errors gracefully
5. **Size Limits**: Enforce 5MB limit
6. **Backup**: Regularly backup uploads folder

---

## 🔒 Security Considerations

1. ✅ File type validation (MIME type)
2. ✅ File size limit (5MB)
3. ✅ Unique filenames (timestamp + random)
4. ✅ Served via static middleware
5. ⚠️ TODO: Add virus scanning for production
6. ⚠️ TODO: Implement CDN for better performance

---

## 📊 File Structure

```
server/
├── uploads/
│   ├── menu-1763254419117-573111602.jpg
│   ├── menu-1763254419118-573111603.png
│   ├── logo-1763254419119-573111604.jpg
│   └── ...
├── routes/
│   ├── menuItems.js (handles menu image uploads)
│   └── restaurant.js (handles logo uploads)
└── server.js (serves /uploads as static)
```

---

## 🐛 Troubleshooting

### Images Not Displaying
- Check if `/uploads` folder exists
- Verify image path in database
- Check browser console for 404 errors

### Upload Fails
- Check file size (max 5MB)
- Verify file format (JPEG, PNG, GIF, WebP)
- Check server logs for errors

### Disk Space Issues
- Monitor `/uploads` folder size
- Implement cleanup for old images
- Consider cloud storage (AWS S3, etc.)

---

**Last Updated**: 2026-01-09
**Status**: ✅ Production Ready

