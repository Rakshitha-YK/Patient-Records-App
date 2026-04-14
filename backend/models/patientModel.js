// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../db');
// const User = require('./userModel');

// const Patient = sequelize.define('Patient', {
//     legalName: { type: DataTypes.STRING, allowNull: false },
//     dob: { type: DataTypes.DATEONLY, allowNull: false },
//     gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
//     contact: { type: DataTypes.STRING },
//     aadhaarNumber: { type: DataTypes.STRING(12) },
//     bloodGroup: { type: DataTypes.STRING },
//     reasonForVisit: { type: DataTypes.TEXT },
//     medicalHistory: { type: DataTypes.TEXT },
//     medications: { type: DataTypes.TEXT },
//     surgicalHistory: { type: DataTypes.TEXT },
//     socialHistory: { type: DataTypes.TEXT },
//     reportPhoto: { type: DataTypes.STRING }
// });

// // Relationships
// User.hasMany(Patient, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Patient.belongsTo(User, { foreignKey: 'userId' });

// module.exports = Patient;



const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./userModel');

const Patient = sequelize.define('Patient', {
    legalName: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
    contact: { type: DataTypes.STRING },
    aadhaarNumber: { type: DataTypes.STRING(12) }, // Redacted in output
    bloodGroup: { type: DataTypes.STRING },
    reasonForVisit: { type: DataTypes.TEXT },
    medicalHistory: { type: DataTypes.TEXT },
    medications: { type: DataTypes.TEXT },
    surgicalHistory: { type: DataTypes.TEXT },
    socialHistory: { type: DataTypes.TEXT },
    reportPhoto: { type: DataTypes.STRING },
    
    // --- NEW FIELDS FOR DATA ISOLATION ---
    
    // Tracks which Receptionist added this patient
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
    },
    
    // Tracks which Doctor is assigned to this patient
    assignedDoctorId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null until a doctor is assigned
        references: { model: 'Users', key: 'id' }
    }
});

// Relationships
// We use 'as' (aliases) to distinguish between the two different User links
Patient.belongsTo(User, { as: 'receptionist', foreignKey: 'createdBy' });
Patient.belongsTo(User, { as: 'doctor', foreignKey: 'assignedDoctorId' });

module.exports = Patient;