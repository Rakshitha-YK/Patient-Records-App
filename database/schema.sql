CREATE DATABASE IF NOT EXISTS patient_records_db;
USE patient_records_db;

-- Users table for Medical Staff
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profilePhoto VARCHAR(255) DEFAULT 'default-profile.png',
    role ENUM('super_admin', 'doctor', 'receptionist') NOT NULL DEFAULT 'doctor',
    nmcId VARCHAR(255) UNIQUE NULL,
    aadhaarNumber VARCHAR(12),
    otp VARCHAR(10),
    otpExpires DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients table with Foreign Key to Users
CREATE TABLE IF NOT EXISTS Patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    legalName VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    contact VARCHAR(20),
    aadhaarNumber VARCHAR(12),
    bloodGroup VARCHAR(5),
    reasonForVisit TEXT,
    medicalHistory TEXT,
    medications TEXT,
    surgicalHistory TEXT,
    socialHistory TEXT,
    reportPhoto VARCHAR(255),
    createdBy INT NOT NULL,
    assignedDoctorId INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id),
    FOREIGN KEY (assignedDoctorId) REFERENCES Users(id)
);


CREATE TABLE IF NOT EXISTS AuditLogs (
    id              INT AUTO_INCREMENT PRIMARY KEY,

    -- WHO performed the action
    userId          INT NULL,
    userRole        VARCHAR(50) NULL,

    -- WHAT was done
    action          VARCHAR(100) NOT NULL,
    accessType      ENUM('CREATE','READ','UPDATE','DELETE','LOGIN','LOGOUT','SYSTEM') NOT NULL,
    outcome         ENUM('SUCCESS','FAILURE','DENIED') NOT NULL DEFAULT 'SUCCESS',

    -- WHICH data was affected
    entityType      VARCHAR(50) NOT NULL,
    entityId        INT NULL,

    -- PHI Tracking
    isPhiAccess     TINYINT(1) NOT NULL DEFAULT 0,
    accessReason    VARCHAR(255) NULL,

    -- SOURCE details
    ipAddress       VARCHAR(45) NULL,
    userAgent       VARCHAR(500) NULL,

    -- BEFORE/AFTER state
    details         JSON NULL,

    -- TIME and RETENTION
    createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    retentionDate   DATE NOT NULL,

    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL
    -- NOTE: No updatedAt column by design — records should NEVER change
);



DELIMITER $$

-- Prevent any row from being deleted
DROP TRIGGER IF EXISTS prevent_auditlog_delete$$
CREATE TRIGGER prevent_auditlog_delete
BEFORE DELETE ON AuditLogs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[SECURITY] AuditLogs are immutable. DELETE operations are forbidden.';
END$$

-- Prevent any row from being updated
DROP TRIGGER IF EXISTS prevent_auditlog_update$$
CREATE TRIGGER prevent_auditlog_update
BEFORE UPDATE ON AuditLogs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '[SECURITY] AuditLogs are immutable. UPDATE operations are forbidden.';
END$$

DELIMITER ;
