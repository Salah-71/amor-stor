/* ===== AMOR STOR - Main JavaScript ===== */

// ===== Global State =====
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let cart = JSON.parse(localStorage.getItem('amorCart') || '[]');
let displayLimit = 8;
const WHATSAPP_NUMBER = '967775490941';

// ===== On Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    loadProducts();
    initScrollHeader();
    initMobileNav();
});

// ===== Load Products from db.js =====
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    try {
        allProducts = typeof dbProducts !== 'undefined' ? dbProducts : [];
        filteredProducts = [...allProducts];
        renderProducts();
    } catch (err) {
        console.error('Error loading products:', err);
        grid.innerHTML = `
            <div class="no-products" style="grid-column:1/-1">
                <i class="fas fa-exclamation-circle"></i>
                <h3>تعذر تحميل المنتجات</h3>
                <p>يرجى المحاولة مرة أخرى لاحقاً</p>
            </div>`;
    }
}

// ===== Render Products =====
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const shown = filteredProducts.slice(0, displayLimit);

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>لا توجد منتجات</h3>
                <p>لم يتم العثور على منتجات تطابق البحث</p>
            </div>`;
        loadMoreContainer.style.display = 'none';
        return;
    }

    grid.innerHTML = shown.map(p => createProductCard(p)).join('');
    loadMoreContainer.style.display = filteredProducts.length > displayLimit ? 'block' : 'none';
}

function createProductCard(p) {
    const isFeatured = p.featured === true || p.featured === 'true';
    const price = Number(p.price || 0).toLocaleString('ar-YE');
    const imgContent = p.image_url
        ? `<img src="${p.image_url}" alt="${escHtml(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:48px;\'>💄</div>'">`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:48px;">💄</div>`;

    return `
    <div class="product-card" data-id="${p.id}">
        <div class="product-img-wrapper">
            ${imgContent}
            ${isFeatured ? '<span class="product-badge featured">⭐ مميز</span>' : '<span class="product-badge">جديد</span>'}
            <div class="product-actions">
                <button class="action-btn" onclick="openProductModal('${p.id}')" title="عرض التفاصيل">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="orderProductWhatsApp('${p.id}')" title="طلب عبر واتساب">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button class="action-btn" onclick="addToCart('${p.id}')" title="إضافة للسلة">
                    <i class="fas fa-shopping-bag"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <p class="product-category">${escHtml(p.category || '')}</p>
            <h3 class="product-name">${escHtml(p.name)}</h3>
            <p class="product-desc">${escHtml(stripHtml(p.description || ''))}</p>
            <div class="product-footer">
                <div class="product-price">${price} <small>ريال</small></div>
                <button class="add-cart-btn" onclick="addToCart('${p.id}')">
                    <i class="fas fa-plus"></i> أضف
                </button>
            </div>
        </div>
    </div>`;
}

// ===== Filter by Category =====
function filterByCategory(cat) {
    currentCategory = cat;
    displayLimit = 8;

    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`.category-card[data-cat="${cat}"]`);
    if (activeCard) activeCard.classList.add('active');

    const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
    filteredProducts = allProducts.filter(p => {
        const matchCat = cat === 'all' || p.category === cat;
        const matchSearch = !searchVal || p.name.toLowerCase().includes(searchVal) || (p.description || '').toLowerCase().includes(searchVal);
        return matchCat && matchSearch;
    });
    renderProducts();

    const productsSection = document.getElementById('products');
    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Search =====
function filterProducts() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase().trim();
    displayLimit = 8;
    filteredProducts = allProducts.filter(p => {
        const matchCat = currentCategory === 'all' || p.category === currentCategory;
        const matchSearch = !searchVal || p.name.toLowerCase().includes(searchVal) || (p.description || '').toLowerCase().includes(searchVal) || (p.category || '').toLowerCase().includes(searchVal);
        return matchCat && matchSearch;
    });
    renderProducts();
}

// ===== Load More =====
function loadMore() {
    displayLimit += 8;
    renderProducts();
}

// ===== Category Cards Click =====
document.addEventListener('click', function(e) {
    const catCard = e.target.closest('.category-card');
    if (catCard) {
        filterByCategory(catCard.dataset.cat);
    }
});

// ===== Add to Cart =====
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, qty: 1 });
    }
    saveCart();
    updateCartCount();
    showToast(`✅ تمت إضافة "${product.name}" للسلة`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function saveCart() {
    localStorage.setItem('amorCart', JSON.stringify(cart));
}

function updateCartCount() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById('cartCount').textContent = total;
}

// ===== Toggle Cart =====
function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) renderCartItems();
}

document.getElementById('cartBtn').addEventListener('click', toggleCart);

function renderCartItems() {
    const body = document.getElementById('cartBody');
    const footer = document.getElementById('cartFooter');

    if (cart.length === 0) {
        body.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>سلتك فارغة</p>
                <a href="#products" onclick="toggleCart()" class="btn-primary">تسوقي الآن</a>
            </div>`;
        footer.style.display = 'none';
        return;
    }

    body.innerHTML = cart.map(item => {
        const price = Number(item.price || 0);
        const total = (price * item.qty).toLocaleString('ar-YE');
        const imgEl = item.image_url
            ? `<img src="${item.image_url}" alt="${escHtml(item.name)}" class="cart-item-img" onerror="this.style.background='#fce4ec';this.style.content='';this.alt='💄'">`
            : `<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;font-size:28px;">💄</div>`;
        return `
        <div class="cart-item">
            ${imgEl}
            <div class="cart-item-info">
                <div class="cart-item-name">${escHtml(item.name)}</div>
                <div class="cart-item-price">${total} ريال</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQty('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty('${item.id}', 1)"><i class="fas fa-plus"></i></button>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        </div>`;
    }).join('');

    const grandTotal = cart.reduce((s, i) => s + (Number(i.price) * i.qty), 0).toLocaleString('ar-YE');
    document.getElementById('cartTotal').textContent = `${grandTotal} ريال`;
    footer.style.display = 'block';
}

// ===== Original WhatsApp Logic (As requested to keep) =====
function orderViaWhatsApp() {
    if(cart.length === 0) return;
    let text = "مرحباً، أريد طلب المنتجات التالية:\n\n";
    let total = 0;
    cart.forEach(i => {
        text += `- ${i.name} (الكمية: ${i.qty}) بـ ${Number(i.price * i.qty).toLocaleString('ar-YE')} ريال\n`;
        total += i.price * i.qty;
    });
    text += `\nالإجمالي: ${total.toLocaleString('ar-YE')} ريال`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

function orderProductWhatsApp(id) {
    const p = allProducts.find(x => x.id === id);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`🌸 طلب منتج: ${p.name}\nالسعر: ${p.price} ريال`)}`, '_blank');
}

// ===== Contact Form =====
function sendWhatsApp(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value.trim();
    const message = document.getElementById('userMessage').value.trim();
    const msg = `🌸 *رسالة من متجر AMOR STOR*\n\nالاسم: *${name}*\n\nالرسالة:\n${message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ===== Product Modal =====
function openProductModal(productId) {
    const p = allProducts.find(x => x.id === productId);
    if (!p) return;
    const price = Number(p.price || 0).toLocaleString('ar-YE');
    const desc = stripHtml(p.description || '');
    const imgContent = p.image_url
        ? `<img src="${p.image_url}" alt="${escHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:64px;\'>💄</div>'">`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:64px;">💄</div>`;

    document.getElementById('modalContent').innerHTML = `
        <div class="modal-inner">
            <div class="modal-img">${imgContent}</div>
            <div class="modal-info">
                <p class="modal-category">${escHtml(p.category || '')}</p>
                <h2 class="modal-name">${escHtml(p.name)}</h2>
                <p class="modal-desc">${escHtml(desc)}</p>
                <div class="modal-price">${price} <small style="font-size:14px;">ريال يمني</small></div>
                <div class="modal-btns">
                    <button class="modal-whatsapp-btn" onclick="orderProductWhatsApp('${p.id}');closeProductModal()">
                        <i class="fab fa-whatsapp"></i> اطلبي عبر واتساب
                    </button>
                    <button class="modal-add-btn" onclick="addToCart('${p.id}');closeProductModal()">
                        <i class="fas fa-shopping-bag"></i> أضف للسلة
                    </button>
                </div>
            </div>
        </div>`;

    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Header Scroll =====
function initScrollHeader() {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 80) {
            header.style.boxShadow = '0 4px 30px rgba(200,84,122,0.15)';
        } else {
            header.style.boxShadow = '';
        }
    });
}

// ===== Mobile Nav =====
function initMobileNav() {
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('mobileNav').classList.add('active');
        document.getElementById('navOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    document.getElementById('closeNav').addEventListener('click', closeMobileNav);
}

function closeMobileNav() {
    document.getElementById('mobileNav').classList.remove('active');
    document.getElementById('navOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Toast =====
let toastTimeout;
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Utilities =====
function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// ===== Smooth Scroll for nav links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});