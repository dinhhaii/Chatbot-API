const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    require: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    require: true
  },
  firstName: {
    type: String,
    require: true
  },
  lastName: {
      type: String,
      require: true
  },
  role: {
    type: String,
    require: true
  },
  imageURL: {
    type: String,
    require: false
  },
  type: {
    type: String,
    require: true
  },
  status: {
      type: String,
      require: true
  },
  bio: {
    type: String,
    require: false
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('user', userSchema);
