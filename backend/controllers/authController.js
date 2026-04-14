const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Mock Database of Registered Doctors for the High-Tech Verification Step
const axios = require('axios');

const authController = {
    // This is the function called by your Signup Page
    verifyNmcId: async (req, res) => {
        try {
            const { nmcId } = req.body;

            // Your Main Backend acts as a client calling the External Registry API
            const response = await axios.get(`http://localhost:5000/api/external/nmc-check/${nmcId}`);

            // If the external API confirms the doctor exists
            if (response.data.success) {
                return res.status(200).json({
                    success: true,
                    message: "Doctor credentials verified via National Registry",
                    doctorDetails: response.data.data
                });
            }
        } catch (error) {
            // Handle cases where the ID doesn't exist (404) or API is down
            const status = error.response ? error.response.status : 500;
            const message = error.response ? error.response.data.message : "Registry Service Offline";

            res.status(status).json({ success: false, message });
        }
    },
    // 2. SIGNUP (Includes Role and NMC ID logic)
    signup: async (req, res) => {
        try {
            const {
                firstName,
                lastName,
                email,
                password,
                role,
                nmcId
            } = req.body;

            // Basic validation
            if (!firstName || !lastName || !email || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'All required fields must be filled'
                });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Create user with specific role and optional nmcId
            const newUser = await User.create({
                firstName,
                lastName,
                email,
                password, // Note: Plain text for Version 1; add bcrypt.hash in Version 2
                role,
                nmcId: role === 'doctor' ? nmcId : null,
                profilePhoto: req.file
                    ? 'http://localhost:5000/uploads/' + req.file.filename
                    : 'default-profile.png'
            });

            // Generate token with role included in payload
            const token = jwt.sign(
                {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                    firstName: newUser.firstName
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                token: token,
                user: {
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    role: newUser.role
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Signup failed',
                error: error.message
            });
        }
    },

    // 3. LOGIN (Supports Secret Admin Entry and Role Checking)
    login: async (req, res) => {
        try {
            const { email, password, isAdminLogin } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const user = await User.findOne({ where: { email } });

            // 1. Basic Credential Check
            if (!user || password !== user.password) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // 2. PORTAL ISOLATION LOGIC

            // Rule A: If trying to use the Admin Portal, user MUST be an Admin
            if (isAdminLogin && user.role !== 'super_admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access Denied: This portal is reserved for System Administrators.'
                });
            }

            // Rule B: If using the Normal Portal, user MUST NOT be an Admin
            if (!isAdminLogin && user.role === 'super_admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Security Alert: Administrators must use the dedicated Admin Portal.'
                });
            }

            // 3. Generate Token (if rules pass)
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    },

    // 4. LOGOUT
    logout: async (req, res) => {
        try {
            // Logout is primarily handled by the frontend clearing localStorage
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Logout failed',
                error: error.message
            });
        }
    }
};

module.exports = authController;