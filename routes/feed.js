const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const feedController = require('../controllers/feed');
// const isAuth = require('../middleware/is-auth');

//GET feed/posts
router.get('/posts', feedController.getPosts);

router.post('/post', feedController.createPost);

router.get('/post/:postId', feedController.getPost);

router.put(
  '/post/:postId',
  [
    body('title').isString().isLength({ min: 5 }).trim(),
    body('content').isString().isLength({ min: 5 }).trim(),
  ],

  feedController.updatePost
);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;
