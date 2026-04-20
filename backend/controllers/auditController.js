const { Op } = require('sequelize');
const AuditLog = require('../models/auditLogModel');

const auditController = {
    getAuditLogs: async (req, res) => {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(403).json({ success: false, message: 'Restricted: Only Super Admins can view audit trails' });
            }

            const { action, accessType, outcome, entityType, userRole, fromDate, toDate } = req.query;
            const where = {};

            if (action) where.action = action;
            if (accessType) where.accessType = accessType;
            if (outcome) where.outcome = outcome;
            if (entityType) where.entityType = entityType;
            if (userRole) where.userRole = userRole;

            if (fromDate || toDate) {
                where.createdAt = {};
                if (fromDate) where.createdAt[Op.gte] = new Date(`${fromDate}T00:00:00`);
                if (toDate) where.createdAt[Op.lte] = new Date(`${toDate}T23:59:59`);
            }

            const logs = await AuditLog.findAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: 250
            });

            res.json({ success: true, count: logs.length, logs });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to load audit trails', error: error.message });
        }
    }
};

module.exports = auditController;
