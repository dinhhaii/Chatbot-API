const express = require ('express');
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const passport = require('passport');
const constant = require('./utils/constant');

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
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.session());

// Router
app.use('/user', usersRouter);

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
