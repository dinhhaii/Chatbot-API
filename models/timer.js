const mongoose = require('mongoose');

const timerSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    _idUser: mongoose.Schema.Types.ObjectId,
    _idCourse: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      require: true,
    },
    time: {
      type: String,
      require: false
    },
    days: {
      type: Array,
      require: false,
    },
    status: {
      type: String,
      require: true
    }
  },
  {
    timestamps: true,
  }
);

timerSchema.index({ 'name': 'text' });

module.exports = mongoose.model('timer', timerSchema);
