// // ============================================
// // Login — login.js (jQuery + AJAX)
// // Aligned with Users DB schema
// // ============================================

// // Base API URL — change this when backend is ready
// const API_BASE = 'http://localhost:5000/api'; // e.g. 'http://localhost:5000/api'

// $(document).ready(function () {

//     // ---- Form Submit ----
//     $('#loginForm').on('submit', function (e) {
//         e.preventDefault();

//         var email = $.trim($('#email').val());
//         // var password = $('#password').val();
//         var password = $.trim($('#password').val());

//         // Validation
//         if (!email || !password) {
//             showToast('Please fill in all fields.', 'error');
//             return;
//         }

//         // Disable button while processing
//         var $btn = $('#loginBtn');
//         $btn.prop('disabled', true).text('Signing in…');

//         // ======== AJAX-READY: Swap this block when backend is connected ========
//         if (API_BASE) {
//             // Real AJAX call to backend
//             $.ajax({
//                 url: API_BASE + '/auth/login',
//                 type: 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify({ email: email, password: password }),
//                 success: function (response) {
//                     // Store user session
//                     localStorage.setItem('currentUser', JSON.stringify(response.user));
//                     if (response.token) {
//                         localStorage.setItem('token', response.token);
//                     }
//                     showToast('Welcome back, ' + response.user.firstName + '!', 'success');
//                     setTimeout(function () {
//                         window.location.href = 'patients.html';
//                     }, 600);
//                 },
//                 error: function (xhr) {
//                     var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Invalid email or password.';
//                     showToast(msg, 'error');
//                     $btn.prop('disabled', false).text('Sign In');
//                 }
//             });
//         } else {
//             // localStorage fallback (no backend)
//             var users = JSON.parse(localStorage.getItem('users') || '[]');
//             var user = null;

//             $.each(users, function (i, u) {
//                 if (u.email === email && u.password === password) {
//                     user = u;
//                     return false; // break
//                 }
//             });

//             if (!user) {
//                 showToast('Invalid email or password.', 'error');
//                 $btn.prop('disabled', false).text('Sign In');
//                 return;
//             }

//             localStorage.setItem('currentUser', JSON.stringify(user));
//             showToast('Welcome back, ' + user.firstName + '!', 'success');

//             setTimeout(function () {
//                 window.location.href = 'patients.html';
//             }, 600);
//         }
//         // ======================================================================
//     });
// });

// // ---- Toast Notification ----
// function showToast(msg, type) {
//     $('.toast').remove();
//     var $toast = $('<div>', {
//         class: 'toast ' + type,
//         text: msg
//     });
//     $('body').append($toast);
//     setTimeout(function () { $toast.remove(); }, 3000);
// }



const API_BASE = 'http://localhost:5000/api';

$(document).ready(function () {
    // This variable must stay inside this block
    let isAdminLogin = false;

    // --- SECRET ADMIN TRIGGER 1: URL Parameter (?view=admin) ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'admin') {
        activateAdminMode();
    }

    // --- SECRET ADMIN TRIGGER 2: Hidden Keypress (A + L) ---
    let keys = {};
    $(document).keydown(function (e) {
        keys[e.key.toLowerCase()] = true;
        if (keys['a'] && keys['l']) {
            activateAdminMode();
            showToast('Admin Mode Unlocked', 'success');
        }
    });
    $(document).keyup(function (e) { delete keys[e.key.toLowerCase()]; });

    // --- THE FIX: One complete function inside the correct scope ---
    function activateAdminMode() {
        isAdminLogin = true;
        $('.card-title').text('Super Admin Portal');
        $('.card-subtitle').text('Enter master credentials to continue');
        $('#loginBtn').css('background-color', '#dc3545').text('Admin Sign In');

        // HIDE THE SIGNUP LINK as we discussed
        $('.auth-link').hide();
    }

    // ---- Form Submit ----
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var email = $.trim($('#email').val());
        var password = $('#password').val(); // Tip: Don't trim passwords, spaces count!

        if (!email || !password) {
            showToast('Please fill in all fields.', 'error');
            return;
        }

        var $btn = $('#loginBtn');
        $btn.prop('disabled', true).text('Signing in…');

        $.ajax({
            url: API_BASE + '/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password,
                isAdminLogin: isAdminLogin
            }),
            success: function (response) {
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                localStorage.setItem('token', response.token);
                localStorage.setItem('role', response.user.role); // Crucial for frontend checks

                showToast('Authenticated as ' + response.user.role, 'success');

                setTimeout(function () {
                    // DIRECT REDIRECTION BASED ON ROLE
                    if (response.user.role === 'super_admin') {
                        window.location.href = 'admin_dashboard.html';
                    } else if (response.user.role === 'doctor') {
                        window.location.href = 'doctor_dashboard.html';
                    } else if (response.user.role === 'receptionist') {
                        window.location.href = 'patients.html';
                    } else {
                        window.location.href = 'index.html'; // Safety fallback
                    }
                }, 600);
            },
            error: function (xhr) {
                var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Invalid email or password.';
                showToast(msg, 'error');
                $btn.prop('disabled', false).text('Sign In');
            }
        });
    });
});

// ---- Toast Notification Helper ----
function showToast(msg, type) {
    $('.toast').remove();
    var $toast = $('<div>', { class: 'toast ' + type, text: msg });
    $('body').append($toast);
    setTimeout(function () { $toast.remove(); }, 3000);
}