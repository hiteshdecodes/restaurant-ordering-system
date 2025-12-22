const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Table = require('../models/Table');

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true }).populate('category').sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single table
router.get('/:id', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id).populate('category');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new table with QR code
router.post('/', async (req, res) => {
  try {
    const { tableNumber, capacity, location, category } = req.body;

    // Generate QR code URL (pointing to customer menu with table number)
    // Use the request origin to determine the frontend URL
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    const frontendUrl = `${protocol}://${host}`;
    const menuUrl = `${frontendUrl}/menu?table=${tableNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl);

    const table = new Table({
      tableNumber,
      capacity,
      location,
      category: category || null,
      qrCode: qrCodeDataUrl
    });

    const savedTable = await table.save();
    const populatedTable = await savedTable.populate('category');
    res.status(201).json(populatedTable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update table
router.put('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT regenerate QR code for table
router.put('/:id/regenerate-qr', async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Generate new QR code
    const protocol = req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    const frontendUrl = `${protocol}://${host}`;
    const menuUrl = `${frontendUrl}/menu?table=${table.tableNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl);

    table.qrCode = qrCodeDataUrl;
    const updatedTable = await table.save();
    const populatedTable = await updatedTable.populate('category');

    res.json(populatedTable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE table (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
