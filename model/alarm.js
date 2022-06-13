const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema(
  {
    active: { type: Boolean },
    time: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  {
    toJSON: {
      transform: function (doc, ret, game) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

module.exports = mongoose.model("alarm", alarmSchema);
