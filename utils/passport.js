const constant = require("../utils/constant");
const modelGenerator = require("../utils/model-generator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwtExtension = require("jsonwebtoken");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const passportLocal = require("passport-local");
const passportGoogle = require("passport-google-oauth20");
const passportFacebook = require("passport-facebook");

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = passportGoogle.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

const User = require("../models/user");

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const jwt = new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: constant.JWT_SECRET,
  },
  function (jwtPayload, cb) {
    return User.findById(jwtPayload._id)
      .then((user) => {
        return cb(null, true, user);
      })
      .catch((err) => {
        return cb(err);
      });
  }
);

// LOCAL
const local = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  function (email, password, cb) {
    //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
    return User.findOne({ email: email, type: "local" })
      .then((user) => {
        if (!user) {
          return cb(null, false, { message: "Incorrect email or password." });
        }
        bcrypt.compare(password, user.password).then((result) => {
          if (result) {
            return cb(null, user, { message: "Logged In Successfully" });
          } else {
            return cb(null, false, { message: "Incorrect password!" });
          }
        });
      })
      .catch((err) => cb(err));
  }
);

//  GOOGLE
const google = new GoogleStrategy(
  {
    clientID: constant.GOOGLE_CLIENT_ID,
    clientSecret: constant.GOOGLE_CLIENT_SECRET,
    callbackURL: "/user/google/redirect",
  },
  async function (accessToken, refreshToken, profile, done) {
    let { emails, name, photos } = profile;
    try {
      const user = await User.findOne({
        email: emails[0].value,
        type: "google",
      });
      if (user) {
        let newUser = await modelGenerator.toUserObject(user);
        newUser = {
          ...newUser,
          token: jwtExtension.sign(
            JSON.stringify(newUser),
            constant.JWT_SECRET
          ),
        };
        return done(null, newUser);
      } else {
        let newUser = await modelGenerator.createUser(
          emails[0].value,
          "",
          name.givenName,
          name.familyName,
          null,
          photos[0].value,
          "google",
          "verified",
          ""
        );
        newUser = {
          ...newUser,
          token: jwtExtension.sign(
            JSON.stringify(newUser),
            constant.JWT_SECRET
          ),
        };
        return done(null, newUser);
      }
    } catch (error) {
      done(error);
    }
  }
);

// FACEBOOK
const facebook = new FacebookStrategy(
  {
    clientID: constant.FACEBOOK_CLIENT_ID,
    clientSecret: constant.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/user/facebook/redirect",
    profileFields: ["id", "first_name", "last_name", "photos", "email"],
  },
  async function (accessToken, refreshToken, profile, user, done) {
    let { id, name, photos } = user;
    try {
      const user = await User.findOne({ email: id, type: "facebook" });
      if (user) {
        let newUser = {
          ...user._doc,
          token: jwtExtension.sign(JSON.stringify(user._doc), constant.JWT_SECRET),
        };
        return done(null, newUser);

      } else {
        let newUser = await modelGenerator.createUser(
          id,
          "",
          name.familyName,
          name.givenName,
          null,
          photos[0].value,
          "facebook",
          "verified",
          ""
        );
        newUser = {
          ...newUser,
          token: jwtExtension.sign(JSON.stringify(newUser), constant.JWT_SECRET),
        };
        return done(null, newUser);
      }
    } catch(e) {
      console.log(e);
      done(e);
    }
  }
);

passport.use(jwt);
passport.use(local);
passport.use(google);
passport.use(facebook);
