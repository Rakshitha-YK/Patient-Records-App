const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

// ALL routes protected with JWT token!
router.get('/', authMiddleware, patientController.getAllPatients);
router.get('/:id', authMiddleware, patientController.getPatientById);
router.post('/create', authMiddleware,upload.single('reportPhoto'), patientController.createPatient);
router.put('/:id', authMiddleware, upload.single('reportPhoto'),patientController.updatePatient);
router.delete('/:id', authMiddleware, patientController.deletePatient);

module.exports = router;

