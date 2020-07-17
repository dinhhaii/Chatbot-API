const mongoose = require('mongoose');

const progressSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  _idUser: mongoose.Schema.Types.ObjectId,
  played: {
    type: Array,
    require: true,
  },
  isDelete: {
    type: Boolean,
    require: true
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('progress', progressSchema);
