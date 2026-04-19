const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// We only need these two now! 
// The others (verify-nmc, signup) were causing the "TypeError"
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;