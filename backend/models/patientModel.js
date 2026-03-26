const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./userModel');

const Patient = sequelize.define('Patient', {
    legalName: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
    contact: { type: DataTypes.STRING },
    bloodGroup: { type: DataTypes.STRING },
    reasonForVisit: { type: DataTypes.TEXT },
    medicalHistory: { type: DataTypes.TEXT },
    medications: { type: DataTypes.TEXT },
    surgicalHistory: { type: DataTypes.TEXT },
    socialHistory: { type: DataTypes.TEXT },
    reportPhoto: { type: DataTypes.STRING }
});

// Relationships
User.hasMany(Patient, { foreignKey: 'userId', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'userId' });

module.exports = Patient;