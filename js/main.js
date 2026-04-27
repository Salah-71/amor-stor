let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let cart = JSON.parse(localStorage.getItem('amorCart') || '[]');
const WHATSAPP_NUMBER = '967775490941';

const defaultProducts = [
    { id: 'p1', name: 'مثبت مكياج الكوجيك أسيد - Kiss Beauty', price: 1200, category: 'مثبت مكياج', image_url: 'IMG-20260424-WA0017.jpg', description: 'ثبات حتى 16 ساعة.', available: true },
    { id: 'p2', name: 'برايمر هيدرو جريب - Diamond Beauty', price: 1500, category: 'برايمر', image_url: 'IMG-20260424-WA0018.jpg', description: 'ترطيب عميق.', available: true },
    { id: 'p3', name: 'ماسكارا رموش كثيفة - SHEGLAM', price: 1200, category: 'ماسكارا', image_url: 'IMG-20260424-WA0020.jpg', description: 'طول طبيعي.', available: true },
    { id: 'p4', name: 'بودرة مضغوطة مضيئة - SHEGLAM', price: 1300, category: 'بودرة', image_url: 'IMG-20260424-WA0021.jpg', description: 'تغطية مثالية.', available: true },
    { id: 'p5', name: 'كريم المعجزة الكوري - SHEGLAM', price: 1300, category: 'كريم عناية', image_url: 'IMG-20260425-WA0000.jpg', description: 'تنقية للمسام.', available: true },
    { id: 'p6', name: 'زيت الشفاه الوردي - Rose Magic', price: 500, category: 'زيت شفاه', image_url: 'IMG-20260425-WA0001.jpg', description: 'ترطيب ولمعان.', available: true },
    { id: 'p7', name: 'مثبت مكياج نايکد - NAKED', price: 1800, category: 'مثبت مكياج', image_url: 'IMG-20260425-WA0002.jpg', description: 'يحافظ على الجمال.', available: true },
    { id: 'p8', name: 'مزيل مكياج 5 في 1 - Kiss Beauty', price: 1300, category: 'مزيل مكياج', image_url: 'IMG-20260425-WA0003.jpg', description: 'تنظيف عميق.', available: true },
    { id: 'p9', name: 'منظف اللافندر الطبيعي - Clean it natural', price: 1400, category: 'مزيل مكياج', image_url: 'IMG-20260424-WA0017.jpg', description: 'نظافة طبيعية.', available: true }
];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    const stored = localStorage.getItem('amorProducts');
    allProducts = stored ? JSON.parse(stored) : defaultProducts;
    if(!stored) localStorage.setItem('amorProducts', JSON.stringify(defaultProducts));
    filteredProducts = [...allProducts];
    renderProducts();
});

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

document.querySelectorAll('.category-card').forEach(c => {
    c.addEventListener('click', function() {
        document.querySelectorAll('.category-card').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.dataset.cat;
        filterProducts();
    });
});

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