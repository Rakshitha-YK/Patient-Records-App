## **1. Implementation Summary (This Week)**

This week, the platform was developed from a static login page into a fully functional, role-based healthcare management system.

* **Universal Auth Gate**: Implemented a single entry point for all users (Admin, Doctor, Receptionist, Patient) using system-generated unique IDs and JWT tokens for session security.
* **Administrative Onboarding**: Removed public registration to ensure only verified staff can access the system; Admins create staff, and staff create patients.
* **Personnel Management**: Built the Admin logic to register Doctors and Receptionists, including automated credential generation.
* **Receptionist & Privacy Wall**: Created a patient onboarding flow where Receptionists register patients and assign doctors. A "Privacy Lock" ensures Receptionists only see contact info—medical data is strictly hidden.
* **Doctor’s Clinical Dashboard**: Designed a high-impact "Medical Card" grid where doctors have full clinical access to the medical histories of their assigned patients.
* **Patient Portal**: Finalized a secure view for patients to log in with their generated **PAT ID** to see their personal records and assigned doctor's details.
* **Backend RBAC**: Secured all endpoints using Role-Based Access Control (RBAC) and Sequelize logic to prevent unauthorized data access.

---

## **2. How to Run the Project**

### **Step 1: Database Setup**
1.  Open your MySQL terminal or Workbench.
2.  Create the database: `CREATE DATABASE healthcare_db;`.
3.  The system uses Sequelize `alter: true`, so all tables will be generated automatically on the first launch.

### **Step 2: Backend Configuration**
1.  Navigate to the `/backend` folder.
2.  Create a file named **`.env`** and add your credentials:
    ```env
    PORT=5000
    DB_NAME=healthcare_db
    DB_USER=your_username
    DB_PASS=your_password
    DB_HOST=localhost
    JWT_SECRET=trust_no_one_123
    ```

### **Step 3: Installation & Launch**
1.  Open your terminal in the `/backend` folder.
2.  Install dependencies: `npm install`.
3.  Start the server: `node server.js`.
4.  Wait for the message: `📂 Models Synced with MySQL`.


### **5. Manual SQL Command for Super Admin**

Open your MySQL terminal or Workbench, ensure you are using the correct database, and run this command:

```sql
INSERT INTO Users (firstName, lastName, email, role, uniqueId, password, createdAt, updatedAt)
VALUES (
    'Main', 
    'Admin', 
    'admin@trustworthy.com', 
    'super_admin', 
    'ADM101', 
    'admin123', 
    NOW(), 
    NOW()
);
```


### **Step 4: Accessing the App**
1.  Go to the `/frontend` folder.
2.  Open **`index.html`** using a local server (like VS Code **Live Server**).
3.  Log in as a Super Admin to start adding staff and patients.



#### **Audit logging & compliance**

This week, the system was enhanced with a comprehensive audit logging and compliance tracking mechanism, transforming it into a security-aware healthcare platform.

* **Centralized Audit Logging**: Implemented a global logging system that automatically records all `/api/*` requests, capturing user actions, access types, outcomes, and affected entities.
* **Authentication Event Tracking**: Added explicit logging for login flows, including invalid payloads, failed attempts, successful logins, and logout events to ensure accurate security monitoring.
* **PHI Access Identification**: Introduced a PHI (Protected Health Information) flag to identify when patient-related data is accessed, enabling compliance-focused filtering.
* **Request Data Sanitization**: Sensitive fields such as passwords and OTPs are automatically redacted before being stored in audit logs.
* **Retention Policy Enforcement**: Each audit log includes a retention date (default: 7 years) to support long-term compliance and recordkeeping.
* **Super Admin Audit Dashboard**: Developed a dedicated audit console for Super Admins with filtering, summary statistics, and detailed log viewing.
* **Role-Based Access Control for Logs**: Restricted audit log access strictly to Super Admin users via backend RBAC enforcement.
* **Entity-Based Tracking**: Logs intelligently classify actions by entity type (Patient, User, Auth, System, etc.) for better traceability.
* **Outcome Classification**: Implemented structured outcomes (SUCCESS, FAILURE, DENIED) based on HTTP responses.
