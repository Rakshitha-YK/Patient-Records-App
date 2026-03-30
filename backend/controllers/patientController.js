const Patient = require('../models/patientModel');
const User = require('../models/userModel');

const patientController = {

    // GET ALL PATIENTS
    getAllPatients: async (req, res) => {
        try {
            const patients = await Patient.findAll({
                include: [{
                    model: User,
                    attributes: [
                        'firstName', 
                        'lastName', 
                        'email'
                    ]
                }]
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

    // GET SINGLE PATIENT BY ID
    getPatientById: async (req, res) => {
        try {
            const { id } = req.params;

            const patient = await Patient.findOne({
                where: { id },
                include: [{
                    model: User,
                    attributes: [
                        'firstName', 
                        'lastName', 
                        'email'
                    ]
                }]
            });

            if (!patient) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Patient not found' 
                });
            }

            res.json({ 
                success: true, 
                patient: patient 
            });

        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Could not fetch patient', 
                error: error.message 
            });
        }
    },

    // CREATE NEW PATIENT
   createPatient: async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        console.log("USER:", req.user);

        const {
            legalName,
            dob,
            gender,
            contact,
            bloodGroup,
            reasonForVisit,
            medicalHistory,
            medications,
            surgicalHistory,
            socialHistory
        } = req.body;

        if (!legalName || !dob || !gender) {
            return res.status(400).json({ 
                success: false, 
                message: 'Legal name, date of birth and gender are required' 
            });
        }

        // ✅ SAFE check
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - invalid token'
            });
        }

        const userId = req.user.id;

        const reportPhoto = req.file
            ? 'http://localhost:5000/uploads/' + req.file.filename
            : null;

        const newPatient = await Patient.create({
            userId,
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
            reportPhoto
        });

        res.status(201).json({ 
            success: true, 
            message: 'Patient record created successfully',
            patient: newPatient
        });

    } catch (error) {
        console.error("CREATE ERROR:", error); // 🔥 IMPORTANT

        res.status(500).json({ 
            success: false, 
            message: 'Could not create patient', 
            error: error.message 
        });
    }
},

    //UPDATE PATIENT

    updatePatient: async (req, res) => {
        try {
            const { id } = req.params;

            const patient = await Patient.findOne({ 
                where: { id } 
            });

            if (!patient) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Patient not found' 
                });
            }

            await patient.update(req.body);

            res.json({ 
                success: true, 
                message: 'Patient record updated successfully',
                patient: patient
            });

        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Could not update patient', 
                error: error.message 
            });
        }
    },

    //DELETE PATIENT
    deletePatient: async (req, res) => {
        try {
            const { id } = req.params;

            const patient = await Patient.findOne({ 
                where: { id } 
            });

            if (!patient) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Patient not found' 
                });
            }

            await patient.destroy();

            res.json({ 
                success: true, 
                message: 'Patient record deleted successfully'
            });

        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Could not delete patient', 
                error: error.message 
            });
        }
    }

};

module.exports = patientController;




