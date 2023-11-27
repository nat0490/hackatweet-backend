const mongoose = require("mongoose");

//VERIFIER LE NOM DE LA COLLECTION USERS
const tweetSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    description: String,
    date: Date,
    nbLike: Number,
    hashtags: [String],
})

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;
