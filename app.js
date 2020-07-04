const express = require ('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const constant = require('./utils/constant');
const initial = require('./utils/initial');

const usersRouter = require('./routes/users');
const indexRouter = require('./routes/index');
const coursesRouter = require('./routes/courses');
const commentsRouter = require('./routes/comments');
const feedbackRouter = require('./routes/feedback');
const lessonsRouter = require('./routes/lessons');
const discountRouter = require('./routes/discount');
const invoicesRouter = require('./routes/invoices');
const subjectsRouter = require('./routes/subjects');
const cartRouter = require('./routes/cart');
const notiRouter = require('./routes/notifications');
const surveyRouter = require('./routes/survey');
const progressRouter = require('./routes/progress');

require('dotenv').config();
const app = express();
app.use(passport.initialize());
require('./utils/passport');


const port = process.env.PORT || 3000;

mongoose.connect(constant.CONNECTION_STRING, { useNewUrlParser: true,
                        useUnifiedTopology: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("Cafocc MongoDB connection established successfully");
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});


// View engine setup
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(cors());

// Router
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/course', coursesRouter);
app.use('/lesson', lessonsRouter);
app.use('/invoice', invoicesRouter);
app.use('/subject', subjectsRouter);
app.use('/discount', discountRouter);
app.use('/feedback', feedbackRouter);
app.use('/comment', commentsRouter);
app.use('/cart', cartRouter);
app.use('/notification', notiRouter);
app.use('/survey', surveyRouter);
app.use('/progress', progressRouter);


// Initialize data
initial.initTimers();

module.exports = app;
