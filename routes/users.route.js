var express = require('express');
var router = express.Router();

const User = require('../models/users.model');
const { checkBody } = require('../module/checkBoby');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


/* ENREGISTREMENT HACKATWEET = SIGN UP*/

// router.post('/signup', (req, res) => {
//   if (!checkBody(req.body, ['username', 'password'])) {
//     res.status(500).json({ result: false, error: 'Missing or empty fields' });
//     return;
//   }
// /* CHECK IF USER ALREADY REGISTERED*/
//   User.findOne({ username: req.body.username }).then(data => {
//     if (data === null) {
//       const hash = bcrypt.hashSync(req.body.password, 10);
  
//       const newUser = new User({
//         firstname: req.body.firstname,
//         username: req.body.username,
//         password: hash,
//         token: uid2(32),
//       });
  
//       newUser.save().then(newDoc => {
//         res.json({ result: true, newDoc });
//       });
//     } else {
//       // USER ALREADY EXISTS
//       res.status(500).json({ result: false, error: 'User already exists' });
//     }
//   });
//   });



  router.post('/signup', async(req, res) => {
    if (!checkBody(req.body, ['username', 'password'])) {
      res.status(500).json({ result: false, message: 'Merci de remplir tous les champs' });
      return;
    }
  /* CHECK IF USER ALREADY REGISTERED*/
    User.findOne({ username: req.body.username }).then(async data => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
        const { firstname, username, /*dateCreated*/ } = req.body;
    
        const newUser = new User({
          firstname: firstname,
          username: username,
          password: hash,
          token: uid2(32),
          dateCreated: new Date(),
          // dateCreated: dateCreated,
        });

        try {
          const userCreate = await newUser.save();
          console.log(userCreate);
          newUser.save().then(newDoc => {
            res.json({ result: true, newDoc });
          });
        } catch (error) {
          if (error instanceof MongoServerError && error.code === 11000) {
            res.status(400).json({ result: false, message: "Le nom d'utilisateur existe déjà" });
          } else {
            console.error(error);
            res.status(500).json({ result: false, message: "Erreur lors de la création de l'utilisateur" });
          }
        }
      } else {
        // USER ALREADY EXISTS
        res.status(500).json({ result: false, message: "Le nom d'utilisateur existe déjà" });
      }
    });
    });



/* LOGIN HACKATWEET = SIGN IN  */

router.post('/signin', async (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.status(500).json({ result: false, message: 'Merci de remplir tous les champs' });
    return;
  }
  try {
    const data = await User.findOne({ username: req.body.username }).select('+password')
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, data });
      } else {
        res.status(500).json({ result: false, message: 'Utilisateur non trouvé ou mauvais mot de passe' });
      }
    
  } catch (error) {
    res.status(500).json({result: false, message: "Erreur serveur"})
  }
});

//Trouver un utilisateur
router.get('/findOneId/:userToken', async(req, res) => {
  const {userToken} = req.params;
  try {
    const data = await User.findOne({token : userToken});
    if (data) {
      res.status(200).json({result: true, _id: data._id})
    }
    console.log(data._id);
  } catch (error) {
    res.status(500).json({result: false, message: "Erreur serveur"})
  }
});




module.exports = router;
