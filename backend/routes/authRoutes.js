// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const upload = require('../middleware/upload');

// // POST /api/auth/signup
// router.post('/signup', upload.single('profilePhoto'), authController.signup);

// // POST /api/auth/login
// router.post('/login', upload.single('profilePhoto'), authController.login);

// // POST /api/auth/logout
// router.post('/logout', authController.logout);

// module.exports = router;


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// Step 1: Verify Doctor ID
router.post('/verify-nmc', authController.verifyNmcId);

// Step 2: Complete Signup
router.post('/signup', upload.single('profilePhoto'), authController.signup);

router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;

