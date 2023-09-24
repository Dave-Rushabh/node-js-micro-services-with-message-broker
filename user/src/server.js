const express = require('express');
const cors = require('cors');
const { connectToDB } = require('./database');
const userRouter = require('./routes/userRoutes');
const app = express();
const { PORT } = require('./config');
const { errorHandlingMiddleware } = require('./utils/middleware');
const { subscribeMessage } = require('./utils/messageBroker');

// utilizing in built middleware
app.use(express.json());
app.use(cors());

const initializeServer = async () => {
  await connectToDB();

  // handling users API
  app.use('/', userRouter);

  app.use(errorHandlingMiddleware);

  // subscribe to the message published from other service directly at the server level
  subscribeMessage();

  app.listen(PORT, () => {
    console.log(`The server has started on PORT =>  ${PORT}`);
  });
};

initializeServer();
