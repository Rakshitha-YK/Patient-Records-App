const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');

const authController = {
    login: async (req, res) => {
        try {
            const { uniqueId, password } = req.body;

            if (!uniqueId || !password) {
                return res.status(400).json({ success: false, message: 'ID and password required' });
            }

            // 1. Search Users (Admin, Doctor, Receptionist)
            let account = await User.findOne({ where: { uniqueId } });
            let isStaff = true;

            // 2. Search Patients if not found in Users
            if (!account) {
                account = await Patient.findOne({ where: { uniqueId } });
                isStaff = false;
            }

            // 3. Credential Check
            if (!account || password !== account.password) {
                return res.status(401).json({ success: false, message: 'Invalid ID or password' });
            }

            // 4. Generate Token (Includes role so frontend knows where to go)
            const token = jwt.sign(
                { 
                    id: account.id, 
                    role: account.role, 
                    name: isStaff ? account.firstName : account.legalName 
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                success: true,
                token: token,
                user: {
                    id: account.id,
                    role: account.role,
                    name: isStaff ? account.firstName : account.legalName
                }
            });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Login failed', error: error.message });
        }
    },

    logout: async (req, res) => {
        res.json({ success: true, message: 'Logged out successfully' });
    }
};

module.exports = authController;