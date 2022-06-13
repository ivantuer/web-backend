const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    gender: { type: String },
    birthday: { type: Date },
    password: { type: String },
    token: { type: String },
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

module.exports = mongoose.model("user", userSchema);
