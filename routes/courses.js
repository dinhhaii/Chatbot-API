const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');

// Get All Courses
router.get('/all-courses', async (req, res) => {
  try {
    let list = await Course.find();
    res.json(list);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});

// Get A Certain Courses
router.get('/course/:id', async (req, res) => {
  try {
    const id = req.params;
    let course = await Course.findById(id);
    return course;
  } catch (e) {
    res.status(400).json('Error: ' + e);
  }
});

// Get Learner's Enrolled Courses
router.get('/my-courses', async (req, res) => {
  try {
    let studentID = req.body._idStudent;
    let listCourses = [];

    let invoices = await Invoice.findById(studentID);
    if (invoices)
    {
      for(let invoice of invoices)
      {
        let course = await Course.findById(invoice._idCourse);

        const resultItem = {
          invoice: { ...invoice._doc },
          course: { ...course._doc }
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
  let { _idSubject, name, imageURL, description, price, startDate, duration, accessibleDays } = res.body;

  try {
    let course = modelGenerator.createCourse(
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

// Update Course
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
