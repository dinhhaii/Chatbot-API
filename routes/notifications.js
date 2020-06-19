const router = require('express').Router();
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const moment = require('moment');

const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');
let Lesson = require('../models/lesson');
let Feedback = require('../models/feedback');
let Subject = require('../models/subject');
let Discount = require('../models/discount');
let Comment = require('../models/comment');

// Send Noti
router.post('/send', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({email: email});
    const invoices = await Invoice.find({_idUser: user['_id']});

    const listCourses = [];

    for (let invoice of invoices) {
      var course = await Course.findById(invoice['_idCourse']);

      listCourses.push(course);
    }

    for (let course of listCourses) {
      var date = moment(course.startDate).date();
      var month = moment(course.startDate).month();

      var scheduledDate = new Date(2020, month, date, 0, 0, 0);

      var j = schedule.scheduleJob(scheduledDate, function(){
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: constant.USERNAME_EMAIL,
            pass: constant.PASSWORD_EMAIL
          }
        });

        var mailOptions = {
          from: constant.USERNAME_EMAIL,
          to: email,
          subject: `Hacademy Course - ${course.name}`,
          text: `You receive this email because your course (${course.name}) is officially started!\nCheck your course here: ${constant.URL_CLIENT}/course-detail/${course._id}`
        };
        // Send e-mail
        transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
                res.json({message: "Email was sent! (Check Spam section if you can't find it)"});
              }
          });
      });
    }
  } catch(e) {
    res.json(error);
  };
});



module.exports = router;
