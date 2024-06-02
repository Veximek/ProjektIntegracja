const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: { // Store the hashed password
    type: String,
    required: true
  },
  salt: { // Store the salt
    type: String,
    required: true
  }
  // ... other user fields
});

// Method to compare passwords (for login)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User; 