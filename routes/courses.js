const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const mongoose = require('mongoose');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');
let Lesson = require('../models/lesson');
let Feedback = require('../models/feedback');
let Subject = require('../models/subject');
let Discount = require('../models/discount');
let Comment = require('../models/comment');
let Timer = require('../models/timer');
let Cart = require('../models/cart');

// Get All Courses
router.post('/', async (req, res) => {
  const { search, popular, offset, limit } = req.body;

  try {
    const pipelines = [];
    if (search && search.length !== 0) {
      pipelines.push(
        { $match: { $text: { $search: search }, isDelete: false }},
        { $sort: { score: { $meta: "textScore" }}});
    } else if (popular != 0) {
      pipelines.push({ $match: { isDelete: false }});
    } else {
      pipelines.push(
        { $match: { isDelete: false }},
        { $sort: { createdAt: -1 }});
    }

    if (offset) {
      pipelines.push({ $skip: Number(offset) });
    };
    if (limit) {
      pipelines.push({ $limit: Number(limit) });
    }

    Course.aggregate([
      ...pipelines,
      { $lookup: { from: 'feedbacks', localField: '_id', foreignField: '_idCourse', as: 'feedback' }},
      { $lookup: { from: 'lessons', localField: '_id', foreignField: '_idCourse', as: 'lessons' }},
      { $lookup: { from: 'discounts', localField: '_id', foreignField: '_idCourse', as: 'discount' }},
      { $lookup: { from: 'users', localField: '_idLecturer', foreignField: '_id', as: 'lecturer' }},
      { $lookup: { from: 'subjects', localField: '_idSubject', foreignField: '_id', as: 'subject' }},
      { $unwind: '$lecturer' },
      { $unwind: '$subject' }
    ]).exec((err, result) => {
      if (err) {
        console.log(err);
        res.json({ error: err.message });
      }
      if (popular != 0) {
        res.json(result.sort((a, b) => {
          const rateA = a.feedback.reduce((init, value) => init + value.rate, 0) / a.feedback.length;
          const rateB = b.feedback.reduce((init, value) => init + value.rate, 0) / b.feedback.length;
          return rateB - rateA;
        }));
      } else {
        res.json(result);
      }
    })
  } catch(e) {
    console.log(e);
    res.json({ error: e.message });
  }
});

router.post('/suggestion', async (req, res) => {
  let { searchHistory, _idUser } = req.body;
  searchHistory = JSON.parse(searchHistory).slice(0,3);

  const pipelines = [
    { $lookup: { from: 'feedbacks', localField: '_id', foreignField: '_idCourse', as: 'feedback' }},
    { $lookup: { from: 'lessons', localField: '_id', foreignField: '_idCourse', as: 'lessons' }},
    { $lookup: { from: 'discounts', localField: '_id', foreignField: '_idCourse', as: 'discount' }},
    { $lookup: { from: 'users', localField: '_idLecturer', foreignField: '_id', as: 'lecturer' }},
    { $lookup: { from: 'subjects', localField: '_idSubject', foreignField: '_id', as: 'subject' }},
    { $unwind: '$lecturer' },
    { $unwind: '$subject' },
    { $skip: 0 },
    { $limit: 10 }
  ]

  try {
    let courses = [];

    if (searchHistory.length !== 0) {
      for (let search of searchHistory) {
        const result = await Course.aggregate([
          { $match: { $text: { $search: search }, isDelete: false }},
          { $sort: { score: { $meta: "textScore" }}},
          ...pipelines
        ])
        if (result.length !== 0) {
          courses = [...courses, ...result];
        }
      }
    } 

    const cart = await Cart.findOne({ _idUser });
    if (cart.items.length !== 0 && courses.length === 0) {
      for(let item of cart.items) {
        const { _idCourse } = item;
        const course = await Course.findById(_idCourse);
        if (course) {
          const result = await Course.aggregate([
            { $match: { _idSubject: mongoose.Types.ObjectId(course._idSubject), isDelete: false }},
            ...pipelines
          ])
          if (result.length !== 0) {
            courses = [...result];
            break;
          }
        }
      }
    }
    const invoices = await Invoice.find({ _idUser });
    if (invoices.length !== 0 && courses.length === 0) {
      for(let invoice of invoices) {
        const { _idCourse } = invoice;
        const course = await Course.findById(_idCourse);
        if (course) {
          const result = await Course.aggregate([
            { $match: { _idSubject: mongoose.Types.ObjectId(course._idSubject), isDelete: false }},
            ...pipelines
          ])
          if (result.length !== 0) {
            courses = [...result];
            break;
          }
        }
      }
    }
    if (courses.length === 0) {
      const result = await Course.aggregate([
        { $match: { isDelete: false }},
        ...pipelines
      ]);
      courses = [...result];
    }
    res.json(courses.slice(0, 10));
  } catch(e) {
    console.log(e);
    return res.json({ error: e.message });
  }
});

// Get Pending Courses
router.get('/pending', async (req, res) => {
  try {
    let list = await Course.find({status: 'pending'});

    let result = [];
    for (let obj of list) {
      let lessons = await Lesson.find({_idCourse: obj['_id']});
      let feedback = await Feedback.find({_idCourse: obj['_id']});
      let lecturer = await User.findById(obj['_idLecturer']);
      let subject = await Subject.findById(obj['_idSubject']);
      let discount = await Discount.find({_idCourse: obj['_id']});


      obj = {
        ...obj._doc,
        subject: subject,
        lecturer: lecturer,
        discount: discount,
        lessons: lessons,
        feedback: feedback
      }
      result.push(obj);
    }

    res.json(result);
  } catch (e) {
    res.status(400).json(e);
  }
});

// Get A Certain Courses + Course's Lessons
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let course = await Course.findById(id);

    if (course) {
      let lessons = await Lesson.find({_idCourse: id});
      let feedback = await Feedback.find({_idCourse: id});
      let lecturer = await User.findById(course._idLecturer);
      let subject = await Subject.findById(course._idSubject);
      let discount = await Discount.find({_idCourse: id});

      if (lessons) {
        let result = {
          ...course._doc,
          subject: subject,
          lecturer: lecturer,
          discount: discount,
          lessons: lessons,
          feedback: feedback
        }

        res.json(result);
      } else {
        res.json(null);
      }
    } else {
      res.json(null);
    }
  } catch (e) {
    res.status(400).json('Error: ' + e);
  }
});

// Get Learner's Enrolled Courses (Invoices) by _idLearner
router.get('/:id/enrolled', async (req, res) => {
  try {
    let studentID = req.params.id;
    let listCourses = [];

    let invoices = await Invoice.find({_idUser: studentID});


    if (invoices)
    {
      for(let invoice of invoices)
      {
        var course = await Course.findById(invoice._idCourse);
        let timer = await Timer.findOne({ _idUser: studentID, _idInvoice: invoice._id });
        let lecturer = await User.findById(course._idLecturer);
        let feedback = await Feedback.findOne({ _idInvoice: invoice._id });

        course = {
          ...course._doc,
          lecturer
        };

        const resultItem = {
          invoice: { ...invoice._doc },
          timer,
          course: course,
          feedback,
        }

        listCourses.push(resultItem);
      }
    }
    res.json(listCourses);
  } catch (e) {
    res.status(400).json(e);
  }
});

// Get Lecturer's Courses by _idLecturer
router.get('/:id/teaching', async (req, res) => {
  try {
    let list = await Course.find({_idLecturer: req.params.id});

    let result = [];

    for (let obj of list) {
      let lessons = await Lesson.find({_idCourse: obj['_id']});
      let feedback = await Feedback.find({_idCourse: obj['_id']});
      let lecturer = await User.findById(obj['_idLecturer']);
      let subject = await Subject.findById(obj['_idSubject']);
      let discount = await Discount.find({_idCourse: obj['_id']});
      let invoices = await Invoice.find({_idCourse: obj['_id']})

      await Promise.all(invoices.map(async (invoice, index) => {
        const learner = await User.findById({_id: invoice._idUser});
        invoices[index] = { ...invoice._doc, learner };
      }))

      obj = {
        ...obj._doc,
        subject, invoices, lessons, feedback, lecturer, discount
      }
      result.push(obj);
    }

    res.json(result);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});

// Create Course
router.post('/create', async (req, res) => {
  let { _idLecturer, _idSubject, name, imageURL, description, price, startDate, duration, accessibleDays, tags } = req.body;
  if (!imageURL)
  {
    imageURL = `${req.protocol}://${req.get("host")}/images/no-avatar.png`;
  }

  try {
    let tagsArray = [];
    if (tags) {
      tagsArray = tags.toLowerCase().split(/,/);
    }

    let course = await modelGenerator.createCourse(
      _idLecturer,
      _idSubject,
      name,
      imageURL,
      description,
      price,
      startDate,
      duration,
      accessibleDays,
      'pending',
      tagsArray,
      false
    );
    res.json(course);
  } catch (e) {
    res.status(400).json('Error: ' + e);
  };
});

// Update a Course
router.post('/update', async (req, res) => {
  const course = await Course.findOne({ _id: req.body._idCourse });

  if (course)
  {
    for (let key in req.body)
    {
      if (key === 'tags')
      {
        let tagsArray = [];
        if (req.body[key]) {
          tagsArray = req.body[key].toLowerCase().split(/,/);
          course[key] = tagsArray;
        }
      }
      else {
        course[key] = req.body[key];
      }
    }
    course
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});

// Delete a Course
router.post('/delete', async (req, res) => {
  const { _idCourse } = req.body;

  try {
    const course = await Course.findOne({ _id: _idCourse });

    if (course) {

      course['isDelete'] = true;
      course
        .save()
        .then(async (data) => {
          if (data) {
            const lessons = await Lesson.find({_idCourse: _idCourse});

            Lesson.updateMany({"_idCourse": _idCourse}, {"$set": {"isDelete": true}}, {"multi": true}, (err, res) => {
              if (err) throw err;
            });

            Feedback.updateMany({"_idCourse": _idCourse}, {"$set": {"isDelete": true}}, {"multi": true}, (err, res) => {
              if (err) throw err;
            });

            Discount.updateMany({"_idCourse": _idCourse}, {"$set": {"isDelete": true}}, {"multi": true}, (err, res) => {
              if (err) throw err;
            });

            for (let lesson of lessons) {

              Comment.updateMany({"_idLesson": lesson._id}, {"$set": {"isDelete": true}}, {"multi": true}, (err, res) => {
                if (err) throw err;
              });
            }
            res.json({message: 'Course is deleted!'});
          }
        })
    }
    else {
      res.json({message: 'Course does not exist'});
    }
  } catch (e) {
    res.json(e);
  };
});

// Get Course by Lesson ID
router.get('/lesson/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let lesson = await Lesson.findById(id);

    if (lesson) {
      let course = await Course.findById(lesson['_idCourse']);
      let lessons = await Lesson.find({_idCourse: course._id});
      let feedback = await Feedback.find({_idCourse: course._id});
      let lecturer = await User.findById(course['_idLecturer']);
      let subject = await Subject.findById(course['_idSubject']);
      let discount = await Discount.find({_idCourse: course._id});

      if (lessons) {
        course = {
          ...course._doc,
          subject: subject,
          lecturer: lecturer,
          discount: discount,
          lessons: lessons,
          feedback: feedback
        }

        res.json(course);
      } else {
        res.json(null);
      }
    } else {
      res.json(null);
    }
  } catch(e) {
    res.json(e);
  }
});



module.exports = router;
