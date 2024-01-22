const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    date: Date,
    userFrom: String,
    text: String,
})

//VERIFIER LE NOM DE LA COLLECTION USERS
const tweetSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    description: String,
    date: Date,
    nbLike: Number,
    hashtags: [String],
    comment: [commentSchema],
})

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;
