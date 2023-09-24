const express = require('express');
const contactRouter = express.Router();
const {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
  getContactById,
  addFavoriteContact,
  removeFavoriteContact,
} = require('../controllers/contactControllers');
const { validateToken } = require('../utils/middleware');

contactRouter.use(validateToken);

contactRouter.get('/', getAllContacts);
contactRouter.post('/', addContact);
contactRouter.put('/:id', updateContact);
contactRouter.delete('/:id', deleteContact);
contactRouter.get('/:id', getContactById);
contactRouter.put('/favorites/:id', addFavoriteContact);
contactRouter.delete('/favorites/:id', removeFavoriteContact);

module.exports = contactRouter;
