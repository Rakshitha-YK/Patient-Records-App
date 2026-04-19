const Patient = require('../models/patientModel');
const User = require('../models/userModel');

const patientController = {

    // Add this to your patientController object
    getMyProfile: async (req, res) => {
        try {
            const User = require('../models/userModel');
            const patientId = req.user.id; // Extracted from the token by authMiddleware

            const patient = await Patient.findOne({
                where: { id: patientId },
                include: [
                    {
                        model: User,
                        as: 'doctor',
                        attributes: ['firstName', 'lastName', 'uniqueId', 'specialist'] // Includes Doctor's ID and Specialist
                    }
                ]
            });

            if (!patient) {
                return res.status(404).json({ success: false, message: 'Profile not found' });
            }

            // Security: Remove system-sensitive fields
            const data = patient.toJSON();
            delete data.password;
            delete data.createdBy;

            res.json({ success: true, patient: data });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error fetching profile' });
        }
    },

    // 1. GET ALL PATIENTS (Role-Based Filtering + Privacy Wall)
    getAllPatients: async (req, res) => {
        try {
            const { id: userId, role } = req.user;
            let whereClause = {};

            // --- DATA ISOLATION LOGIC ---
            if (role === 'receptionist') {
                // Receptionists see patients they registered
                whereClause = { createdBy: userId };
            }
            else if (role === 'doctor') {
                // Doctors see patients assigned to them
                whereClause = { assignedDoctorId: userId };
            }
            else if (role === 'super_admin') {
                whereClause = {};
            }

            let patients = await Patient.findAll({
                where: whereClause,
                include: [
                    { model: User, as: 'receptionist', attributes: ['firstName', 'lastName'] },
                    { model: User, as: 'doctor', attributes: ['firstName', 'lastName'] }
                ]
            });

            // --- PRIVACY WALL: Hide clinical data from Receptionists ---
            if (role === 'receptionist') {
                patients = patients.map(p => {
                    const data = p.toJSON();
                    delete data.medicalHistory;
                    delete data.medications;
                    delete data.surgicalHistory;
                    delete data.socialHistory;
                    delete data.reportPhoto;
                    delete data.password; // Never send passwords
                    return data;
                });
            }

            res.json({ success: true, count: patients.length, patients });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
        }
    },

    // 2. GET SINGLE PATIENT (Security Gate + Clinical Access)
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

            // --- SECURITY GATE ---
            if (role === 'doctor' && patient.assignedDoctorId !== userId) {
                return res.status(403).json({ success: false, message: 'Access Denied: Patient not assigned to you' });
            }
            if (role === 'receptionist' && patient.createdBy !== userId) {
                return res.status(403).json({ success: false, message: 'Access Denied: You did not register this patient' });
            }

            // --- PRIVACY WALL: Strip clinical info for Receptionists ---
            let responseData = patient.toJSON();
            delete responseData.password;

            if (role === 'receptionist') {
                delete responseData.medicalHistory;
                delete responseData.medications;
                delete responseData.surgicalHistory;
                delete responseData.socialHistory;
                delete responseData.reportPhoto;
            }

            res.json({ success: true, patient: responseData });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching patient', error: error.message });
        }
    },

    // 3. CREATE NEW PATIENT (Auto-ID & Password Generation)
    createPatient: async (req, res) => {
        try {
            const {
                legalName, dob, gender, contact, bloodGroup,
                reasonForVisit, medicalHistory, medications,
                surgicalHistory, socialHistory, assignedDoctorId
            } = req.body;

            if (!legalName || !dob || !gender) {
                return res.status(400).json({ success: false, message: 'Basic info (Name, DOB, Gender) is required' });
            }

            // --- AUTO-GENERATION LOGIC ---
            // 1. Unique ID: PAT + 3 random digits
            const uniqueId = `PAT${Math.floor(100 + Math.random() * 900)}`;
            // 2. Temp Password: 8 character random string
            const tempPassword = Math.random().toString(36).slice(-8);

            const receptionistId = req.user.id;
            const reportPhoto = req.file ? 'http://localhost:5000/uploads/' + req.file.filename : null;

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
                uniqueId,          // Generated PAT ID
                password: tempPassword, // System-assigned password
                createdBy: receptionistId,
                assignedDoctorId: assignedDoctorId || null
            });

            res.status(201).json({
                success: true,
                message: 'Patient registered successfully',
                credentials: {
                    uniqueId: newPatient.uniqueId,
                    password: tempPassword
                }
            });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
        }
    },

    // 4. UPDATE PATIENT (Clinical Restriction)
    updatePatient: async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.user;
            const patient = await Patient.findOne({ where: { id } });

            if (!patient) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }

            // PREVENT RECEPTIONISTS FROM UPDATING CLINICAL DATA
            if (role === 'receptionist') {
                const restrictedFields = ['medicalHistory', 'medications', 'surgicalHistory', 'reportPhoto'];
                restrictedFields.forEach(field => delete req.body[field]);
            }

            await patient.update(req.body);
            res.json({ success: true, message: 'Record updated', patient });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Update failed', error: error.message });
        }
    },

    // 5. DELETE PATIENT (Super Admin Only)
    deletePatient: async (req, res) => {
        try {
            const { id } = req.params;
            if (req.user.role !== 'super_admin') {
                return res.status(403).json({ success: false, message: 'Restricted: Only Super Admins can delete records' });
            }

            const deleted = await Patient.destroy({ where: { id } });
            if (!deleted) return res.status(404).json({ success: false, message: 'Patient not found' });

            res.json({ success: true, message: 'Record deleted permanently' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
        }
    }
};

module.exports = patientController;