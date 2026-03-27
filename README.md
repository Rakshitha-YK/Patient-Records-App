# 🏥 Trustworthy - Medical Patient Management
### 📂 Branch: `feature/database-and-models`
**Owner:** Sougata Nandy 
This branch contains the **Data Layer** for the Trustworthy application. I have initialized the MySQL connection using **Sequelize ORM** and defined the core models for Users and Patients.

---

## 🛠️ Database Setup (For Team Members)
Before you start working on your controllers, please sync your local database:

1. **Import Schema:** Open your MySQL terminal/Workbench and run the script found in `/database/schema.sql`.
2. **Update Environment Variables:** 
3. **Install Dependencies:** Run `npm install` to ensure you have `sequelize`, `mysql2`, and `dotenv`.

---

## 🏗️ Architecture & Models
I have implemented the **MVC (Model-View-Controller)** pattern. You can now interact with the database using JavaScript objects instead of raw SQL.

### 1. User Model (`backend/models/userModel.js`)
Handles medical staff registration and authentication.
* **Fields:** `firstName`, `lastName`, `email`, `password`, `otp`, `otpExpires`.

### 2. Patient Model (`backend/models/patientModel.js`)
Handles the clinical records added by doctors.
* **Fields:** `legalName`, `dob`, `gender`, `contact`, `bloodGroup`, `medicalHistory`, etc.
* **Relationship:** **One-to-Many**. One User can own many Patient records.
* **Security:** `ON DELETE CASCADE` is active. If a User account is deleted, all their patients are automatically wiped.



---

## 🚀 How to use in your Controllers
To use these models in your assigned tasks (Auth/Patients), simply import them:

```javascript
const User = require('../models/userModel');
const Patient = require('../models/patientModel');

// Example: Finding a user
const user = await User.findOne({ where: { email: 'doctor@clinic.com' } });

// Example: Creating a patient record linked to a doctor
await Patient.create({
    legalName: "Jane Doe",
    userId: req.user.id // Use the logged-in user's ID
});
```

---

## 🏁 Progress Checklist
- [x] MySQL Connection Setup (`db.js`)
- [x] Sequelize User Model defined
- [x] Sequelize Patient Model defined (with Foreign Key)
- [x] Server-side DB Sync logic implemented
- [x] Cascading Delete functionality verified

---

### 💡 Note to Reviewers
Please ensure your local MySQL service is running before starting the server. If you modify the models, let me know so I can update the `schema.sql`.
