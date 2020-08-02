const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  _idLecturer: mongoose.Schema.Types.ObjectId,
  _idSubject: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    require: true
  },
  imageURL: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true
  },
  startDate: {
    type: Date,
    require: true
  },
  duration: {
    type: String,
    require: true
  },
  accessibleDays: {
    type: Number,
    require: true
  },
  level: {
    type: Number,
    require: true
  },
  views: {
    type: Number,
    require: true
  },
  status: {
    type: String,
    require: false
  },
  tags :{
    type: Array,
    require: false,
  },
  isDelete: {
    type: Boolean,
    require: true
  }
}, {
  timestamps: true,
});

courseSchema.index({ 'name': 'text', 'description': 'text', 'tags': 'text' });

module.exports = mongoose.model('course', courseSchema);
