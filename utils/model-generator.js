const User = require('../models/user');
const Course = require('../models/courses');

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
  },

  createCourse: (
    _idSubject,
    name,
    imageURL,
    description,
    price,
    startDate,
    duration,
    accessibleDays,
    status,
    isDelete
  ) => {
    var course = new Course({
      _id: new mongoose.Types.ObjectId(),
      _idSubject: _idSubject,
      name: name,
      imageURL: imageURL,
      description: description,
      price: price,
      startDate: startDate,
      duration: duration,
      accessibleDays: accessibleDays,
      status: status,
      isDelete: isDelete
    });
    course
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return course._doc;
  }
}
