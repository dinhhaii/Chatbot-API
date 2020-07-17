const User = require('../models/user');
const Course = require('../models/course');
const Feedback = require('../models/feedback');
const Subject = require('../models/subject');
const Discount = require('../models/discount');
const Lesson = require('../models/lesson');
const Invoice = require('../models/invoice');
const Comment = require('../models/comment');
const Cart = require('../models/cart');
const Timer = require('../models/timer');
const Survey = require('../models/survey');
const Progress = require('../models/progress');

const mongoose = require("mongoose");


module.exports = {
  createUser: (
    email,
    password,
    firstName,
    lastName,
    role,
    imageURL,
    idFacebook,
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
      idFacebook: idFacebook,
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

  createCourse: (
    _idLecturer,
    _idSubject,
    name,
    imageURL,
    description,
    price,
    startDate,
    duration,
    accessibleDays,
    status,
    tags,
    isDelete
  ) => {
    var course = new Course({
      _id: new mongoose.Types.ObjectId(),
      _idLecturer: _idLecturer,
      _idSubject: _idSubject,
      name: name,
      imageURL: imageURL,
      description: description,
      price: price,
      startDate: startDate,
      duration: duration,
      accessibleDays: accessibleDays,
      status: status,
      tags: tags,
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
  },

  createSubject: (
    name,
    imageURL,
    isDelete
  ) => {
    var subject = new Subject({
      _id: new mongoose.Types.ObjectId(),
      name: name,
      imageURL: imageURL,
      isDelete: isDelete
    });
    subject
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      })
    return subject._doc;
  },

  createLesson: (
    _idCourse,
    name,
    description,
    lectureURL,
    files,
    isDelete,
  ) => {
    var lesson = new Lesson({
      _id: new mongoose.Types.ObjectId(),
      _idCourse: _idCourse,
      name: name,
      description: description,
      lectureURL: lectureURL,
      files: files,
      isDelete: isDelete
    });
    lesson
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return lesson._doc;
  },

  createFeedback: (
    _idInvoice,
    _idUser,
    _idCourse,
    content,
    rate,
    isDelete
  ) => {
    var feedback = new Feedback({
      _id: new mongoose.Types.ObjectId(),
      _idInvoice,
      _idUser: _idUser,
      _idCourse: _idCourse,
      content: content,
      rate: rate,
      isDelete: isDelete
    });
    feedback
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return feedback._doc;
  },

  createComment: (
    _idUser,
    _idLesson,
    content,
    isDelete
  ) => {
    var comment = new Comment({
      _id: new mongoose.Types.ObjectId(),
      _idUser: _idUser,
      _idLesson: _idLesson,
      content: content,
      isDelete: isDelete
    });
    comment
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return comment._doc;
  },

  createInvoice: (
    _idUser,
    _idCourse,
    _idDiscount,
    totalPrice,
    payDay,
    status,
    reportMsg,
    isDelete
  ) => {
    var invoice = new Invoice({
      _id: new mongoose.Types.ObjectId(),
      _idUser: _idUser,
      _idDiscount: _idDiscount,
      _idCourse: _idCourse,
      totalPrice: totalPrice,
      payDay: payDay,
      status: status,
      reportMsg: reportMsg,
      isDelete: isDelete
    });
    invoice
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return invoice._doc;
  },

  createDiscount: (
    _idCourse,
    code,
    percentage,
    status,
    isDelete
  ) => {
    var discount = new Discount({
      _id: new mongoose.Types.ObjectId(),
      _idCourse: _idCourse,
      code: code,
      percentage: percentage,
      status: status,
      isDelete: isDelete
    });
    discount
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return discount._doc;
  },

  createCart: (
    _idUser,
    items
  ) => {
    var cart = new Cart({
      _id: new mongoose.Types.ObjectId(),
      _idUser: _idUser,
      items: items
    });
    cart
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      })
    return cart._doc;
  },

  createTimer: (
    _idUser,
    _idInvoice,
    name,
    time,
    days,
    status
  ) => {
    var timer = new Timer({
      _id: new mongoose.Types.ObjectId(),
      _idUser: _idUser,
      _idInvoice: _idInvoice,
      name: name,
      time: time,
      days: days,
      status: status
    });
    timer
      .save()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.log(error);
      });
    return timer._doc;
  },

  createSurvey: (
    _idUser,
    rate,
    content,
    isDelete
  ) => {
    var survey = new Survey({
      _id: new mongoose.Types.ObjectId(),
      _idUser: _idUser,
      rate: rate,
      content: content,
      isDelete: isDelete
    });
    survey
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return survey._doc;
  },

  createProgress: (_idUser, played, isDelete) => {
    var progress = new Progress({
      _id: new mongoose.Types.ObjectId(),
      _idUser,
      played,
      isDelete,
    });
    progress
      .save()
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
    return progress._doc;
  },

// ----------------------------------------------------------------
// ------------------------------------------------------------------
// ------------------------------------------------------------------------------
  toTimerObject: timer => {
    return {
      _id: timer._id,
      _idUser: timer._idUser,
      _idInvoice: timer._idInvoice,
      name: timer.name,
      time: timer.time,
      days: timer.days,
      status: timer.status
    }
  },

  toCourseObject: course => {
    return {
      _id: course._id,
      _idLecturer: course._idLecturer,
      _idSubject: course._idSubject,
      name: course.name,
      imageURL: course.imageURL,
      description: course.description,
      price: course.price,
      startDate: course.startDate,
      duration: course.duration,
      accessibleDays: course.accessibleDays,
      status: course.status,
      tags: course.tags,
      isDelete: course.isDelete
    }
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
      idFacebook: user.idFacebook,
      status: user.status,
      bio: user.bio
    };
  },

  toLessonObject: lesson => {
    return {
      _id: lesson._id,
      _idCourse: lesson._idCourse,
      name: lesson.name,
      description: lesson.description,
      lectureURL: lesson.lectureURL,
      files: lesson.files,
      isDelete: lesson.isDelete
    }
  },

  toFeedbackObject: feedback => {
    return {
      _id: feedback._id,
      _idUser: feedback._idUser,
      _idCourse: feedback._idCourse,
      content: feedback.content,
      rate: feedback.rate,
      isDelete: feedback.isDelete
    }
  },

  toCommentObject: comment => {
    return {
      _id: comment._id,
      _idUser: comment._idUser,
      _idLesson: comment._idLesson,
      content: comment.content,
      isDelete: comment.isDelete
    }
  },

  toSubjectObject: subject => {
    return {
      _id: subject._id,
      name: subject.name,
      imageURL: subject.imageURL,
      isDelete: subject.isDelete
    }
  },

  toInvoiceObject: invoice => {
    return {
      _id: invoice._id,
      _idUser: invoice._idUser,
      _idDiscount: invoice._idDiscount,
      _idCourse: invoice._idCourse,
      totalPrice: invoice.totalPrice,
      payDay: invoice.payDay,
      status: invoice.status,
      reportMsg: invoice.reportMsg,
      isDelete: invoice.isDelete
    }
  },

  toDiscountObject: discount => {
    return {
      _id: discount._id,
      _idCourse: discount._idCourse,
      code: discount.code,
      percentage: discount.percentage,
      status: discount.status,
      isDelete: discount.isDelete
    }
  },

  toCartObject: cart => {
    return {
      _id: cart._id,
      _idUser: cart._idUser,
      items: cart.items
    }
  },
}
