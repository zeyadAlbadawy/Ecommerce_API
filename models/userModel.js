const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: [
      true,
      'Another user register with this mail, try with different mail',
    ],
    required: [true, 'A User Must has an email!'],
    validate: {
      validator: validator.isEmail,
      message: 'The Mail Entered Is Not Valid',
    },
  },
  mobile: {
    type: String,
    required: [true, 'A user must provide a mobile number'],
  },
  password: {
    type: String,
    required: [true, 'Please provide the password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: `Password doesn't match`,
    },
    select: false
  },
});




userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPasswordCorrectness = async function (plainPassword, hashedPassword) { 
  return await bcrypt.compare(plainPassword, hashedPassword);
};
const User = mongoose.model('User', userSchema);

module.exports = User;
