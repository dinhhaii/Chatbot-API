const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');
let Lesson = require('../models/lesson');
let Feedback = require('../models/feedback');
let Subject = require('../models/subject');
let Discount = require('../models/discount');
let Comment = require('../models/comment');

// Get All Courses
router.get('/', async (req, res) => {
  try {
    let list = await Course.find();

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
  } catch(e) {
    res.status(400).json('Error: ' + e);
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

// Get Learner's Enrolled Courses (Invoice included) by _idLearner
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
        let lecturer = await User.findById(course._idLecturer);

        course = {
          ...course._doc,
          lecturer
        };

        const resultItem = {
          invoice: { ...invoice._doc },
          course: course
        }

        listCourses.push(resultItem);
      }
    }
    res.json(listCourses);
  } catch (e) {
    res.status(400).json('Error: ' + e);
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
  let { _idLecturer, _idSubject, name, imageURL, description, price, startDate, duration, accessibleDays } = req.body;
  if (!imageURL)
  {
    imageURL = `${req.protocol}://${req.get("host")}/images/no-avatar.png`;
  }
  try {
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
      course[key] = req.body[key];
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
