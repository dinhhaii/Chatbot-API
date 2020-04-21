const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');
let Lesson = require('../models/lesson');
let Feedback = require('../models/feedback');
let Subject = require('../models/subject');
let Discount = require('../models/discount');

// Get All Invoices
router.get('/', async (req, res) => {
  try {
    let invoices = await Invoice.find();

    let list = [];
    for (let invoice of invoices) {
      var user = await User.findById(invoice['_idUser']);
      var course = await Course.findById(invoice['_idCourse']);
      var discount = await Discount.findById(invoice['_idDiscount']);

      item = {
        _id: invoice._id,
        user: user,
        discount: discount,
        course: course,
        totalPrice: invoice.totalPrice,
        payDay: invoice.payDay,
        status: invoice.status,
        reportMsg: invoice.reportMsg,
        isDelete: invoice.isDelete,
      }

      list.push(item);
    }

    res.json(list);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});

// Create Invoice
router.post('/create', async (req, res) => {
  let { _idUser, _idDiscount, _idCourse, totalPrice, payDay, status, reportMsg } = req.body;

  try {
    let invoice = await modelGenerator.createInvoice(
      _idUser,
      _idDiscount,
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


// Get Lecturer's Invoices
router.post('/lecturer', async (req, res) => {
  try {
    let listInvoices = await Invoice.find();
    let lecturerID = req.body._id;
    let listCourses = await Course.find({_idLecturer: lecturerID});

    let result = [];
    for (let invoice of listInvoices)
    {

      for (let course of listCourses)
      {

        if (invoice['_idCourse'].toString() === course['_id'].toString())
        {
          let learner = await User.findById(invoice['_idUser']);
          let lessons = await Lesson.find({_idCourse: course['_id']});
          let feedback = await Feedback.find({_idCourse: course['_id']});
          let lecturer = await User.findById(course['_idLecturer']);
          let subject = await Subject.findById(course['_idSubject']);
          let discount = await Discount.find({_idCourse: course['_id']});

          invoice = {
            ...invoice._doc,
            learner: learner,
            course: course,
            lecturer: lecturer,
            subject: subject,
            discount: discount,
            lessons: lessons,
            feedback: feedback
          }
          result.push(invoice);
          continue;
        }
      }
    }


    res.json(result);
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
});


module.exports = router
