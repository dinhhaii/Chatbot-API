const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let Lesson = require('../models/lesson');


// Get All Lessons
router.get('/', async (req, res) => {
  try {
    let list = await Lesson.find();
    res.json(list);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});


// Create a Lesson
router.post('/create', async (req, res) => {
  let { _idCourse, name, description, lectureURL, fileURLs } = req.body;

  try {
    let lesson = await modelGenerator.createLesson(
      _idCourse,
      name,
      description,
      lectureURL,
      fileURLs,
      false
    );

    res.json(lesson);

  } catch(e) {
    res.status(400).json("Error: " + e);
  };
});

// Update + Delete a Lesson
router.post('/update', async (req, res) => {
  const lesson = await Lesson.findOne({ _id: req.body._idLesson });

  if (lesson)
  {
    for (let key in req.body)
    {
      lesson[key] = req.body[key];
    }
    lesson
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});


module.exports = router;
