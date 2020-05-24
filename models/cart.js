const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    _idUser: mongoose.Schema.Types.ObjectId,
    items: {
      type: Array,
      require: true,
    }
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("cart", cartSchema);
