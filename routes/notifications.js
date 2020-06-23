const router = require('express').Router();
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const moment = require('moment');
const mongoose = require('mongoose');
const modelGenerator = require('../utils/model-generator');
const constant = require('../utils/constant');

let Course = require('../models/course');
let User = require('../models/user');
let Invoice = require('../models/invoice');
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
      var year = moment(course.startDate).year()

      var scheduledDate = new Date(year, month, date, 0, 0, 0);
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
                res.json({ error: error.message });
              } else {
                console.log('Email sent: ' + info.response);
                res.json({message: "Email was sent! (Check Spam section if you can't find it)"});
              }
          });
      });
    }
  } catch(e) {
    console.log(e);
    res.json({ error: e.message });
  };
});

// Create timer
router.post('/create-timer', async (req, res) => {
  try {
    const { _idUser, _idInvoice, time, days } = req.body;

    let timer = await Timer.findOne({ _idUser, _idInvoice });
    const scheduleName = `Timer for ${_idUser}`

    if (timer) {
      timer.time = time;
      timer.days = days;
      timer.status = 'available';
      await timer.save();

    } else {
      timer = await modelGenerator.createTimer(
        _idUser,
        _idInvoice,
        scheduleName,
        time,
        days,
        'available'
      );
    }

    const invoice = await Invoice.findById(_idInvoice);
    const user = await User.findById(_idUser);
    const course = await Course.findById(invoice._idCourse);

    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = days;
    rule.hour = time.split(":")[0];
    rule.minute = time.split(":")[1];

    var j = schedule.scheduleJob(scheduleName, rule, function () {
      // Send Messenger

      // Send email
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: constant.USERNAME_EMAIL,
          pass: constant.PASSWORD_EMAIL,
        },
      });

      var mailOptions = {
        from: constant.USERNAME_EMAIL,
        to: user.email,
        subject: `Hacademy Course - ${course.name}`,
        text: `Reminder for the course (${course.name}) you're taking!\nCheck your course here: ${constant.URL_CLIENT}/course-detail/${course._id}`,
      };
      // Send e-mail
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.json({ error: error.message });
        } else {
          console.log("Email sent: " + info.response);
          res.json({
            message:
              "Email was sent! (Check Spam section if you can't find it)",
          });
        }
      });
    });

    res.json(timer);
  } catch(e) {
    console.log(e);
    res.json({ error: e.message });
  };
});


// Update timer
router.post("/update-timer", async (req, res) => {
  try {
    const { _idUser, _idInvoice } = req.body;
    const timer = await Timer.findOne({ _idUser, _idInvoice });

    if (timer) {
      for (let key in req.body) {
        if (key === "status" && req.body[key] === "canceled") {
          console.log(`Cancel schedule ${timer.name}: ` + eval(`schedule.scheduledJobs['${timer.name}'].cancel()`));
        }
        timer[key] = req.body[key];
      }
      const result = await timer.save()
      res.json(result);
    } else {
      res.json({ error: "Timer not found." });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e.message });
  }
});


module.exports = router;
