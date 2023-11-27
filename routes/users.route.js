var express = require('express');
var router = express.Router();

const User = require('../models/users.model');
const { checkBody } = require('../module/checkBoby');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


/* ENREGISTREMENT HACKATWEET = SIGN UP*/

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['firstname', 'username', 'password'])) {
    res.status(500).json({ result: false, error: 'Missing or empty fields' });
    return;
  } 

/* CHECK IF USER ALREADY REGISTERED*/
router.post('/signin', (req,res) => {
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
  
      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32),
      });
  
      newUser.save().then(newDoc => {
        res.json({ result: true, newDoc });
      });
    } else {
      // USER ALREADY EXISTS
      res.status(500).json({ result: false, error: 'User already exists' });
    }
  });
  });
})


/* LOGIN HACKATWEET = SIGN IN  */

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.status(500).json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, data });
    } else {
      res.status(500).json({ result: false, error: 'User not found or wrong password' });
    }
  });
});




module.exports = router;
