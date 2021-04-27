const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'User!',
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  library: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  playlists: [
    {
      name: String,
      songs: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Post',
        },
      ],
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
