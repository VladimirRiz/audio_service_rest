const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashPassword,
      name,
    });
    const result = await user.save();
    res.status(201).json({ message: 'Success', userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('A user not found');
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Invalid password');
      error.status = 401;
      throw error;
    }
    console.log(user);
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      'supersecretkeyever',
      { expiresIn: '1h' }
    );
    console.log(loadedUser, token);
    res.status(200).json({
      token,
      userId: loadedUser._id.toString(),
      expiresIn: 3600,
      status: loadedUser.status,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  console.log(req.userId);
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { name, email, status } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = status;
    user.name = name;
    user.email = email;
    await user.save();
    res.status(200).json({ message: 'User updated.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const admin = await User.findById(req.userId);

    if (admin.status === 'Admin') {
      const users = await User.find();
      res.status(200).json({ message: 'Success', users });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    // const user = await User.findById(userId);
    // if (!user) {
    //   const error = new Error('User not found');
    //   error.statusCode = 404;
    //   throw error;
    // }
    await User.findByIdAndRemove(userId);

    res.status(200).json({ message: 'Deleted!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
