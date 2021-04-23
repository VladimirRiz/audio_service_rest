const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

//GET feed/posts
router.get('/posts', feedController.getPosts);

router.get('/posts/:category', feedController.getCategory);
router.get('/likes', feedController.getPopular);

router.post(
  '/post',
  [
    body('title').isString().isLength({ min: 5 }).trim(),
    body('description').isString().isLength({ min: 5 }).trim(),
    isAuth,
  ],
  feedController.createPost
);

router.get('/post/:postId', feedController.getPost);

router.put(
  '/post/:postId',
  [
    body('title').isString().isLength({ min: 5 }).trim(),
    body('description').isString().isLength({ min: 5 }).trim(),
  ],

  feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

router.put('/post/likes/:postId', feedController.updatePostLikes);
router.put('/post/plays/:postId', feedController.updatePostPlays);

module.exports = router;
