const path = require('path');
const cors = require('cors');
const express = require('express');
const { connectDB, sequelize } = require('./db');
const User = require('./models/userModel');
const Patient = require('./models/patientModel');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Sync Database
connectDB();
sequelize.sync({ alter: true })
    .then(() => console.log('📂 Models Synced with MySQL'))
    .catch(err => console.log('❌ Sync Error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("API is running");
});