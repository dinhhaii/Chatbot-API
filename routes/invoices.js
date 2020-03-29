const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');

// Get All Invoices
router.get('/', async (req, res) => {
  try {
    let list = await Invoice.find();
    res.json(list);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});

// Create Invoice
router.post('/create', async (req, res) => {
  let { _idUser, _idCourse, totalPrice, payDay, status, reportMsg } = req.body;

  try {
    let invoice = await modelGenerator.createInvoice(
      _idUser,
      _idCourse,
      totalPrice,
      payDay,
      status,
      reportMsg,
      false
    );
    res.json(invoice);
  } catch(e) {
    res.status(400).json("Error: " + e);
  };
});

// Update + Delete Invoice
router.post('/update', async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.body._idInvoice });

  if (invoice)
  {
    for (let key in req.body)
    {
      invoice[key] = req.body[key];
    }
    invoice
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});

module.exports = router
