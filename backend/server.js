require('dotenv').config(); // MUST be at the very top
const path = require('path');
const cors = require('cors');
const express = require('express');
const { connectDB, sequelize } = require('./db');
const User = require('./models/userModel');
const Patient = require('./models/patientModel');
const AuditLog = require('./models/auditLogModel');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const registryController = require('./controllers/registryController');
const userRoutes = require('./routes/userRoutes');
const auditRoutes = require('./routes/auditRoutes');
const auditLogger = require('./middleware/auditLogger');

const app = express(); // Define app BEFORE using it

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(auditLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditRoutes);


// --- Your External API Mock Endpoint ---
app.get('/api/external/nmc-check/:id', registryController.verifyDoctor);



// Patient.belongsTo(User, { as: 'doctor', foreignKey: 'assignedDoctorId' });
// User.hasMany(Patient, { foreignKey: 'assignedDoctorId' });
// Sync Database
connectDB();
sequelize.sync({ alter: true })
    .then(() => console.log('📂 Models Synced with MySQL'))
    .catch(err => console.log('❌ Sync Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

app.get("/", (req, res) => {
    res.send("API is running");
});
