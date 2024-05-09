var express = require("express");
var router = express.Router();

const Tweet = require("../models/tweets.model");
const Notification = require("../models/notifications.model");
const User = require('../models/users.model');
const { checkBody } = require("../module/checkBoby");

//CLOUDINARY
const Multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


//Test écoute modification (ajout/retrait) tweet

/* TEST2 DROPZONE 
    vvvvvvvv */
const upload  =  Multer ( {  dest : '/tmp'  } );
const type = upload.array('file');

router.post('/upload2' , type , async(req,res) => {
  const allCloudinaryRes = [];
  try {
      for (const key in req.files) {
        const file = req.files[key];
        // console.log("file:",file);
      // const b64 = Buffer.from(file.buffer).toString("base64");
      // let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const cloudinaryRes = await cloudinary.uploader.upload(file.path, { folder: "dropzone-image",});
      console.log("Upload successful for", file);
      // console.log(cloudinaryRes);
      // console.log(cloudinaryRes);
      allCloudinaryRes.push({url: cloudinaryRes.secure_url, cloudId: cloudinaryRes.public_id});
      }
    // console.log("allCloudyRes:",allCloudinaryRes);
    res.status(200).json({ message: "Upload sucessfull", allCloudinaryRes: allCloudinaryRes});
  } catch(error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "Error uploading files" });
  }
});
/* ^^^^^^^^ 
TEST2 DROPZONE */



//POSTER UN NEW TWEET
router.post("/create", async (req, res) => {
  // if (checkBody(req.body, ["user", ("pictures"  || "description" )])) {
  const date = new Date();
  const { user, description, pictures, hashtags, privat } = req.body;
    try {
       //console.log(description, pictures);
       const userFrom = await User.findOne({token : user}).lean();
       if(userFrom) {

        if(pictures.length === 0 && description === "") {
          res.status(500).json({ result: false, message: "MissingFields" });
        } else {
        const tweet = new Tweet({
          user: userFrom._id,
          description: description,
          date: date,
          nbLike: 0,
          privat: privat,
          pictures: pictures,
          hashtags: hashtags,
          comment: [],
        });
        const savedTweet = await tweet.save();
        // console.log("Tweet saved!");
        res.status(200).json({ result: true, savedTweet });
    }} else {
      res.status(500).json({ result: false, message: "noUser" });
  }} catch (error){
      res.status(500).json({ result: false, message: "Erreur serveur" })
    }
});


//AJOUTER UN COMMENTAIRE V3
//AFIN DE RECUPERER SON ID DANS LA REPONSE
router.put("/addCommentV3/:id/from/:userTokenFrom", async (req, res) => {
  const date = new Date();
  const {id, userTokenFrom} = req.params;

  try {
    // const userIdTo = await User.findOne({token : userTokenTo}).lean();
    const userFrom = await User.findOne({token : userTokenFrom}).lean();
    if(userFrom) {
        
      const newComment = {
        date: date,
        userFrom: userFrom._id,
        text: req.body.text,
        nbLike: 0,
      };

      const updateResult = await Tweet.updateOne({ _id: id}, { $push: { comment: newComment } });
      if (updateResult.modifiedCount === 0) {
        res.json({ result: false, error: "Tweet not found" });
      } else {
        const updatedTweet = await Tweet.findOne({ _id: req.params.id });
        const addedComment = updatedTweet.comment[updatedTweet.comment.length - 1];
  //ajout notification
        const newNotification = new Notification ({
          fromUserName: req.body.userName, 
          fromUserId: userIdFrom._id,
          toUserId: updatedTweet.user, 
          type: "Comment", 
          tweetId: id, 
          tweetDescription: req.body.text, 
          time: date, 
          isRead: false, 
        });
        const newNotif = await newNotification.save()
          // console.log("notification comment saved!", newNotif);
  //Fin ajout notif 
        res.status(200).json({ result: true, comment: addedComment });
      }
    } else {
      res.status(500).json({result: false, comment: "no user found"});
    }
  } catch (error) {
    res.json({ result: false, error: error.message });
  }
});



//METTRE A JOUR NOMBRE DE LIKE COMMENTAIRE ++
router.put("/:tweetId/addLikeComment/:commentId", async (req, res) => {
  const date = new Date();
  const {commentId, tweetId} = req.params;
  const {commentText, fromUserName, toUserId, fromUserToken} = req.body;
  try {
    const userIdFrom = await User.findOne({token : fromUserToken}).lean();
    if (userIdFrom) {
      const newNotification = new Notification ({
        fromUserName: fromUserName, 
        fromUserId: userIdFrom,
        toUserId: toUserId, 
        type: "Like", 
        tweetId: commentId, 
        tweetDescription: commentText, 
        time: date, 
        isRead: false, 
      });
      const tweetUpdate = await  Tweet.updateOne(
                                        { _id: tweetId, "comment._id": commentId },
                                        { $inc: { "comment.$.nbLike": 1 } }
                                      );
      if (tweetUpdate.modifiedCount === 0) {
        console.log("nothing update");
        res.status(500).json({result: false, nbLike: "nothing update"})
      } else {
        const newNotif = await newNotification.save();
        console.log("notification like saved!", newNotif);
        res.status(200).json({ result: true, nbLike: "add one like & notification" });
      }
    } else {
      console.log("no user found");
      res.status(500).json({result: false, comment: "no user found"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({result: false, comment: "Erreur serveur", error});
  }
});



//METTRE A JOUR NOMBRE DE LIKE COMMENTAIRE--
router.put("/:tweetId/rmvLikeComment/:commentId", (req, res) => {
  const tweetId = req.params.tweetId;
  const commentId = req.params.commentId;
  Tweet.updateOne({ _id: tweetId, "comment._id": commentId }, { $inc: { "comment.$.nbLike": - 1 }})
    .then((data) => {
      if(data.modifiedCount === 0){
        res.json({result: false, message: "nothing change"})
      } else {
        res.json({ result: true, nbLike: "remove one like" });
      }
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

//DELETE PICTURE FROM CLOUDY
router.post('/destroy/:cloudId', async(req,res) => {
  const { cloudId } = req.params;
  const newCloudId = decodeURIComponent(cloudId);
  // console.log(newCloudId);
  try {
    const cloudinaryRes = await cloudinary.uploader.destroy(newCloudId, { invalidate: true /*, type: upload*/, resource_type: "image" })
    if (cloudinaryRes.result !== "ok") {
      res.status(500).json({ cloudinaryRes: cloudinaryRes});
    } else {
      res.status(200).json({ cloudinaryRes: cloudinaryRes});
    }
  } catch(error) {
    console.error("Error removing files:", error);
    res.status(500).json({ message: "Error removing files" });
  }
});


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

//SUPPRIMER UN TWEET V2: supprimer tweet et photo de cloudy
router.delete("/delete2", async (req, res) => {
  try {
    // Supprimer les images du Cloudinary
    const tweet = await Tweet.findById(req.body.id);
    for (const pic of tweet.pictures) {
      if (pic.cloudId){
/*const cloudinaryRes = */await cloudinary.uploader.destroy(pic.cloudId, { invalidate: true, resource_type: "image" });
      // console.log(cloudinaryRes);
      }
      
    };

    // Supprimer le tweet dans la base de données
    const dataDeleted = await Tweet.deleteOne({ _id: req.body.id });
    if (dataDeleted.deletedCount === 0) {
      res.status(500).json({ result: false, error: "Impossible to delete" });
    } else {
      res.json({ result: true });}
  } catch (error) {
    console.error("Error deleting tweet:", error);
    res.status(500).json({ message: "Error deleting tweet" });
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
router.put("/addNbLike/:tweetId", async(req, res) => {
  const date = new Date();
  const { tweetId } = req.params;
  const {tweetDescription, fromUserName, fromUserToken, toUserId } = req.body;
  try {
    const userIdFrom = await User.findOne({token : fromUserToken}).lean();
    if (userIdFrom) {
      // console.log("userfound");
      const newNotification = new Notification ({
        fromUserName: fromUserName, 
        fromUserId: userIdFrom,
        toUserId: toUserId, 
        type: "Like", 
        tweetId: tweetId, 
        tweetDescription: tweetDescription, 
        time: date, 
        isRead: false, 
      });

      const tweetUpdate = await Tweet.updateOne({ _id: tweetId }, { $inc: { nbLike: 1 } });
      // console.log(tweetUpdate);
      if (tweetUpdate.modifiedCount === 0){
        res.status(500).json({ result: false, error: "Nothing update"})
      } else {
        // console.log("try to save new notif");
        const newNotif = await newNotification.save();


        // console.log(newNotif);
        // console.log("notification like saved!", newNotif);
        res.status(200).json({ result: true, comment: "add one like & notification" });
      }

    } else{
      console.log("no user found");
      res.status(500).json({result: false, comment: "no user found"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({result: false, comment: "Erreur serveur", error});
  }
});

//METTRE A JOUR NOMBRE DE LIKE --
router.put("/rmvNbLike/:id", (req, res) => {
  Tweet.updateOne({ _id: req.params.id }, { $inc: { nbLike: -1 } })
  .then((data) => {
    if (data.modifiedCount === 0) {
      res.json({result: false, message: "nothing change"})
    } else {
      res.json({ result: true, nbLike: "remove one like" })
    }
  })
  .catch((error)=> {
    res.status(500).json({result: false, error: error.message})
  })
});

module.exports = router;
