const express = require('express');
const router = express.Router();
const User = require('../models/User.js'); // Adjust path as needed


// Endpoint to get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude the password field for security
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});


module.exports = router;