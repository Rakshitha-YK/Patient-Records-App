const express = require('express');
const { connectDB, sequelize } = require('./db');
const User = require('./models/userModel');
const Patient = require('./models/patientModel');
require('dotenv').config();

const app = express();
app.use(express.json());

// Sync Database
connectDB();
sequelize.sync({ alter: true })
    .then(() => console.log('📂 Models Synced with MySQL'))
    .catch(err => console.log('❌ Sync Error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));