const path = require('path');
const fs = require('fs');

const { validationResult } = require('express-validator');

const Categories = require('../models/categories');

exports.createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const { name } = req.body;
  try {
    const category = new Categories({ name });
    await category.save();
    const categories = await Categories.find();
    res.status(201).json({
      message: 'Success!',
      categories,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.fetchCategories = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  try {
    const categories = await Categories.find();
    res.status(201).json({
      message: 'Success!',
      categories: categories,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const { name } = req.body;
  try {
    const category = await Categories.findById(categoryId);
    category.name = name;
    await category.save();
    res.status(201).json({
      message: 'Success!',
      category,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
