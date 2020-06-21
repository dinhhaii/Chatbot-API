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
let Timer = require('../models/timer');

// Send Noti
router.post('/start-date', async (req, res) => {
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
      var scheduleName = `Start date notification for ${user._id}`

      var j = schedule.scheduleJob(scheduleName, scheduledDate, function(){
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
    res.json(e);
  };
});

// Create timer
router.post('/create-timer', async (req, res) => {
  try {
    const { _idUser, _idCourse, time, days } = req.body;

    const scheduleName = `Timer for ${_idUser}`

    let timer = await modelGenerator.createTimer(
      _idUser,
      _idCourse,
      scheduleName,
      time,
      days,
      'available'
    );

    const user = await User.findById(_idUser);
    const course = await Course.findById(_idCourse);

    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = days;
    rule.hour = time.split(':')[0];
    rule.minute = time.split(':')[1];

    var j = schedule.scheduleJob(scheduleName, rule, function(){
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: constant.USERNAME_EMAIL,
          pass: constant.PASSWORD_EMAIL
        }
      });

      var mailOptions = {
        from: constant.USERNAME_EMAIL,
        to: user.email,
        subject: `Hacademy Course - ${course.name}`,
        text: `Reminder for the course (${course.name}) you're taking!\nCheck your course here: ${constant.URL_CLIENT}/course-detail/${course._id}`
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

    res.json(timer);
  } catch(e) {
    res.json(e);
  };
});


// Update timer
router.post('/update-timer', async (req, res) => {
  try {
    const { _idUser, _idCourse } = req.body;

    const timer = await Timer.findOne({_idUser: _idUser, _idCourse: _idCourse});

    if (timer)
    {
      for (let key in req.body)
      {
        if (key === 'status' && req.body[key] === 'canceled')
        {
          console.log(`Cancel schedule ${timer.name}: `+ eval(`schedule.scheduledJobs['${timer.name}'].cancel()`));
        }
        timer[key] = req.body[key];
      }
      timer
        .save()
        .then(result => res.json(result))
        .catch (err => console.log(err));
    } else {
      res.json(null);
    }
  } catch(e) {
    res.json(e);
  };
});


module.exports = router;
