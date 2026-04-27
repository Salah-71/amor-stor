let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let cart = JSON.parse(localStorage.getItem('amorCart') || '[]');
const WHATSAPP_NUMBER = '967775490941';

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    allProducts = typeof dbProducts !== 'undefined' ? dbProducts : [];
    filteredProducts = [...allProducts];
    renderCategories();
    renderProducts();
});

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
    let html = `<div class="category-card ${currentCategory === 'all' ? 'active' : ''}" data-cat="all"><span>الكل</span></div>`;
    uniqueCategories.forEach(cat => {
        html += `<div class="category-card ${currentCategory === cat ? 'active' : ''}" data-cat="${cat}"><span>${cat}</span></div>`;
    });
    grid.innerHTML = html;

    document.querySelectorAll('.category-card').forEach(c => {
        c.addEventListener('click', function() {
            document.querySelectorAll('.category-card').forEach(x => x.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.cat;
            filterProducts();
        });
    });
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = filteredProducts.map(p => `
    <div class="product-card">
        <div class="product-img-wrapper"><img src="${p.image_url}" alt="${p.name}"></div>
        <div class="product-info">
            <p class="product-category">${p.category}</p>
            <h3 class="product-name">${p.name}</h3>
            <div class="product-price">${Number(p.price).toLocaleString('ar-YE')} ريال</div>
            <button class="add-cart-btn" onclick="addToCart('${p.id}')">أضف للسلة</button>
            <button class="add-cart-btn" style="background:#25d366;" onclick="orderProductWhatsApp('${p.id}')">للطلب عبر واتساب</button>
        </div>
    </div>`).join('');
}

function filterProducts() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    filteredProducts = allProducts.filter(p => (currentCategory === 'all' || p.category === currentCategory) && p.name.toLowerCase().includes(s));
    renderProducts();
}

// Dynamic categories handled directly in renderCategories()

function addToCart(id) {
    const p = allProducts.find(x => x.id === id);
    const ex = cart.find(x => x.id === id);
    ex ? ex.qty++ : cart.push({...p, qty: 1});
    localStorage.setItem('amorCart', JSON.stringify(cart));
    updateCartCount();
    showToast('تمت الإضافة للسلة');
}

function updateCartCount() { document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0); }

function toggleCart() {
    const m = document.getElementById('cartModal');
    m.classList.toggle('active');
    if(m.classList.contains('active')) renderCart();
}

function renderCart() {
    const body = document.getElementById('cartBody');
    if(cart.length === 0) {
        body.innerHTML = '<p style="text-align:center;">السلة فارغة</p>';
        document.getElementById('cartFooter').style.display = 'none';
        return;
    }
    body.innerHTML = cart.map(i => `
        <div class="cart-item">
            <img src="${i.image_url}" style="width:50px;">
            <div>
                <h4 style="font-size:12px;">${i.name}</h4>
                <p>${Number(i.price * i.qty).toLocaleString('ar-YE')} ريال</p>
                <button onclick="removeFromCart('${i.id}')" style="color:red; border:none; background:none; cursor:pointer;">حذف</button>
            </div>
        </div>`).join('');
    document.getElementById('cartFooter').style.display = 'block';
    document.getElementById('cartTotal').textContent = cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString('ar-YE') + ' ريال';
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); localStorage.setItem('amorCart', JSON.stringify(cart)); renderCart(); updateCartCount(); }

function orderViaWhatsApp() {
    let msg = '🌸 طلب جديد من AMOR STOR\n\n';
    let tot = 0;
    cart.forEach(i => { tot += i.price * i.qty; msg += `- ${i.name} (${i.qty})\n`; });
    msg += `\nالإجمالي: ${tot.toLocaleString('ar-YE')} ريال`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
}

function orderProductWhatsApp(id) {
    const p = allProducts.find(x => x.id === id);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`🌸 طلب منتج: ${p.name}\nالسعر: ${p.price} ريال`)}`);
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 2000);
}

function toggleMobileNav() {
    document.getElementById('mobileNav').classList.toggle('active');
    document.getElementById('navOverlay').style.display = document.getElementById('mobileNav').classList.contains('active') ? 'block' : 'none';
}