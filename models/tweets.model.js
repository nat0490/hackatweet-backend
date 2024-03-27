const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    date: Date,
    userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    text: String,
    nbLike: Number,
});

const pictureSchema = mongoose.Schema({
    url: String,
    cloudId: String,
})

const tweetSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    description: String,
    date: Date,
    nbLike: Number,
    privat: Boolean,
    pictures: [pictureSchema],
    hashtags: [String],
    comment: [commentSchema],
    },
    { timestamps: true, toJSON: { virtuals: true}}
);

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;
