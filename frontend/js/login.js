// ============================================
// Login — login.js (jQuery + AJAX)
// Aligned with Users DB schema
// ============================================

// Base API URL — change this when backend is ready
const API_BASE = 'http://localhost:5000/api'; // e.g. 'http://localhost:5000/api'

$(document).ready(function () {

    // ---- Form Submit ----
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var email = $.trim($('#email').val());
        // var password = $('#password').val();
        var password = $.trim($('#password').val());

        // Validation
        if (!email || !password) {
            showToast('Please fill in all fields.', 'error');
            return;
        }

        // Disable button while processing
        var $btn = $('#loginBtn');
        $btn.prop('disabled', true).text('Signing in…');

        // ======== AJAX-READY: Swap this block when backend is connected ========
        if (API_BASE) {
            // Real AJAX call to backend
            $.ajax({
                url: API_BASE + '/auth/login',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ email: email, password: password }),
                success: function (response) {
                    // Store user session
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    if (response.token) {
                        localStorage.setItem('token', response.token);
                    }
                    showToast('Welcome back, ' + response.user.firstName + '!', 'success');
                    setTimeout(function () {
                        window.location.href = 'patients.html';
                    }, 600);
                },
                error: function (xhr) {
                    var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Invalid email or password.';
                    showToast(msg, 'error');
                    $btn.prop('disabled', false).text('Sign In');
                }
            });
        } else {
            // localStorage fallback (no backend)
            var users = JSON.parse(localStorage.getItem('users') || '[]');
            var user = null;

            $.each(users, function (i, u) {
                if (u.email === email && u.password === password) {
                    user = u;
                    return false; // break
                }
            });

            if (!user) {
                showToast('Invalid email or password.', 'error');
                $btn.prop('disabled', false).text('Sign In');
                return;
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            showToast('Welcome back, ' + user.firstName + '!', 'success');

            setTimeout(function () {
                window.location.href = 'patients.html';
            }, 600);
        }
        // ======================================================================
    });
});

// ---- Toast Notification ----
function showToast(msg, type) {
    $('.toast').remove();
    var $toast = $('<div>', {
        class: 'toast ' + type,
        text: msg
    });
    $('body').append($toast);
    setTimeout(function () { $toast.remove(); }, 3000);
}
