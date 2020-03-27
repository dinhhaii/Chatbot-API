const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let Discount = require('../models/discount');

// Get All Discount
router.get('/', async (req, res) => {
  try {
    let list = await Discount.find();
    res.json(list);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});

// Create Discount
router.post('/create', async (req, res) => {
  let { _idCourse, code, percentage, status } = req.body;

  try {
    let invoice = await modelGenerator.createDiscount(
      _idCourse,
      code,
      percentage,
      status,
      false
    );
    res.json(discount);
  } catch(e) {
    res.status(400).json("Error: " + e);
  };
});

// Update + Delete Discount
router.post('/update', async (req, res) => {
  const discount = await Discount.findOne({ _id: req.body._idDiscount });

  if (discount)
  {
    for (let key in req.body)
    {
      discount[key] = req.body[key];
    }
    discount
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});

module.exports = router
