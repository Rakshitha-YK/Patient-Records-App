const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authController = {

    // SIGNUP
    signup: async (req, res) => {
        try {
            const { 
                firstName, 
                lastName, 
                email, 
                password 
            } = req.body;

            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required' 
                });
            }

            const existingUser = await User.findOne({ 
                where: { email } 
            });

            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already registered' 
                });
            }

            // Version 1 - plain text password
            // Version 2 will hash with bcrypt
            const newUser = await User.create({
                firstName,
                lastName,
                email,
                password,
                profilePhoto: req.file 
        ? 'http://localhost:5000/uploads/' + req.file.filename 
        : 'default-profile.png'
            });

            // Generate token after signup
            const token = jwt.sign(
                { 
                    id: newUser.id, 
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName
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
                    email: newUser.email
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

    // LOGIN
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email and password are required' 
                });
            }

            const user = await User.findOne({ 
                where: { email } 
            });

            
            console.log("Entered:", email, password);
            console.log("DB:", user?.email, user?.password);

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Version 1 - plain text comparison  
            if (password !== user.password) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid email or password' 
                });
            }

            // Generate token after successful login
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
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
                    email: user.email
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

    // LOGOUT
    logout: async (req, res) => {
        try {
            // Frontend will delete the token from localStorage
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










