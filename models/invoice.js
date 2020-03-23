const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  _idUser: mongoose.Schema.Types.ObjectId,
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
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('invoice', invoiceSchema);
