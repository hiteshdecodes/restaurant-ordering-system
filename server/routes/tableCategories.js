const express = require('express');
const router = express.Router();
const TableCategory = require('../models/TableCategory');

// GET all table categories
router.get('/', async (req, res) => {
  try {
    const categories = await TableCategory.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single table category
router.get('/:id', async (req, res) => {
  try {
    const category = await TableCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new table category
router.post('/', async (req, res) => {
  const { name, description, color, icon, order } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const category = new TableCategory({
    name,
    description: description || '',
    color: color || '#ff6b35',
    icon: icon || 'category',
    order: order || 0
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update table category
router.put('/:id', async (req, res) => {
  try {
    const category = await TableCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (req.body.name) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.color) category.color = req.body.color;
    if (req.body.icon) category.icon = req.body.icon;
    if (req.body.order !== undefined) category.order = req.body.order;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE table category
router.delete('/:id', async (req, res) => {
  try {
    const category = await TableCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await TableCategory.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

