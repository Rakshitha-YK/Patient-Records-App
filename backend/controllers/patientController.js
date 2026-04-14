const Patient = require('../models/patientModel');
const User = require('../models/userModel');

const patientController = {

    // 1. GET PATIENTS (Filtered by Role)
    getAllPatients: async (req, res) => {
        try {
            const { id, role } = req.user; // From Auth Middleware
            let whereClause = {};

            // DATA ISOLATION LOGIC
            if (role === 'receptionist') {
                // I only see patients I added
                whereClause = { createdBy: id };
            } 
            else if (role === 'doctor') {
                // I only see patients assigned to me
                whereClause = { assignedDoctorId: id };
            } 
            else if (role === 'super_admin') {
                // Maibaap sees everything
                whereClause = {}; 
            }

            const patients = await Patient.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        as: 'receptionist', // Uses the alias from your Model
                        attributes: ['firstName', 'lastName', 'email']
                    },
                    {
                        model: User,
                        as: 'doctor', // Shows who the assigned doctor is
                        attributes: ['firstName', 'lastName', 'email']
                    }
                ]
            });

            res.json({ 
                success: true, 
                count: patients.length,
                patients: patients 
            });

        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Could not fetch patients', 
                error: error.message 
            });
        }
    },

    // 2. GET SINGLE PATIENT (With Security Check)
    getPatientById: async (req, res) => {
        try {
            const { id } = req.params;
            const { id: userId, role } = req.user;

            const patient = await Patient.findOne({
                where: { id },
                include: [
                    { model: User, as: 'receptionist', attributes: ['firstName', 'lastName'] },
                    { model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }
                ]
            });

            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            // SECURITY GATE: Prevent URL manipulation
            // If I'm a doctor and this patient isn't assigned to me, block access
            if (role === 'doctor' && patient.assignedDoctorId !== userId) {
                return res.status(403).json({ success: false, message: 'Access Denied: Not your patient' });
            }
            // If I'm a receptionist and I didn't create this record, block access
            if (role === 'receptionist' && patient.createdBy !== userId) {
                return res.status(403).json({ success: false, message: 'Access Denied: You did not register this patient' });
            }

            res.json({ success: true, patient });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching patient', error: error.message });
        }
    },

    // 3. CREATE NEW PATIENT (Attaching the Creator)
    createPatient: async (req, res) => {
        try {
            const {
                legalName, dob, gender, contact, bloodGroup,
                reasonForVisit, medicalHistory, medications,
                surgicalHistory, socialHistory, assignedDoctorId
            } = req.body;

            if (!legalName || !dob || !gender) {
                return res.status(400).json({ success: false, message: 'Required fields missing' });
            }

            const receptionistId = req.user.id; // The logged-in receptionist

            const reportPhoto = req.file
                ? 'http://localhost:5000/uploads/' + req.file.filename
                : null;

            const newPatient = await Patient.create({
                legalName,
                dob,
                gender,
                contact,
                bloodGroup,
                reasonForVisit,
                medicalHistory,
                medications,
                surgicalHistory,
                socialHistory,
                reportPhoto,
                createdBy: receptionistId, // LOGS THE RECEPTIONIST
                assignedDoctorId: assignedDoctorId || null // OPTIONAL ASSIGNMENT
            });

            res.status(201).json({ success: true, message: 'Record created', patient: newPatient });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Create failed', error: error.message });
        }
    },

    // 4. UPDATE PATIENT
    updatePatient: async (req, res) => {
        try {
            const { id } = req.params;
            const patient = await Patient.findOne({ where: { id } });

            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            // Optional: Add logic here so only the assigned doctor can update clinical notes
            await patient.update(req.body);

            res.json({ success: true, message: 'Updated successfully', patient });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Update failed', error: error.message });
        }
    },

    // 5. DELETE PATIENT
    deletePatient: async (req, res) => {
        try {
            const { id } = req.params;
            const patient = await Patient.findOne({ where: { id } });

            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            // Only Super Admin should usually be allowed to delete
            if (req.user.role !== 'super_admin') {
                return res.status(403).json({ success: false, message: 'Only Admins can delete records' });
            }

            await patient.destroy();
            res.json({ success: true, message: 'Deleted successfully' });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
        }
    }
};

module.exports = patientController;