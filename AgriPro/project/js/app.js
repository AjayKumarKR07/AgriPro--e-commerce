// ===== MAIN APPLICATION =====

// Initialize the application
function initApp() {
    // Initialize all components
    initNavigation();
    initHomePage();
    initProductsPage();
    initProfileSection();
    initCheckoutSection();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI based on initial state
    updateCartUI();
    updateUserUI();
    
    // Load user data if logged in
    if (currentUser) {
        loadUserData();
    }
    
    // Show home section by default
    showSection('home-section');
}

// Initialize navigation
function initNavigation() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Login button
    document.getElementById('login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            logout();
        } else {
            showLoginModal();
        }
    });
}

// Initialize home page
function initHomePage() {
    initHomeCategories();
    initSteps();
    initTestimonials();
    initFooter();
    displayFeaturedProducts();
}

// Initialize products page
function initProductsPage() {
    setupCategoryFilters();
    displayProducts();
    
    // Search functionality with debounce
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }
}

// Set up event listeners
function setupEventListeners() {
    // Home page CTA buttons
    document.getElementById('shop-now-btn').addEventListener('click', () => showSection('products-section'));
    document.getElementById('get-advice-btn').addEventListener('click', () => showSection('expert-section'));
    
    // Register form
    document.getElementById('register-btn').addEventListener('click', register);
    document.getElementById('login-from-register').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });
    
    // Expert form
    document.getElementById('submit-question-btn').addEventListener('click', submitQuestion);
    
    // Cart and checkout
    document.getElementById('proceed-checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty. Please add items to your cart first.', 'warning');
            return;
        }
        showSection('checkout-section');
    });
    
    // Order confirmation
    document.getElementById('continue-shopping-btn').addEventListener('click', () => showSection('home-section'));
    
    // Login modal
    document.getElementById('close-login-modal').addEventListener('click', closeLoginModal);
    document.getElementById('send-otp-btn').addEventListener('click', sendLoginOTP);
    document.getElementById('verify-otp-btn').addEventListener('click', verifyLoginOTP);
    document.getElementById('resend-otp-btn').addEventListener('click', resendLoginOTP);
    document.getElementById('back-to-phone-btn').addEventListener('click', backToLoginPhoneStep);
    document.getElementById('register-from-login').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterSection();
    });
    
    // Product modal
    document.getElementById('close-product-modal').addEventListener('click', closeProductModal);
    
    // Close modals when clicking outside
    document.getElementById('login-modal').addEventListener('click', (e) => {
        if (e.target.id === 'login-modal') {
            closeLoginModal();
        }
    });
    
    document.getElementById('product-modal').addEventListener('click', (e) => {
        if (e.target.id === 'product-modal') {
            closeProductModal();
        }
    });
}

// Show section function
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Section-specific initialization
    switch(sectionId) {
        case 'cart-section':
            updateCartUI();
            break;
        case 'checkout-section':
            updateCheckoutUI();
            break;
        case 'profile-section':
            if (!currentUser) {
                showNotification('Please login to access your profile.', 'warning');
                showLoginModal();
                return;
            }
            updateProfileUI();
            break;
        case 'products-section':
            // Ensure products are displayed
            displayProducts();
            break;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);