// ============================================
// Signup — signup.js (jQuery + AJAX)
// Aligned with Users DB schema
// ============================================

const API_BASE = ''; // e.g. 'http://localhost:5000/api'

$(document).ready(function () {

    var profilePhotoData = '';

    // ---- Profile photo upload ----
    $('#profilePhoto').on('change', function () {
        var file = this.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast('Profile photo must be under 2MB.', 'error');
            $(this).val('');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            profilePhotoData = e.target.result;
            $('#profilePreviewImg').attr('src', profilePhotoData).show();
            $('#profilePlaceholder').hide();
        };
        reader.readAsDataURL(file);
    });

    // ---- Form Submit ----
    $('#signupForm').on('submit', function (e) {
        e.preventDefault();

        var firstName = $.trim($('#firstName').val());
        var lastName = $.trim($('#lastName').val());
        var email = $.trim($('#email').val());
        var password = $('#password').val();
        var confirmPassword = $('#confirmPassword').val();

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showToast('Please fill in all fields.', 'error');
            return;
        }

        if (password.length < 4) {
            showToast('Password must be at least 4 characters.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            return;
        }

        // Disable button while processing
        var $btn = $('#signupBtn');
        $btn.prop('disabled', true).text('Creating Account…');

        // ======== AJAX-READY ========
        if (API_BASE) {
            // Build FormData for multipart/form-data (for profilePhoto file upload)
            var formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('email', email);
            formData.append('password', password);

            var fileInput = $('#profilePhoto')[0];
            if (fileInput.files[0]) {
                formData.append('profilePhoto', fileInput.files[0]);
            }

            $.ajax({
                url: API_BASE + '/auth/signup',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    showToast('Account created! Redirecting…', 'success');
                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 800);
                },
                error: function (xhr) {
                    var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Signup failed. Please try again.';
                    showToast(msg, 'error');
                    $btn.prop('disabled', false).text('Create Account');
                }
            });
        } else {
            // localStorage fallback
            var users = JSON.parse(localStorage.getItem('users') || '[]');
            var exists = false;

            $.each(users, function (i, u) {
                if (u.email === email) {
                    exists = true;
                    return false;
                }
            });

            if (exists) {
                showToast('An account with this email already exists.', 'error');
                $btn.prop('disabled', false).text('Create Account');
                return;
            }

            users.push({
                id: Date.now().toString(),
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                profilePhoto: profilePhotoData || 'default-profile.png',
                otp: null,
                otpExpires: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem('users', JSON.stringify(users));
            showToast('Account created! Redirecting…', 'success');

            setTimeout(function () {
                window.location.href = 'index.html';
            }, 800);
        }
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
