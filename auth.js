// ==========================================
// AUTHENTICATION
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        const icon = togglePassword.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });

    // Handle login
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');

        try {
            // Show loading
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span>Signing in...</span><i class="fas fa-spinner fa-spin"></i>';
            loadingOverlay.classList.add('active');

            // Sign in with Firebase
            await auth.signInWithEmailAndPassword(email, password);

            // Success - redirect to admin
            showToast('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);

            let errorMessage = 'Login failed. Please try again.';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
            }

            showToast(errorMessage, 'error');

            // Reset button
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
            loadingOverlay.classList.remove('active');
        }
    });
});

// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');

    toastMessage.textContent = message;

    toast.className = 'toast';
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        toast.classList.add('success');
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.classList.add('error');
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        toast.classList.add('warning');
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
