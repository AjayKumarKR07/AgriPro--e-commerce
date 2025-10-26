// ===== PRODUCTS MANAGEMENT =====

let activeCategory = 'all';
let searchQuery = '';

// Display all products
function displayProducts() {
    displayFilteredProducts(products);
}

// Display filtered products
function displayFilteredProducts(productsToDisplay) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <span class="product-category">${product.category}</span>
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">${getStarRating(product.rating)}</div>
                <p class="product-price">${formatCurrency(product.price)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                <button class="secondary view-details-btn" data-id="${product.id}" style="margin-top: 10px;">View Details</button>
            </div>
        `;
        productsContainer.appendChild(productElement);
    });
    
    // Add event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            showProductDetails(productId);
        });
    });
}

// Display featured products
function displayFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products-container');
    if (!featuredContainer) return;
    
    featuredContainer.innerHTML = '';
    const featuredProducts = products.filter(product => product.featured);
    
    featuredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <span class="product-category">${product.category}</span>
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">${getStarRating(product.rating)}</div>
                <p class="product-price">${formatCurrency(product.price)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                <button class="secondary view-details-btn" data-id="${product.id}" style="margin-top: 10px;">View Details</button>
            </div>
        `;
        featuredContainer.appendChild(productElement);
    });
    
    // Add event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            showProductDetails(productId);
        });
    });
}

// Show product details modal
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modalBody = document.getElementById('product-modal-body');
    modalBody.innerHTML = `
        <div class="product-modal-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-modal-info">
            <h2>${product.name}</h2>
            <div class="product-rating">${getStarRating(product.rating)}</div>
            <div class="product-modal-price">${formatCurrency(product.price)}</div>
            <p class="product-modal-description">${product.detailedDescription}</p>
            
            <h3>Key Features</h3>
            <ul class="product-modal-features">
                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            
            <button id="modal-add-to-cart" data-id="${product.id}" style="margin-right: 10px;">Add to Cart</button>
            <button class="secondary" id="close-product-modal-btn">Continue Shopping</button>
        </div>
    `;
    
    document.getElementById('product-modal').classList.remove('hidden');
    
    // Add event listeners for modal buttons
    document.getElementById('modal-add-to-cart').addEventListener('click', () => {
        addToCart(product.id);
        closeProductModal();
    });
    
    document.getElementById('close-product-modal-btn').addEventListener('click', closeProductModal);
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

// Setup category filters
function setupCategoryFilters() {
    const categories = ['all', 'Seeds', 'Fertilizers', 'Tools', 'Protection'];
    const filtersContainer = document.getElementById('category-filters');
    
    if (!filtersContainer) return;
    
    filtersContainer.innerHTML = '';
    
    categories.forEach(category => {
        const filterElement = document.createElement('div');
        filterElement.className = `category-filter ${category === 'all' ? 'active' : ''}`;
        filterElement.setAttribute('data-category', category);
        filterElement.textContent = category === 'all' ? 'All Products' : category;
        filtersContainer.appendChild(filterElement);
    });
    
    // Add event listeners
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            // Update active filter
            document.querySelectorAll('.category-filter').forEach(f => {
                f.classList.remove('active');
            });
            filter.classList.add('active');
            
            // Filter products
            activeCategory = filter.getAttribute('data-category');
            filterProducts();
        });
    });
}

// Set active category
function setActiveCategory(category) {
    activeCategory = category;
    
    // Update active filter
    document.querySelectorAll('.category-filter').forEach(f => {
        f.classList.remove('active');
        if (f.getAttribute('data-category') === category) {
            f.classList.add('active');
        }
    });
    
    filterProducts();
}

// Filter products based on category and search
function filterProducts() {
    searchQuery = document.getElementById('product-search').value.toLowerCase();
    
    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) || 
                            product.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    
    displayFilteredProducts(filteredProducts);
}

// Initialize home page categories
function initHomeCategories() {
    const categories = [
        { name: 'Seeds', icon: 'fas fa-seedling', description: 'High-yield varieties for better harvest' },
        { name: 'Fertilizers', icon: 'fas fa-flask', description: 'Organic and chemical nutrients' },
        { name: 'Tools', icon: 'fas fa-tools', description: 'Quality farming tools' },
        { name: 'Protection', icon: 'fas fa-spray-can', description: 'Pesticides and safe solutions' }
    ];
    
    const categoryGrid = document.getElementById('category-grid');
    if (!categoryGrid) return;
    
    categoryGrid.innerHTML = '';
    
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-card';
        categoryElement.innerHTML = `
            <div class="category-icon"><i class="${category.icon}"></i></div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
        `;
        categoryElement.addEventListener('click', () => {
            showSection('products-section');
            setActiveCategory(category.name);
        });
        categoryGrid.appendChild(categoryElement);
    });
}

// Initialize steps
function initSteps() {
    const steps = [
        { number: 1, title: 'Browse Products', description: 'Explore our wide range of agricultural inputs from trusted brands.' },
        { number: 2, title: 'Get Expert Advice', description: 'Connect with our agricultural experts for personalized guidance.' },
        { number: 3, title: 'Place Order', description: 'Order easily and get delivery at your doorstep.' },
        { number: 4, title: 'Grow Better', description: 'Implement recommendations and improve your yield.' }
    ];
    
    const stepsContainer = document.getElementById('steps-container');
    if (!stepsContainer) return;
    
    stepsContainer.innerHTML = '';
    
    steps.forEach(step => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step-card';
        stepElement.innerHTML = `
            <div class="step-number">${step.number}</div>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
        `;
        stepsContainer.appendChild(stepElement);
    });
}

// Initialize testimonials
function initTestimonials() {
    const testimonials = [
        { text: "The quality of seeds I received from Agripro was excellent. My tomato yield increased by 30% compared to last season.", author: "Rajesh Kumar, Tamil Nadu" },
        { text: "The expert advice helped me save my sugarcane crop from disease. Thank you for the timely support!", author: "Sunita Patel, Maharashtra" },
        { text: "The app is easy to use even for someone like me who isn't very comfortable with technology. Great service!", author: "Abdul Rahman, Uttar Pradesh" }
    ];
    
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (!testimonialsContainer) return;
    
    testimonialsContainer.innerHTML = '';
    
    testimonials.forEach(testimonial => {
        const testimonialElement = document.createElement('div');
        testimonialElement.className = 'testimonial-card';
        testimonialElement.innerHTML = `
            <div class="testimonial-text">${testimonial.text}</div>
            <div class="testimonial-author">${testimonial.author}</div>
        `;
        testimonialsContainer.appendChild(testimonialElement);
    });
}

// Initialize footer
function initFooter() {
    const footerContent = document.getElementById('footer-content');
    if (!footerContent) return;
    
    footerContent.innerHTML = `
        <div class="footer-column">
            <h3>Agripro</h3>
            <p>Empowering farmers with technology, quality inputs, and expert knowledge for sustainable agriculture.</p>
            <div class="social-links">
                <a href="#"><i class="fab fa-facebook"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
        </div>
        <div class="footer-column">
            <h3>Quick Links</h3>
            <ul>
                <li><a href="#" data-section="home-section">Home</a></li>
                <li><a href="#" data-section="products-section">Products</a></li>
                <li><a href="#" data-section="expert-section">Ask Expert</a></li>
                <li><a href="#" data-section="register-section">Register</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </div>
        <div class="footer-column">
            <h3>Contact Info</h3>
            <ul>
                <li><i class="fas fa-phone"></i> +91 1800-123-4567</li>
                <li><i class="fas fa-envelope"></i> support@agripro.com</li>
                <li><i class="fas fa-map-marker-alt"></i> Bangalore, India</li>
            </ul>
        </div>
    `;
    
    // Add event listeners for footer links
    document.querySelectorAll('.footer-column a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}