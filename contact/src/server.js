const express = require('express');
const cors = require('cors');
const { connectToDB } = require('./database');
const contactRouter = require('./routes/contactRoutes');
const app = express();
const { PORT } = require('./config');
const { errorHandlingMiddleware } = require('./utils/middleware');

// utilizing in built middleware
app.use(express.json());
app.use(cors());

const initializeServer = async () => {
  await connectToDB();

  // handling users API
  app.use('/', contactRouter);

  app.use(errorHandlingMiddleware);

  app.listen(PORT, () => {
    console.log(`The server has started on PORT =>  ${PORT}`);
  });
};

initializeServer();
