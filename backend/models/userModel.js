const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    // --- NEW FIELD FOR SYSTEM LOGIN ---
    uniqueId: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    specialist: { type: DataTypes.STRING, allowNull: true },
    profilePhoto: { type: DataTypes.STRING },
    role: {
        type: DataTypes.ENUM('super_admin', 'doctor', 'receptionist'),
        allowNull: false,
        defaultValue: 'doctor'
    },
    nmcId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    // Storing for verification as per HIPAA/Audit requirements
    aadhaarNumber: { type: DataTypes.STRING(12) },
    otp: { type: DataTypes.STRING },
    otpExpires: { type: DataTypes.DATE }
});

module.exports = User;
