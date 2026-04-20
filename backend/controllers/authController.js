const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const { createAuditLog } = require('../utils/auditService');

const authController = {
    login: async (req, res) => {
        try {
            const { uniqueId, password } = req.body;

            if (!uniqueId || !password) {
                await createAuditLog({
                    action: 'LOGIN_ATTEMPT_INVALID_PAYLOAD',
                    accessType: 'LOGIN',
                    outcome: 'FAILURE',
                    entityType: 'Auth',
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    details: { uniqueId: uniqueId || null }
                });
                res.locals.auditLogged = true;
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
                await createAuditLog({
                    userId: account ? account.id : null,
                    userRole: account ? account.role : null,
                    action: 'USER_LOGIN_FAILURE',
                    accessType: 'LOGIN',
                    outcome: 'FAILURE',
                    entityType: isStaff ? 'User' : 'Patient',
                    entityId: account ? account.id : null,
                    isPhiAccess: !isStaff,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    details: { uniqueId }
                });
                res.locals.auditLogged = true;
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

            await createAuditLog({
                userId: account.id,
                userRole: account.role,
                action: 'USER_LOGIN_SUCCESS',
                accessType: 'LOGIN',
                outcome: 'SUCCESS',
                entityType: isStaff ? 'User' : 'Patient',
                entityId: account.id,
                isPhiAccess: !isStaff,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                details: { uniqueId }
            });
            res.locals.auditLogged = true;
            res.locals.auditUserId = account.id;
            res.locals.auditUserRole = account.role;

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
        await createAuditLog({
            action: 'USER_LOGOUT',
            accessType: 'LOGOUT',
            outcome: 'SUCCESS',
            entityType: 'Auth',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        res.locals.auditLogged = true;
        res.json({ success: true, message: 'Logged out successfully' });
    }
};

module.exports = authController;
