const express = require("express");
const Trend = require("../models/trend.model");
const router = express.Router();
const { checkBody } = require("../module/checkBoby");

router.post("/create", (req, res) => {
  const { hashtag, tweets } = req.body;
  if (checkBody(req.body, ["hashtag", "tweets"])) {
    Trend.findOne({ hashtag }).then((data) => {
      if (data === null) {
        const newTrend = new Trend({
          hashtag,
          tweets,
        });
        newTrend.save().then((newDoc) => {
          Trend.findById(newDoc._id)
            .populate("tweets")
            .then((data) => {
              res.json({ result: true, data });
            });
        });
      } else {
        res.status(500).json({ result: false, error: "Hashtag already exist" });
      }
    });
  } else {
    res.status(500).json({ result: false, error: "Missing fields" });
  }
});

router.get("/all", (req, res) => {
  Trend.find()
    .populate("tweets")
    .then((hashtags) => {
      if (hashtags.length === 0) {
        res.status(500).json({ result: false, error: "No Hashtag yet" });
      } else {
        res.json({ result: true, hashtags });
      }
    });
});

router.get("/oneHashtag/:hashtag", (req, res) => {
  const { hashtag } = req.params;
  if (checkBody(req.params, ["hashtag"])) {
    Trend.findOne({ hashtag })
      .populate({
        path: 'tweets',
        populate: {
        path: 'user',
        },
        })
      .then((hashtagFind) => {
        if (hashtagFind === null) {
          res.status(500).json({ result: false, error: "Hashtag Unknown" });
        } else {
          res.json({ result: true, hashtagFind });
        }
      });
  } else {
    res.status(500).json({ result: false, error: "Missing fields" });
  }
});

// créer route put pour Hashtag
router.put("/update/:hashtag", (req, res) => {
  Trend.updateOne(
    { hashtag: req.params.hashtag },
    { $push: { tweets: req.body.tweetId } }
  ).then((data) => {
    console.log(req.params.hashtag);
    console.log(data);
    if (data.acknowledged === false) {
      res.status(500).json({ result: false, error: "noMatch" });
    } else {
      res.json({ result: true });
    }
  });
});

router.delete("/delete", (req, res) => {
  const { id } = req.body;
  if (checkBody(req.body, ["id"])) {
    Trend.deleteOne({ _id: id }).then((dataDeleted) => {
      if (dataDeleted.deletedCount === 0) {
        res.status(500).json({ result: false, error: "Impossible to delete" });
      } else {
        res.json({ result: true });
      }
    });
  } else {
    res.status(500).json({ result: false, error: "Missing fields" });
  }
});

module.exports = router;
