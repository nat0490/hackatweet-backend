const mongoose = require("mongoose");

const trendSchema = mongoose.Schema({
  hashtag: String,
  tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "tweets" }],
});

const Trend = mongoose.model("trends", trendSchema);

module.exports = Trend;
