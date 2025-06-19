// =================================================================
// SCRIPT CONFIGURATION
// =================================================================
// !!! QUAN TRỌNG: Dán URL Web App của bạn từ Google Apps Script vào đây !!!
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
// =================================================================

const appRoot = document.getElementById('app-root');
const mainNav = document.getElementById('nav-main');

const routes = {
    '#/login': 'pages/login.html',
    '#/register': 'pages/register.html',
    '#/forgot-password': 'pages/forgot-password.html',
    '#/dashboard': 'pages/dashboard.html'
};

// --- ROUTER ---
async function router() {
    const hash = window.location.hash || '#/login';
    const path = routes[hash];

    // Check auth
    const user = getSession();
    if (!user && hash === '#/dashboard') {
        window.location.hash = '#/login';
        return;
    }
    if(user && (hash === '#/login' || hash === '#/register')){
        window.location.hash = '#/dashboard';
        return;
    }

    if (path) {
        appRoot.innerHTML = '<div class="loader"></div>';
        try {
            const response = await fetch(path);
            appRoot.innerHTML = await response.text();
            attachFormListeners(hash);
            updateNav();
        } catch (error) {
            appRoot.innerHTML = '<p>Lỗi tải trang. Vui lòng thử lại.</p>';
        }
    } else {
        window.location.hash = '#/login';
    }
}

// --- NAVIGATION ---
function updateNav() {
    const user = getSession();
    if (user) {
        mainNav.innerHTML = `<a href="#/dashboard">Bảng điều khiển</a> | <a href="#" id="logout-btn">Đăng xuất</a>`;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    } else {
        mainNav.innerHTML = `<a href="#/login">Đăng nhập</a> | <a href="#/register">Đăng ký</a>`;
    }
}

// --- EVENT LISTENERS ---
function attachFormListeners(route) {
    switch (route) {
        case '#/login':
            document.getElementById('loginForm').addEventListener('submit', handleLogin);
            break;
        case '#/register':
            document.getElementById('registerForm').addEventListener('submit', handleRegisterSendOtp);
            break;
        case '#/forgot-password':
            document.getElementById('forgotForm').addEventListener('submit', handleForgotPassword);
            break;
        case '#/dashboard':
            initializeDashboard();
            break;
    }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// --- API HELPER ---
async function apiCall(action, payload) {
    const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script simple POST
        },
        body: JSON.stringify({ action, payload })
    });
    return res.json();
}

// --- AUTH HANDLERS ---
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('qr_app_user');
    window.location.hash = '#/login';
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('button');
    setLoading(button, true, 'Đang xử lý...');

    const credentials = {
        username: form.username.value,
        password: form.password.value
    };

    try {
        const response = await apiCall('login', credentials);
        if (response.success) {
            setSession({ username: response.username });
            window.location.hash = '#/dashboard';
        } else {
            showMessage(form, response.message, 'error');
        }
    } catch (error) {
        showMessage(form, 'Lỗi kết nối. Vui lòng thử lại.', 'error');
    } finally {
        setLoading(button, false, 'Đăng Nhập');
    }
}

async function handleRegisterSendOtp(e) {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('button');
    const password = form.password.value;

    if (password !== form.confirmPassword.value) {
        showMessage(form, 'Mật khẩu xác nhận không khớp.', 'error');
        return;
    }

    const userInfo = {
        fullName: form.fullName.value,
        birthDate: form.birthDate.value,
        email: form.email.value,
        username: form.username.value,
        password: password
    };
    
    setLoading(button, true, 'Đang gửi OTP...');
    try {
        const response = await apiCall('send_otp', userInfo);
        showMessage(form, response.message, response.success ? 'success' : 'error');
        if (response.success) {
            // Show OTP form
            form.style.display = 'none';
            const otpFormHtml = `
                <form id="otpForm">
                    <p>Một mã OTP đã được gửi đến email của bạn.</p>
                    <label for="otp">Nhập mã OTP:</label>
                    <input type="text" id="otp" required autocomplete="one-time-code" />
                    <button type="submit">Xác nhận và Đăng ký</button>
                </form>
            `;
            form.insertAdjacentHTML('afterend', otpFormHtml);
            document.getElementById('otpForm').addEventListener('submit', (otpEvent) => handleVerifyOtp(otpEvent, userInfo));
        }
    } catch(error) {
         showMessage(form, 'Lỗi kết nối khi gửi OTP.', 'error');
    } finally {
        setLoading(button, false, 'Nhận mã OTP');
    }
}

async function handleVerifyOtp(e, userInfo) {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('button');
    setLoading(button, true, 'Đang xác thực...');

    const otp = form.otp.value;
    try {
        const response = await apiCall('verify_otp', { userInfo, otp });
        showMessage(form, response.message, response.success ? 'success' : 'error');
        if(response.success){
            form.innerHTML = `<p style="color:green;">${response.message} Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.</p>`;
            setTimeout(() => window.location.hash = '#/login', 3000);
        }
    } catch(error) {
        showMessage(form, 'Lỗi kết nối khi xác thực.', 'error');
    } finally {
        setLoading(button, false, 'Xác nhận và Đăng ký');
    }
}


async function handleForgotPassword(e) {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('button');
    setLoading(button, true, 'Đang xử lý...');

    try {
        const response = await apiCall('forgot_password', { email: form.email.value });
        showMessage(form, response.message, 'success');
        form.reset();
    } catch(error) {
         showMessage(form, 'Lỗi kết nối.', 'error');
    } finally {
        setLoading(button, false, 'Gửi Yêu Cầu');
    }
}

// --- DASHBOARD LOGIC ---
function initializeDashboard() {
    const user = getSession();
    if (!user) return; // Should not happen due to router guard

    document.getElementById('username-display').textContent = user.username;
    document.getElementById('qrForm').addEventListener('submit', handleCreateQR);
    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        document.getElementById('changePasswordModal').style.display = 'block';
    });
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('changePasswordModal').style.display = 'none';
    });
    document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
}

async function handleCreateQR(e) {
    e.preventDefault();
    const content = document.getElementById('content').value.trim();
    if (!content) return;
    
    // Log on server
    apiCall('log_qr', { content });

    // Generate QR on client
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';
    new QRCode(qrcodeDiv, { text: content, width: 200, height: 200 });

    const qrcodeContainer = document.getElementById('qrcode-container');
    qrcodeContainer.style.display = 'block';
}

async function handleChangePassword(e) {
    e.preventDefault();
    const form = e.target;
    const button = form.querySelector('button');
    const msgDiv = document.getElementById('changePassMsg');
    const user = getSession();

    const newPassword = form.newPassword.value;
    if (newPassword !== form.confirmNewPassword.value) {
        msgDiv.textContent = 'Mật khẩu mới không khớp.';
        msgDiv.className = 'message error';
        return;
    }

    setLoading(button, true, 'Đang lưu...');
    try {
        const payload = {
            username: user.username,
            currentPassword: form.currentPassword.value,
            newPassword: newPassword
        };
        const response = await apiCall('change_password', payload);
        msgDiv.textContent = response.message;
        msgDiv.className = response.success ? 'message success' : 'message error';
        if (response.success) {
            form.reset();
            setTimeout(() => document.getElementById('changePasswordModal').style.display = 'none', 2000);
        }
    } catch(error){
        msgDiv.textContent = 'Lỗi kết nối.';
        msgDiv.className = 'message error';
    } finally {
        setLoading(button, false, 'Lưu thay đổi');
    }
}


// --- UTILITY FUNCTIONS ---
function setLoading(button, isLoading, text) {
    button.disabled = isLoading;
    button.textContent = text;
}

function showMessage(form, message, type = 'success') {
    let msgDiv = form.querySelector('.message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        form.appendChild(msgDiv);
    }
    msgDiv.textContent = message;
    msgDiv.className = 'message ' + type;
}

function setSession(user) {
    localStorage.setItem('qr_app_user', JSON.stringify(user));
}

function getSession() {
    const user = localStorage.getItem('qr_app_user');
    return user ? JSON.parse(user) : null;
}
