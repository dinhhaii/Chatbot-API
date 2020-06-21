const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');

let User = require('../models/user');
let Survey = require('../models/survey');

// Get All Survey
router.get('/', async (req, res) => {
  try {
    let surveyList = await Survey.find();

    let list = [];
    for (survey of surveyList) {
      let user = await User.findById(survey['_idUser']);

      let item = {
        _id: survey._id,
        user: user,
        rate: survey.rate,
        content: survey.content,
        isDelete: survey.isDelete,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt
      }

      list.push(item);
    }
    res.json(list);
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});

// Create Survey
router.post('/create', async (req, res) => {
  let { _idUser, rate, content } = req.body;

  try {
    let survey = await modelGenerator.createSurvey(
        _idUser,
        rate,
        content,
        false
    );
    res.json(survey);
  } catch(e) {
    res.status(400).json({ error: e.message });
  };
});

// Update Survey
router.post("/update", async (req, res) => {
  try {
    const survey = await Survey.findOne({ _id: req.body._idSurvey });

    if (survey) {
      for (let key in req.body) {
        survey[key] = req.body[key];
      }
      survey
        .save()
        .then((result) => res.json(result))
        .catch((err) => console.log(err));
    } else {
      res.json(null);
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e.message });
  }
});

module.exports = router
