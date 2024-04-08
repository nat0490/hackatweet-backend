const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
    {
    date: Date,
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    text: String,
    nbLike: Number,
    },
    { timestamps: true, toJSON: { virtuals: true}}
);

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
