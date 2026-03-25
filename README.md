# Patient-Records-App 🏥

A patient records management app built with Node.js, Express, MySQL, and jQuery.

> ⚠️ Version 1 — Deliberately insecure for learning purposes!

## Team Members
- Rakshitha
- Rahul
- Yashas
- Vineeth
- Ranjith
- Sougath
- Vivek

## Tech Stack
- Frontend: HTML, CSS, JavaScript, jQuery, AJAX
- Backend: Node.js, Express.js
- Database: MySQL

## Steps to run this project-

### 1. Clone the repository

    Go to a folder where you want the project
        cd Desktop
    Clone the repository
        git clone https://github.com/Rakshitha-YK/Patient-Records-App.git

### 2. Install dependencies
    Go inside the project 
        cd Patient-Records-App
    Install dependencies
        npm install


### 3. Create your branch (IMPORTANT) (please create your branch and don't work on main branch)
git checkout -b feature/your-feature-name 
### example= git checkout -b  feature/login

### 4. Create .env file
Copy .env.example and rename it to .env
Then fill in your own values:

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=patient_records
PORT=5000

### 5. Start the server
node backend/server.js

### 6. Open the app
Go to http://localhost:5000 in your browser


## Project Structure
- frontend/ — View layer (HTML, CSS, JS)
- backend/models/ — Model layer (database queries)
- backend/controllers/ — Controller layer (business logic)
- backend/routes/ — Routes (URL mapping)
- database/ — SQL schema
