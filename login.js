// ==========================================
// AUTHENTICATION WITH SUPABASE
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    // Handle login
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Sign in with Supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Success - redirect to admin
            alert('Login successful! Redirecting...');
            window.location.href = 'admin.html';

        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please try again.');
        }
    });
});
