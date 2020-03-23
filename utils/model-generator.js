const User = require('../models/user');

const mongoose = require("mongoose");


module.exports = {
  createUser: (
    email,
    password,
    firstName,
    lastName,
    role,
    imageURL,
    type,
    status,
    bio
  ) => {
    var user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      role: role,
      imageURL: imageURL,
      type: type,
      status: status,
      bio: bio
    });
    user
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return user._doc;
  },
  toUserObject: user => {
    return {
      _id: user._id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      imageURL: user.imageURL,
      type: user.type,
      status: user.status,
      bio: user.bio
    };
  }
}
