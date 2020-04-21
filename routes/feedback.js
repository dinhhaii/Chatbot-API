const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Feedback = require('../models/feedback');

// Get All Feedbacks
router.get('/', async (req, res) => {
  try {
    let feedbacks = await Feedback.find();

    let list = [];
    for (let feedback of feedbacks) {
      let user = await User.findById(feedback['_idUser']);
      let course = await Course.findById(feedback['_idCourse']);

      let item = {
        _id: feedback._id,
        user: user,
        course: course,
        content: feedback.content,
        rate: feedback.rate,
        isDelete: feedback.isDelete,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt
      }

      list.push(item);
    }
    res.json(list);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});

// Create Feedback
router.post('/create', async (req, res) => {
  let { _idUser, _idCourse, content, rate } = req.body;

  try {
    let feedback = await modelGenerator.createFeedback(
      _idUser,
      _idCourse,
      content,
      rate,
      false
    );
    res.json(feedback);
  } catch(e) {
    res.status(400).json("Error: " + e);
  };
});

// Update + Delete Feedback
router.post('/update', async (req, res) => {
  const feedback = await Feedback.findOne({ _id: req.body._idFeedback });

  if (feedback)
  {
    for (let key in req.body)
    {
      feedback[key] = req.body[key];
    }
    course
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});

module.exports = router
