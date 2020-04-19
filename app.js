const express = require ('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const constant = require('./utils/constant');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const coursesRouter = require('./routes/courses');
const commentsRouter = require('./routes/comments');
const feedbackRouter = require('./routes/feedback');
const lessonsRouter = require('./routes/lessons');
const discountRouter = require('./routes/discount');
const invoicesRouter = require('./routes/invoices');
const subjectsRouter = require('./routes/subjects');
const cartRouter = require('./routes/cart');

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.session());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
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

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
