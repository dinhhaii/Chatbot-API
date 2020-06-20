const mongoose = require('mongoose');

const surveySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  _idUser: mongoose.Schema.Types.ObjectId,
  rate: {
    type: Number,
    require: true
  },
  content: {
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

surveySchema.index({'content': 'text' });

module.exports = mongoose.model('survey', surveySchema);
