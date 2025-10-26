// ===== AUTHENTICATION MANAGEMENT =====

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let generatedOTP = '';
let loginPhoneNumber = '';

// Update user interface based on login status
function updateUserUI() {
    if (currentUser) {
        document.getElementById('login-nav-item').classList.add('hidden');
        document.getElementById('user-nav-item').classList.remove('hidden');
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('login-btn').textContent = 'Logout';
    } else {
        document.getElementById('login-nav-item').classList.remove('hidden');
        document.getElementById('user-nav-item').classList.add('hidden');
        document.getElementById('login-btn').textContent = 'Login';
    }
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    showNotification('You have been logged out successfully.', 'success');
    showSection('home-section');
}

// Show login modal
function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    showLoginPhoneStep();
}

// Close login modal
function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    resetLoginForm();
}

// Reset login form
function resetLoginForm() {
    document.getElementById('login-phone').value = '';
    document.getElementById('login-otp').value = '';
    document.getElementById('login-phone-error').style.display = 'none';
    document.getElementById('login-otp-error').style.display = 'none';
    showLoginPhoneStep();
}

// Show login phone step
function showLoginPhoneStep() {
    document.getElementById('login-phone-step').classList.add('active');
    document.getElementById('login-otp-step').classList.remove('active');
}

// Show login OTP step
function showLoginOTPStep() {
    document.getElementById('login-phone-step').classList.remove('active');
    document.getElementById('login-otp-step').classList.add('active');
}

// Back to phone step
function backToLoginPhoneStep() {
    showLoginPhoneStep();
}

// Send login OTP
function sendLoginOTP() {
    const phone = document.getElementById('login-phone').value;
    
    if (!phone || !validatePhone(phone)) {
        document.getElementById('login-phone-error').style.display = 'block';
        return;
    }
    
    document.getElementById('login-phone-error').style.display = 'none';
    
    // Check if user exists
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = existingUsers.find(user => user.phone === phone);
    
    if (!user) {
        showNotification('No account found with this phone number. Please register first.', 'error');
        return;
    }
    
    // Generate a random 6-digit OTP (for simulation)
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    loginPhoneNumber = phone;
    
    // In a real app, you would send this OTP to the user's phone via SMS
    console.log(`OTP for ${phone}: ${generatedOTP}`); // For testing purposes
    
    // Show OTP step
    document.getElementById('login-otp-phone-display').textContent = phone;
    showLoginOTPStep();
    
    showNotification('OTP sent to your phone number.', 'success');
}

// Resend login OTP
function resendLoginOTP() {
    // Generate a new OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, you would resend the OTP to the user's phone via SMS
    console.log(`New OTP for ${loginPhoneNumber}: ${generatedOTP}`); // For testing purposes
    
    showNotification('New OTP has been sent to your phone.', 'success');
}

// Verify login OTP
function verifyLoginOTP() {
    const enteredOTP = document.getElementById('login-otp').value;
    
    if (!enteredOTP || enteredOTP.length !== 6 || enteredOTP !== generatedOTP) {
        document.getElementById('login-otp-error').style.display = 'block';
        return;
    }
    
    document.getElementById('login-otp-error').style.display = 'none';
    
    // Login successful - get user details
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = existingUsers.find(user => user.phone === loginPhoneNumber);
    
    if (user) {
        currentUser = { name: user.name, phone: user.phone, email: user.email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserUI();
        closeLoginModal();
        loadUserData();
        showNotification(`Login successful! Welcome back, ${user.name}`, 'success');
    }
}

// Register function
function register() {
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const email = document.getElementById('reg-email').value;
    const address = document.getElementById('reg-address').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    // Basic validation
    if (!name || !phone || !address || !password || !confirmPassword) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    if (!validatePhone(phone)) {
        showNotification('Please enter a valid 10-digit phone number.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'error');
        return;
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    if (existingUsers.find(user => user.phone === phone)) {
        showNotification('An account with this phone number already exists. Please login instead.', 'error');
        return;
    }

    // Create new user
    const newUser = {
        name,
        phone,
        email,
        address,
        password, // Note: In a real app, you would hash the password
        createdAt: new Date().toISOString()
    };

    // Save user
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));

    // Auto login after registration
    currentUser = { name, phone, email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserUI();

    showNotification('Registration successful! You are now logged in.', 'success');
    showSection('home-section');
}

// Show register section from login
function showRegisterSection() {
    closeLoginModal();
    showSection('register-section');
}