const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    audio: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
    },
    // creator: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
