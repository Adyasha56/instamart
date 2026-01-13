
    const products = [
      { id: 101, title: 'Bananas (1kg)', price: 49, img: 'images/banana.jpg', category: 'fruits', desc: 'Ripe bananas, perfect for breakfast.' },
      { id: 102, title: 'Tomatoes (1kg)', price: 39, img: 'images/tomato.jpg', category: 'veggies', desc: 'Fresh red tomatoes from local farms.' },
      { id: 103, title: 'Fresh Milk 1L', price: 45, img: 'images/milk.jpg', category: 'dairy', desc: 'Full cream farm milk.' },
      { id: 104, title: 'Potato Chips', price: 59, img: 'images/chips.jpg', category: 'snacks', desc: 'Crispy salted chips.' },
      { id: 105, title: 'Orange Juice 1L', price: 129, img: 'images/juice.jpg', category: 'beverages', desc: 'Cold-pressed orange juice.' },
      { id: 106, title: 'Paneer 200g', price: 99, img: 'images/paneer.jpg', category: 'dairy', desc: 'Fresh cottage cheese.' },
      { id: 107, title: 'Apples (1kg)', price: 129, img: 'images/apples.jpg', category: 'fruits', desc: 'Crisp and juicy apples.' },
      { id: 108, title: 'Green Tea (box)', price: 199, img: 'images/tea.jpg', category: 'beverages', desc: 'Premium green tea bags.' },
      { id: 109, title: 'Cucumbers (500g)', price: 29, img: 'images/cucumber.jpg', category: 'veggies', desc: 'Cool and fresh cucumbers.' },
      { id: 110, title: 'Brown Bread (400g)', price: 45, img: 'images/bread.jpg', category: 'bakery', desc: 'Soft, healthy brown bread.' },
      { id: 111, title: 'Butter 200g', price: 120, img: 'images/butter.jpg', category: 'dairy', desc: 'Rich and creamy butter.' },
      { id: 112, title: 'Cold Coffee 200ml', price: 60, img: 'images/coffee.jpg', category: 'beverages', desc: 'Chilled and energizing coffee drink.' },
      { id: 113, title: 'Lays Masala Chips', price: 35, img: 'images/lays.jpg', category: 'snacks', desc: 'Indian-style spicy potato chips.' },
      { id: 114, title: 'Eggs (6 pieces)', price: 55, img: 'images/eggs.jpg', category: 'dairy', desc: 'Farm-fresh eggs, rich in protein.' },
      { id: 115, title: 'Mangoes (1kg)', price: 149, img: 'images/mangoes.jpg', category: 'fruits', desc: 'Sweet and juicy summer mangoes.' },
      { id: 116, title: 'Spinach (bunch)', price: 25, img: 'images/spinach.jpg', category: 'veggies', desc: 'Fresh green spinach leaves.' },
      { id: 117, title: 'Cheese Slices (10pc)', price: 135, img: 'images/cheese.jpg', category: 'dairy', desc: 'Soft and melty cheese slices.' },
      { id: 118, title: 'Chocolate Cookies', price: 89, img: 'images/cookies.jpg', category: 'snacks', desc: 'Crunchy chocolate chip cookies.' },
      { id: 119, title: 'Coca-Cola 1.25L', price: 85, img: 'images/coke.jpg', category: 'beverages', desc: 'Chilled fizzy cola drink.' },
      { id: 120, title: 'Onions (1kg)', price: 45, img: 'images/onions.jpg', category: 'veggies', desc: 'Fresh and crisp red onions.' },
      { id: 121, title: 'Strawberries (250g)', price: 99, img: 'images/strawberry.jpg', category: 'fruits', desc: 'Sweet, tangy, and juicy berries.' },
      { id: 122, title: 'Peanut Butter 500g', price: 199, img: 'images/peanutbutter.jpg', category: 'snacks', desc: 'Protein-rich creamy peanut butter.' },
      { id: 123, title: 'Cold Drink Mix (pack)', price: 75, img: 'images/drinkmix.jpg', category: 'beverages', desc: 'Refreshing instant drink powders.' },
      { id: 124, title: 'Curd 500g', price: 55, img: 'images/curd.jpg', category: 'dairy', desc: 'Thick and creamy homemade-style curd.' },
      { id: 125, title: 'Garlic (250g)', price: 30, img: 'images/garlic.jpg', category: 'veggies', desc: 'Strong-flavored fresh garlic bulbs.' },
      { id: 126, title: 'Kellogg’s Corn Flakes', price: 195, img: 'images/cornflakes.jpg', category: 'snacks', desc: 'Crispy breakfast flakes with iron.' },
      { id: 127, title: 'Pineapple Juice 1L', price: 139, img: 'images/pineapplejuice.jpg', category: 'beverages', desc: 'Freshly squeezed pineapple juice.' },
      { id: 128, title: 'Watermelon (1pc)', price: 79, img: 'images/watermelon.jpg', category: 'fruits', desc: 'Juicy and hydrating summer fruit.' },
      { id: 129, title: 'Wooden Coffee Table', price: 2499, img: 'images/coffeetable.jpg', category: 'furniture', desc: 'Compact and elegant wooden coffee table.' },
      {id:130,title:'Sofa Cushion',price:499,img:'images/cushion.jpg',category:'furniture',desc:'soft and stylish cushion for your sofa.'},
      { id: 131, title: 'Wall Clock', price: 899, img: 'images/clock.jpg', category: 'furniture', desc: 'Minimal design silent wall clock.' },
      { id: 132, title: 'Laundry Basket', price: 599, img: 'images/laundrybasket.jpg', category: 'furniture', desc: 'Foldable and lightweight laundry basket.' },
      { id: 133, title: 'Wooden Hanger Set (Pack of 5)', price: 349, img: 'images/hangers.jpg', category: 'furniture', desc: 'Durable hangers made from natural wood.' },

    ];

    const categories = [...new Set(products.map(p => p.category))];

    // CART (localStorage)
    let CART = JSON.parse(localStorage.getItem('CART') || '{}');

    // UI elements
    const categoriesEl = document.getElementById('categories');
    const productsEl = document.getElementById('products');
    const navCartCount = document.getElementById('navCartCount');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartList = document.getElementById('cartList');

    // MODAL state
    let modalState = { open: false, product: null, qty: 1 };

    function renderCategories() {
      // @ts-ignore
      categoriesEl.innerHTML = '';
      // @ts-ignore
      const allBtn = document.createElement('div'); allBtn.className = 'cat'; allBtn.innerHTML = `<div style="align-items:center;position:relative;top:30px;font-weight:700;)">All</div>`; allBtn.onclick = () => renderProducts(); categoriesEl.appendChild(allBtn);
      categories.forEach(c => {
        // @ts-ignore
        const img = products.find(p => p.category === c).img;
        const d = document.createElement('div'); d.className = 'cat'; d.innerHTML = `<img src="${img}" alt="${c}" /><div style="text-transform:capitalize">${c}</div>`;
        d.onclick = () => renderProducts(products.filter(p => p.category === c));
        // @ts-ignore
        categoriesEl.appendChild(d);
      });
    }

    function renderProducts(list = products) {
      // @ts-ignore
      const sortVal = document.getElementById('sortSelect').value;
      let arr = [...list];
      if (sortVal === 'price-asc') arr.sort((a, b) => a.price - b.price);
      if (sortVal === 'price-desc') arr.sort((a, b) => b.price - a.price);

      // @ts-ignore
      productsEl.innerHTML = '';
      arr.forEach(p => {
        const card = document.createElement('div'); card.className = 'card';
        card.innerHTML = `
          <img src="${p.img}" alt="${p.title}" />
          <div class="card-body">
            <div class="card-title">${p.title}</div>
            <div class="card-price">₹${p.price}</div>
            <div class="card-actions">
              <button class="btn" onclick="openModal(${p.id})">View</button>
              <button class="btn ghost" onclick="quickAdd(${p.id})">Add</button>
            </div>
          </div>
        `;
        // @ts-ignore
        productsEl.appendChild(card);
      });
    }

    // @ts-ignore
    function quickAdd(id) { const p = products.find(x => x.id === id); if (!p) return; if (!CART[id]) CART[id] = { ...p, qty: 0 }; CART[id].qty++; localStorage.setItem('CART', JSON.stringify(CART)); updateCartUI(); showToast(`${p.title} added`); }

    // @ts-ignore
    function openModal(id) { const p = products.find(x => x.id === id); if (!p) return; modalState.open = true; modalState.product = p; modalState.qty = 1; document.getElementById('modalTitle').textContent = p.title; document.getElementById('modalImg').src = p.img; document.getElementById('modalDesc').textContent = p.desc; document.getElementById('modalPrice').textContent = '₹' + p.price; document.getElementById('modalQty').textContent = '1'; document.getElementById('modalBackdrop').style.display = 'flex'; }
    // @ts-ignore
    function closeModal() { document.getElementById('modalBackdrop').style.display = 'none'; modalState.open = false; }
    // @ts-ignore
    function modalQty(delta) { modalState.qty = Math.max(1, modalState.qty + delta); document.getElementById('modalQty').textContent = modalState.qty; }
    // @ts-ignore
    function modalAddToCart() { const p = modalState.product; if (!p) return; if (!CART[p.id]) CART[p.id] = { ...p, qty: 0 }; CART[p.id].qty += modalState.qty; localStorage.setItem('CART', JSON.stringify(CART)); updateCartUI(); showToast(`${p.title} added (${modalState.qty})`); closeModal(); }

    // CART UI
    // @ts-ignore
    function updateCartUI() { const keys = Object.keys(CART); navCartCount.textContent = keys.reduce((s, k) => s + (CART[k].qty || 0), 0); renderCartList(); }
    function renderCartList() {
      // @ts-ignore
      cartList.innerHTML = ''; let total = 0; const keys = Object.keys(CART); if (keys.length === 0) { cartList.innerHTML = '<div style="padding:12px;color:var(--muted)">Cart is empty</div>'; document.getElementById('cartTotal').textContent = 'Total: ₹0'; return; } keys.forEach(k => {
        const it = CART[k]; total += it.price * it.qty; const row = document.createElement('div'); row.className = 'cart-item'; row.innerHTML = `
        <img src="${it.img}" alt="${it.title}" />
        <div style="flex:1">
          <div style="font-weight:700">${it.title}</div>
          <div style="color:var(--muted)">₹${it.price} x ${it.qty}</div>
        </div>
        <div style="text-align:right">
          <div class="qty-controls">
            <button onclick="changeQty(${it.id}, -1)">-</button>
            <div>${it.qty}</div>
            <button onclick="changeQty(${it.id}, 1)">+</button>
          </div>
        </div>
      `; 
// @ts-ignore
      cartList.appendChild(row);
      // @ts-ignore
      }); document.getElementById('cartTotal').textContent = 'Total: ₹' + total.toFixed(2);
    }

    // @ts-ignore
    function changeQty(id, delta) { if (!CART[id]) return; CART[id].qty += delta; if (CART[id].qty <= 0) delete CART[id]; localStorage.setItem('CART', JSON.stringify(CART)); updateCartUI(); }
    // @ts-ignore
    function toggleCart(show = true) { cartSidebar.style.display = show ? 'block' : 'none'; }
    // @ts-ignore
    document.getElementById('openCartBtn').addEventListener('click', () => toggleCart(true));

    // CHECKOUT flow (opens form modal)
    // @ts-ignore
    function openCheckout() { if (Object.keys(CART).length === 0) { alert('Cart is empty'); return; } document.getElementById('checkoutBackdrop').style.display = 'flex'; }
    // @ts-ignore
    function closeCheckout() { document.getElementById('checkoutBackdrop').style.display = 'none'; }
    function submitOrder() {
      // @ts-ignore
      const name = document.getElementById('c_name').value.trim(); const phone = document.getElementById('c_phone').value.trim(); const addr = document.getElementById('c_address').value.trim(); if (!name || !phone || !addr) { alert('Please fill all fields'); return; } // demo: clear cart and show message
      localStorage.removeItem('CART'); CART = {}; updateCartUI(); closeCheckout(); showToast('Order placed — demo'); setTimeout(() => toggleCart(false), 800);
    }

    // SEARCH & SORT
    // @ts-ignore
    document.getElementById('searchBtn').addEventListener('click', () => {
      // @ts-ignore
      const q = document.getElementById('search').value.trim().toLowerCase(); if (!q) return renderProducts(); const res = products.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)); renderProducts(res);
    });
    // @ts-ignore
    document.getElementById('sortSelect').addEventListener('change', () => renderProducts());

    // @ts-ignore
    function scrollToProducts() { document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); }
    function addStarterPack() { quickAdd(104); quickAdd(113); quickAdd(119); }


    // Toast helper
    // @ts-ignore
    function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('visible'); setTimeout(() => t.classList.remove('visible'), 2200); }

    // init
    renderCategories(); renderProducts(); updateCartUI();

    // keyboard Esc to close modals
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeCheckout(); toggleCart(false); } });

    // add location
    // @ts-ignore
// Popup Open/Close
const openPopupBtn = document.getElementById("openLocationPopup");
const popup = document.getElementById("locationPopup");
const closePopupBtn = document.getElementById("closePopupBtn");
const saveBtn = document.getElementById("saveLocationBtn");
const locationInput = document.getElementById("locationInput");

// @ts-ignore
openPopupBtn.addEventListener("click", () => {
  // @ts-ignore
  popup.style.display = "flex";
});

// @ts-ignore
closePopupBtn.addEventListener("click", () => {
  // @ts-ignore
  popup.style.display = "none";
});

// Save location
// @ts-ignore
saveBtn.addEventListener("click", () => {
  // @ts-ignore
  const val = locationInput.value.trim();
  if (val) {
    // @ts-ignore
    openPopupBtn.textContent = "📍 " + val;
  }
  // @ts-ignore
  popup.style.display = "none";
});

// Detect location
// @ts-ignore
document.getElementById("locateBtn").addEventListener("click", () => {
  // @ts-ignore
  locationInput.placeholder = "Detecting location...";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Unknown";
        const state = data.address.state || "";
        // @ts-ignore
        locationInput.value = `${city}, ${state}`;
      } catch {
        // @ts-ignore
        locationInput.placeholder = "Could not detect location";
      }
    }, () => {
      // @ts-ignore
      locationInput.placeholder = "Location access denied";
    });
  } else {
    // @ts-ignore
    locationInput.placeholder = "Geolocation not supported";
  }
});
