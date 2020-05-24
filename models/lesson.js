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
  files: {
    type: Array,
    require: false
  },
  isDelete: {
    type: Boolean,
    require: true
  }
}, {
  timestamps: true,
});

lessonSchema.index({ 'name': 'text', 'description': 'text' });

module.exports = mongoose.model('lesson', lessonSchema);
