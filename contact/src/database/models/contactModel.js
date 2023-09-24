const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      require: [true, 'Please add the name of the contact'],
    },
    email: {
      type: String,
      require: [true, 'Please add the email of the contact'],
      unique: true,
    },
    phone: {
      type: String,
      require: [true, 'Please add the phone number of the contact'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Contact', contactSchema);
