const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const { category, includeUnavailable } = req.query;
    let query = {};

    // For dashboard, include all items. For customer menu, only available items
    if (includeUnavailable !== 'true') {
      query.isAvailable = true;
    }

    if (category) {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query)
      .populate('category', 'name')
      .sort({ sortOrder: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET menu items by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      category: req.params.categoryId,
      isAvailable: true
    }).populate('category', 'name').sort({ sortOrder: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new menu item (with optional file upload)
router.post('/', upload.single('imageFile'), async (req, res) => {
  try {
    console.log('Creating menu item with data:', req.body);

    const itemData = { ...req.body };

    // If file was uploaded, use the file path; otherwise use the provided URL
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
    } else if (!itemData.image) {
      itemData.image = '/api/placeholder/300/200';
    }

    const menuItem = new MenuItem(itemData);
    const savedMenuItem = await menuItem.save();
    const populatedMenuItem = await MenuItem.findById(savedMenuItem._id).populate('category', 'name');
    res.status(201).json(populatedMenuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(400).json({ message: error.message, details: error });
  }
});

// PUT update menu item (with optional file upload)
router.put('/:id', upload.single('imageFile'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If file was uploaded, use the file path; otherwise keep existing or use provided URL
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE menu item (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable: false },
      { new: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
