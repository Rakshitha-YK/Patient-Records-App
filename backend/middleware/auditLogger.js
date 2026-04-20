const { createAuditLog, sanitizeBody } = require('../utils/auditService');

function inferAccessType(method) {
    if (method === 'POST') return 'CREATE';
    if (method === 'GET') return 'READ';
    if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';
    return 'SYSTEM';
}

function inferAuthAccessType(path, method) {
    if (method !== 'POST') return null;
    if (path.startsWith('/api/auth/login')) return 'LOGIN';
    if (path.startsWith('/api/auth/logout')) return 'LOGOUT';
    return null;
}

function inferEntityType(path) {
    if (path.includes('/patients')) return 'Patient';
    if (path.includes('/users')) return 'User';
    if (path.includes('/auth')) return 'Auth';
    if (path.includes('/audit-logs')) return 'AuditLog';
    if (path.includes('/external')) return 'Registry';
    return 'System';
}

function inferAction(req) {
    const normalized = `${req.method}_${req.path.replace(/\//g, '_')}`
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toUpperCase();

    return normalized || 'SYSTEM_EVENT';
}

function inferAuthAction(req) {
    if (req.method !== 'POST') return null;
    if (req.path.startsWith('/api/auth/login')) return 'USER_LOGIN';
    if (req.path.startsWith('/api/auth/logout')) return 'USER_LOGOUT';
    return null;
}

function inferOutcome(statusCode) {
    if (statusCode >= 200 && statusCode < 400) return 'SUCCESS';
    if (statusCode === 401 || statusCode === 403) return 'DENIED';
    return 'FAILURE';
}

function auditLogger(req, res, next) {
    if (!req.path.startsWith('/api')) {
        return next();
    }

    res.on('finish', async () => {
        if (res.locals && res.locals.auditLogged) {
            return;
        }

        const authAccessType = inferAuthAccessType(req.path, req.method);
        const authAction = inferAuthAction(req);
        const accessType = authAccessType || inferAccessType(req.method);
        const action = authAction || inferAction(req);
        const entityType = inferEntityType(req.path);

        await createAuditLog({
            userId: (res.locals && res.locals.auditUserId) || (req.user ? req.user.id : null),
            userRole: (res.locals && res.locals.auditUserRole) || (req.user ? req.user.role : null),
            action,
            accessType,
            outcome: inferOutcome(res.statusCode),
            entityType,
            entityId: Number(req.params.id) || null,
            isPhiAccess: req.path.includes('/api/patients'),
            accessReason: req.path.includes('/api/patients') ? 'Clinical and administrative record access' : null,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: {
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                requestBody: sanitizeBody(req.body),
                query: req.query
            }
        });
    });

    next();
}

module.exports = auditLogger;
