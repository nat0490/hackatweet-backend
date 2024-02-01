var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets.model");
const Notification = require("../models/notifications.model");
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
      comment: [],
    });
    tweet.save().then(() => {
      console.log("Tweet saved!");
      res.json({ result: true, tweet });
    });
  } else {
    res.status(500).json({ result: false, error: "Missing fields" });
  }
});


//AJOUTER UN COMMENTAIRE V2
//AFIN DE RECUPERER SON ID DANS LA REPONSE
router.put("/addComment/:id", async (req, res) => {
  const date = new Date();
  const newComment = {
    date: date,
    userFrom: req.body.userId,
    text: req.body.text,
    nbLike: 0,
  };
  try {
    const updateResult = await Tweet.updateOne({ _id: req.params.id }, { $push: { comment: newComment } });
    if (updateResult.modifiedCount === 0) {
      res.json({ result: false, error: "Tweet not found" });
    } else {
      const updatedTweet = await Tweet.findOne({ _id: req.params.id });
      const addedComment = updatedTweet.comment[updatedTweet.comment.length - 1];
//ajout notification
      const newNotification = new Notification ({
        fromUserName: req.body.userName, 
        fromUserId: req.body.userId,
        toUserId: updatedTweet.user, 
        type: "Comment", 
        tweetId: req.params.id, 
        tweetDescription: req.body.text, 
        time: date, 
        isRead: false, 
      });
      newNotification.save().then(() => {
        console.log("notification comment saved!");
        //res.json({ result: true, newNotification });
      });
//Fin ajout notif 
      res.json({ result: true, comment: addedComment });
    }
  } catch (error) {
    res.json({ result: false, error: error.message });
  }
});


//METTRE A JOUR NOMBRE DE LIKE COMMENTAIRE ++
router.put("/:tweetId/addLikeComment/:commentId", (req, res) => {
  const date = new Date();
  //const tweetId = req.params.tweetId;
  const {commentId, tweetId} = req.params;
  const {commentText, fromUserName, toUserId, fromUserId} = req.body;
  Tweet.updateOne(
    { _id: tweetId, "comment._id": commentId },
    { $inc: { "comment.$.nbLike": 1 } }
  )
    .then(() => {
//ajout notification
      const newNotification = new Notification ({
        fromUserName: fromUserName, 
        fromUserId: fromUserId,
        toUserId: toUserId, 
        type: "Like", 
        tweetId: commentId, 
        tweetDescription: commentText, 
        time: date, 
        isRead: false, 
      });
      newNotification.save().then(() => {
        console.log("notification like saved!");
        //res.json({ result: true, newNotification });
      });
//Fin ajout notif 
      res.json({ result: true, nbLike: "add one like" });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});



//METTRE A JOUR NOMBRE DE LIKE COMMENTAIRE--
router.put("/:tweetId/rmvLikeComment/:commentId", (req, res) => {
  const tweetId = req.params.tweetId;
  const commentId = req.params.commentId;
  Tweet.updateOne(
    { _id: tweetId, "comment._id": commentId },
    { $inc: { "comment.$.nbLike": - 1 } }
  )
    .then(() => {
      res.json({ result: true, nbLike: "remove one like" });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});


//SUPPRIMER UN COMMENTAIRE
router.delete("/:tweetId/removeComment/:commentId", (req,res) => {
  const {tweetId, commentId} = req.params;
  Tweet.updateOne(
    { _id: tweetId, "comment._id": commentId}, 
    { $pull: {comment: { _id: commentId }}})
    .then(data => {
      if (data.modifiedCount === 0) {
        res.json({ result: false, error: "Nothing remove"})
      } else {
        res.json({ result: true, message: "Comment remove"})
      }
    })
    .catch((error)=> {
      res.json({result:false, error: error.message});
    })
})

//SUPPRIMER UN TWEET
router.delete("/delete", (req, res) => {
  if (req.body.id === "") {
    res.status(500).json({ result: false, error: "Missing fields" });
  } else {
    Tweet.deleteOne({ _id: req.body.id }).then((dataDeleted) => {
      if (dataDeleted.deletedCount === 0) {
        res.status(500).json({ result: false, error: "Impossible to delete" });
      } else {
        res.json({ result: true });
      }
    });
  }
});




//RECUPERER TOUS LES TWEETS
router.get("/lastTweet", (req, res) => {
  Tweet.find()
     .populate("user")
     .populate('comment.userFrom')
     .exec()
     .then((tweets) => res.json({ result: true, tweets }))
     .catch((error) => {
        console.error("Error in /tweets/lastTweet route:", error);
        res.status(500).json({ result: false, comment: "Internal server error" });
     });
});

//RECUPERER UN TWEET
router.get("/find/:id", (req, res) => {
  Tweet.findOne({_id: req.params.id})
     .populate("user")
     .populate('comment.userFrom')
     .exec()
     .then((tweet) => res.json({ result: true, tweet }))
     .catch((error) => {
        console.error("Error in /tweets/find route:", error);
        res.status(500).json({ result: false, comment: "Internal server error" });
     });
});


//OBTENIR TOUS LES TWEETS D'UN HASHTAG
router.get("/hashtagNumber/:hashtag", (req,res) => {
  const hashtagToSearch = req.params.hashtag;
  Tweet.find({ hashtags: { $regex: new RegExp(hashtagToSearch, 'i') } })
    .populate("user")
    .then((tweets) => res.json({ result: true, tweets}))
})

//METTRE A JOUR NOMBRE DE LIKE ++
router.put("/addNbLike/:tweetId", (req, res) => {
  const date = new Date();
  const { tweetId } = req.params;
  const {tweetDescription, fromUserName, fromUserId, toUserId } = req.body;
  const newNotification = new Notification ({
    fromUserName: fromUserName, //Ecrire juste sont nom utilisateur => A MODIFIER!!!!
    fromUserId: fromUserId,
    toUserId: toUserId, //mettre un ID
    type: "Like", 
    tweetId: tweetId, 
    tweetDescription: tweetDescription, 
    time: date, 
    isRead: false, 
  });
  Tweet.updateOne({ _id: req.params.id }, { $inc: { nbLike: 1 } })
    .then(() =>
//ajout notification
    newNotification.save().then(() => {
      console.log("notification like saved!");
      //res.json({ result: true, newNotification });
      res.json({ result: true, nbLike: "add one like" })
    })
//Fin ajout notif 
  );
});

//METTRE A JOUR NOMBRE DE LIKE --
router.put("/rmvNbLike/:id", (req, res) => {
  Tweet.updateOne({ _id: req.params.id }, { $inc: { nbLike: -1 } }).then(() =>
    res.json({ result: true, nbLike: "remove one like" })
  );
});

module.exports = router;
