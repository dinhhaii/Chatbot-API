const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Feedback = require('../models/feedback');
const feedback = require('../models/feedback');

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

// Update all Feedback
router.get('/update-all', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    const listTemp = {
      compliment: [
        "I love this course, couldn't be better!",
        "I feel like a new person after finished this course!",
        "Highly recommended, amazing lecturer and course's structure!",
        "Extremely useful, I've got everything I need to learn from this course!",
        "This course should've been rated 100 stars",
        "Super effective course, lecturer also answered questions on the comment section on each lesson!",
        "Just like I'm studying at some actual university!",
        "Clear steps, feasible for all learner to follow!",
        "Guarantee on your outcome, easy to memorize and practice!",
        "Most practical course, couldn't be more better!",
        "Extremely easy to learn and understand!",
        "Totally useful and ways of teaching in each lesson is extremely understandable!",
        "I've learned a lot from this course. Good course structure!",
        "I've learned a lot from this course. Good lecturer as well!",
        "I'd study over and over again this course!",
        "Say no more about this course! Highly recommend"
      ],
      complaint: [
        "Need to improve more, the way of teaching, course's structure...",
        "Need more relevant attachments on each lesson!",
        "Wasted money on this course, maybe I'm gonna report this course as well!",
        "The lecturer's accent is kinda hard to listen, no offense!",
        "In my opinion, this course is still acceptable!",
        "So bad on every aspects!",
        "I really regret buying this course!",
        "I feel a little bit disappointed about this course!",
        "I don't like the way this lecture teach the course!",
        "I feel something is missing about this course. Please check it!",
        "I don't really like this course",
        "The teacher should be more enthusiastic!",
        "Can I have my money back, really don't like the way of teaching of this course!",
        "Steps in this course must be more detail and lecturer please put some effort in your course!",
        "I think the lecturer didn't put enough effort making this course!",
        "Not recommended, I've tried and kinda disappointed about the way the lecturer transfer his knowledge!"
      ],
    }
    if (feedbacks.length !== 0)
    {
      feedbacks.forEach((feedback, index) => {
          var random = Math.floor(Math.random() * 16);
          if (feedback.rate <= 3) {
            Feedback.updateOne(
              { _id: feedback._id },
              { $set: { content: listTemp.complaint[random] } },
              (err) => { if (err) console.log(err) }
            );
          }
          else {
            Feedback.updateOne(
              { _id: feedback._id },
              { $set: { content: listTemp.compliment[random] } },
              (err) => {
                if (err) console.log(err);
              }
            );
          }
      })
      const result = await Feedback.find();
      res.json(result);
    } else {
      res.json(null);
    }
  } catch (e) {
    res.json(e);
  }
});

// Create Feedback
router.post('/create', async (req, res) => {
  let { _idInvoice, _idUser, _idCourse, content, rate } = req.body;

  try {
    let feedback = await modelGenerator.createFeedback(
      _idInvoice,
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
    feedback
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});

module.exports = router
