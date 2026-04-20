const AuditLog = require('../models/auditLogModel');

function getRetentionDate() {
    const retention = new Date();
    retention.setFullYear(retention.getFullYear() + 7);
    return retention.toISOString().slice(0, 10);
}

function sanitizeBody(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return body || null;
    }

    const clone = { ...body };
    ['password', 'otp', 'otpExpires'].forEach((key) => {
        if (key in clone) clone[key] = '[REDACTED]';
    });

    return clone;
}

async function createAuditLog(payload) {
    try {
        await AuditLog.create({
            userId: payload.userId || null,
            userRole: payload.userRole || null,
            action: payload.action || 'SYSTEM_EVENT',
            accessType: payload.accessType || 'SYSTEM',
            outcome: payload.outcome || 'SUCCESS',
            entityType: payload.entityType || 'System',
            entityId: payload.entityId || null,
            isPhiAccess: Boolean(payload.isPhiAccess),
            accessReason: payload.accessReason || null,
            ipAddress: payload.ipAddress || null,
            userAgent: payload.userAgent || null,
            details: payload.details || null,
            retentionDate: payload.retentionDate || getRetentionDate()
        });
    } catch (error) {
        console.error('Audit log write failed:', error.message);
    }
}

module.exports = {
    createAuditLog,
    sanitizeBody
};
