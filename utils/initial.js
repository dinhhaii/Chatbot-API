const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const axios = require('axios');
const constant = require("../utils/constant");

let Course = require("../models/course");
let Timer = require("../models/timer");
let Invoice = require("../models/invoice");
let User = require('../models/user');

const initTimers = async () => {
  try {
    let timers = await Timer.find();

    if (timers.length) {
      for (timer of timers) {
        // Check Timer not canceled
        if (timer.status === 'available') {
          const invoice = await Invoice.findById(timer._idInvoice);
          const user = await User.findById(timer._idUser);

          if (invoice) {
            let course = await Course.findById(invoice._idCourse);
            var rule = new schedule.RecurrenceRule();
            rule.dayOfWeek = timer.days;
            rule.hour = timer.time.split(":")[0];
            rule.minute = timer.time.split(":")[1];
    
            var j = schedule.scheduleJob(timer.name, rule, function () {
              // Send message
              const requestBody = {
                recipient: {
                  id: user.idFacebook,
                },
                message: {
                  attachment: {
                    type: "template",
                    payload: {
                      template_type: "button",
                      text: `Reminder for the course (${course.name}) you're taking!`,
                      buttons: [
                        { 
                          title: "Course Detail",
                          type: "web_url",
                          url: `${constant.URL_CLIENT}/course-detail/${course._id}`
                        }
                      ],
                    }
                  }
                }
              };
              
              axios.post(`${constant.PLATFORM_FACEBOOK_URL}/me/messages?access_token=${constant.PAGE_ACCESS_TOKEN}`, requestBody)
                .then(response => console.log(response.data));
              
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
                } else {
                  console.log("Email sent: " + info.response);
                  res.json({
                    message:
                      "Email was sent! (Check Spam section if you can't find it)",
                  });
                }
              });
            });
          } else {
            console.log(`Invoice not found in timer ${timer._id}`);
            break;
          }
        }
      }
      console.log("Timers are all scheduled!");
    } else {
      console.log("There is no timer was set!");
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.initTimers = initTimers;
