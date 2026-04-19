const API_BASE = 'http://localhost:5000/api';

$(document).ready(function () {
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var uniqueId = $.trim($('#uniqueId').val());
        var password = $('#password').val(); 

        if (!uniqueId || !password) {
            showToast('Please enter your ID and password.', 'error');
            return;
        }

        var $btn = $('#loginBtn');
        $btn.prop('disabled', true).text('Signing in...');

        $.ajax({
            url: API_BASE + '/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                uniqueId: uniqueId,
                password: password
            }),
            success: function (response) {
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.user.role);

                showToast('Welcome back, ' + response.user.name, 'success');

                setTimeout(function () {
                    const role = response.user.role;
                    
                    if (role === 'super_admin') {
                        window.location.href = 'admin_dashboard.html';
                    } else if (role === 'doctor') {
                        window.location.href = 'doctor_dashboard.html';
                    } else if (role === 'receptionist') {
                        window.location.href = 'patients.html';
                    } else if (role === 'patient') {
                        window.location.href = 'patient_portal.html'; 
                    }
                }, 600);
            },
            error: function (xhr) {
                var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Invalid Credentials';
                showToast(msg, 'error');
                $btn.prop('disabled', false).text('Sign In');
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