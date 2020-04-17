var express = require('express');
const passport = require('passport');
const bcrypt = require("bcrypt");
var router = express.Router();
const jwt = require('jsonwebtoken');
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');
const nodemailer = require("nodemailer");
const passwordGenerator = require('generate-password');

const User = require('../models/user');

/* GET user profile. */
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
  const authInfo = req.authInfo;
  if(authInfo) {
    var data = modelGenerator.toUserObject(req.authInfo);
    data = { ...data, token: jwt.sign(JSON.stringify(data), constant.JWT_SECRET)};
    res.json(req.authInfo);
  }
  else {
    res.json(null);
  }
});

// Verification
router.get("/verification/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, constant.JWT_SECRET);
    if (decoded._id) {
      let user = await User.findById(decoded._id);
       if (user) {
         user.status = 'verified';
         const data = await user.save();
         res.redirect(`${constant.URL_CLIENT}/logout`);
       }
     }
     res.json(decoded);
  } catch(e) {
    next(e);
  }
  res.json(decoded);
});

// Verification Email to Generate New Password
router.get("/verify/:email/:token", async (req, res) => {

  try {
    res.redirect(`${constant.URL_CLIENT}/reset-password`);
  } catch (e) {
    res.json(e);
  }
});

// Hash Password
router.post('/hashed-password', async (req, res) => {
  let { password } = req.body;

  try {
    let saltRounds = 10;

    var hashedPassword = await bcrypt.hash(password, saltRounds);

    res.json(hashedPassword);
  } catch(e) {
    res.json(e);
  };
});

module.exports = router;
