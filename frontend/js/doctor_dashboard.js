const API_BASE = 'http://localhost:5000/api';

$(document).ready(function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || localStorage.getItem('role') !== 'doctor') {
        window.location.href = 'index.html';
        return;
    }

    $('#doctorName').text(currentUser.name);
    $('#specialistText').text(currentUser.specialist || 'Medical Professional');

    loadAssignedPatients();

    $('#logoutBtn').on('click', function () {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});

function loadAssignedPatients() {
    $.ajax({
        url: API_BASE + '/patients',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (res) {
            renderPatientCards(res.patients);
        },
        error: function () {
            alert("Failed to load clinical data.");
        }
    });
}

function renderPatientCards(patients) {
    const $grid = $('#patientGrid');
    $grid.empty();

    if (patients.length === 0) {
        $('#emptyState').show();
        return;
    }

    $.each(patients, function (i, p) {
        // Calculate Age
        const dob = new Date(p.dob);
        const age = new Date().getFullYear() - dob.getFullYear();

        const cardHtml = `
            <div class="patient-card">
                <div class="card-header">
                    <h2>${p.legalName}</h2>
                    <span class="patient-id">${p.uniqueId}</span>
                </div>
                
                <div class="card-body">
                    <div class="info-row">
                        <div class="info-item">
                            <label>Gender</label>
                            <span>${p.gender}</span>
                        </div>
                        <div class="info-item">
                            <label>Age</label>
                            <span>${age} Yrs</span>
                        </div>
                        <div class="info-item">
                            <label>Blood Group</label>
                            <span class="blood-badge">${p.bloodGroup || 'N/A'}</span>
                        </div>
                    </div>

                    <div class="info-item" style="padding: 10px 0;">
                        <label>Contact Info</label>
                        <span>${p.contact || 'No contact provided'}</span>
                    </div>

                    <div class="medical-section">
                        <h3>Reason for Visit</h3>
                        <p>${p.reasonForVisit || 'Not specified'}</p>
                    </div>

                    <div class="medical-section">
                        <h3>Medical History</h3>
                        <p>${p.medicalHistory || 'No history recorded'}</p>
                    </div>

                    <div class="medical-section">
                        <h3>Active Medications</h3>
                        <p>${p.medications || 'None'}</p>
                    </div>

                    <div class="medical-section">
                        <h3>Surgical & Social History</h3>
                        <p>${p.surgicalHistory || 'No surgeries'} | ${p.socialHistory || 'No social history'}</p>
                    </div>
                </div>
            </div>
        `;
        $grid.append(cardHtml);
    });
}