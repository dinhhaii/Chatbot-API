const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  _idUser: mongoose.Schema.Types.ObjectId,
  _idDiscount: mongoose.Schema.Types.ObjectId,
  _idCourse: mongoose.Schema.Types.ObjectId,
  totalPrice: {
    type: Number,
    require: true
  },
  payDay: {
    type: Date,
    require: true
  },
  status: {
    type: String,
    require: true
  },
  reportMsg: {
    type: String,
    require: false
  },
  isDelete: {
    type: Boolean,
    require: true
  }
}, {
  timestamps: true,
});

invoiceSchema.index({ 'reportMsg': 'text' });

module.exports = mongoose.model('invoice', invoiceSchema);
