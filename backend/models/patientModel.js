const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./userModel');

const Patient = sequelize.define('Patient', {
    legalName: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
    contact: { type: DataTypes.STRING },
    // --- NEW CREDENTIALS FOR PATIENT LOGIN ---
    uniqueId: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'patient' },
    
    // Existing fields for medical audit
    aadhaarNumber: { type: DataTypes.STRING(12) }, 
    bloodGroup: { type: DataTypes.STRING },
    reasonForVisit: { type: DataTypes.TEXT },
    medicalHistory: { type: DataTypes.TEXT },
    medications: { type: DataTypes.TEXT },
    surgicalHistory: { type: DataTypes.TEXT },
    socialHistory: { type: DataTypes.TEXT },
    reportPhoto: { type: DataTypes.STRING },
    
    // --- DATA ISOLATION & RBAC LINKS ---
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    assignedDoctorId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: { model: 'Users', key: 'id' }
    }
});

// Relationships for strict data isolation
Patient.belongsTo(User, { as: 'receptionist', foreignKey: 'createdBy' });
Patient.belongsTo(User, { as: 'doctor', foreignKey: 'assignedDoctorId' });

module.exports = Patient;