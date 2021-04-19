const path = require('path');
const fs = require('fs');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

const clearAudio = (filePath) => {
  const audioPath = path.join(__dirname, '..', filePath);
  fs.unlink(audioPath, (err) => console.log(err));
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
      // .populate('category')
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

exports.getCategory = async (req, res, next) => {
  const reqCategory = req.params.category;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find().where({ category: reqCategory });
    console.log(posts);
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
  const { title, description, category } = req.body;
  const audio = req.file.path;
  const post = new Post({
    title,
    description,
    audio,
    category,
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
  console.log('here');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const { title, description, category } = req.body;
  let audio = req.body.audio;
  if (req.file) {
    audio = req.file.path;
  }
  if (!audio) {
    const error = new Error('No audio');
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
    // if (post.creator.toString() !== req.userId) {
    //   const error = new Error('Not Authorized');
    //   error.statusCode = 403;
    //   throw error;
    // }
    if (audio !== post.audio) {
      clearAudio(post.audio, audio);
    }
    post.title = title;
    post.description = description;
    post.audio = audio;
    post.category = category;
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
    // if (post.creator.toString() !== req.userId) {
    //   const error = new Error('Not Authorized');
    //   error.statusCode = 403;
    //   throw error;
    // }
    clearAudio(post.audio);
    await Post.findByIdAndRemove(postId);

    // const user = await User.findById(req.userId);
    // user.posts.pull(postId);
    // await user.save();
    res.status(200).json({ message: 'Deleted!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
