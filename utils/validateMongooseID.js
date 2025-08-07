const mongoose = require('mongoose');

const validateUserID = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = { validateUserID };
