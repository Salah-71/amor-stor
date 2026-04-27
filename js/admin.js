const ADMIN_PASSWORD = 'amor2025';
let allAdminProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('amorAdmin') === '1') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        loadAdminProducts();
    }
});

function adminLogin(e) {
    e.preventDefault();
    if (document.getElementById('adminPass').value === ADMIN_PASSWORD) {
        sessionStorage.setItem('amorAdmin', '1');
        location.reload();
    } else {
        document.getElementById('loginError').textContent = 'كلمة المرور خاطئة';
    }
}

function adminLogout() { sessionStorage.removeItem('amorAdmin'); location.reload(); }

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${id}`).classList.add('active');
}

function loadAdminProducts() {
    allAdminProducts = JSON.parse(localStorage.getItem('amorProducts') || '[]');
    document.getElementById('productsTableBody').innerHTML = allAdminProducts.map(p => `
        <tr>
            <td><img src="${p.image_url}" style="width:40px;"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.price}</td>
            <td>
                <button onclick="editProduct('${p.id}')">تعديل</button>
                <button onclick="deleteProduct('${p.id}')" style="color:red;">حذف</button>
            </td>
        </tr>`).join('');
}

function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('editProductId').value || 'p' + Date.now();
    const newP = {
        id: id,
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        price: document.getElementById('pPrice').value,
        description: document.getElementById('pDescription').value,
        image_url: document.getElementById('pImageUrl').value,
        available: true
    };
    const idx = allAdminProducts.findIndex(x => x.id === id);
    if(idx > -1) allAdminProducts[idx] = newP; else allAdminProducts.push(newP);
    localStorage.setItem('amorProducts', JSON.stringify(allAdminProducts));
    location.reload();
}

function editProduct(id) {
    const p = allAdminProducts.find(x => x.id === id);
    document.getElementById('editProductId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pDescription').value = p.description;
    document.getElementById('pImageUrl').value = p.image_url;
    document.getElementById('formTitle').innerHTML = 'تعديل المنتج';
    showSection('add');
}

function deleteProduct(id) {
    if(confirm('هل أنت متأكد من الحذف؟')) {
        allAdminProducts = allAdminProducts.filter(x => x.id !== id);
        localStorage.setItem('amorProducts', JSON.stringify(allAdminProducts));
        loadAdminProducts();
    }
}