const mongoose = require('mongoose');
const { CONNECTION_STRING } = require('../config');

const connectToDB = async () => {
  try {
    const connect = await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
    });
    const {
      connection: { host },
    } = connect;
    console.log('connection to DB is successful at : =>', host);
  } catch (error) {
    console.log('Error while connecting to DB', error);
    process.exit(1);
  }
};

module.exports = connectToDB;
