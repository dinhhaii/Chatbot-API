const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');
let Lesson = require('../models/lesson');
let Feedback = require('../models/feedback');
let Subject = require('../models/subject');

// Get All Courses
router.get('/', async (req, res) => {
  try {
    let list = await Course.find();
    res.json(list);
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

      if (lessons) {
        let result = {
          ...course._doc,
          subject: subject,
          lecturer: lecturer,
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

// Get Learner's Enrolled Courses (Invoice included)
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
      null,
      false
    );
    res.json(course);
  } catch (e) {
    res.status(400).json('Error: ' + e);
  };
});

// Update + Delete a Course
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

module.exports = router;
