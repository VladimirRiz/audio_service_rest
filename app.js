require('dotenv').config();

const path = require('path');
const express = require('express');

const multer = require('multer');

const mongoose = require('mongoose');

const feedRouts = require('./routes/feed');
const authRouts = require('./routes/auth');

const app = express();

const MONGODB_URI = process.env.MONGODB;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'audio');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'audio/mp3') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter }).single('audio'));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRouts);
app.use('/auth', authRouts);

app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode, message, data } = error;
  res.status(statusCode).json({ message, data });
});

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log('connected');
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => console.log(err));
