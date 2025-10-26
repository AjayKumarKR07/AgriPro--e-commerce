// ===== CART MANAGEMENT =====

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
let selectedPaymentMethod = '';

// Add product to cart
function addToCart(productId) {
    if (!requireLogin('add items to cart')) return;
    
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification(`${product.name} added to cart!`, 'success');
}

// Remove product from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }
}

// Remove all of a product from cart
function removeAllFromCart(productId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const productName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
            showNotification(`${productName} removed from cart.`, 'success');
        }
    }
}

// Update cart UI
function updateCartUI() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;

    const cartItemsContainer = document.getElementById('cart-items');
    const totalAmountElement = document.getElementById('cart-total-amount');

    if (cartItemsContainer && totalAmountElement) {
        cartItemsContainer.innerHTML = '';
        let totalAmount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Start shopping to add items to your cart</p>
                    <button id="browse-products-btn">Browse Products</button>
                </div>
            `;
            
            document.getElementById('browse-products-btn').addEventListener('click', () => {
                showSection('products-section');
            });
            
            totalAmountElement.textContent = '0';
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;

            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="cart-item-details">
                    <div>
                        <h3>${item.name}</h3>
                        <p>${formatCurrency(item.price)} per item</p>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div class="cart-quantity">
                            <button class="decrease-quantity" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-quantity" data-id="${item.id}">+</button>
                        </div>
                        <p style="margin-left: 15px; font-weight: bold;">${formatCurrency(itemTotal)}</p>
                        <button class="remove-from-cart remove-all-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        // Add event listeners for cart buttons
        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                addToCart(productId);
            });
        });
        
        document.querySelectorAll('.remove-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.getAttribute('data-id'));
                removeAllFromCart(productId);
            });
        });

        totalAmountElement.textContent = totalAmount;
    }
}

// Update checkout UI
function updateCheckoutUI() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const shippingElement = document.getElementById('checkout-shipping');
    const totalElement = document.getElementById('checkout-total');
    
    if (!checkoutItemsContainer || !subtotalElement) return;
    
    checkoutItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        subtotalElement.textContent = '0';
        shippingElement.textContent = '0';
        totalElement.textContent = '0';
        return;
    }
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const checkoutItemElement = document.createElement('div');
        checkoutItemElement.className = 'checkout-summary-item';
        checkoutItemElement.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatCurrency(itemTotal)}</span>
        `;
        checkoutItemsContainer.appendChild(checkoutItemElement);
    });
    
    // Calculate shipping (free for orders above ₹999, otherwise ₹50)
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = subtotal;
    shippingElement.textContent = shipping;
    totalElement.textContent = total;
    
    // Populate shipping form with user data if available
    if (currentUser) {
        document.getElementById('full-name').value = currentUser.name || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('address').value = currentUser.address || '';
    }
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll('.payment-method').forEach(el => {
        if (el.querySelector('input').id === `${method}-payment`) {
            el.classList.add('selected');
        }
    });
    
    // Show appropriate payment details
    document.getElementById('card-details').classList.add('hidden');
    document.getElementById('upi-details').classList.add('hidden');
    
    if (method === 'card') {
        document.getElementById('card-details').classList.remove('hidden');
    } else if (method === 'upi') {
        document.getElementById('upi-details').classList.remove('hidden');
    }
}

// Place order
function placeOrder() {
    if (!requireLogin('place an order')) return;
    
    if (cart.length === 0) {
        showNotification('Your cart is empty. Please add items to your cart before placing an order.', 'error');
        showSection('products-section');
        return;
    }
    
    // Validate shipping form
    const fullName = document.getElementById('full-name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value;
    
    if (!fullName || !phone || !address || !city || !state || !pincode) {
        showNotification('Please fill in all shipping information fields.', 'error');
        return;
    }
    
    // Validate payment method
    if (!selectedPaymentMethod) {
        showNotification('Please select a payment method.', 'error');
        return;
    }
    
    // Validate payment details based on selected method
    if (selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const cardName = document.getElementById('card-name').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
            showNotification('Please fill in all card details.', 'error');
            return;
        }
    } else if (selectedPaymentMethod === 'upi') {
        const upiId = document.getElementById('upi-id').value;
        
        if (!upiId) {
            showNotification('Please enter your UPI ID.', 'error');
            return;
        }
    }
    
    // Generate random order ID
    const orderId = generateId('FC-');
    document.getElementById('order-id').textContent = orderId;
    
    // Create order record
    const order = {
        id: orderId,
        userPhone: currentUser.phone,
        date: new Date().toISOString(),
        items: [...cart],
        total: document.getElementById('checkout-total').textContent,
        status: 'pending',
        shippingInfo: {
            fullName,
            phone,
            address,
            city,
            state,
            pincode
        },
        paymentMethod: selectedPaymentMethod
    };
    
    // Save order
    userOrders.push(order);
    localStorage.setItem('userOrders', JSON.stringify(userOrders));
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    
    // Show confirmation
    showSection('order-confirmation-section');
    showNotification('Order placed successfully!', 'success');
}

// Initialize checkout section
function initCheckoutSection() {
    const checkoutSection = document.getElementById('checkout-section');
    if (!checkoutSection) return;
    
    checkoutSection.innerHTML = `
        <h1 class="section-title">Checkout</h1>
        
        <div class="checkout-grid">
            <div>
                <h2>Shipping Information</h2>
                <form id="shipping-form">
                    <div class="form-group">
                        <label for="full-name">Full Name</label>
                        <input type="text" id="full-name" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="address">Address</label>
                        <textarea id="address" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="city">City</label>
                        <input type="text" id="city" required>
                    </div>
                    <div class="form-group">
                        <label for="state">State</label>
                        <input type="text" id="state" required>
                    </div>
                    <div class="form-group">
                        <label for="pincode">PIN Code</label>
                        <input type="text" id="pincode" required>
                    </div>
                </form>
                
                <h2>Payment Method</h2>
                <div class="payment-methods">
                    <div class="payment-method" id="card-payment-method">
                        <input type="radio" name="payment-method" id="card-payment">
                        <label for="card-payment">
                            <i class="fas fa-credit-card payment-method-icon"></i>
                            Credit/Debit Card
                        </label>
                    </div>
                    <div class="payment-method" id="upi-payment-method">
                        <input type="radio" name="payment-method" id="upi-payment">
                        <label for="upi-payment">
                            <i class="fas fa-mobile-alt payment-method-icon"></i>
                            UPI
                        </label>
                    </div>
                    <div class="payment-method" id="cod-payment-method">
                        <input type="radio" name="payment-method" id="cod-payment">
                        <label for="cod-payment">
                            <i class="fas fa-money-bill-wave payment-method-icon"></i>
                            Cash on Delivery
                        </label>
                    </div>
                </div>
                
                <div id="card-details" class="hidden">
                    <h3>Card Details</h3>
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456">
                    </div>
                    <div class="form-group">
                        <label for="card-name">Name on Card</label>
                        <input type="text" id="card-name">
                    </div>
                    <div style="display: flex; gap: 15px;">
                        <div class="form-group" style="flex: 1;">
                            <label for="card-expiry">Expiry Date</label>
                            <input type="text" id="card-expiry" placeholder="MM/YY">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="card-cvv">CVV</label>
                            <input type="text" id="card-cvv" placeholder="123">
                        </div>
                    </div>
                </div>
                
                <div id="upi-details" class="hidden">
                    <h3>UPI Details</h3>
                    <div class="form-group">
                        <label for="upi-id">UPI ID</label>
                        <input type="text" id="upi-id" placeholder="yourname@upi">
                    </div>
                </div>
            </div>
            
            <div class="checkout-summary">
                <h2>Order Summary</h2>
                <div id="checkout-items"></div>
                <div class="checkout-summary-item">
                    <span>Subtotal</span>
                    <span>₹<span id="checkout-subtotal">0</span></span>
                </div>
                <div class="checkout-summary-item">
                    <span>Shipping</span>
                    <span>₹<span id="checkout-shipping">0</span></span>
                </div>
                <div class="checkout-summary-item" style="font-weight: bold; font-size: 1.2rem;">
                    <span>Total</span>
                    <span>₹<span id="checkout-total">0</span></span>
                </div>
                
                <button id="place-order-btn" style="width: 100%; margin-top: 20px;">Place Order</button>
                <button class="secondary" id="back-to-cart-btn" style="width: 100%; margin-top: 10px;">Back to Cart</button>
            </div>
        </div>
    `;
    
    // Add event listeners for checkout
    document.getElementById('card-payment-method').addEventListener('click', () => selectPaymentMethod('card'));
    document.getElementById('upi-payment-method').addEventListener('click', () => selectPaymentMethod('upi'));
    document.getElementById('cod-payment-method').addEventListener('click', () => selectPaymentMethod('cod'));
    
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
    document.getElementById('back-to-cart-btn').addEventListener('click', () => showSection('cart-section'));
}