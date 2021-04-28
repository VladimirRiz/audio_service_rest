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
    res.status(200).json({ message: 'success', post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 10;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find().sort({ createdAt: -1 });
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

exports.getPopular = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 10;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find().sort({ likes: -1 });
    res.status(200).json({ message: 'Success', posts, totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPlays = async (req, res, next) => {
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find().sort({ plays: -1 });
    res.status(200).json({ message: 'Success', posts, totalItems });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getFavorite = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    const posts = await Post.find({
      _id: { $in: user.library },
    });
    res.status(200).json({ message: 'Success', posts });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPlaylists = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);

    res.status(200).json({ message: 'Success', playlists: user.playlists });
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
  const { title, description, category, likes, plays } = req.body;
  const audio = req.file.path;
  const post = new Post({
    title,
    description,
    audio,
    category,
    likes,
    plays,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    res.status(201).json({
      message: 'Success!',
      post: post,
      creator: { _id: user._id, name: user.name },
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
  const { title, description, category, likes, plays } = req.body;
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
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not Authorized');
      error.statusCode = 403;
      throw error;
    }
    if (audio !== post.audio) {
      clearAudio(post.audio, audio);
    }
    post.title = title;
    post.description = description;
    post.audio = audio;
    post.category = category;
    post.likes = likes;
    post.plays = plays;
    await post.save();

    res.status(200).json({ message: 'Success', post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.setComment = async (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const { comment } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(req.userId);
    post.comments.push({ text: comment, name: user.name });
    await post.save();

    res.status(200).json({ message: 'Success', post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPlaylist = async (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  let name = req.body.name ? name : `My Playlist`;
  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(postId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedPlaylists = [...user.playlists];

    if (user.playlists.length > 0) {
      const playlistIndex = user.playlists.findIndex(
        (playlist) => playlist.name === name
      );
      if (playlistIndex >= 0) {
        const updatedPlaylist = updatedPlaylists[playlistIndex];
        const isExist = updatedPlaylist.songs.find(
          (song) => song._id.toString() === postId.toString()
        );
        if (!isExist) {
          updatedPlaylists[playlistIndex].songs.push(post);
        }
      } else {
        updatedPlaylists.push({
          name: name,
          songs: [post],
        });
      }
    } else {
      updatedPlaylists.push({
        name: name,
        songs: [post],
      });
    }
    user.playlists = updatedPlaylists;
    await user.save();
    console.log(user.playlists);
    res.status(200).json({ message: 'Success', playlists: user.playlists });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changeNamePlaylist = async (req, res, next) => {
  const { listId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const { name } = req.body;
  try {
    const user = await User.findById(req.userId);
    const updatedPlaylists = [...user.playlists];
    const playlistIndex = user.playlists.findIndex(
      (playlist) => playlist._id.toString() === listId.toString()
    );
    updatedPlaylists[playlistIndex].name = name;
    user.playlists = updatedPlaylists;
    await user.save();
    res.status(200).json({ message: 'Success', playlists: user.playlists });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.removeFromPlayList = async (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    const updatedPlaylists = [...user.playlists];
    let filtered;
    if (user.playlists.length > 0) {
      const playlistIndex = user.playlists.findIndex(
        (playlist) => playlist.name === name
      );
      console.log(updatedPlaylists[playlistIndex], name);
      filtered = updatedPlaylists[playlistIndex].songs.filter(
        (id) => id.toString() !== postId.toString()
      );
      updatedPlaylists[playlistIndex].songs = filtered;
    }
    user.playlists = updatedPlaylists;
    await user.save();
    res.status(200).json({ message: 'Success', playlists: user.playlists });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.removePlaylist = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  try {
    console.log(name);
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    let filtered;
    if (user.playlists.length > 0) {
      filtered = user.playlists.filter((playlist) => playlist.name !== name);
    }
    user.playlists = filtered;
    await user.save();
    res.status(200).json({ message: 'Success', playlists: user.playlists });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePostLikes = async (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
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

    const user = await User.findById(req.userId);
    const isExist = await user.library.find((post) => {
      return post._id.toString() === postId.toString();
    });
    if (user.library.length === 0 || !isExist) {
      user.library.push(post);
      post.likes = post.likes + 1;
      post.likedBy.push(user);
      await post.save();
      await user.save();
    }
    res.status(200).json({ message: 'Success', post, library: user.library });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePostPlays = async (req, res, next) => {
  const { postId } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
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
    post.plays = post.plays + 1;
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
    console.log(req.userId);
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not Authorized');
      error.statusCode = 403;
      throw error;
    }
    clearAudio(post.audio);
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
