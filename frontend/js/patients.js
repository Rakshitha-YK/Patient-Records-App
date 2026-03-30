// ============================================
// Patients List + Dashboard — patients.js (jQuery + AJAX)
// Aligned with Patients DB schema
// ============================================

const API_BASE = ' http://localhost:5000/api';

var currentPatient = null;
var currentPatientIndex = -1;

$(document).ready(function () {

    // Auth check
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    $('#userName').text(currentUser.firstName);

    // Set profile photo in header
    if (currentUser.profilePhoto && currentUser.profilePhoto !== 'default-profile.png') {
        $('#userProfileImg').attr('src', currentUser.profilePhoto).show();
    } else {
        $('#userProfileImg').hide();
    }

    // Theme
    initTheme();

    // Render patient list
    renderPatientList();

    // ---- Logout ----
    $('#logoutBtn').on('click', function () {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // ---- Back to list ----
    $('#backToList').on('click', function () {
        showListView();
    });

    // ===== VISIT MODAL =====
    $('#addVisitBtn').on('click', function () {
        $('#visitModal').addClass('open');
        $('#visitDate').val(new Date().toISOString().split('T')[0]);
        addMedicineRow();
    });

    $('#closeVisitModal').on('click', function () {
        $('#visitModal').removeClass('open');
        resetVisitForm();
    });

    $('#visitModal').on('click', function (e) {
        if ($(e.target).is('#visitModal')) {
            $(this).removeClass('open');
            resetVisitForm();
        }
    });

    $('#addMedicineBtn').on('click', function () {
        addMedicineRow();
    });

    $('#visitForm').on('submit', function (e) {
        e.preventDefault();
        saveVisit();
    });

    // ===== EDIT MODAL =====
    $('#editPatientBtn').on('click', function () {
        populateEditForm();
        $('#editModal').addClass('open');
    });

    $('#closeEditModal').on('click', function () {
        $('#editModal').removeClass('open');
    });

    $('#editModal').on('click', function (e) {
        if ($(e.target).is('#editModal')) {
            $(this).removeClass('open');
        }
    });

    $('#editForm').on('submit', function (e) {
        e.preventDefault();
        saveEditPatient();
    });

    // Edit Aadhar formatting
    $('#editAadharCard').on('input', function () {
        var val = $(this).val().replace(/\D/g, '').slice(0, 12);
        $(this).val(val.replace(/(\d{4})(?=\d)/g, '$1 '));
    });

    // Edit report file handling
    $('#editReportPhoto').on('change', function () {
        var file = this.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be under 5MB.', 'error');
            $(this).val('');
            return;
        }
        var reader = new FileReader();
        reader.onload = function (ev) {
            currentPatient._pendingReport = ev.target.result;
            $('#editFileName').text(file.name);
            $('#editFilePreview').css('display', 'flex');
        };
        reader.readAsDataURL(file);
    });

    $('#editRemoveFile').on('click', function () {
        currentPatient._pendingReport = '';
        $('#editReportPhoto').val('');
        $('#editFilePreview').hide();
    });

    // ===== DELETE =====
    $('#deletePatientBtn').on('click', function () {
        if (!confirm('Delete this patient and all their visit records?')) return;

        if (API_BASE) {
            $.ajax({
                url: API_BASE + '/patients/' + currentPatient.id,
                type: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
                success: function () {
                    showToast('Patient deleted.', 'success');
                    showListView();
                    renderPatientList();
                },
                error: function (xhr) {
                    var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Delete failed.';
                    showToast(msg, 'error');
                }
            });
        } else {
            var patients = getPatients();
            patients.splice(currentPatientIndex, 1);
            localStorage.setItem('patients', JSON.stringify(patients));
            showToast('Patient deleted.', 'success');
            showListView();
            renderPatientList();
        }
    });
});


// ============================================
// VIEW SWITCHING
// ============================================
function showListView() {
    $('#listView').removeClass('view-hidden');
    $('#dashboardView').addClass('view-hidden');
    currentPatient = null;
    currentPatientIndex = -1;
}

function showDashboardView(patientId) {
    var patients = getPatients();
    var idx = -1;

    $.each(patients, function (i, p) {
        if (p.id === patientId) { idx = i; return false; }
    });

    if (idx === -1) return;

    currentPatient = patients[idx];
    currentPatientIndex = idx;

    $('#listView').addClass('view-hidden');
    $('#dashboardView').removeClass('view-hidden');

    renderSummary();
    renderMedicalInfo();
    renderReportPhoto();
    renderVisits();
}


// ============================================
// PATIENT LIST
// ============================================
function renderPatientList() {
    if (API_BASE) {
        // AJAX fetch patients list
        $.ajax({
            url: API_BASE + '/patients',
            type: 'GET',
            headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
            success: function (response) {
                var patients = response.patients || response;
                localStorage.setItem('patients', JSON.stringify(patients));
                renderPatientTable(patients);
            },
            error: function () {
                showToast('Failed to load patients.', 'error');
            }
        });
    } else {
        renderPatientTable(getPatients());
    }
}

function renderPatientTable(patients) {
    var $tbody = $('#patientTableBody');
    var $emptyState = $('#emptyState');
    var $table = $('#patientTable');

    $tbody.empty();

    if (patients.length === 0) {
        $table.hide();
        $emptyState.show();
        return;
    }

    $table.css('display', 'table');
    $emptyState.hide();

    $.each(patients, function (i, p) {
        var age = p.dob ? calcAge(p.dob) : '—';
        var gc = p.gender === 'Male' ? 'badge-male' : p.gender === 'Female' ? 'badge-female' : 'badge-other';
        var displayName = p.legalName || p.name || '—';
        var displayContact = p.contact || p.phone || '—';
        var displayAadhar = p.aadharCard ? formatAadhar(p.aadharCard) : '—';

        var $row = $('<tr>');
        $row.html(
            '<td>' + (i + 1) + '</td>' +
            '<td>' + esc(displayName) + '</td>' +
            '<td>' + age + '</td>' +
            '<td><span class="badge ' + gc + '">' + p.gender + '</span></td>' +
            '<td>' + esc(displayContact) + '</td>' +
            '<td>' + (p.bloodGroup ? '<span class="badge badge-blood">' + p.bloodGroup + '</span>' : '—') + '</td>' +
            '<td>' + esc(displayAadhar) + '</td>'
        );

        $row.on('click', function () { showDashboardView(p.id); });
        $tbody.append($row);
    });
}


// ============================================
// PATIENT DASHBOARD
// ============================================
function renderSummary() {
    var displayName = currentPatient.legalName || currentPatient.name || 'Patient';
    $('#patientName').text(displayName);

    var age = currentPatient.dob ? calcAge(currentPatient.dob) : '—';
    var displayContact = currentPatient.contact || currentPatient.phone || '—';
    var displayAadhar = currentPatient.aadharCard ? formatAadhar(currentPatient.aadharCard) : '—';

    var data = [
        { label: 'Age', value: age },
        { label: 'Gender', value: currentPatient.gender },
        { label: 'Contact', value: displayContact },
        { label: 'Blood Group', value: currentPatient.bloodGroup || '—' },
        { label: 'Aadhar Card', value: displayAadhar },
        { label: 'Date of Birth', value: currentPatient.dob ? fmtDate(currentPatient.dob) : '—' }
    ];

    var html = '';
    $.each(data, function (i, d) {
        html += '<div class="summary-item"><span class="label">' + d.label + '</span><span class="value">' + esc(String(d.value)) + '</span></div>';
    });
    $('#summaryGrid').html(html);
}

function renderMedicalInfo() {
    var fields = [
        { label: 'Reason for Visit', value: currentPatient.reasonForVisit },
        { label: 'Medical History', value: currentPatient.medicalHistory },
        { label: 'Current Medications', value: currentPatient.medications },
        { label: 'Surgical History', value: currentPatient.surgicalHistory },
        { label: 'Social History', value: currentPatient.socialHistory }
    ];

    var hasAny = false;
    $.each(fields, function (i, f) { if (f.value) { hasAny = true; return false; } });

    if (!hasAny) {
        $('#medicalHistoryCard').hide();
        return;
    }

    $('#medicalHistoryCard').show();

    var html = '';
    $.each(fields, function (i, f) {
        if (f.value) {
            html += '<div class="medical-info-item">' +
                '<span class="medical-info-label">' + f.label + '</span>' +
                '<p class="medical-info-value">' + esc(f.value) + '</p>' +
                '</div>';
        }
    });
    $('#medicalInfoGrid').html(html);
}

function renderReportPhoto() {
    if (!currentPatient.reportPhoto) {
        $('#reportPhotoCard').hide();
        return;
    }

    $('#reportPhotoCard').show();
    var $container = $('#reportPreviewContainer');

    if (currentPatient.reportPhoto.indexOf('data:image') === 0) {
        $container.html('<img src="' + currentPatient.reportPhoto + '" class="report-preview-img" alt="Patient Report" />');
    } else if (currentPatient.reportPhoto.indexOf('data:application/pdf') === 0) {
        $container.html('<div class="report-pdf-badge">📄 PDF Report Uploaded</div>');
    } else {
        $container.html('<div class="report-pdf-badge">📎 Report Attached</div>');
    }
}

function renderVisits() {
    var visits = currentPatient.visits || [];
    var $container = $('#visitList');
    var $emptyVisits = $('#emptyVisits');

    $container.empty();

    if (visits.length === 0) {
        $emptyVisits.show();
        return;
    }
    $emptyVisits.hide();

    // Newest first
    var reversed = visits.slice().reverse();
    $.each(reversed, function (i, v) {
        var rxHtml = '';
        if (v.prescriptions && v.prescriptions.length > 0) {
            rxHtml = '<table class="prescription-table"><thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Instructions</th></tr></thead><tbody>';
            $.each(v.prescriptions, function (j, rx) {
                rxHtml += '<tr><td>' + esc(rx.medicine) + '</td><td>' + esc(rx.dosage) + '</td><td>' + esc(rx.duration) + '</td><td>' + esc(rx.instructions) + '</td></tr>';
            });
            rxHtml += '</tbody></table>';
        } else {
            rxHtml = '<p style="font-size:0.82rem;color:var(--text-muted);">No prescriptions.</p>';
        }

        var $card = $('<div>', { class: 'visit-card' });
        $card.html(
            '<div class="visit-card-header">' +
            '<span class="date">' + fmtDate(v.date) + '</span>' +
            '<span class="doctor">' + esc(v.doctor) + '</span>' +
            '</div>' +
            '<div class="diagnosis">' + esc(v.diagnosis) + '</div>' +
            '<div class="symptoms">' + esc(v.symptoms) + '</div>' +
            '<div class="visit-details" id="vd-' + i + '">' +
            (v.notes ? '<div class="notes">"' + esc(v.notes) + '"</div>' : '') +
            '<p class="section-label" style="margin-top:0.5rem;">Prescription</p>' +
            rxHtml +
            '</div>'
        );

        $card.on('click', function () {
            $('#vd-' + i).toggleClass('open');
        });

        $container.append($card);
    });
}


// ============================================
// ADD VISIT
// ============================================
function addMedicineRow() {
    var $container = $('#medicineRows');
    var idx = $container.children().length;

    var $row = $('<div>', { class: 'medicine-row' });
    $row.html(
        '<div class="form-group">' + (idx === 0 ? '<label>Medicine</label>' : '') +
        '<input type="text" placeholder="Medicine name" class="med-name" required /></div>' +
        '<div class="form-group">' + (idx === 0 ? '<label>Dosage</label>' : '') +
        '<input type="text" placeholder="e.g. 500mg" class="med-dosage" /></div>' +
        '<div class="form-group">' + (idx === 0 ? '<label>Duration</label>' : '') +
        '<input type="text" placeholder="e.g. 5 days" class="med-duration" /></div>' +
        '<div class="form-group">' + (idx === 0 ? '<label>Instructions</label>' : '') +
        '<input type="text" placeholder="e.g. After meals" class="med-instructions" /></div>' +
        '<button type="button" class="btn btn-danger btn-icon remove-med" title="Remove"' +
        (idx === 0 ? ' style="visibility:hidden"' : '') + '>✕</button>'
    );

    $row.find('.remove-med').on('click', function () { $row.remove(); });
    $container.append($row);
}

function saveVisit() {
    var date = $('#visitDate').val();
    var doctor = $.trim($('#doctorName').val());
    var symptoms = $.trim($('#symptoms').val());
    var diagnosis = $.trim($('#diagnosis').val());
    var notes = $.trim($('#visitNotes').val());

    if (!date || !doctor || !symptoms || !diagnosis) {
        showToast('Please fill required visit fields.', 'error');
        return;
    }

    var prescriptions = [];
    $('.medicine-row').each(function () {
        var med = $.trim($(this).find('.med-name').val());
        if (med) {
            prescriptions.push({
                medicine: med,
                dosage: $.trim($(this).find('.med-dosage').val()) || '—',
                duration: $.trim($(this).find('.med-duration').val()) || '—',
                instructions: $.trim($(this).find('.med-instructions').val()) || '—'
            });
        }
    });

    var visitData = { date: date, doctor: doctor, symptoms: symptoms, diagnosis: diagnosis, notes: notes, prescriptions: prescriptions };

    if (API_BASE) {
        $.ajax({
            url: API_BASE + '/patients/' + currentPatient.id + '/visits',
            type: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
            data: JSON.stringify(visitData),
            success: function () {
                if (!currentPatient.visits) currentPatient.visits = [];
                currentPatient.visits.push(visitData);
                $('#visitModal').removeClass('open');
                resetVisitForm();
                renderVisits();
                showToast('Visit saved!', 'success');
            },
            error: function (xhr) {
                var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Failed to save visit.';
                showToast(msg, 'error');
            }
        });
    } else {
        if (!currentPatient.visits) currentPatient.visits = [];
        currentPatient.visits.push(visitData);
        currentPatient.updatedAt = new Date().toISOString();
        persistPatient();
        $('#visitModal').removeClass('open');
        resetVisitForm();
        renderVisits();
        showToast('Visit saved!', 'success');
    }
}

function resetVisitForm() {
    $('#visitForm')[0].reset();
    $('#medicineRows').empty();
}


// ============================================
// EDIT PATIENT
// ============================================
function populateEditForm() {
    $('#editLegalName').val(currentPatient.legalName || currentPatient.name || '');
    $('#editGender').val(currentPatient.gender);
    $('#editDob').val(currentPatient.dob || '');
    $('#editContact').val(currentPatient.contact || currentPatient.phone || '');
    $('#editAadharCard').val(currentPatient.aadharCard ? formatAadhar(currentPatient.aadharCard) : '');
    $('#editBloodGroup').val(currentPatient.bloodGroup || '');
    $('#editReasonForVisit').val(currentPatient.reasonForVisit || '');
    $('#editMedicalHistory').val(currentPatient.medicalHistory || '');
    $('#editMedications').val(currentPatient.medications || '');
    $('#editSurgicalHistory').val(currentPatient.surgicalHistory || '');
    // Parse social history
    var sh = currentPatient.socialHistory || '';
    var fields = ['smoking', 'alcohol', 'drugs', 'exercise', 'diet', 'caffeine'];
    fields.forEach(function (f) { $('input[name="edit_sh_' + f + '"][value="No"]').prop('checked', true); });

    if (sh) {
        var parts = sh.split(', ');
        parts.forEach(function (part) {
            var kv = part.split(': ');
            if (kv.length === 2) {
                var key = kv[0].toLowerCase();
                var val = kv[1] === 'Sometimes' ? 'No' : kv[1]; // mapping old 'Sometimes' to 'No'
                var $radio = $('input[name="edit_sh_' + key + '"][value="' + val + '"]');
                if ($radio.length) $radio.prop('checked', true);
            }
        });
    }

    // Report file preview
    if (currentPatient.reportPhoto) {
        $('#editFileName').text('Report attached');
        $('#editFilePreview').css('display', 'flex');
    } else {
        $('#editFilePreview').hide();
    }
    currentPatient._pendingReport = undefined;
}

function saveEditPatient() {
    var legalName = $.trim($('#editLegalName').val());
    var gender = $('#editGender').val();
    var dob = $('#editDob').val();
    var contact = $.trim($('#editContact').val());
    var aadharCard = $('#editAadharCard').val().replace(/\s/g, '');

    if (!legalName || !gender || !dob) {
        showToast('Please fill required fields (Name, Gender, DOB).', 'error');
        return;
    }

    if (aadharCard && aadharCard.length !== 12) {
        showToast('Aadhar card number must be 12 digits.', 'error');
        return;
    }

    var shSmoking = $('input[name="edit_sh_smoking"]:checked').val() || 'No';
    var shAlcohol = $('input[name="edit_sh_alcohol"]:checked').val() || 'No';
    var shDrugs = $('input[name="edit_sh_drugs"]:checked').val() || 'No';
    var shExercise = $('input[name="edit_sh_exercise"]:checked').val() || 'No';
    var shDiet = $('input[name="edit_sh_diet"]:checked').val() || 'No';
    var shCaffeine = $('input[name="edit_sh_caffeine"]:checked').val() || 'No';
    var socialHistoryStr = `Smoking: ${shSmoking}, Alcohol: ${shAlcohol}, Drugs: ${shDrugs}, Exercise: ${shExercise}, Diet: ${shDiet}, Caffeine: ${shCaffeine}`;

    var updatedData = {
        legalName: legalName,
        gender: gender,
        dob: dob,
        contact: contact,
        aadharCard: aadharCard,
        bloodGroup: $('#editBloodGroup').val(),
        reasonForVisit: $.trim($('#editReasonForVisit').val()),
        medicalHistory: $.trim($('#editMedicalHistory').val()),
        medications: $.trim($('#editMedications').val()),
        surgicalHistory: $.trim($('#editSurgicalHistory').val()),
        socialHistory: socialHistoryStr
    };

    if (API_BASE) {
        // AJAX PUT/PATCH to update patient
        var formData = new FormData();
        $.each(updatedData, function (key, val) {
            formData.append(key, val);
        });

        var fileInput = $('#editReportPhoto')[0];
        if (fileInput.files[0]) {
            formData.append('reportPhoto', fileInput.files[0]);
        }

        $.ajax({
            url: API_BASE + '/patients/' + currentPatient.id,
            type: 'PUT',
            data: formData,
            processData: false,
            contentType: false,
            headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
            success: function (response) {
                // Merge response into currentPatient
                $.extend(currentPatient, response.patient || updatedData);
                currentPatient.updatedAt = new Date().toISOString();
                persistPatient();
                renderSummary();
                renderMedicalInfo();
                renderReportPhoto();
                renderPatientList();
                $('#editModal').removeClass('open');
                showToast('Patient updated!', 'success');
            },
            error: function (xhr) {
                var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Update failed.';
                showToast(msg, 'error');
            }
        });
    } else {
        // localStorage fallback
        $.extend(currentPatient, updatedData);
        currentPatient.name = legalName; // backward compat
        currentPatient.phone = contact;  // backward compat
        currentPatient.updatedAt = new Date().toISOString();

        // Handle report photo update
        if (currentPatient._pendingReport !== undefined) {
            currentPatient.reportPhoto = currentPatient._pendingReport;
        }
        delete currentPatient._pendingReport;

        persistPatient();
        renderSummary();
        renderMedicalInfo();
        renderReportPhoto();
        renderPatientList();
        $('#editModal').removeClass('open');
        showToast('Patient updated!', 'success');
    }
}


// ============================================
// HELPERS
// ============================================
function getPatients() {
    return JSON.parse(localStorage.getItem('patients') || '[]');
}

function persistPatient() {
    var patients = getPatients();
    patients[currentPatientIndex] = currentPatient;
    localStorage.setItem('patients', JSON.stringify(patients));
}

function calcAge(dob) {
    var b = new Date(dob), t = new Date();
    var a = t.getFullYear() - b.getFullYear();
    var m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return a;
}

function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatAadhar(val) {
    if (!val) return '';
    var clean = val.replace(/\D/g, '');
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function esc(s) {
    return $('<div>').text(s).html();
}

function initTheme() {
    var $btn = $('#themeToggle');
    if (!$btn.length) return;

    var saved = localStorage.getItem('theme');
    if (saved) {
        $('html').attr('data-theme', saved);
        $btn.text(saved === 'dark' ? '☀️' : '🌙');
    } else {
        $btn.text(window.matchMedia('(prefers-color-scheme: dark)').matches ? '☀️' : '🌙');
    }

    $btn.on('click', function () {
        var cur = $('html').attr('data-theme');
        var isDark = cur === 'dark' || (!cur && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var next = isDark ? 'light' : 'dark';
        $('html').attr('data-theme', next);
        localStorage.setItem('theme', next);
        $(this).text(next === 'dark' ? '☀️' : '🌙');
    });
}

// ---- Toast Notification ----
function showToast(msg, type) {
    $('.toast').remove();
    var $toast = $('<div>', { class: 'toast ' + type, text: msg });
    $('body').append($toast);
    setTimeout(function () { $toast.remove(); }, 3000);
}
