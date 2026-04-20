const User = require('../models/userModel');



// Add this function to your existing userController


const userController = {

    getAllDoctors: async (req, res) => {
        try {
            const User = require('../models/userModel');
            const doctors = await User.findAll({
                where: { role: 'doctor' },
                attributes: ['id', 'firstName', 'lastName', 'specialist']
            });
            res.json({ success: true, doctors });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching doctors' });
        }
    },



    // Admin creates a new staff member (Doctor or Receptionist)
    createStaff: async (req, res) => {
        try {
            // 1. Grab everything from the request body
            const { firstName, lastName, email, role, specialist } = req.body;

            // 2. Basic Validation (Don't let them send empty data)
            if (!firstName || !lastName || !email || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'First name, last name, email, and role are required!'
                });
            }

            // 3. Check if the staff member is already in the system
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'That email is already registered. Try another one.'
                });
            }

            // 4. Generate a Unique ID (e.g., DOC482 or REC910)
            const prefix = role === 'doctor' ? 'DOC' : 'REC';
            const randomNumber = Math.floor(100 + Math.random() * 900);
            const uniqueId = `${prefix}${randomNumber}`;

            // 5. Generate a temporary 8-character password
            const tempPassword = Math.random().toString(36).slice(-8);

            // 6. Save to the database with the new 'specialist' field
            const newStaff = await User.create({
                firstName,
                lastName,
                email,
                uniqueId,
                password: tempPassword, // Plain text for your V1 Demo
                role,
                // If it's a doctor, save the specialty. If not, keep it null.
                specialist: role === 'doctor' ? specialist : null
            });

            // 7. Send the "Secret" credentials back to the Admin
            res.status(201).json({
                success: true,
                message: `${role.charAt(0).toUpperCase() + role.slice(1)} added successfully!`,
                credentials: {
                    uniqueId: newStaff.uniqueId,
                    password: tempPassword
                }
            });

        } catch (error) {
            console.error("Staff Creation Error:", error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
};

module.exports = userController;
