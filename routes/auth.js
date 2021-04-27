const express = require('express');

const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Email is already exist');
          }
        });
      })
      .normalizeEmail(),
    body('name').trim().not().isEmpty(),
    body('password').trim().isLength({ min: 5 }),
  ],
  authController.signup
);

router.post('/login', authController.login);

// router.get('/status', isAuth, authController.getUserStatus);

router.get('/users', isAuth, authController.getUsers);

router.put('/user/:userId', isAuth, authController.updateUser);

router.delete('/user/:userId', isAuth, authController.deleteUser);
// router.patch(
//   '/status',
//   isAuth,
//   [body('status').trim().not().isEmpty()],
//   authController.updateUserStatus
// );

module.exports = router;
