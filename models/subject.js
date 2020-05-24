const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    require: true
  },
  imageURL: {
    type: String,
    require: true
  },
  isDelete: {
    type: Boolean,
    require: true
  }
}, {
  timestamps: true,
});

subjectSchema.index({ 'name': 'text' });
module.exports = mongoose.model('subject', subjectSchema);
