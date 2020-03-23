const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  _idCourse: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  lectureURL: {
    type: String,
    require: true
  },
  fileURLs: {
    type: Array,
    require: false
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('lesson', lessonSchema);
