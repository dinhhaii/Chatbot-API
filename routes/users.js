const router = require('express').Router();
const bcrypt = require("bcrypt");
const modelGenerator = require('../utils/model-generator');
const jwtExtension = require('jsonwebtoken');
const passport = require('passport');
const constant = require('../utils/constant');

let User = require('../models/user');

/* POST login. */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : "Login failed",
                user   : user
            });
        }
       req.login(user, {session: false}, (err) => {
           if (err) {
               res.send(err);
           }
           // generate a signed json web token with the contents of user object and return it in the response
           //
           // const token = jwt.sign(user, constant.JWT_SECRET);
           // return res.json({user, token});

           var data = modelGenerator.toUserObject(user);
           data = {
             ...data,
             token: jwtExtension.sign(user.toJSON(), constant.JWT_SECRET)
           };
           return res.json(data);
        });
    })(req, res);
});

// User Registers
router.post("/register", (req, res) => {
  var { email, password, firstName, lastName } = req.body;
  var imgURL = `sample`;
  const saltRounds = 10;
  User.findOne({ email: email, type: "local" }).then(user => {

    if (user) {
      res.json({ message: "This user has already existed" });
    } else {
      bcrypt
        .hash(password, saltRounds)
        .then(hash => {
          const user = modelGenerator.createUser(
            email,
            hash,
            firstName,
            lastName,
            'learner',
            imgURL,
            'local',
            'active',
            null
          );
          const objectUser = modelGenerator.toUserObject(user);
          res.send(objectUser);
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});


// Get all users
router.get("/", async (req, res) => {
  try {
    let list = await User.find();
    res.json(list);
  } catch (e) {
    res.status(400).json('Error: ' + e);
  }
});

module.exports = router;
