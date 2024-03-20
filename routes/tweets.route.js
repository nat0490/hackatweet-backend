var express = require("express");
var router = express.Router();
//require('dotenv').config();
const Tweet = require("../models/tweets.model");
const Notification = require("../models/notifications.model");
const { checkBody } = require("../module/checkBoby");

//POSTER UNE PHOTO SUR CLOUDINARY
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});


//UPLOAD MULTIPLE
router.post('/uploadMultiPic',  async(req,res)=> {
  // console.log(cloudinary.config());

      try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ result: false, error: 'Aucun fichier n\'a été téléchargé.' });
        }
        const files = Object.values(req.files); // Récupérer tous les fichiers téléchargés
        const uploadedImages = [];
        // Envoyer chaque fichier vers Cloudinary
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
   
            // Créer un flux de lecture des données du fichier
            const fileStream = fs.createWriteStream(`./tmp/${file.name}`);
            // Écrire les données du fichier dans un fichier temporaire sur le serveur
            fileStream.write(file.data);
            // Fermer le flux de lecture
            fileStream.end();
            // Attendre la fin de l'écriture des données dans le fichier
            await new Promise((resolve, reject) => {
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });
            const resultCloudinary = await cloudinary.uploader.upload(`./tmp/${file.name}`); 
            console.log('File uploaded:', resultCloudinary.secure_url);
            //res.json({success: true, uploadedImage: resultCloudinary.secure_url });
            uploadedImages.push(resultCloudinary.secure_url);
          }
          
        // Envoyer la réponse avec les URLs des images sur Cloudinary
        res.status(200).json({ result: true, uploadedImages });
    } catch(error) {
        console.error('Error uploading file to Cloudinary:', error);
        res.status(500).json({ result: false, error: 'Une erreur est survenue lors de l\'envoi du fichier vers Cloudinary.' });
    }
});


//image a définir

const image ='https://res.cloudinary.com/dawkemcl5/image/upload/v1710771725/qszoxaundh0nzb7gv9xb.jpg';

router.post('/upload', async(req,res) => {
  const file = req.body['files[0]'];
  console.log("objectURL:",file)


  // if (!req.files || Object.keys(req.files).length === 0) {
  //         return res.status(400).json({ result: false, error: 'Aucun fichier n\'a été téléchargé.' });
  //       }

  try{
    const resultCloudinary = await cloudinary.uploader.upload(file);
    console.log('File uploaded:', resultCloudinary.secure_url);

  //   const resultCloudinary = await cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
  //     if (error) {
  //       console.error('Error uploading file to Cloudinary:', error);
  //       res.status(500).json({ result: false, error: 'Une erreur est survenue lors de l\'envoi du fichier vers Cloudinary.' });
  //     } else {
  //       console.log('File uploaded:', result.secure_url);
  //       uploadedImages.push(result.secure_url);
  //     }
  //   }).end(file.data);
  // }

    res.status(200).json({ result: true, message: 'Image téléchargé' });
  } catch (error){
    console.error('Error uploading file to Cloudinary:', error);
    res.status(500).json({ result: false, error: 'Une erreur est survenue lors de l\'envoi du fichier vers Cloudinary.' });
  }
  
});





//UPLOAD UNIQUE
router.post('/uploadPic',  async(req,res)=> {
  // console.log(cloudinary.config());
      try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ result: false, error: 'Aucun fichier n\'a été téléchargé.' });
        }

        const uploadedImages = [];

        // Envoyer chaque fichier vers Cloudinary
        for (const key in req.files) {
            const file = req.files[key];
            // Créer un flux de lecture des données du fichier
            const fileStream = fs.createWriteStream(`./tmp/${file.name}`);
            
            fileStream.write(file.data);   // Écrire les données du fichier dans un fichier temporaire sur le serveur
            
            fileStream.end();    // Fermer le flux de lecture

            // Attendre la fin de l'écriture des données dans le fichier
            await new Promise((resolve, reject) => {
                fileStream.on('finish', resolve);
                fileStream.on('error', reject);
            });

            const resultCloudinary = await cloudinary.uploader.upload(`./tmp/${file.name}`); 
            console.log('File uploaded:', resultCloudinary.secure_url);
       
            uploadedImages.push(resultCloudinary.secure_url);
           }
          
        // Envoyer la réponse avec les URLs des images sur Cloudinary
        res.status(200).json({ result: true, uploadedImages });
    } catch(error) {
        console.error('Error uploading file to Cloudinary:', error);
        res.status(500).json({ result: false, error: 'Une erreur est survenue lors de l\'envoi du fichier vers Cloudinary.' });
    }
});



//DELETE PICTURE FROM CLOUDY

//POSTER UN NEW TWEET
router.post("/create", (req, res) => {
  const date = new Date();
  if (checkBody(req.body, ["user", ("pictures" || ["description", "hashtags"])])) {
    const { user, description, pictures, hashtags, privat } = req.body;
    const tweet = new Tweet({
      user: user,
      description: description,
      date: date,
      nbLike: 0,
      privat: privat,
      pictures: pictures,
      hashtags: hashtags,
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
  const {commentId, tweetId} = req.params;
  const {commentText, fromUserName, toUserId, fromUserId} = req.body;
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
  Tweet.updateOne(
    { _id: tweetId, "comment._id": commentId },
    { $inc: { "comment.$.nbLike": 1 } }
  )
    .then((data) => {
      if ( data.modifiedCount === 0) {
        res.json({ result: false, nbLike: "noting change" });
      } else {
        newNotification.save().then(() => {
          console.log("notification like saved!");
        });
        res.json({ result: true, nbLike: "add one like & notification" });
      }
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
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
    fromUserName: fromUserName, 
    fromUserId: fromUserId,
    toUserId: toUserId, 
    type: "Like", 
    tweetId: tweetId, 
    tweetDescription: tweetDescription, 
    time: date, 
    isRead: false, 
  });
  Tweet.updateOne({ _id: tweetId }, { $inc: { nbLike: 1 } })
    .then((data) => {
      if (data.modifiedCount === 0) {
        res.json({ result: false, error: "Nothing add"})
      } else {
        newNotification.save().then(() => {
          res.json({ result: true, message: "nbr like ++ & notification like saved!" })
        })
        
      }}
    )
  .catch((error)=> {
    res.status(500).json({ result: false, error: error.message});
  })
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
