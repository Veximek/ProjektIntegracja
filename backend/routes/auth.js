const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Registration Route
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const saltRounds = 5; 
    const salt = await bcrypt.genSalt(saltRounds);

    // Correct order of arguments for bcrypt.hash:
    console.log("Password:", password); 
    console.log("Salt:", salt);
    
    const hashedPassword = await bcrypt.hash(password, salt); 

    console.log("Before creating user object"); 
    const newUser = new User({
      username,
      password: hashedPassword,
      salt: salt 
    });
    console.log("After creating user object");

    await newUser.save(); 
    console.log("User saved successfully");
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});
// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); 
    res.json({ token });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;