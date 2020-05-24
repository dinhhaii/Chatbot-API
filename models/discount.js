const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  _idCourse: mongoose.Schema.Types.ObjectId,
  code: {
    type: String,
    require: false
  },
  percentage: {
    type: Number,
    require: false
  },
  status: {
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

discountSchema.index({'code': 'text' });

module.exports = mongoose.model('discount', discountSchema);
