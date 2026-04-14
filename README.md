Yo, listen up team! 
---

### 🚀 How to Run (Don't mess this up)

1.  **Clone it:** You know the drill.
2.  **Get into the backend:** `cd backend`. If you try to run it from the root, it’s going to scream at you with a "Module Not Found" error. Don't say I didn't warn you.
3.  **Install the internet:** Run `npm install`. If **axios** acts like a brat, run `npm install axios` manually.
4.  **The `.env` struggle:** Create a .env file in the backend folder. Add your MySQL credentials and a JWT_SECRET that’s actually hard to guess (not "123456").
5.  **SQL Magic:** Just start the server with `node server.js`. Sequelize is set to `alter: true`, so it'll fix the database tables for you automatically.

---

### 🔑 The "God Mode" (Super Admin) Entrance

We don't let just anyone be an Admin. It's a secret club.
* **Step 1:** You can't sign up as Admin. You have to "hack" yourself in via MySQL Workbench. Run this:
    ```sql
    INSERT INTO Users (firstName, lastName, email, password, role, createdAt, updatedAt) 
    VALUES ('System', 'Admin', 'admin@trustworthy.com', 'admin123', 'super_admin', NOW(), NOW());
    ```
* **Step 2:** Go to the login page and hit **'A' + 'L'** at the same time. The page will transform like a Transformer. Use the email/pass from Step 1 to get in.

---

### 🩺 Doctor Registration (The "No Fakes" Zone)

Doctors have to prove they actually went to med school.
* **NMC ID Check:** On the signup page, a doctor MUST enter their **NMC ID** first.
* **Real-time Roast:** Our app calls a separate "National Registry" API I built. If the ID isn't in my mock list, they get kicked out.
* **Try these:** Use `NMC12345` or `NMC67890`. If the ID is legit, the app will auto-fill their name like magic. Then they can set a password.

---

### 🛡️ Cool Stuff I Added (Why Our App is Smarter Than Your Ex)

* **Portal Isolation:** Admins and Staff live in two different worlds. If an Admin tries to use the front door, the app says "Not today, honey."
* **HIPAA & OWASP Vibes:** We’re keeping patient data locked down tighter than a vault. No hackers allowed in this house.
* **Data Jealousy:** Receptionists only see the patients *they* brought to the party. Doctors only see the patients assigned to *them*. No peeking at each other's homework!
