const API_BASE = 'http://localhost:5000/api';

$(document).ready(function () {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // Security Guard: Only allow patients here
    if (!token || role !== 'patient') {
        window.location.href = 'index.html';
        return;
    }

    // Load Profile
    $.ajax({
        url: API_BASE + '/patients/me',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function (res) {
            const p = res.patient;

            // Map Patient Details
            $('#pName').text(p.legalName);
            $('#pId').text(p.uniqueId);
            $('#pGender').text(p.gender);
            $('#pBlood').text(p.bloodGroup || 'Not Specified');
            $('#pDob').text(new Date(p.dob).toLocaleDateString());
            $('#pHistory').text(p.medicalHistory || 'No medical history found in your records.');

            // Map Doctor Details
            if (p.doctor) {
                $('#docName').text(`${p.doctor.firstName} ${p.doctor.lastName}`);
                $('#docId').text(p.doctor.uniqueId);
                $('#docSpecialty').text(p.doctor.specialist);
            } else {
                $('#docName').text('Pending Assignment');
                $('#docId').text('—');
                $('#docSpecialty').text('General Consultation');
            }
        },
        error: function (xhr) { // Added 'xhr' here so it's defined!
            console.error("DEBUG ERROR:", xhr);
            if (xhr.status === 404) {
                alert("Route not found. Make sure /me is above /:id in patientRoutes.js");
            } else {
                alert("Your session has expired. Please log in again.");
                localStorage.clear();
                window.location.href = 'index.html';
            }
        }
    });

    $('#logoutBtn').on('click', function () {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});
