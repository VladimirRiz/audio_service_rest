const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

//GET feed/posts
router.get('/posts', feedController.getPosts);

router.get('/posts/:category', feedController.getCategory);
router.get('/likes', feedController.getPopular);
router.get('/plays', feedController.getPlays);
router.get('/favorite/:userId', feedController.getFavorite);

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

router.get('/playlists/:userId', feedController.getPlaylists);

router.put(
  '/post/:postId',
  [
    body('title').isString().isLength({ min: 5 }).trim(),
    body('description').isString().isLength({ min: 5 }).trim(),
  ],
  isAuth,
  feedController.updatePost
);

router.put(
  '/post/comment/:postId',
  [body('comment').isString().isLength({ min: 5 }).trim()],
  isAuth,
  feedController.setComment
);
router.put('/playlists/:postId', isAuth, feedController.createPlaylist);

router.delete('/post/:postId', isAuth, feedController.deletePost);

router.put('/post/likes/:postId', isAuth, feedController.updatePostLikes);
router.put('/post/plays/:postId', feedController.updatePostPlays);

module.exports = router;
