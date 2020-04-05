const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');

let Subject = require('../models/subject');


// Get all Subjects
router.get("/", async (req, res) => {
  try {
    let list = await Subject.find();
    res.json(list);
  } catch (e) {
    res.status(400).json('Error: ' + e);
  }
});


// Create a Subject
router.post("/create", async (req, res) => {
  let { name, imageURL } = req.body;
  if (!imageURL)
  {
    imageURL = `${req.protocol}://${req.get("host")}/images/no-avatar.png`;
  }
  try {
    let subject = await modelGenerator.createSubject(
      name,
      imageURL,
      false
    );

    res.json(subject);

  } catch(e) {
    res.status(400).json("Error: " + e);
  };
});

// Update + Delete a Lesson
router.post('/update', async (req, res) => {
  const subject = await Subject.findOne({ _id: req.body._idSubject });

  if (subject)
  {
    for (let key in req.body)
    {
      subject[key] = req.body[key];
    }
    subject
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});


module.exports = router;
