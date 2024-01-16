var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets.model");
const { checkBody } = require("../module/checkBoby");

//POSTER UN NEW TWEET
router.post("/create", (req, res) => {
  const date = new Date();
  if (checkBody(req.body, ["user", "description", "hashtags"])) {
    const tweet = new Tweet({
      user: req.body.user,
      description: req.body.description,
      date: date,
      nbLike: 0,
      hashtags: req.body.hashtags,
    });
    tweet.save().then(() => {
      console.log("Tweet saved!");
      res.json({ result: true, tweet });
    });
  } else {
    res.status(500).json({ result: false, error: "Missing fields" });
  }
});

//SUPPRIMER UN TWEET
router.delete("/delete", (req, res) => {
  if (req.body.id === "") {
    res.status(500).json({ result: false, error: "Missing fields" });
  } else {
    Tweet.deleteOne({ _id: req.body.id }).then((dataDeleted) => {
      console.log(dataDeleted);
      if (dataDeleted.deletedCount === 0) {
        res.status(500).json({ result: false, error: "Impossible to delete" });
      } else {
        res.json({ result: true });
      }
    });
  }
});

//OBTENIR LES TWEETS
router.get("/lastTweet", (req, res) => {
  Tweet.find()
    .populate("user")
    .then((tweets) => res.json({ result: true, tweets }));
});



//OBTENIR TOUS LES TWEETS D'UN HASHTAG
router.get("/hashtagNumber/:hashtag", (req,res) => {
  const hashtagToSearch = req.params.hashtag;
  Tweet.find({ hashtags: { $regex: new RegExp(hashtagToSearch, 'i') } })
    .populate("user")
    .then((tweets) => res.json({ result: true, tweets}))
})

//METTRE A JOUR NOMBRE DE LIKE
router.put("/nbLike/:id", (req, res) => {
  Tweet.updateOne({ _id: req.params.id }, { $inc: { nbLike: 1 } }).then(() =>
    res.json({ nbLike: "update" })
  );
});

module.exports = router;
