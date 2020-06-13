const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');

let Subject = require('../models/subject');


// Get all Subjects
router.get("/", async (req, res) => {
  const { search, offset, limit } = req.query;
  try {
    const pipelines = [];
    if (search && search.length !== 0) {
      pipelines.push(
        { $match: { $text: { $search: search }, isDelete: false }},
        { $sort: { score: { $meta: "textScore" }}});
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

    Subject.aggregate([ 
      ...pipelines,
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_idSubject', as: 'courses' }}
     ]).exec((err, result) => {
      if (err) {
        console.log(err);
        res.json({ error: err.message });
      }
      res.json(result);
    })
  } catch(e) {
    console.log(e);
    res.json({ error: e.message });
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

// Update Lesson
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
