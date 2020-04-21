const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let Lesson = require('../models/lesson');
let Comment = require('../models/comment');
let User = require('../models/user');


// Get All Lessons
router.get('/', async (req, res) => {
  try {
    let lessons = await Lesson.find();

    let list = [];
    for (let lesson of lessons) {
      let course = await Course.findById(lesson['_idCourse']);

      let item = {
        _id: lesson._id,
        course: course,
        name: lesson.name,
        description: lesson.description,
        lectureURL: lesson.lectureURL,
        files: lesson.files,
        isDelete: lesson.isDelete,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      }

      list.push(item);
    }

    res.json(list);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});


// Create a Lesson
router.post('/create', async (req, res) => {
  let { _idCourse, name, description, lectureURL, files } = req.body;

  try {
    let lesson = await modelGenerator.createLesson(
      _idCourse,
      name,
      description,
      lectureURL,
      files,
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

// Find Lesson by ID
router.get('/:id', async (req, res) => {
  let { id } = req.params;

  try {
    let lesson = await Lesson.findById(id);

    if (lesson) {
      let course = await Course.findById(lesson['_idCourse']);
      let comments = await Comment.find({ _idLesson: id });

      let commentsWithUser = [];

      for (let comment of comments) {
        let learner = await User.findById(comment._idUser);

        comment = {
          ...comment._doc,
          user: learner
        };

        commentsWithUser.push(comment);
      }

      lesson = {
        ...lesson._doc,
        course: course,
        comments: commentsWithUser
      };

      res.json(lesson);
    } else {
      res.json(null);
    }
  } catch(e) {
    res.json(e);
  }
});


module.exports = router;
