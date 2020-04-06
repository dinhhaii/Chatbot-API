var express = require('express');
const passport = require('passport');
var router = express.Router();
const jwt = require('jsonwebtoken');
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

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

router.get("/verification/:token", async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, constant.JWT_SECRET);

  if (decoded._id) {
    let user = await User.findById(decoded._id);
    if (user) {
      user.status = 'verified';
      const data = await user.save();
      res.json(data);
    }
  }
  res.json(decoded);
});

module.exports = router;
