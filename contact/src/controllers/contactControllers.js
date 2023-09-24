const expressAsyncHandler = require('express-async-handler');
const { contactModel } = require('../database');
const axios = require('axios');
const { publishMessage } = require('../utils/messageBroker');

const getAllContacts = expressAsyncHandler(async (req, res) => {
  const contacts = await contactModel.find({ user_id: req.userId });
  res.json(contacts);
});

const addContact = expressAsyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error('Name, Phone and Email is needed to create a new contact');
  }
  const createdContact = await contactModel.create({
    name,
    email,
    phone,
    user_id: req.userId,
  });

  const payload = {
    event: 'ADD_CONTACT',
    data: createdContact,
  };

  /**
   * USE BELOW BLOCK TO COMMUNICATE BETWEEN SERVICES VIA MESSAGE BROKER
   */
  publishMessage(JSON.stringify(payload));

  /**
   * USE BELOW BLOCK T0 COMMUNICATE BETWEEN SERVICES VIA REST METHODS
   */
  // const isAddedToUserModel = await publishUserAppEvent(payload);

  // if (isAddedToUserModel) {
  // } else {
  //   throw new Error('Something went wrong, contact could not be created');
  // }

  res.status(201).json(createdContact);
});

const updateContact = expressAsyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const contactId = await contactModel.findById(req?.params?.id);

  if (!contactId) {
    throw new Error('could not find the contact ID');
  }

  const newValues = {
    name,
    email,
    phone,
  };

  if (contactId?.user_id?.toString() !== req?.userId) {
    res.status(403);
    throw new Error("permission denied to update other user's contacts");
  }

  const updatedContact = await contactModel.findByIdAndUpdate(
    req?.params?.id,
    newValues,
    { new: true },
  );

  const payload = {
    event: 'UPDATE_CONTACT',
    data: updatedContact,
  };

  /**
   * USE BELOW BLOCK TO COMMUNICATE BETWEEN SERVICES VIA MESSAGE BROKER
   */
  publishMessage(JSON.stringify(payload));

  /**
   * USE BELOW BLOCK T0 COMMUNICATE BETWEEN SERVICES VIA REST METHODS
   */

  // const isUpdatedToUserModel = await publishUserAppEvent(payload);

  // if (isUpdatedToUserModel) {
  //   res.json(updatedContact);
  // } else {
  //   throw new Error('Something went wrong, contact could not be updated');
  // }

  res.json(updatedContact);
});

const deleteContact = expressAsyncHandler(async (req, res) => {
  const contactId = await contactModel.findById(req?.params?.id);

  if (!contactId) {
    throw new Error('could not find the contact ID');
  }

  if (contactId?.user_id?.toString() !== req?.userId) {
    res.status(403);
    throw new Error("permission denied to delete other user's contacts");
  }

  const deletedDocument = await contactModel.findByIdAndRemove(req?.params?.id);
  console.log(deletedDocument, '<<== deletedDocument');

  if (!deletedDocument) {
    return res.status(404).json({ message: 'Document not found' });
  } else {
    const payload = {
      event: 'DELETE_CONTACT',
      data: deletedDocument,
    };

    /**
     * USE BELOW BLOCK TO COMMUNICATE BETWEEN SERVICES VIA MESSAGE BROKER
     */
    publishMessage(JSON.stringify(payload));

    /**
     * USE BELOW BLOCK T0 COMMUNICATE BETWEEN SERVICES VIA REST METHODS
     */

    // const isDeletedFromUserModel = await publishUserAppEvent(payload);

    // if (isDeletedFromUserModel) {
    //   res.status(200).json({ message: 'Document deleted successfully' });
    // } else {
    //   throw new Error('Something went wrong, contact could not be deleted');
    // }

    res.status(200).json({ message: 'Document deleted successfully' });
  }
});

const getContactById = expressAsyncHandler(async (req, res) => {
  const id = req?.params?.id;

  const contactInfo = await contactModel.findById(id);

  if (contactInfo) {
    res.status(200).json(contactInfo);
  } else {
    res.status(400).json({ message: 'Could not find the contact ID' });
  }
});

const addFavoriteContact = expressAsyncHandler(async (req, res) => {
  const userId = req.userId;
  const contact = await contactModel.findById(req.params.id);

  if (!contact) {
    res.status(400);
    throw new Error('Could not find the requested contact');
  }

  const payload = {
    event: 'ADD_TO_FAVORITE',
    data: contact,
  };

  publishUserAppEvent(payload);

  res.status(200).json(contact);
});

const removeFavoriteContact = expressAsyncHandler(async (req, res) => {
  const userId = req.userId;
  const contact = await contactModel.findById(req.params.id);

  if (!contact) {
    res.status(400);
    throw new Error('Could not find the requested contact');
  }

  const payload = {
    event: 'REMOVE_FROM_FAVORITE',
    data: contact,
  };

  publishUserAppEvent(payload);

  res.status(200).json(contact);
});

// app level event publisher
const publishUserAppEvent = expressAsyncHandler(async payload => {
  const resp = await axios.post(
    'http://localhost:8000/api/user/user-app-events',
    { payload },
  );
  if (resp) {
    return resp;
  } else {
    throw new Error('Could not update the contact info in user model');
  }
});

module.exports = {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
  getContactById,
  addFavoriteContact,
  removeFavoriteContact,
};
