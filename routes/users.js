const router = require('express').Router();
const bcrypt = require("bcrypt");
const modelGenerator = require('../utils/model-generator');
const jwtExtension = require('jsonwebtoken');
const passport = require('passport');
const constant = require('../utils/constant');
const nodemailer = require("nodemailer");

let User = require('../models/user');

// Get all users
router.get("/", async (req, res) => {
  try {
    let list = await User.find();
    res.json(list);
  } catch (e) {
    res.status(400).json('Error: ' + e);
  }
});

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

           const token = jwtExtension.sign(user.toJSON(), constant.JWT_SECRET);
           return res.json({user, token});
        });
    })(req, res);
});

// Google Sign in
router.get('/auth/google', passport.authenticate('google', {scope:['profile', 'email']}));

router.get("/google/redirect", (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    (error, user) => {
      if (user) {

        req.login(user, { session: false }, err => {
          const query = {...user, _id: user._id.toString()};
          if (err) {
            res.send(err);
          }
          const redirectURL = url.format({
            pathname: `${constant.URL_CLIENT}/login`,
            query: query
          });
          res.redirect(redirectURL);
        });
      } else {
        return res.json({ message: "Error occured", error });
      }
    }
  )(req, res);
});


// User Registers
router.post("/register", (req, res) => {
  var { email, password, firstName, lastName, role } = req.body;
  var imgURL = `${req.protocol}://${req.get("host")}/images/no-avatar.png`;
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
            role,
            imgURL,
            'local',
            'unverified',
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

// Send Email
router.post('/verify', async (req, res) => {
  const { _idUser, email } = req.body

  try {
    const token = jwtExtension
        .sign(JSON.stringify({ _id: _idUser }), constant.EMAIL_SECRET)
    const url = `${req.protocol}://${req.get("host")}/verification/${token}`;

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: constant.USERNAME_EMAIL,
        pass: constant.PASSWORD_EMAIL
      }
    });

    var mailOptions = {
      from: constant.USERNAME_EMAIL,
      to: email,
      subject: '[CAFOCC] - ACCOUNT VERIFICATION',
      html: `Please click the link to confirm: <a href="${url}">${url}</a>
        <p>The link will be expired in 24h.</p>`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        res.json({message: "Email was sent! Please open the verification link in your email! (Check Spam section if you can't find it)"});
      }
    });
  } catch(e) {
    res.json(error);
  };
});


// Update User info
router.post('/update', async (req, res) => {
  var { _idUser, password, type } = req.body;
  const saltRounds = 10;
  var user = await User.findById({ _id: _idUser });

  if (user) {
    for (var key in req.body) {
      if (user[key] === req.body[key]||(key==="password")) continue;
      user[key] = req.body[key];
    }
    if (password === "" || type === "facebook" || type === "google") {
      user
        .save()
        .then(result => res.json(result))
        .catch(err => console.log(err));
    } else if (user.password !== req.body.password && req.body.password) {
      var hash = await bcrypt.hash(password, saltRounds);
      user.password = hash;
    }
    user
        .save()
        .then(result => {
          res.json(result);
        })
        .catch(err => console.log(err));
  }
});


module.exports = router;
