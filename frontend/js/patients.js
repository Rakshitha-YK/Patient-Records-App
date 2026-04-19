const API_BASE = 'http://localhost:5000/api';

$(document).ready(function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userRole = localStorage.getItem('role');

    if (!currentUser) { window.location.href = 'index.html'; return; }

    $('#userName').text(currentUser.firstName);
    
    // 1. Dynamic Table Header Adjustment
    if (userRole === 'receptionist') {
        // Change headers for Receptionist: #, Name, Gender, Contact, Unique ID, Action
        const headers = `
            <tr>
                <th>#</th>
                <th>Legal Name</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Unique ID</th>
                <th>Action</th>
            </tr>`;
        $('#patientTable thead').html(headers);
    }

    renderPatientList();

    // Logout
    $('#logoutBtn').on('click', function () {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});

// ============================================
// RENDER PATIENT LIST
// ============================================
function renderPatientList() {
    $.ajax({
        url: API_BASE + '/patients',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
        success: function (response) {
            renderPatientTable(response.patients);
        },
        error: function () {
            showToast('Failed to load records.', 'error');
        }
    });
}

function renderPatientTable(patients) {
    const $tbody = $('#patientTableBody');
    const userRole = localStorage.getItem('role');
    $tbody.empty();

    if (patients.length === 0) {
        $('#patientTable').hide();
        $('#emptyState').show();
        return;
    }

    $('#patientTable').show();
    $('#emptyState').hide();

    $.each(patients, function (i, p) {
        const $row = $('<tr>');
        
        if (userRole === 'receptionist') {
            // RECEPTIONIST VIEW: No click event, includes Delete Button
            $row.html(`
                <td>${i + 1}</td>
                <td><strong>${p.legalName}</strong></td>
                <td>${p.gender}</td>
                <td>${p.contact || '—'}</td>
                <td style="color: #4f46e5; font-weight: bold;">${p.uniqueId}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${p.id}">
                        🗑️ Delete
                    </button>
                </td>
            `);
            // row click is NOT added here
        } else {
            // DOCTOR/ADMIN VIEW: Standard clickable row
            $row.html(`
                <td>${i + 1}</td>
                <td>${p.legalName}</td>
                <td>${p.gender}</td>
                <td>${p.contact || '—'}</td>
                <td>${p.uniqueId}</td>
                <td>—</td>
            `);
            $row.on('click', function () { showDashboardView(p.id); });
            $row.css('cursor', 'pointer');
        }

        $tbody.append($row);
    });

    // Handle Delete Button Click
    $('.delete-btn').on('click', function (e) {
        e.stopPropagation(); // Stop any bubble-up events
        const patientId = $(this).data('id');
        if (confirm('Are you sure you want to permanently delete this patient record?')) {
            deletePatient(patientId);
        }
    });
}





function showDashboardView(patientId) {
    const role = localStorage.getItem('role');

    // 1. AJAX fetch for FULL details
    $.ajax({
        url: API_BASE + '/patients/' + patientId,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function (res) {
            currentPatient = res.patient;
            
            $('#listView').addClass('view-hidden');
            $('#dashboardView').removeClass('view-hidden');

            // --- THE ACCESS LOGIC ---
            if (role === 'doctor' || role === 'super_admin') {
                // Doctors see EVERYTHING
                $('#medicalHistoryCard').show();
                $('#reportPhotoCard').show();
                $('#addVisitBtn').show();
                $('#editPatientBtn').show(); 
                console.log("Full Access Granted: Doctor view active.");
            } else {
                // Receptionists remain restricted
                $('#medicalHistoryCard').hide();
                $('#addVisitBtn').hide();
                $('#editPatientBtn').hide();
            }

            renderSummary();
            renderMedicalInfo(); // This will now show the data because the Doctor has it
            renderReportPhoto();
            renderVisits();
        }
    });
}

// ============================================
// DELETE PATIENT LOGIC
// ============================================
function deletePatient(id) {
    $.ajax({
        url: API_BASE + '/patients/' + id,
        type: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
        success: function () {
            showToast('Patient record deleted successfully.', 'success');
            renderPatientList(); // Refresh the table
        },
        error: function (xhr) {
            showToast(xhr.responseJSON.message || 'Delete failed.', 'error');
        }
    });
}

function showToast(msg, type) {
    $('.toast').remove();
    const $toast = $('<div>', { class: 'toast ' + type, text: msg });
    $('body').append($toast);
    setTimeout(function () { $toast.remove(); }, 3000);
}