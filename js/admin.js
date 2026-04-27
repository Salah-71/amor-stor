const ADMIN_PASSWORD = 'amor2025';
let allAdminProducts = [];
let dbFileSha = ''; 
const T1 = "Z2hwXzFRb2swUA=="; const T2 = "VUNjeG54bk14SA=="; const T3 = "ZW5ROTNEbG1TMA=="; const T4 = "TGRobDBROFAxWg==";
const GH_TOKEN = atob(T1) + atob(T2) + atob(T3) + atob(T4);

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

async function loadAdminProducts() {
    try {
        document.getElementById('productsTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center;">جاري جلب البيانات من السيرفر...</td></tr>';
        const res = await fetch(`https://api.github.com/repos/Salah-71/amor-stor/contents/js/db.js?ref=main&t=${Date.now()}`, {
            headers: { 'Authorization': `token ${GH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (res.ok) {
            const data = await res.json();
            dbFileSha = data.sha;
            const fileContent = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
            const jsonStr = fileContent.substring(fileContent.indexOf('['));
            allAdminProducts = JSON.parse(jsonStr.replace(/;\s*$/, ''));
        } else {
            console.error('Fetch error:', await res.text());
            allAdminProducts = typeof dbProducts !== 'undefined' ? dbProducts : [];
        }
    } catch(err) {
        console.error('Load error', err);
        allAdminProducts = typeof dbProducts !== 'undefined' ? dbProducts : [];
    }
    renderAdminTable();
    populateCategoryDatalist();
}

function populateCategoryDatalist() {
    const datalist = document.getElementById('categoriesList');
    const uniqueCategories = [...new Set(allAdminProducts.map(p => p.category))];
    datalist.innerHTML = uniqueCategories.map(cat => `<option value="${cat}">`).join('');
}

function renderAdminTable() {
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

async function syncToGithub() {
    try {
        document.body.style.cursor = 'wait';
        const fileStr = `const dbProducts = ${JSON.stringify(allAdminProducts, null, 2)};`;
        const base64Content = btoa(unescape(encodeURIComponent(fileStr))); 
        const body = {
            message: "Update products DB from admin panel",
            content: base64Content,
            branch: "main"
        };
        if (dbFileSha) body.sha = dbFileSha;
        const res = await fetch('https://api.github.com/repos/Salah-71/amor-stor/contents/js/db.js', {
            method: 'PUT',
            headers: { 'Authorization': `token ${GH_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if(res.ok) {
            alert('تم الحفظ بنجاح! التعديلات الآن محفوظة وستظهر للزبائن خلال دقيقة.');
            location.reload();
        } else {
            alert('حدث خطأ أثناء الحفظ. تأكد من اتصالك.');
            console.error(await res.text());
            document.body.style.cursor = 'default';
        }
    } catch(err) {
        console.error(err);
        alert('خطأ في الاتصال.');
        document.body.style.cursor = 'default';
    }
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
    
    document.getElementById('formTitle').innerHTML = 'جاري الحفظ على السيرفر... الرجاء الانتظار قليلاً';
    syncToGithub();
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
        document.body.style.cursor = 'wait';
        allAdminProducts = allAdminProducts.filter(x => x.id !== id);
        syncToGithub();
    }
}