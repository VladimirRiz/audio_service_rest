const path = require('path');
const fs = require('fs');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

const clearAudio = (filePath) => {
  const imagePath = path.join(__dirname, '..', filePath);
  fs.unlink(imagePath, (err) => console.log(err));
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  try {
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    console.log(post);
    res.status(200).json({ message: 'success', post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  console.log('work');
  const currentPage = req.query.page || 1;
  const perPage = 10;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      // .populate('creator')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({ message: 'Success', posts, totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    console.log(req.file);
    const error = new Error('No audio');
    error.statusCode = 422;
    throw error;
  }
  // console.log(req.body);
  const { title, description } = req.body;
  const audio = req.file.path;
  const post = new Post({
    title,
    description,
    audio,
    // creator: req.userId,
  });
  try {
    await post.save();
    // const user = await User.findById(req.userId);
    // user.posts.push(post);
    // await user.save();
    res.status(201).json({
      message: 'Success!',
      post: post,
      // creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = req.file.path;
  }
  if (!image) {
    const error = new Error('No image');
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not Authorized');
      error.statusCode = 403;
      throw error;
    }
    if (image !== post.image) {
      clearAudio(post.image, image);
    }
    post.title = title;
    post.content = content;
    post.image = image;
    await post.save();

    res.status(200).json({ message: 'Success', post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not Authorized');
      error.statusCode = 403;
      throw error;
    }
    clearAudio(post.image);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    res.status(200).json({ message: 'Deleted!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
