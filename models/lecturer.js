const mongoose = require('mongoose');

const lecturerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    require: true
  },
  bio: {
    type: String,
    require: false
  },
  courses: {
    type: Array,
    require: false
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('lecturer', userSchema);
