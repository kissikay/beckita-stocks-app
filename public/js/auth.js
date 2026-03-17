document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        let data = {};
        try { data = await response.json(); } catch (_) {}

        if (response.ok) {
            window.location.href = '/dashboard';
        } else if (response.status === 403) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('waitingUI').style.display = 'block';
            document.getElementById('statusMsg').textContent = data.error || 'Pending approval';
        } else {
            alert(data.error || `Login failed (${response.status}). Please try again.`);
        }
    } catch (error) {
        alert('Cannot reach server. Please check your connection.');
    }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password })
        });

        let data = {};
        try { data = await response.json(); } catch (_) {}

        if (response.ok) {
            alert(data.message || 'Registered successfully!');
            window.location.href = '/login';
        } else {
            alert(data.error || `Registration failed (${response.status}).`);
        }
    } catch (error) {
        alert('Cannot reach server. Please check your connection.');
    }
});

function checkStatus() {
    // Simply reload to let the user try again
    window.location.reload();
}
