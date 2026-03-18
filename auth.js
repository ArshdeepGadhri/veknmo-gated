export function setupAuth() {
    const loginOverlay = document.getElementById('login-overlay');
    const appContent = document.getElementById('app-content');
    const userProfile = document.getElementById('user-profile');
    const tokenInput = document.getElementById('tokenInput');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const userAvatar = document.getElementById('user-avatar');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    function requireAuth() {
        const session = localStorage.getItem('session');
        if (!session) {
            showLogin();
            return false;
        }

        const payload = parseJwt(session);
        if (!payload || payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('session');
            showLogin();
            return false;
        }

        // Authenticated! Update UI
        showApp();
        displayUser(payload.username, payload.userId, payload.avatar);
        return true;
    }

    function showLogin() {
        loginOverlay.style.display = 'flex';
        appContent.style.display = 'none';
        userProfile.style.display = 'none';
    }

    function showApp() {
        loginOverlay.style.display = 'none';
        appContent.style.display = ''; // Revert to default stylesheet CSS (e.g., grid)
        userProfile.style.display = 'flex';
        loadOwnerAvatars();
    }

    async function loadOwnerAvatars() {
        try {
            const res = await fetch(`${process.env.VITE_API_URL}/api/owners`);
            if (!res.ok) return;
            const { art, vekn } = await res.json();
            const artImg = document.getElementById('owner-art-avatar');
            const veknImg = document.getElementById('owner-vekn-avatar');
            if (artImg && art?.avatar) artImg.src = art.avatar;
            if (veknImg && vekn?.avatar) veknImg.src = vekn.avatar;
        } catch {
            // silently fail — avatars stay blank
        }
    }

    function displayUser(username, userId, avatar) {
        welcomeMessage.innerHTML = `👻 Welcome back investigator,<br><b>@${username}</b>`;

        if (avatar) {
            let ext = avatar.startsWith('a_') ? 'gif' : 'png';
            userAvatar.src = `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${ext}`;
            userAvatar.style.display = 'block';
        } else {
            // Default discord avatar based on user id fallback
            userAvatar.src = `https://cdn.discordapp.com/embed/avatars/${(BigInt(userId) >> 22n) % 6n}.png`;
        }
    }

    loginBtn.addEventListener('click', async () => {
        const token = tokenInput.value.trim();
        if (!token) {
            loginError.textContent = 'Please enter an access code';
            loginError.style.display = 'block';
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Authenticating...';
        loginError.style.display = 'none';

        try {
            const res = await fetch(`${process.env.VITE_API_URL.VITE_API_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            localStorage.setItem('session', data.token);
            requireAuth(); // Re-check auth and show app
        } catch (err) {
            loginError.textContent = err.message;
            loginError.style.display = 'block';
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Authenticate';
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('session');
        requireAuth();
    });

    // Run auth check initially
    return requireAuth();
}
