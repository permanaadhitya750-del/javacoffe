// Data Menu dengan gambar yang lebih menggugah selera (menggunakan gambar tematik)
const menuData = {
  coffee: [
    { id: 1, name: "Espresso", price: 25000, img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop" },
    { id: 2, name: "Caramel Latte", price: 35000, img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=400&fit=crop" },
    { id: 3, name: "Cappuccino", price: 33000, img: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=400&fit=crop" },
    { id: 4, name: "Mocha", price: 36000, img: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=400&fit=crop" }
  ],
  "non-coffee": [
    { id: 5, name: "Matcha Latte", price: 35000, img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop" },
    { id: 6, name: "Chocolate Bliss", price: 32000, img: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop" },
    { id: 7, name: "Vanilla Milkshake", price: 38000, img: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=400&fit=crop" },
    { id: 8, name: "Lemon Mint Tea", price: 24000, img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop" }
  ],
  snack: [
    { id: 9, name: "Cheese Cake", price: 29000, img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop" },
    { id: 10, name: "Butter Croissant", price: 22000, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop" },
    { id: 11, name: "French Fries", price: 25000, img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop" },
    { id: 12, name: "Choco Lava Cake", price: 32000, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop" }
  ]
};

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

let currentTable = null;
let cart = [];

// DOM Elements
const menuGrid = document.getElementById('menuGrid');
const categoryBtns = document.querySelectorAll('.category-btn');
const tableDisplayHero = document.getElementById('tableNumberDisplayHero');
const cartCountBadge = document.getElementById('cartCountBadge');
const cartPanel = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalPriceSpan = document.getElementById('cartTotalPrice');
const cartIconBtn = document.getElementById('cartIconBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderModal = document.getElementById('orderModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const orderForm = document.getElementById('orderForm');
const tableNumberInput = document.getElementById('tableNumberInput');
const qrisContainer = document.getElementById('qrisContainer');
const toastMsgDiv = document.getElementById('toastMsg');

function getTableFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get('meja');
  let tableNum = parseInt(tableParam);
  if (tableParam && !isNaN(tableNum) && tableNum >= 1 && tableNum <= 10) {
    return tableNum;
  }
  return Math.floor(Math.random() * 10) + 1;
}

function loadCart() {
  const saved = localStorage.getItem('javaCoffeeCart');
  if (saved) {
    try { cart = JSON.parse(saved); } catch(e) { cart = []; }
  }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('javaCoffeeCart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartCountBadge.innerText = totalItems;
  
  if (cartItemsList) {
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<div class="empty-cart-msg">✨ Keranjang masih kosong</div>';
      cartTotalPriceSpan.innerText = formatRupiah(0);
      return;
    }
    let html = '', total = 0;
    cart.forEach((item, idx) => {
      total += item.price * item.quantity;
      html += `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatRupiah(item.price)}</div>
          </div>
          <div class="cart-item-actions">
            <button class="qty-btn dec-qty" data-id="${item.id}">-</button>
            <span class="item-qty">${item.quantity}</span>
            <button class="qty-btn inc-qty" data-id="${item.id}">+</button>
          </div>
        </div>
      `;
    });
    cartItemsList.innerHTML = html;
    cartTotalPriceSpan.innerText = formatRupiah(total);
    
    document.querySelectorAll('.dec-qty').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), -1));
    });
    document.querySelectorAll('.inc-qty').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), 1));
    });
  }
}

function updateQuantity(itemId, delta) {
  const index = cart.findIndex(i => i.id === itemId);
  if (index !== -1) {
    const newQty = cart[index].quantity + delta;
    if (newQty <= 0) cart.splice(index, 1);
    else cart[index].quantity = newQty;
    saveCart();
  }
}

function addToCart(item) {
  const exist = cart.find(i => i.id === item.id);
  if (exist) exist.quantity += 1;
  else cart.push({ ...item, quantity: 1 });
  saveCart();
  showToast(`${item.name} ditambahkan ke keranjang`);
}

function showToast(msg) {
  toastMsgDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  toastMsgDiv.classList.add('show');
  setTimeout(() => toastMsgDiv.classList.remove('show'), 2000);
}

function renderMenu(category) {
  const items = menuData[category];
  if (!items) return;
  menuGrid.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <img class="menu-img" src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.src='https://placehold.co/400x400/E9DFD3/8B5A2B?text=${item.name}'">
      <div class="menu-info">
        <div class="menu-name">${item.name}</div>
        <div class="menu-price">${formatRupiah(item.price)}</div>
        <button class="add-btn" data-id="${item.id}">Tambah</button>
      </div>
    `;
    menuGrid.appendChild(card);
  });
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      const found = items.find(i => i.id === id);
      if (found) addToCart(found);
    });
  });
}

// Category
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMenu(btn.dataset.cat);
  });
});

function openCart() { cartPanel.classList.add('open'); cartOverlay.classList.add('open'); }
function closeCart() { cartPanel.classList.remove('open'); cartOverlay.classList.remove('open'); }
cartIconBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) { showToast("Keranjang masih kosong"); return; }
  closeCart();
  tableNumberInput.value = `Meja ${currentTable}`;
  orderModal.classList.add('open');
});

// Payment method
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    qrisContainer.style.display = e.target.value === 'noncash' ? 'block' : 'none';
  });
});

orderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  if (!name || !phone || !email) { showToast("Lengkapi data diri"); return; }
  if (cart.length === 0) { showToast("Keranjang kosong"); return; }
  
  console.log("Pesanan terkirim:", { meja: currentTable, customer: {name, phone, email}, items: cart, total: cart.reduce((s,i)=> s+(i.price*i.quantity),0) });
  cart = [];
  saveCart();
  orderModal.classList.remove('open');
  showToast("Pesanan berhasil dikirim ✅");
  orderForm.reset();
  qrisContainer.style.display = 'none';
  document.querySelector('input[value="cash"]').checked = true;
});

closeModalBtn.addEventListener('click', () => orderModal.classList.remove('open'));

function init() {
  currentTable = getTableFromURL();
  tableDisplayHero.innerText = `Meja ${currentTable}`;
  document.title = `Java Coffee | Meja ${currentTable}`;
  loadCart();
  renderMenu('coffee');
  document.body.classList.add('fade-in');
}
init();