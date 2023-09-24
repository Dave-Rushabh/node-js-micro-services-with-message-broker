const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../database/models/userModel');
const { APP_SECRET } = require('../config');

const handleUserRegistration = expressAsyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    res.status(400);
    throw new Error('Please fill out all the fields to register');
  }

  const existingUser = await userModel.findOne({ email: email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email id already exists, use another one');
  }

  const hashedPWD = await bcrypt.hash(password, 10);

  const addedUser = await userModel.create({
    username: username,
    password: hashedPWD,
    email: email,
  });

  if (addedUser) {
    // Generate a JWT token for the new user
    const payload = { userId: addedUser._id, email: addedUser.email };
    const secretKey = APP_SECRET;
    const options = { expiresIn: '1h' };

    const token = jwt.sign(payload, secretKey, options);
    res.status(201).json({
      token,
      message: 'Registration is successful',
      data: addedUser,
    });
  } else {
    res.status(400);
    throw new Error('Something went wrong, please try again');
  }
});

const handleUserLogin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password to log in');
  }

  const user = await userModel.findOne({ email: email });

  if (!user) {
    res.status(400).json({
      message: 'The provided email does not exist in our system !',
    });
  }

  // Check if the password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid password !' });
  }

  // Generate a JWT token for the authenticated user
  const payload = { userId: user._id, email: user.email };
  const secretKey = APP_SECRET;
  const options = { expiresIn: '1h' };

  const token = jwt.sign(payload, secretKey, options);

  // Return the token and user data in the response
  res.status(200).json({
    token,
    user: { id: user._id, username: user.username, email: user.email },
    message: '🎉 Login successful ! 🥳',
  });
});

const fetchUserDetailsById = expressAsyncHandler(async (req, res) => {
  const id = req?.params?.id;

  if (id !== 'undefined') {
    const requestedUser = await userModel.findById(id);
    if (requestedUser) {
      res.status(200).json(requestedUser);
    } else {
      res.status(400);
      throw new Error('Invalid Id');
    }
  } else {
    res.status(400);
    throw new Error('Id is missing');
  }
});

const getUserProfile = expressAsyncHandler(async (req, res) => {
  const userId = req.userId;

  const userProfile = await userModel.findById(userId);

  if (!userProfile) {
    res.status(400);
    throw new Error('user not found');
  } else {
    res.status(200).json(userProfile);
  }
});

const getUserFavoriteContacts = expressAsyncHandler(async (req, res) => {
  const userId = req.userId;

  const userProfile = await userModel.findById(userId).populate('favorites');

  if (!userProfile) {
    res.status(400);
    throw new Error('user not found');
  } else {
    res.status(200).json(userProfile.favorites);
  }
});

// cross-services handlers
const userAppEvents = expressAsyncHandler(async (req, res, next) => {
  const { payload } = req.body;
  console.log(payload, 'payload');
  console.log('============ User service has received an Event =============');
  subscribeEvents(payload);
  res.status(200).json(payload);
});

const manageContact = async (event, data) => {
  console.log('now in contact manager');
  const { user_id, name, _id } = data;
  const contactObj = { _id, name };
  const userProfile = await userModel.findById(user_id).populate('contacts');
  if (userProfile) {
    let contactList = userProfile.contacts;
    if (event === 'ADD_CONTACT') {
      contactList.push(contactObj);
    } else {
      const idx = contactList.findIndex(
        contact => contact._id.toString() === contactObj._id.toString(),
      );
      if ((event = 'UPDATE_CONTACT')) {
        console.log('if 1');
        contactList[idx] = contactObj;
      }
      if ((event = 'DELETE_CONTACT')) {
        console.log('if 2');
        console.log(contactList, '<<== before');
        contactList.splice(idx, 1);
        console.log(contactList, '<<== after');
      }
    }
    userProfile.contacts = contactList;
    await userProfile.save();
  }
};

const manageFavorite = async (event, data) => {
  const { user_id, name, _id, email, phone } = data;
  const contact = { name, _id, email, phone };

  const userProfile = await userModel.findById(user_id).populate('favorites');

  if (!userProfile) {
    res.status(400);
    throw new Error('Could not find the user');
  }

  let favorites = userProfile.favorites;

  if (event === 'ADD_TO_FAVORITE') {
    if (
      favorites.filter(favorite => favorite._id.toString() === _id.toString())
        .length === 0
    ) {
      favorites.push(contact);
    } else {
      throw new Error('contact is already added in the favorites list');
    }
  }

  if (event === 'REMOVE_FROM_FAVORITE') {
    const idx = favorites.findIndex(
      favorite => favorite._id.toString() === _id.toString(),
    );
    if (idx !== undefined) {
      favorites.splice(idx, 1);
    } else {
      res.status(400);
      throw new Error(
        'Something went wrong while removing the contact from favorites',
      );
    }
  }

  userProfile.favorites = favorites;
  await userProfile.save();
};

const subscribeEvents = async payload => {
  console.log('User subscribe event triggered !!');
  const { event, data } = payload;

  switch (event) {
    case 'ADD_CONTACT':
    case 'UPDATE_CONTACT':
    case 'DELETE_CONTACT':
      manageContact(event, data);
      break;
    case 'ADD_TO_FAVORITE':
    case 'REMOVE_FROM_FAVORITE':
      manageFavorite(event, data);
      break;
    default:
      break;
  }
};

module.exports = {
  handleUserRegistration,
  handleUserLogin,
  fetchUserDetailsById,
  getUserProfile,
  getUserFavoriteContacts,
  userAppEvents,
  subscribeEvents,
};
