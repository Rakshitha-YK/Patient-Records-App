$(document).ready(function() {
    // 1. Initial Guard: Check if token exists
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || userRole !== 'super_admin') {
        alert("Session expired or unauthorized. Please login again.");
        window.location.href = 'index.html';
        return;
    }

    // 2. Form Submission
    $('#addStaffForm').on('submit', function(e) {
        e.preventDefault();
        
        const $btn = $('#submitBtn');
        $btn.prop('disabled', true).text('Working...');

        const staffData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#staffEmail').val(),
            role: $('#staffRole').val(),
            specialist: $('#specialist').val()
        };

        $.ajax({
            url: 'http://localhost:5000/api/users/add-staff',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(staffData),
            headers: {
                // IMPORTANT: This line sends your security token
                'Authorization': 'Bearer ' + localStorage.getItem('token') 
            },
            success: function(res) {
                $('#displayId').text(res.credentials.uniqueId);
                $('#displayPass').text(res.credentials.password);
                $('#credentialsDisplay').fadeIn();
                $('#addStaffForm')[0].reset();
                $btn.prop('disabled', false).text('Generate Access Credentials');
            },
            error: function(xhr) {
                // If it fails, we show the error and UNLOCK the button
                const msg = xhr.responseJSON ? xhr.responseJSON.message : "Connection failed";
                alert("Security Alert: " + msg);
                $btn.prop('disabled', false).text('Generate Access Credentials');
                
                // If token is truly invalid, send back to login
                if (xhr.status === 401) window.location.href = 'index.html';
            }
        });
    });

    // Toggle specialist field
    $('#staffRole').on('change', function() {
        if ($(this).val() === 'doctor') {
            $('#specialistGroup').slideDown();
        } else {
            $('#specialistGroup').slideUp();
        }
    });
});