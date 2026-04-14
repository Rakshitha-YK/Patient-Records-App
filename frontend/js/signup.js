// // ============================================
// // Signup — signup.js (jQuery + AJAX)
// // Aligned with Users DB schema
// // ============================================

// const API_BASE = 'http://localhost:5000/api';

// $(document).ready(function () {

//     var profilePhotoData = '';

//     // ---- Profile photo upload ----
//     $('#profilePhoto').on('change', function () {
//         var file = this.files[0];
//         if (!file) return;

//         if (file.size > 2 * 1024 * 1024) {
//             showToast('Profile photo must be under 2MB.', 'error');
//             $(this).val('');
//             return;
//         }

//         var reader = new FileReader();
//         reader.onload = function (e) {
//             profilePhotoData = e.target.result;
//             $('#profilePreviewImg').attr('src', profilePhotoData).show();
//             $('#profilePlaceholder').hide();
//         };
//         reader.readAsDataURL(file);
//     });

//     // ---- Form Submit ----
//     $('#signupForm').on('submit', function (e) {
//         e.preventDefault();

//         var firstName = $.trim($('#firstName').val());
//         var lastName = $.trim($('#lastName').val());
//         var email = $.trim($('#email').val());
//         var password = $('#password').val();
//         var confirmPassword = $('#confirmPassword').val();

//         // Validation
//         if (!firstName || !lastName || !email || !password || !confirmPassword) {
//             showToast('Please fill in all fields.', 'error');
//             return;
//         }

//         if (password.length < 4) {
//             showToast('Password must be at least 4 characters.', 'error');
//             return;
//         }

//         if (password !== confirmPassword) {
//             showToast('Passwords do not match.', 'error');
//             return;
//         }

//         // Disable button while processing
//         var $btn = $('#signupBtn');
//         $btn.prop('disabled', true).text('Creating Account…');

//         // ======== AJAX-READY ========
//         if (API_BASE) {
//             // Build FormData for multipart/form-data (for profilePhoto file upload)
//             var formData = new FormData();
//             formData.append('firstName', firstName);
//             formData.append('lastName', lastName);
//             formData.append('email', email);
//             formData.append('password', password);

//             var fileInput = $('#profilePhoto')[0];
//             if (fileInput.files[0]) {
//                 formData.append('profilePhoto', fileInput.files[0]);
//             }

//             $.ajax({
//                 url: API_BASE + '/auth/signup',
//                 type: 'POST',
//                 data: formData,
//                 processData: false,
//                 contentType: false,
//                 success: function (response) {
//                     showToast('Account created! Redirecting…', 'success');
//                     setTimeout(function () {
//                         window.location.href = 'index.html';
//                     }, 800);
//                 },
//                 error: function (xhr) {
//                     var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Signup failed. Please try again.';
//                     showToast(msg, 'error');
//                     $btn.prop('disabled', false).text('Create Account');
//                 }
//             });
//         } else {
//             // localStorage fallback
//             var users = JSON.parse(localStorage.getItem('users') || '[]');
//             var exists = false;

//             $.each(users, function (i, u) {
//                 if (u.email === email) {
//                     exists = true;
//                     return false;
//                 }
//             });

//             if (exists) {
//                 showToast('An account with this email already exists.', 'error');
//                 $btn.prop('disabled', false).text('Create Account');
//                 return;
//             }

//             users.push({
//                 id: Date.now().toString(),
//                 firstName: firstName,
//                 lastName: lastName,
//                 email: email,
//                 password: password,
//                 profilePhoto: profilePhotoData || 'default-profile.png',
//                 otp: null,
//                 otpExpires: null,
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString()
//             });

//             localStorage.setItem('users', JSON.stringify(users));
//             showToast('Account created! Redirecting…', 'success');

//             setTimeout(function () {
//                 window.location.href = 'index.html';
//             }, 800);
//         }
//         // ==============================
//     });
// });

// // ---- Toast Notification ----
// function showToast(msg, type) {
//     $('.toast').remove();
//     var $toast = $('<div>', { class: 'toast ' + type, text: msg });
//     $('body').append($toast);
//     setTimeout(function () { $toast.remove(); }, 3000);
// }



const API_BASE = 'http://localhost:5000/api';

$(document).ready(function () {
    let profilePhotoData = '';
    let isVerified = false;
    let selectedRole = 'doctor'; // Default role

    // 1. ---- Role Selection Logic ----
    // You can trigger this based on a toggle or a URL parameter (?role=doctor)
    $('#roleSelector').on('change', function() {
        selectedRole = $(this).val();
        if (selectedRole === 'doctor') {
            $('#nmcSection').show();
            $('#formDetails').hide(); // Hide form until verified
        } else {
            $('#nmcSection').hide();
            $('#formDetails').show(); // Receptionists don't need NMC ID
        }
    });

    // 2. ---- Step 1: Verify NMC ID ----
    $('#verifyNmcBtn').on('click', function () {
        const nmcId = $.trim($('#nmcId').val());

        if (!nmcId) {
            showToast('Please enter your NMC ID.', 'error');
            return;
        }

        $(this).prop('disabled', true).text('Verifying...');

        $.ajax({
            url: API_BASE + '/auth/verify-nmc',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ nmcId: nmcId }),
            success: function (response) {
                showToast(response.message, 'success');
                isVerified = true;

                // Auto-fill details from the Mock API
                $('#firstName').val(response.doctorDetails.name.split(' ')[1]); 
                $('#lastName').val(response.doctorDetails.name.split(' ').slice(2).join(' '));
                
                // Unlock the rest of the form
                $('#nmcId').prop('disabled', true);
                $('#verifyNmcBtn').hide();
                $('#formDetails').fadeIn();
            },
            error: function (xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Verification failed.';
                showToast(msg, 'error');
                $('#verifyNmcBtn').prop('disabled', false).text('Verify ID');
            }
        });
    });

    // 3. ---- Profile Photo Preview ----
    $('#profilePhoto').on('change', function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            $('#profilePreviewImg').attr('src', e.target.result).show();
            $('#profilePlaceholder').hide();
        };
        reader.readAsDataURL(file);
    });

    // 4. ---- Step 2: Final Form Submit ----
    $('#signupForm').on('submit', function (e) {
        e.preventDefault();

        if (selectedRole === 'doctor' && !isVerified) {
            showToast('Please verify your NMC ID first.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('firstName', $.trim($('#firstName').val()));
        formData.append('lastName', $.trim($('#lastName').val()));
        formData.append('email', $.trim($('#email').val()));
        formData.append('password', $('#password').val());
        formData.append('role', selectedRole);
        
        if (selectedRole === 'doctor') {
            formData.append('nmcId', $('#nmcId').val());
        }

        const fileInput = $('#profilePhoto')[0];
        if (fileInput.files[0]) {
            formData.append('profilePhoto', fileInput.files[0]);
        }

        const $btn = $('#signupBtn');
        $btn.prop('disabled', true).text('Creating Account...');

        $.ajax({
            url: API_BASE + '/auth/signup',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                showToast('Account created! Redirecting...', 'success');
                setTimeout(() => window.location.href = 'index.html', 800);
            },
            error: function (xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Signup failed.';
                showToast(msg, 'error');
                $btn.prop('disabled', false).text('Create Account');
            }
        });
    });
});

function showToast(msg, type) {
    $('.toast').remove();
    const $toast = $('<div>', { class: 'toast ' + type, text: msg });
    $('body').append($toast);
    setTimeout(() => $toast.remove(), 3000);
}