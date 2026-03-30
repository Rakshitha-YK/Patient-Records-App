// ============================================
// Create Patient — create-patient.js (jQuery + AJAX)
// Aligned with Patients DB schema
// ============================================
console.log("CREATE PATIENT JS LOADED");
const API_BASE = 'http://localhost:5000/api'; 

$(document).ready(function () {
     console.log("JS LOADED ✅");

    // Auth check
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    var selectedFileData = null;

    // ---- Aadhar card formatting (auto-space every 4 digits) ----
    $('#aadharCard').on('input', function () {
        var val = $(this).val().replace(/\D/g, '').slice(0, 12);
        $(this).val(val.replace(/(\d{4})(?=\d)/g, '$1 '));
    });

    // ---- File Upload handling ----
    $('#reportPhoto').on('change', function () {
        var file = this.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be under 5MB.', 'error');
            $(this).val('');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            selectedFileData = e.target.result;
            $('#fileName').text(file.name);
            $('#filePreview').css('display', 'flex');
            $('#fileUploadDisplay').hide();
        };
        reader.readAsDataURL(file);
    });

    $('#removeFile').on('click', function () {
        selectedFileData = null;
        $('#reportPhoto').val('');
        $('#filePreview').hide();
        $('#fileUploadDisplay').css('display', 'flex');
    });

    // ---- Form Submit ----
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();
        

        var legalName = $.trim($('#legalName').val());
        var gender = $('#gender').val();
        var dob = $('#dob').val();
        var contact = $.trim($('#contact').val());
        var aadharCard = $('#aadharCard').val().replace(/\s/g, '');
        var bloodGroup = $('#bloodGroup').val();
        var reasonForVisit = $.trim($('#reasonForVisit').val());
        var medicalHistory = $.trim($('#medicalHistory').val());
        var medications = $.trim($('#medications').val());
        var surgicalHistory = $.trim($('#surgicalHistory').val());
        
        // Collect social history from radio buttons
        var shSmoking = $('input[name="sh_smoking"]:checked').val() || 'No';
        var shAlcohol = $('input[name="sh_alcohol"]:checked').val() || 'No';
        var shDrugs = $('input[name="sh_drugs"]:checked').val() || 'No';
        var shExercise = $('input[name="sh_exercise"]:checked').val() || 'No';
        var shDiet = $('input[name="sh_diet"]:checked').val() || 'No';
        var shCaffeine = $('input[name="sh_caffeine"]:checked').val() || 'No';
        var socialHistory = `Smoking: ${shSmoking}, Alcohol: ${shAlcohol}, Drugs: ${shDrugs}, Exercise: ${shExercise}, Diet: ${shDiet}, Caffeine: ${shCaffeine}`;

        // Validation — required fields per DB: legalName, dob, gender
        if (!legalName || !gender || !dob) {
            showToast('Please fill in all required fields (Name, Gender, DOB).', 'error');
            return;
        }

        // Aadhar validation (if provided, must be 12 digits)
        if (aadharCard && aadharCard.length !== 12) {
            showToast('Aadhar card number must be 12 digits.', 'error');
            return;
        }

        // Disable button while processing
        var $btn = $('#registerBtn');
        $btn.prop('disabled', true).text('Registering…');

        // ======== AJAX-READY ========
        if (API_BASE) {
            var formData = new FormData();
            formData.append('legalName', legalName);
            formData.append('dob', dob);
            formData.append('gender', gender);
            formData.append('contact', contact);
            formData.append('aadharCard', aadharCard);
            formData.append('bloodGroup', bloodGroup);
            formData.append('reasonForVisit', reasonForVisit);
            formData.append('medicalHistory', medicalHistory);
            formData.append('medications', medications);
            formData.append('surgicalHistory', surgicalHistory);
            formData.append('socialHistory', socialHistory);

            var fileInput = $('#reportPhoto')[0];
            if (fileInput.files[0]) {
                formData.append('reportPhoto', fileInput.files[0]);
            }

            $.ajax({
                url: API_BASE + '/patients/create',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
                },
                success: function (response) {
                    showToast('Patient registered successfully!', 'success');
                    setTimeout(function () {
                        window.location.href = 'patients.html';
                    }, 600);
                },
                error: function (xhr) {
                    var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Registration failed.';
                    showToast(msg, 'error');
                    $btn.prop('disabled', false).text('Register Patient');
                }
            });
        } else {
            // localStorage fallback
            var patients = JSON.parse(localStorage.getItem('patients') || '[]');

            patients.push({
                id: Date.now().toString(),
                userId: currentUser.id || currentUser.email,
                legalName: legalName,
                dob: dob,
                gender: gender,
                contact: contact || '',
                bloodGroup: bloodGroup || '',
                reasonForVisit: reasonForVisit || '',
                medicalHistory: medicalHistory || '',
                aadharCard: aadharCard || '',
                medications: medications || '',
                surgicalHistory: surgicalHistory || '',
                socialHistory: socialHistory || '',
                reportPhoto: selectedFileData || '',
                visits: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem('patients', JSON.stringify(patients));
            showToast('Patient registered successfully!', 'success');

            setTimeout(function () {
                window.location.href = 'patients.html';
            }, 600);
        }

        console.log("FORM SUBMITTED ✅");
        // ==============================
    });
});

// ---- Toast Notification ----
function showToast(msg, type) {
    $('.toast').remove();
    var $toast = $('<div>', { class: 'toast ' + type, text: msg });
    $('body').append($toast);
    setTimeout(function () { $toast.remove(); }, 3000);
}
