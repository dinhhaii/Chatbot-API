const router = require('express').Router();
const bcrypt = require("bcrypt");
const modelGenerator = require('../utils/model-generator');
const jwtExtension = require('jsonwebtoken');
const passport = require('passport');
const constant = require('../utils/constant');
const nodemailer = require("nodemailer");
const passwordGenerator = require('generate-password');
const queryString = require('query-string');
const mongoose = require('mongoose');

let User = require('../models/user');

// Google Sign in
router.get('/google', passport.authenticate('google', {scope:['profile', 'email']}));

router.get("/google/redirect", (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    (error, user) => {
      if (error) {
        console.log(error);
        res.json({ message: error.message })
      }
      if (user) {
        req.login(user, { session: false }, (err) => {
          const query = { ...user, _id: user._id.toString() };
          if (err) {
            res.json({ message: err });
          }
          const redirectURL = `${constant.URL_CLIENT}/auth/login?${queryString.stringify(query)}`;
          res.redirect(redirectURL);
        });
      } else {
        return res.json({ message: "User not found!" });
      }
    }
  )(req, res);
});

// Facebook Sign in
router.get('/facebook', passport.authenticate('facebook', {scope:['email']}));

router.get("/facebook/redirect", (req, res, next) => {
passport.authenticate(
  "facebook",
  {
    successRedirect: `${constant.URL_CLIENT}`,
    failureRedirect: `${constant.URL_CLIENT}`
  },
  (error, user) => {
    if (error) {
      console.log(error);
      res.json({ error: error.message });
    }
    if (user) {
      req.login(user, { session: false }, (err) => {
        const query = { ...user, _id: user._id.toString() };
        if (err) {
          res.json({ error: err });
        }
        const redirectURL = `${constant.URL_CLIENT}/auth/login?${queryString.stringify(query)}`;
        res.redirect(redirectURL);
      });
    } else {
      return res.json({ error: "User not found!" });
    }
  }
)(req, res);
});

// Get all users
router.get("/", async (req, res) => {
  const { email } = req.query;
  try {
    if (email) {
      let user = await User.findOne({ email });
      if (user) {
        res.json(user);
      }
      res.json({ error: "User not found "});
    } else {
      let list = await User.find();
      res.json(list);
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


// Get all Learners
router.get('/all-learners', async (req, res) => {
  try {
    let list = await User.find({role: 'learner'});
    res.json(list);
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});

// Get all Lecturers
router.get('/all-lecturers', async (req, res) => {
  try {
    let list = await User.find({role: 'lecturer'});
    res.json(list);
  } catch(e) {
    res.status(400).json({ error: e.message });
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
           const token = jwtExtension.sign(user.toJSON(), constant.JWT_SECRET);
           return res.json({user, token});
        });
    })(req, res);
});

// User Registers
router.post("/register", async (req, res) => {
  var { email, password, firstName, lastName, role, imageURL, idFacebook, status } = req.body;
  console.log(password);
  try {
    const saltRounds = 10;
    const user = await User.findOne({ email });
    const fbUser = await User.findOne({ idFacebook })

    if (user || fbUser) {
      res.json({ error: "This user has already existed" });
    } else {
      const hash = await bcrypt.hash(password, saltRounds);
      const user = await modelGenerator.createUser(
        email,
        hash,
        firstName,
        lastName,
        role,
        imageURL || `${req.protocol}://${req.get("host")}/images/no-avatar.png`,
        idFacebook || "",
        status || "unverified",
        ""
      );
      const newUser = {
        ...user,
        token: jwtExtension.sign(JSON.stringify(user), constant.JWT_SECRET),
      };
      res.send(newUser);
    }
  } catch(err) {
    console.log(err);
    res.json({ error: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({email});

    if (user) {
      const saltRounds = 10;
      let token = await bcrypt.hash(`${user.email}-reset`, saltRounds);
      // token = token.split('/').join('');

      const url = `${req.protocol}://${req.get("host")}/verify/${user._id}/${token}`;

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
        subject: '[Hacademy] - EMAIL VERIFICATION',
        html: `Please click the link to confirm: <a href="${url}">${url}</a>
          <p>The link will be expired in 24h.</p>`,
        expire: '1d'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.json({
            message: "Email was sent! Please open the verification link in your email! (Check Spam section if you can't find it)",
            token: token,
          });
        }
      });
    }
    else {
      res.json({ error: "User not founded in database." });
    }
  } catch(error) {
    res.json({ error: error.message });
  }
});

// Log Out
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Send Email
router.post('/verify', async (req, res) => {
  const { _id, email } = req.body
  try {
    const token = jwtExtension
        .sign(JSON.stringify({ _id }), constant.JWT_SECRET)
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
      subject: '[Hacademy] - ACCOUNT VERIFICATION',
      html: `Please click the link to confirm: <a href="${url}">${url}</a>
        <p>The link will be expired in 24h.</p>`,
      expire: '1d'
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
    res.json({ error: e.message });
  };
});


// Update User info
router.post("/update", async (req, res) => {
  var { _idUser, password } = req.body;
  const saltRounds = 10;
  try {
    var user = await User.findById({ _id: _idUser });

    if (user) {
      for (var key in req.body) {
        if (user[key] === req.body[key] || key === "password") continue;
        user[key] = req.body[key];
      }

      if (password) {
        const equalPassword = await bcrypt.compare(password, user.password);
        if (!equalPassword) {
          var hash = await bcrypt.hash(password, saltRounds);
          user.password = hash;
        }
      }

      user
        .save()
        .then((result) => {
          const newUser = {
            ...result._doc,
            token: jwtExtension.sign(JSON.stringify(result._doc), constant.JWT_SECRET)
          };
          res.json(newUser);
        })
        .catch((err) => {
          console.log(err);
          res.json({ error: err.message });
        });
    } else {
      res.json({ error: "User not found." });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e.message });
  }
});

// Get user by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let user = await User.findById(mongoose.Schema.Types.ObjectId(id));
    if (!user) {
      user = await User.findOne({ idFacebook: id });
    }
    res.json(user);
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;
