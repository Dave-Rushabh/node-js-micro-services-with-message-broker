const expressAsyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../../config');

const validateToken = expressAsyncHandler(async (req, res, next) => {
  let token = req?.headers?.authorization;

  if (!token) {
    res.status(401);
    throw new Error('Unauthorized request');
  }

  if (token.startsWith('Bearer')) {
    token = token.split(' ')[1];
  }

  jwt.verify(token, APP_SECRET, (error, decoded) => {
    if (error) {
      res.status(401);
      throw new Error('Unauthorized request');
    } else {
      req.userId = decoded?.userId;
      next();
    }
  });
});

module.exports = validateToken;
