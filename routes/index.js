var express = require('express');
const passport = require('passport');
const bcrypt = require("bcrypt");
var router = express.Router();
const jwt = require('jsonwebtoken');
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');
const nodemailer = require("nodemailer");
const passwordGenerator = require('generate-password');
const stripe = require("stripe")(constant.SECRET_KEY_STRIPE);
const uuid = require("uuid/v4");

const User = require('../models/user');

router.get("/", (req, res) => {
  res.send(`<div>Client: <a href="${constant.URL_CLIENT}">${constant.URL_CLIENT}</a></div>
            <div>Admin: <a href="${constant.URL_ADMIN}">${constant.URL_ADMIN}</a></div>`);
});

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
router.get("/verify/:id/:token", async (req, res) => {
  const { token, id } = req.params;
  try {
    res.redirect(`${constant.URL_CLIENT}/auth/reset-password/${id}/${token}`);
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

const charge = (tokenID, courses) => {
  const total = courses.reduce((initVal, val) => initVal + val.price, 0);
  const description = courses.reduce((initVal, value) => {
    if (value.discount){
      return initVal + `+${value.course.name} - $${value.price} - (${value.discount.code} ${value.discount.percentage}%)${'\n'}`;
    }
    return initVal + `+${value.course.name} - $${value.price}${'\n'}`
   }, '');
  return stripe.charges.create({
    amount: total * 100,
    currency: 'usd',
    description: description,
    source: tokenID
  })
}

router.post("/payment", async (req, res) => {
  const { courses, token } = req.body;
  try {
    const data = await charge(token.id, courses);
    courses.forEach(async item => {
      await modelGenerator.createInvoice(
        item.idLearner,
        item.course._id,
        item.discount ? item.discount._id : null,
        item.price,
        new Date(),
        'success',
        '',
        false
      );
    })

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json(error)
  }
})

// Send Email
router.post('/submit-contact', async (req, res) => {
  const { inputEmail, inputName, inputSubject, inputMsg } = req.body
  try {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: constant.USERNAME_EMAIL,
        pass: constant.PASSWORD_EMAIL
      }
    });

    var mailOptions = {
      from: constant.USERNAME_EMAIL,
      to: constant.USERNAME_EMAIL,
      subject: `Contact Submit (${inputSubject})`,
      text: `From ${inputName} (${inputEmail}) - Message: ${inputMsg}`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        res.json({message: 'Your message was sent! Thank you for reaching out to us!'});
      }
    });
  } catch(e) {
    res.json(error);
  };
});

module.exports = router;
