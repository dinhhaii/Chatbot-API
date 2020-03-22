const mongoose = require('mongoose');

const learnerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  enrolledCourses: {
    type: Array,
    require: false
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('learner', userSchema);
