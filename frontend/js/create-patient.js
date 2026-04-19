const API_BASE = 'http://localhost:5000/api'; 

$(document).ready(function () {
    // 1. Auth check
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) { window.location.href = 'index.html'; return; }

    // 2. Fetch Doctors for the dropdown menu
    $.ajax({
        url: API_BASE + '/users/doctors',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
        success: function(res) {
            let options = '<option value="">Select Assigned Doctor</option>';
            res.doctors.forEach(doc => {
                options += `<option value="${doc.id}">Dr. ${doc.firstName} ${doc.lastName} (${doc.specialist})</option>`;
            });
            $('#assignedDoctorId').html(options);
        },
        error: function() { showToast('Could not load doctor list.', 'error'); }
    });

    // 3. Aadhar formatting
    $('#aadharCard').on('input', function () {
        var val = $(this).val().replace(/\D/g, '').slice(0, 12);
        $(this).val(val.replace(/(\d{4})(?=\d)/g, '$1 '));
    });

    // 4. Form Submit
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();
        
        const legalName = $.trim($('#legalName').val());
        const gender = $('#gender').val();
        const dob = $('#dob').val();
        const assignedDoctorId = $('#assignedDoctorId').val();

        if (!legalName || !gender || !dob || !assignedDoctorId) {
            showToast('Please fill all required fields and assign a doctor.', 'error');
            return;
        }

        var formData = new FormData();
        formData.append('legalName', legalName);
        formData.append('dob', dob);
        formData.append('gender', gender);
        formData.append('contact', $.trim($('#contact').val()));
        formData.append('assignedDoctorId', assignedDoctorId);
        formData.append('bloodGroup', $('#bloodGroup').val());
        formData.append('reasonForVisit', $.trim($('#reasonForVisit').val()));
        formData.append('medicalHistory', $.trim($('#medicalHistory').val()));
        formData.append('medications', $.trim($('#medications').val()));
        formData.append('surgicalHistory', $.trim($('#surgicalHistory').val()));

        // Social History Logic
        var socialHistory = `Smoking: ${$('input[name="sh_smoking"]:checked').val()}, Alcohol: ${$('input[name="sh_alcohol"]:checked').val()}`;
        formData.append('socialHistory', socialHistory);

        var fileInput = $('#reportPhoto')[0];
        if (fileInput.files[0]) { formData.append('reportPhoto', fileInput.files[0]); }

        var $btn = $('#registerBtn');
        $btn.prop('disabled', true).text('Generating Credentials...');

        $.ajax({
            url: API_BASE + '/patients/add', // Pointing to your new onboarding endpoint
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
            success: function (res) {
                // SUCCESS: Show the generated PAT ID and Password
                $('#displayId').text(res.credentials.uniqueId);
                $('#displayPass').text(res.credentials.password);
                $('#credentialsDisplay').fadeIn();
                
                showToast('Patient Registered Successfully!', 'success');
                $btn.text('Registration Complete');
            },
            error: function (xhr) {
                showToast(xhr.responseJSON.message || 'Registration failed.', 'error');
                $btn.prop('disabled', false).text('Register Patient');
            }
        });
    });
});

function showToast(msg, type) {
    $('.toast').remove();
    var $toast = $('<div>', { class: 'toast ' + type, text: msg });
    $('body').append($toast);
    setTimeout(function () { $toast.remove(); }, 3000);
}