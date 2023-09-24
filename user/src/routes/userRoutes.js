const express = require('express');
const {
  handleUserRegistration,
  handleUserLogin,
  fetchUserDetailsById,
  getUserProfile,
  getUserFavoriteContacts,
  userAppEvents,
} = require('../controllers/userControllers');
const { validateToken } = require('../utils/middleware');

const userRouter = express.Router();

userRouter.post('/signup', handleUserRegistration);

userRouter.post('/login', handleUserLogin);

// protected routes
userRouter.get('/id/:id', validateToken, fetchUserDetailsById);

userRouter.get('/profile', validateToken, getUserProfile);

userRouter.get('/favorites', validateToken, getUserFavoriteContacts);

// adding a middleware to communicate between user service and contact service
userRouter.use('/user-app-events', userAppEvents);

module.exports = userRouter;
