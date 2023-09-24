const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'username is a required field'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'email is a required field'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'password is a required field'],
    },
    contacts: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
    favorites: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        date: { type: Date, default: Date.now() },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', userSchema); // Capitalize model name (User) conventionally
