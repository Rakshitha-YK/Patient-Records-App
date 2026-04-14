// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../db');

// const User = sequelize.define('User', {
//     firstName: { type: DataTypes.STRING, allowNull: false },
//     lastName: { type: DataTypes.STRING, allowNull: false },
//     email: { type: DataTypes.STRING, allowNull: false, unique: true },
//     password: { type: DataTypes.STRING, allowNull: false },
//     profilePhoto: { type: DataTypes.STRING },
//     aadhaarNumber: { type: DataTypes.STRING(12) },
//     otp: { type: DataTypes.STRING },
//     otpExpires: { type: DataTypes.DATE }
// });

// module.exports = User;



const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    profilePhoto: { type: DataTypes.STRING },
    // Role can be 'super_admin', 'doctor', or 'receptionist'
    role: { 
        type: DataTypes.ENUM('super_admin', 'doctor', 'receptionist'), 
        allowNull: false,
        defaultValue: 'doctor' 
    },
    // Only used for Doctors
    nmcId: { 
        type: DataTypes.STRING, 
        allowNull: true, 
        unique: true 
    },
    // We can keep this for other verification if needed
    aadhaarNumber: { type: DataTypes.STRING(12) },
    otp: { type: DataTypes.STRING },
    otpExpires: { type: DataTypes.DATE }
});

module.exports = User;