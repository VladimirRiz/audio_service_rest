const express = require('express');

const { body } = require('express-validator');

const categoriesController = require('../controllers/categories');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/category', categoriesController.fetchCategories);
router.post('/category', categoriesController.createCategory);
router.put('/category/:categoryId', categoriesController.updateCategory);

module.exports = router;
