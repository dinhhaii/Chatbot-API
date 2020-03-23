const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    require: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('subject', subjectSchema);
