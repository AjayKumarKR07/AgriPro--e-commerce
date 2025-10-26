// ===== PROFILE MANAGEMENT =====

let userQuestions = JSON.parse(localStorage.getItem('userQuestions')) || [];
let userFarmingPreferences = JSON.parse(localStorage.getItem('userFarmingPreferences')) || {};

// Load user data
function loadUserData() {
    if (!currentUser) return;
    
    // Get user details from stored users
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = existingUsers.find(u => u.phone === currentUser.phone);
    
    if (user) {
        currentUser = { ...currentUser, ...user };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Load user orders and questions
    userQuestions = JSON.parse(localStorage.getItem('userQuestions')) || [];
    userFarmingPreferences = JSON.parse(localStorage.getItem('userFarmingPreferences')) || {};
}

// Update profile UI
function updateProfileUI() {
    if (!currentUser) return;
    
    // Update profile header
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-phone').textContent = currentUser.phone;
    document.getElementById('profile-email').textContent = currentUser.email || 'Not provided';
    
    // Update stats
    const ordersCount = userOrders.filter(order => order.userPhone === currentUser.phone).length;
    const questionsCount = userQuestions.filter(q => q.userPhone === currentUser.phone).length;
    const memberSince = currentUser.createdAt ? new Date(currentUser.createdAt).getFullYear() : new Date().getFullYear();
    
    document.getElementById('orders-count').textContent = ordersCount;
    document.getElementById('questions-count').textContent = questionsCount;
    document.getElementById('member-since').textContent = memberSince;
    
    // Update recent orders
    updateRecentOrders();
    
    // Update recent questions
    updateRecentQuestions();
    
    // Update farming preferences
    updateFarmingPreferencesDisplay();
}

// Update recent orders
function updateRecentOrders() {
    const recentOrdersContainer = document.getElementById('recent-orders');
    if (!recentOrdersContainer) return;
    
    const userOrderHistory = userOrders
        .filter(order => order.userPhone === currentUser.phone)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    if (userOrderHistory.length === 0) {
        recentOrdersContainer.innerHTML = '<p>No orders yet. Start shopping to see your orders here.</p>';
        return;
    }
    
    recentOrdersContainer.innerHTML = '';
    userOrderHistory.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div>
                <div class="order-id">${order.id}</div>
                <div class="order-date">${formatDate(order.date)}</div>
            </div>
            <div>
                <div class="order-status ${order.status === 'delivered' ? 'status-delivered' : order.status === 'shipped' ? 'status-shipped' : 'status-pending'}">${order.status}</div>
                <div style="text-align: right; margin-top: 5px;">${formatCurrency(parseInt(order.total))}</div>
            </div>
        `;
        recentOrdersContainer.appendChild(orderElement);
    });
}

// Update recent questions
function updateRecentQuestions() {
    const recentQuestionsContainer = document.getElementById('recent-questions');
    if (!recentQuestionsContainer) return;
    
    const userQuestionHistory = userQuestions
        .filter(q => q.userPhone === currentUser.phone)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    if (userQuestionHistory.length === 0) {
        recentQuestionsContainer.innerHTML = '<p>No questions asked yet. Ask our experts for advice!</p>';
        return;
    }
    
    recentQuestionsContainer.innerHTML = '';
    userQuestionHistory.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'expert-question';
        questionElement.innerHTML = `
            <div class="question-crop">${question.crop}</div>
            <div class="question-text">${question.question.substring(0, 100)}${question.question.length > 100 ? '...' : ''}</div>
            <div class="question-date">${formatDate(question.date)}</div>
            <div class="question-status ${question.answered ? 'status-answered' : 'status-pending'}">${question.answered ? 'Answered' : 'Pending'}</div>
        `;
        recentQuestionsContainer.appendChild(questionElement);
    });
}

// Update farming preferences display
function updateFarmingPreferencesDisplay() {
    const preferencesContainer = document.getElementById('farming-preferences');
    if (!preferencesContainer) return;
    
    const userPrefs = userFarmingPreferences[currentUser.phone] || {};
    
    if (Object.keys(userPrefs).length === 0) {
        preferencesContainer.innerHTML = '<p>No farming preferences set yet. Update your preferences to get personalized recommendations.</p>';
        return;
    }
    
    let preferencesHTML = '<ul style="list-style-type: none; padding-left: 0;">';
    
    if (userPrefs.farmSize) {
        preferencesHTML += `<li><strong>Farm Size:</strong> ${userPrefs.farmSize} acres</li>`;
    }
    
    if (userPrefs.primaryCrops) {
        preferencesHTML += `<li><strong>Primary Crops:</strong> ${userPrefs.primaryCrops}</li>`;
    }
    
    if (userPrefs.soilType) {
        preferencesHTML += `<li><strong>Soil Type:</strong> ${userPrefs.soilType}</li>`;
    }
    
    if (userPrefs.irrigationType) {
        preferencesHTML += `<li><strong>Irrigation Type:</strong> ${userPrefs.irrigationType}</li>`;
    }
    
    if (userPrefs.farmingType) {
        preferencesHTML += `<li><strong>Farming Type:</strong> ${userPrefs.farmingType}</li>`;
    }
    
    preferencesHTML += '</ul>';
    preferencesContainer.innerHTML = preferencesHTML;
}

// Show edit profile form
function showEditProfileForm() {
    document.getElementById('edit-profile-form').classList.remove('hidden');
    
    // Populate form with current user data
    document.getElementById('edit-name').value = currentUser.name || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-address').value = currentUser.address || '';
    document.getElementById('edit-state').value = currentUser.state || '';
    document.getElementById('edit-district').value = currentUser.district || '';
    document.getElementById('edit-pincode').value = currentUser.pincode || '';
}

// Cancel edit profile
function cancelEditProfile() {
    document.getElementById('edit-profile-form').classList.add('hidden');
}

// Update profile
function updateProfile() {
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const address = document.getElementById('edit-address').value;
    const state = document.getElementById('edit-state').value;
    const district = document.getElementById('edit-district').value;
    const pincode = document.getElementById('edit-pincode').value;
    
    if (!name) {
        showNotification('Name is required.', 'error');
        return;
    }
    
    // Update current user
    currentUser.name = name;
    currentUser.email = email;
    currentUser.address = address;
    currentUser.state = state;
    currentUser.district = district;
    currentUser.pincode = pincode;
    
    // Update in localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update in users array
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = existingUsers.findIndex(u => u.phone === currentUser.phone);
    
    if (userIndex !== -1) {
        existingUsers[userIndex] = { ...existingUsers[userIndex], ...currentUser };
        localStorage.setItem('users', JSON.stringify(existingUsers));
    }
    
    // Update UI
    updateUserUI();
    updateProfileUI();
    
    // Hide form
    document.getElementById('edit-profile-form').classList.add('hidden');
    
    showNotification('Profile updated successfully!', 'success');
}

// Show change password form
function showChangePasswordForm() {
    document.getElementById('change-password-form').classList.remove('hidden');
}

// Cancel change password
function cancelChangePassword() {
    document.getElementById('change-password-form').classList.add('hidden');
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showNotification('Please fill in all password fields.', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showNotification('New passwords do not match.', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters long.', 'error');
        return;
    }
    
    // Verify current password
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = existingUsers.find(u => u.phone === currentUser.phone);
    
    if (!user || user.password !== currentPassword) {
        showNotification('Current password is incorrect.', 'error');
        return;
    }
    
    // Update password
    user.password = newPassword;
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    // Hide form
    document.getElementById('change-password-form').classList.add('hidden');
    
    showNotification('Password changed successfully!', 'success');
}

// Show farming preferences form
function showFarmingPreferencesForm() {
    document.getElementById('farming-preferences-form').classList.remove('hidden');
    
    // Populate form with current preferences
    const userPrefs = userFarmingPreferences[currentUser.phone] || {};
    
    document.getElementById('farm-size').value = userPrefs.farmSize || '';
    document.getElementById('primary-crops').value = userPrefs.primaryCrops || '';
    document.getElementById('soil-type').value = userPrefs.soilType || '';
    document.getElementById('irrigation-type').value = userPrefs.irrigationType || '';
    document.getElementById('farming-type').value = userPrefs.farmingType || '';
}

// Cancel farming preferences
function cancelFarmingPreferences() {
    document.getElementById('farming-preferences-form').classList.add('hidden');
}

// Update farming preferences
function updateFarmingPreferences() {
    const farmSize = document.getElementById('farm-size').value;
    const primaryCrops = document.getElementById('primary-crops').value;
    const soilType = document.getElementById('soil-type').value;
    const irrigationType = document.getElementById('irrigation-type').value;
    const farmingType = document.getElementById('farming-type').value;
    
    // Update preferences
    userFarmingPreferences[currentUser.phone] = {
        farmSize,
        primaryCrops,
        soilType,
        irrigationType,
        farmingType
    };
    
    // Save to localStorage
    localStorage.setItem('userFarmingPreferences', JSON.stringify(userFarmingPreferences));
    
    // Update UI
    updateFarmingPreferencesDisplay();
    
    // Hide form
    document.getElementById('farming-preferences-form').classList.add('hidden');
    
    showNotification('Farming preferences updated successfully!', 'success');
}

// Submit expert question
function submitQuestion() {
    if (!requireLogin('ask a question')) return;
    
    const cropType = document.getElementById('crop-type').value;
    const question = document.getElementById('question').value;

    if (!cropType || !question) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    // Create question record
    const questionRecord = {
        userPhone: currentUser.phone,
        crop: cropType,
        question: question,
        date: new Date().toISOString(),
        answered: false
    };
    
    // Save question
    userQuestions.push(questionRecord);
    localStorage.setItem('userQuestions', JSON.stringify(userQuestions));
    
    showNotification('Thank you! Your question has been submitted. An expert will contact you shortly.', 'success');
    document.getElementById('expert-form').reset();
}

// Initialize profile section
function initProfileSection() {
    const profileSection = document.getElementById('profile-section');
    if (!profileSection) return;
    
    profileSection.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="profile-info">
                <h1 id="profile-name">Loading...</h1>
                <p id="profile-phone">Loading...</p>
                <p id="profile-email">Loading...</p>
                <div class="profile-stats">
                    <div class="stat-item">
                        <div class="stat-value" id="orders-count">0</div>
                        <div class="stat-label">Orders</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="questions-count">0</div>
                        <div class="stat-label">Questions Asked</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="member-since">0</div>
                        <div class="stat-label">Member Since</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="dashboard-card">
                <h2><i class="fas fa-history"></i> Recent Orders</h2>
                <div id="recent-orders"></div>
                <button id="view-all-orders-btn" style="width: 100%; margin-top: 15px;">View All Orders</button>
            </div>

            <div class="dashboard-card">
                <h2><i class="fas fa-question-circle"></i> Recent Questions</h2>
                <div id="recent-questions"></div>
                <button id="ask-new-question-btn" style="width: 100%; margin-top: 15px;">Ask New Question</button>
            </div>

            <div class="dashboard-card">
                <h2><i class="fas fa-user-edit"></i> Profile Settings</h2>
                <p>Update your personal information and preferences.</p>
                <div class="profile-actions">
                    <button id="edit-profile-btn"><i class="fas fa-edit"></i> Edit Profile</button>
                    <button class="secondary" id="change-password-btn"><i class="fas fa-key"></i> Change Password</button>
                </div>
            </div>

            <div class="dashboard-card">
                <h2><i class="fas fa-tractor"></i> Farming Preferences</h2>
                <p>Tell us about your farm to get personalized recommendations.</p>
                <div id="farming-preferences"></div>
                <button id="update-preferences-btn" style="width: 100%; margin-top: 15px;">Update Preferences</button>
            </div>
        </div>

        <!-- Edit Profile Form -->
        <div id="edit-profile-form" class="profile-edit-form hidden">
            <h2>Edit Profile</h2>
            <form id="profile-form">
                <div class="form-group">
                    <label for="edit-name">Full Name</label>
                    <input type="text" id="edit-name" required>
                </div>
                <div class="form-group">
                    <label for="edit-email">Email Address</label>
                    <input type="email" id="edit-email">
                </div>
                <div class="form-group">
                    <label for="edit-address">Address</label>
                    <textarea id="edit-address" required></textarea>
                </div>
                <div class="form-group">
                    <label for="edit-state">State</label>
                    <input type="text" id="edit-state">
                </div>
                <div class="form-group">
                    <label for="edit-district">District</label>
                    <input type="text" id="edit-district">
                </div>
                <div class="form-group">
                    <label for="edit-pincode">PIN Code</label>
                    <input type="text" id="edit-pincode">
                </div>
                <button type="button" id="save-profile-btn">Save Changes</button>
                <button type="button" class="secondary" id="cancel-edit-profile-btn">Cancel</button>
            </form>
        </div>

        <!-- Change Password Form -->
        <div id="change-password-form" class="profile-edit-form hidden">
            <h2>Change Password</h2>
            <form id="password-form">
                <div class="form-group">
                    <label for="current-password">Current Password</label>
                    <input type="password" id="current-password" required>
                </div>
                <div class="form-group">
                    <label for="new-password">New Password</label>
                    <input type="password" id="new-password" required>
                </div>
                <div class="form-group">
                    <label for="confirm-new-password">Confirm New Password</label>
                    <input type="password" id="confirm-new-password" required>
                </div>
                <button type="button" id="save-password-btn">Change Password</button>
                <button type="button" class="secondary" id="cancel-password-btn">Cancel</button>
            </form>
        </div>

        <!-- Farming Preferences Form -->
        <div id="farming-preferences-form" class="profile-edit-form hidden">
            <h2>Farming Preferences</h2>
            <form id="preferences-form">
                <div class="form-group">
                    <label for="farm-size">Farm Size (in acres)</label>
                    <input type="number" id="farm-size" min="0" step="0.1">
                </div>
                <div class="form-group">
                    <label for="primary-crops">Primary Crops</label>
                    <input type="text" id="primary-crops" placeholder="e.g., Rice, Wheat, Vegetables">
                </div>
                <div class="form-group">
                    <label for="soil-type">Soil Type</label>
                    <select id="soil-type">
                        <option value="">Select Soil Type</option>
                        <option value="clay">Clay</option>
                        <option value="sandy">Sandy</option>
                        <option value="loamy">Loamy</option>
                        <option value="silt">Silt</option>
                        <option value="peaty">Peaty</option>
                        <option value="chalky">Chalky</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="irrigation-type">Irrigation Type</label>
                    <select id="irrigation-type">
                        <option value="">Select Irrigation Type</option>
                        <option value="rainfed">Rainfed</option>
                        <option value="canal">Canal</option>
                        <option value="well">Well</option>
                        <option value="drip">Drip Irrigation</option>
                        <option value="sprinkler">Sprinkler</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="farming-type">Farming Type</label>
                    <select id="farming-type">
                        <option value="">Select Farming Type</option>
                        <option value="organic">Organic</option>
                        <option value="conventional">Conventional</option>
                        <option value="mixed">Mixed</option>
                    </select>
                </div>
                <button type="button" id="save-preferences-btn">Save Preferences</button>
                <button type="button" class="secondary" id="cancel-preferences-btn">Cancel</button>
            </form>
        </div>
    `;
    
    // Add event listeners for profile section
    document.getElementById('view-all-orders-btn').addEventListener('click', () => showSection('cart-section'));
    document.getElementById('ask-new-question-btn').addEventListener('click', () => showSection('expert-section'));
    document.getElementById('edit-profile-btn').addEventListener('click', showEditProfileForm);
    document.getElementById('change-password-btn').addEventListener('click', showChangePasswordForm);
    document.getElementById('update-preferences-btn').addEventListener('click', showFarmingPreferencesForm);
    
    document.getElementById('save-profile-btn').addEventListener('click', updateProfile);
    document.getElementById('cancel-edit-profile-btn').addEventListener('click', cancelEditProfile);
    
    document.getElementById('save-password-btn').addEventListener('click', changePassword);
    document.getElementById('cancel-password-btn').addEventListener('click', cancelChangePassword);
    
    document.getElementById('save-preferences-btn').addEventListener('click', updateFarmingPreferences);
    document.getElementById('cancel-preferences-btn').addEventListener('click', cancelFarmingPreferences);
}