const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');

const Progress = require('../models/progress');
const Course = require('../models/course');
const User = require('../models/user');
const Lesson = require('../models/lesson');

router.get('/', async (req, res) => {
  try {
    let list = await Progress.find();
    if (list) {
      res.json(list);
    }
    else {
      res.json(null);
    }
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
})

router.get('/:idUser', async (req, res) => {
  const { idUser } = req.params;

  try {
    const progress = await Progress.findOne({ _idUser: idUser });
    if (!progress) {
        res.json(await modelGenerator.createProgress(idUser, [], false));
    }
    res.json(progress);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/create", async (req, res) => {
  let { _idUser, played } = req.body;

  try {
    const progress = await Progress.findOne({ _idUser });
    if (progress) {
        progress.played = played;
        const result = await progress.save();
        res.json(result);
    } else {
        let result = await modelGenerator.createProgress(
          _idUser,
          played,
          false
        );
        res.json(result);
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  };
});


router.post("/update", async (req, res) => {
  let { _idUser, played } = req.body;

  try {
    const progress = await Progress.findOne({ _idUser });
    if (!progress) {
      let result = await modelGenerator.createProgress(_idUser, played, false);
      res.json(result);
    } else {
      progress.played = [...played];
      const result = await progress.save();
      res.json(result);
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/add-lesson", async (req, res) => {
  let { _idUser, _idLesson, percentage } = req.body;

  try {
    let progress = await Progress.findOne({ _idUser });
    if (!progress) {
      await modelGenerator.createProgress(_idUser, [], false);
      progress = await Progress.findOne({ _idUser });
    }
    let isExist = false;
    for (let item of progress.played) {
        if (item._idLesson == _idLesson) {
            item.percentage = percentage;
            isExist = true;
            break;
        }
    }
    if (!isExist) {
        progress.played = [...progress.played, {
            _idLesson, percentage
        }];
    }

    const result = await progress.save();
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
