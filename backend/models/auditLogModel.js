const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const AuditLog = sequelize.define('AuditLog', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userRole: {
        type: DataTypes.STRING,
        allowNull: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accessType: {
        type: DataTypes.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SYSTEM'),
        allowNull: false
    },
    outcome: {
        type: DataTypes.ENUM('SUCCESS', 'FAILURE', 'DENIED'),
        allowNull: false,
        defaultValue: 'SUCCESS'
    },
    entityType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isPhiAccess: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    accessReason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true
    },
    retentionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'AuditLogs',
    updatedAt: false
});

module.exports = AuditLog;
