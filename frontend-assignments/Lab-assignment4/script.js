// Static array of product objects with all required properties
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 2499,
    originalPrice: 3499,
    description: "Comfortable wireless headphones with clear sound and deep bass.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    discount: 29,
    category: "Electronics",
    rating: 4.5,
    inStock: true
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 1999,
    originalPrice: 2999,
    description: "Track fitness, heart rate, and notifications with a sleek display.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    discount: 33,
    category: "Wearables",
    rating: 4.2,
    inStock: true
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 1799,
    originalPrice: 2499,
    description: "Lightweight breathable running shoes built for daily comfort.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    discount: 28,
    category: "Footwear",
    rating: 4.4,
    inStock: true
  },
  {
    id: 4,
    name: "Casual Sneakers",
    price: 1799,
    originalPrice: 2499,
    description: "Stylish everyday sneakers with cushioned soles and durable grip.",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80",
    discount: 28,
    category: "Footwear",
    rating: 4.4,
    inStock: true
  },
  {
    id: 5,
    name: "Coffee Maker",
    price: 3499,
    originalPrice: 4499,
    description: "Compact drip coffee maker for rich, freshly brewed coffee at home.",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80",
    discount: 22,
    category: "Home Appliances",
    rating: 4.6,
    inStock: false
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    price: 1499,
    originalPrice: 2199,
    description: "Portable water-resistant speaker with 12-hour battery life.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
    discount: 32,
    category: "Electronics",
    rating: 4.3,
    inStock: true
  }
];

// Shopping cart state (pre-populated or empty — starts empty and updates dynamically)
let cart = [];

// DOM Elements
const productGrid = document.getElementById("product-grid");
const cartSidebar = document.getElementById("cart-sidebar");
const cartItemsContainer = document.getElementById("cart-items");
const cartBadge = document.getElementById("cart-badge");
const cartTotalItemsEl = document.getElementById("cart-total-items");
const cartGrandTotalEl = document.getElementById("cart-grand-total");
const cartToggleBtn = document.getElementById("cart-toggle-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const checkoutBtn = document.getElementById("checkout-btn");

// Format number in Indian Rupee format (e.g., ₹ 2,499)
function formatPrice(amount) {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

// Dynamically render product cards
function renderProducts() {
  productGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = `product-card ${product.inStock ? "" : "out-of-stock"}`;

    card.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
        ${!product.inStock ? '<span class="out-of-stock-badge">OUT OF STOCK</span>' : ""}
      </div>
      <div class="product-body">
        <div class="product-title-row">
          <h3 class="product-name">${product.name}</h3>
          <span class="product-rating">
            <span class="star-icon">&#9733;</span> ${product.rating}
          </span>
        </div>
        <p class="product-description">${product.description}</p>
        <div class="product-price-row">
          <div class="price-group">
            <span class="current-price">${formatPrice(product.price)}</span>
            <span class="original-price">${formatPrice(product.originalPrice)}</span>
          </div>
          ${product.inStock ? `<span class="discount-badge">${product.discount}% OFF</span>` : ""}
        </div>
        <button
          class="add-to-cart-btn"
          data-id="${product.id}"
          ${!product.inStock ? "disabled" : ""}
        >
          Add to Cart
        </button>
      </div>
    `;

    productGrid.appendChild(card);
  });
}

// Add a product to the cart
function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !product.inStock) return;

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  cartSidebar.classList.remove("hidden");
  renderCart();
}

// Update quantity of a cart item (+1 or -1)
function updateQuantity(productId, delta) {
  const itemIndex = cart.findIndex((item) => item.id === productId);
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;

  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  renderCart();
}

// Render shopping cart sidebar and totals
function renderCart() {
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty. Add products to get started.</p>';
  } else {
    cart.forEach((item) => {
      const subtotal = item.price * item.quantity;
      const cartItemEl = document.createElement("div");
      cartItemEl.className = "cart-item";

      cartItemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-row">
            <span>Quantity:</span>
            <div class="qty-controls">
              <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-item-row">
            <span>Subtotal:</span>
            <span class="cart-item-subtotal">${formatPrice(subtotal)}</span>
          </div>
        </div>
      `;

      cartItemsContainer.appendChild(cartItemEl);
    });
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartBadge.textContent = totalItems;
  cartTotalItemsEl.textContent = totalItems;
  cartGrandTotalEl.textContent = formatPrice(grandTotal);
}

// Event Listeners
productGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".add-to-cart-btn");
  if (!btn || btn.disabled) return;

  const productId = Number(btn.dataset.id);
  addToCart(productId);
});

cartItemsContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".qty-btn");
  if (!btn) return;

  const productId = Number(btn.dataset.id);
  const action = btn.dataset.action;
  updateQuantity(productId, action === "increase" ? 1 : -1);
});

cartToggleBtn.addEventListener("click", () => {
  cartSidebar.classList.toggle("hidden");
});

closeCartBtn.addEventListener("click", () => {
  cartSidebar.classList.add("hidden");
});

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your shopping cart is empty!");
    return;
  }

  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert(`Order placed successfully! Grand Total: ${formatPrice(grandTotal)}`);
  cart = [];
  renderCart();
});

// Initialize page
renderProducts();
renderCart();
