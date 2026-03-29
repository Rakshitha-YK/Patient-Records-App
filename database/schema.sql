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
    otp VARCHAR(10),
    otpExpires DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients table with Foreign Key to Users
CREATE TABLE IF NOT EXISTS Patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
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
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
