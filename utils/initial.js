const router = require('express').Router();
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const moment = require('moment');

const constant = require('../utils/constant');

let Course = require('../models/course');
let Timer = require('../models/timer');


const initTimers = async () => {
  try {
    let timers = await Timer.find();

    if (timers.length) {
      for (timer of timers) {
        let course = await Course.findById(timer['_idCourse']);

        var rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = timer.days;
        rule.hour = timer.time.split(':')[0];
        rule.minute = timer.time.split(':')[1];

        var j = schedule.scheduleJob(timer.name, rule, function(){
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
      }
      console.log('Timers are all scheduled!');
    }
    else {
      console.log('There is no timer was set!');
    }
  } catch (e)
  {
    res.json(e);
  }
}

module.exports.initTimers = initTimers;
