const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// Import your auth middleware if you are using it
const authMiddleware = require('../middleware/authMiddleware');

// This is the specific line your frontend is looking for
// We use authMiddleware so only logged-in staff can see the doctor list
router.get('/doctors', authMiddleware, userController.getAllDoctors);

// Admin only route to add staff
router.post('/add-staff', authMiddleware, userController.createStaff);

module.exports = router;