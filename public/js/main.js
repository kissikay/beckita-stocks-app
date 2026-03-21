// Global State
let cart = [];
let products = [];
let currentChart = null;

// Dashboard & Analytics Functions
async function loadDashboardData() {
    try {
        const response = await fetch('/api/insights?period=monthly');
        const data = await response.json();
        
        // Update Stats
        if (document.getElementById('dashTotalSales')) {
            const sales = data.overallSales || 0;
            const profit = data.overallProfit || 0;
            document.getElementById('dashTotalSales').textContent = `$${sales.toLocaleString()}`;
            document.getElementById('dashTotalProfit').textContent = `$${profit.toLocaleString()}`;
            document.getElementById('dashOrderCount').textContent = data.orderCount || 0;
        }

        if (data.profitTrend) {
            renderProfitChart(data.profitTrend, 'salesChart');
        }

        // Render Recent Sales
        const salesList = document.querySelector('.sales-list');
        if (salesList && data.orders) {
            salesList.innerHTML = data.orders.slice(0, 5).map(order => `
                <div class="sale-item d-flex justify-content-between align-items-center mb-3 p-3 glass" style="border-radius: 12px;">
                    <div class="sale-info">
                        <div style="font-weight: 600;">#${order.id}</div>
                        <div class="text-muted" style="font-size: 0.8rem;">${new Date(order.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <div class="sale-amount" style="font-weight: 800; color: var(--accent-blue);">$${order.totalPrice.toFixed(2)}</div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Error loading dashboard:', e);
    }
}

async function loadInsights(period = 'daily', btn = null) {
    if (btn) {
        document.querySelectorAll('.btn-period').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    try {
        const response = await fetch(`/api/insights?period=${period}`);
        const data = await response.json();
        
        if (data.profitTrend) renderProfitChart(data.profitTrend, 'profitChart');
        if (data.topProducts) renderTopSelling(data.topProducts);
    } catch (e) {
        console.error('Error loading insights:', e);
    }
}

function renderProfitChart(trendData, canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (window.currentChart) window.currentChart.destroy();

    const labels = trendData.map(d => d.label);
    const profitValues = trendData.map(d => d.profit);
    const revenueValues = trendData.map(d => d.revenue || d.profit * 1.4); // fallback estimate

    // Create gradient for profit
    const profitGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 320);
    profitGradient.addColorStop(0, 'rgba(92, 82, 255, 0.4)');
    profitGradient.addColorStop(1, 'rgba(92, 82, 255, 0)');

    // Create gradient for revenue
    const revenueGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 320);
    revenueGradient.addColorStop(0, 'rgba(0, 210, 255, 0.2)');
    revenueGradient.addColorStop(1, 'rgba(0, 210, 255, 0)');

    window.currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Revenue ($)',
                    data: revenueValues,
                    borderColor: '#00d2ff',
                    backgroundColor: revenueGradient,
                    fill: true,
                    tension: 0.45,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#00d2ff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                },
                {
                    label: 'Net Profit ($)',
                    data: profitValues,
                    borderColor: '#5c52ff',
                    backgroundColor: profitGradient,
                    fill: true,
                    tension: 0.45,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#5c52ff',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Outfit', size: 13, weight: '600' },
                        padding: 20,
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 11, 16, 0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    padding: 16,
                    cornerRadius: 12,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Outfit', size: 12 },
                        callback: v => `$${v.toLocaleString()}`
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Outfit', size: 12 }
                    }
                }
            }
        }
    });
}

function renderTopSelling(products) {
    const body = document.getElementById('topSellingBody');
    if (!body) return;

    body.innerHTML = products.map(p => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--glass-bg); display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">📦</div>
                    <div>
                        <div style="font-weight: 600;">${p.name}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">${p.category}</div>
                    </div>
                </div>
            </td>
            <td>${p.unitsSold}</td>
            <td>$${p.revenue.toFixed(2)}</td>
            <td class="text-purple" style="font-weight: 600;">$${p.profit.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Inventory & POS Functions
async function loadInventory() {
    const response = await fetch('/api/products');
    products = await response.json();
    renderInventory();
    renderPOSProducts();
}

function renderInventory() {
    const body = document.getElementById('inventoryBody');
    if (!body) return;
    
    body.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>
                <span class="badge ${p.quantity <= p.minStockLevel ? 'badge-warning' : 'badge-success'}">
                    ${p.quantity} ${p.quantity <= p.minStockLevel ? 'Low' : ''}
                </span>
            </td>
            <td>$${p.price.toFixed(2)}</td>
            <td>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;" onclick="openRestockModal('${p._id}')">Restock</button>
                    <button class="btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.85rem;" onclick="openEditModal('${p._id}')">Edit</button>
                    <button class="btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.85rem; border-color: var(--warning); color: var(--warning);" onclick="deleteProduct('${p._id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderPOSProducts(filterText = '') {
    const grid = document.getElementById('posProducts');
    if (!grid) return;

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(filterText.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(filterText.toLowerCase())
    );

    grid.innerHTML = filtered.map(p => {
        const inStock = p.quantity > 0;
        const lowStock = p.quantity > 0 && p.quantity <= (p.minStockLevel || 5);
        const stockLabel = !inStock ? 'Out of Stock' : lowStock ? `Low: ${p.quantity} left` : `In Stock: ${p.quantity}`;
        const stockColor = !inStock ? 'var(--warning)' : lowStock ? '#f59e0b' : 'var(--success)';

        return `
        <div class="product-card glass" style="border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="padding: 1.25rem 1.25rem 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.7rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 0.2rem 0.6rem; border-radius: 6px;">${p.id}</span>
                    <span style="font-size: 0.72rem; font-weight: 700; color: ${stockColor}; display: flex; align-items: center; gap: 4px;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: ${stockColor}; display: inline-block;"></span>
                        ${stockLabel}
                    </span>
                </div>
                <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem; color: var(--text-light);">${p.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">${p.category || 'General'}</div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-blue);">$${p.price.toFixed(2)}</div>
            </div>
            <div style="margin-top: auto; padding: 0.75rem 1.25rem; border-top: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="changePOSQty('${p._id}', -1)" style="width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">−</button>
                    <span id="qty-${p._id}" style="min-width: 24px; text-align: center; font-weight: 700;">1</span>
                    <button onclick="changePOSQty('${p._id}', 1)" style="width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                </div>
                <button onclick="addToCart('${p._id}', '${p.name}', ${p.price})" ${!inStock ? 'disabled' : ''} 
                    style="flex: 1; padding: 0.5rem 0.75rem; border-radius: 10px; border: none; background: ${inStock ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.05)'}; color: ${inStock ? 'white' : 'var(--text-muted)'}; font-weight: 700; font-size: 0.875rem; cursor: ${inStock ? 'pointer' : 'not-allowed'}; transition: all 0.2s;">
                    ${inStock ? 'Add to Cart' : 'Unavailable'}
                </button>
            </div>
        </div>`;
    }).join('');
}

const posQtyMap = {};

function changePOSQty(id, delta) {
    posQtyMap[id] = Math.max(1, (posQtyMap[id] || 1) + delta);
    const el = document.getElementById(`qty-${id}`);
    if (el) el.textContent = posQtyMap[id];
}

function addToCart(id, name, price) {
    const qty = posQtyMap[id] || 1;
    const existing = cart.find(item => item.productId === id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ productId: id, name, unitPrice: price, quantity: qty });
    }
    // Reset card qty back to 1
    posQtyMap[id] = 1;
    const el = document.getElementById(`qty-${id}`);
    if (el) el.textContent = 1;
    renderCart();
}

function renderCart() {
    const body = document.getElementById('cartBody');
    if (!body) return;

    body.innerHTML = cart.map(item => `
        <tr style="background: transparent;">
            <td style="padding: 1rem 0;">${item.name}</td>
            <td style="padding: 1rem 0;">
                <div class="d-flex align-items-center gap-2">
                    <button class="btn-period" style="padding: 0.2rem 0.6rem; min-width: 30px;" onclick="updateCartQuantity('${item.productId}', -1)">-</button>
                    <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button class="btn-period" style="padding: 0.2rem 0.6rem; min-width: 30px;" onclick="updateCartQuantity('${item.productId}', 1)">+</button>
                </div>
            </td>
            <td class="text-end" style="padding: 1rem 0;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    if (document.getElementById('total')) {
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        document.getElementById('subtotal').textContent = `$${total.toFixed(2)}`;
    }
}

function updateCartQuantity(id, delta) {
    const item = cart.find(i => i.productId === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.productId !== id);
        }
        renderCart();
    }
}

// Modal Logic
function openAddModal() {
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('addProductModal').style.display = 'block';
}

function openRestockModal(id) {
    document.getElementById('restockId').value = id;
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('restockModal').style.display = 'block';
}

function closeAllModals() {
    if(document.getElementById('modalOverlay')) document.getElementById('modalOverlay').style.display = 'none';
    if(document.getElementById('addProductModal')) document.getElementById('addProductModal').style.display = 'none';
    if(document.getElementById('restockModal')) document.getElementById('restockModal').style.display = 'none';
    if(document.getElementById('editProductModal')) document.getElementById('editProductModal').style.display = 'none';
}

function openEditModal(id) {
    const p = products.find(prod => prod._id === id);
    if (!p) return;
    document.getElementById('edit_p_object_id').value = p._id;
    document.getElementById('edit_p_id').value = p.id;
    document.getElementById('edit_p_name').value = p.name;
    document.getElementById('edit_p_category').value = p.category;
    document.getElementById('edit_p_price').value = p.price;
    document.getElementById('edit_p_cost').value = p.costPrice;
    document.getElementById('edit_p_stock').value = p.quantity;
    document.getElementById('edit_p_min').value = p.minStockLevel || 5;
    
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('editProductModal').style.display = 'block';
}

async function confirmAdd(e) {
    e.preventDefault();
    const productData = {
        id: document.getElementById('p_id').value,
        name: document.getElementById('p_name').value,
        category: document.getElementById('p_category').value,
        price: parseFloat(document.getElementById('p_price').value),
        costPrice: parseFloat(document.getElementById('p_cost').value),
        quantity: parseInt(document.getElementById('p_stock').value),
        minStockLevel: parseInt(document.getElementById('p_min').value)
    };

    const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });

    if (res.ok) {
        closeAllModals();
        loadInventory();
        e.target.reset();
    } else {
        const error = await res.json();
        alert(error.error);
    }
}

async function confirmRestock(e) {
    e.preventDefault();
    const productId = document.getElementById('restockId').value;
    const addedQuantity = parseInt(document.getElementById('restockAmount').value);

    const res = await fetch('/api/products/restock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, addedQuantity })
    });

    if (res.ok) {
        closeAllModals();
        loadInventory();
        e.target.reset();
    } else {
        const error = await res.json();
        alert(error.error);
    }
}

async function confirmEdit(e) {
    e.preventDefault();
    const _id = document.getElementById('edit_p_object_id').value;
    const productData = {
        id: document.getElementById('edit_p_id').value,
        name: document.getElementById('edit_p_name').value,
        category: document.getElementById('edit_p_category').value,
        price: parseFloat(document.getElementById('edit_p_price').value),
        costPrice: parseFloat(document.getElementById('edit_p_cost').value),
        quantity: parseInt(document.getElementById('edit_p_stock').value),
        minStockLevel: parseInt(document.getElementById('edit_p_min').value)
    };

    const res = await fetch(`/api/products/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    });

    if (res.ok) {
        closeAllModals();
        loadInventory();
        e.target.reset();
    } else {
        const error = await res.json();
        alert(error.error);
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        loadInventory();
    } else {
        const error = await res.json();
        alert(error.error);
    }
}

async function completeSale() {
    if (cart.length === 0) return alert('Cart is empty');

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });

        if (response.ok) {
            alert('Sale Completed!');
            cart = [];
            renderCart();
            loadInventory(); 
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadAdminsPerformance() {
    const tableBody = document.getElementById('adminsPerformanceTable');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/admin/all');
        const data = await response.json();

        if (data.error) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-warning">${data.error}</td></tr>`;
            return;
        }

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No approved admins found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(admin => `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${admin.profileImage || 'https://via.placeholder.com/32'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <div style="font-weight: 600;">${admin.fullName}</div>
                            <div class="text-muted" style="font-size: 0.8rem;">${admin.email}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-success">${admin.status}</span></td>
                <td>${admin.totalOrders || 0}</td>
                <td>$${(admin.totalSales || 0).toLocaleString()}</td>
                <td class="text-purple" style="font-weight: 600;">$${(admin.totalProfit || 0).toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Error loading admin performance:', e);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading data.</td></tr>`;
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path === '/' || path === '/home' || path === '/dashboard') {
        loadDashboardData();
    } else if (path === '/analytics') {
        loadInsights();
    } else if (path === '/inventory') {
        loadInventory();
    } else if (path === '/sales') {
        loadInventory();
    } else if (path === '/admins') {
        loadAdminsPerformance();
    }
});
