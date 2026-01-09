const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const multer = require('multer');
const path = require('path');

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// GET restaurant settings
router.get('/', async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne();
    
    // If no restaurant exists, create default one
    if (!restaurant) {
      restaurant = new Restaurant({
        name: 'Restaurant Menu',
        primaryColor: '#ff6b35',
        secondaryColor: '#2d5016'
      });
      await restaurant.save();
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update restaurant settings (with optional logo upload or URL)
router.put('/', upload.single('logo'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If file was uploaded, use the file path
    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    } else if (req.body.logoUrl) {
      // If URL was provided, use the URL directly
      updateData.logo = req.body.logoUrl;
    }

    let restaurant = await Restaurant.findOne();

    if (!restaurant) {
      restaurant = new Restaurant(updateData);
    } else {
      Object.assign(restaurant, updateData);
    }

    const updatedRestaurant = await restaurant.save();
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

