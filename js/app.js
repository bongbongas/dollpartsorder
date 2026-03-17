import { store } from './store.js';

const viewport = document.getElementById('app-viewport');
let cart = [];

function init() {
    window.addEventListener('app-navigate', (e) => {
        renderView(e.detail.view);
    });
    renderView('shop');
}

function renderView(view) {
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.id === `nav-${view}`);
    });

    viewport.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'animate-fade';

    if (view === 'shop') renderShop(container);
    else if (view === 'tracking') renderTracking(container);
    else if (view === 'admin') renderAdmin(container);

    viewport.appendChild(container);
    lucide.createIcons();
}

function renderShop(container) {
    const parts = store.getParts();

    container.innerHTML = `
        <header style="margin-bottom: 2rem;">
            <h1>부품 목록</h1>
            <p style="color: var(--text-muted);">필요한 부품을 장바구니에 담아 주문하세요.</p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${parts.map(part => `
                <div class="card">
                    <img src="${part.img}" alt="${part.name}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="color: var(--primary); font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">${part.category.toUpperCase()}</div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${part.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${part.desc}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 1.2rem; font-weight: 700;">₩${part.price.toLocaleString()}</span>
                        <button class="btn btn-primary" onclick="addToCart(${part.id})">
                            <i data-lucide="shopping-cart" style="width: 18px;"></i> 담기
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Floating Cart Summary -->
        <div id="cart-summary" class="card" style="position: fixed; bottom: 2rem; right: 2rem; width: 320px; z-index: 1000; border-color: var(--primary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin-bottom: 0;">장바구니</h3>
                <span id="cart-count">0 items</span>
            </div>
            <div id="cart-items" style="max-height: 200px; overflow-y: auto; margin-bottom: 1rem; font-size: 0.9rem;">
                <p style="color: var(--text-muted);">담긴 부품이 없습니다.</p>
            </div>
            <div style="border-top: 1px solid var(--border); padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 1rem;">
                    <span>총액</span>
                    <span id="cart-total">₩0</span>
                </div>
                <button class="btn btn-primary" style="width: 100%;" id="btn-checkout">주문하기</button>
            </div>
        </div>
    `;

    document.getElementById('btn-checkout').onclick = renderCheckout;
    updateCartUI();
}

function addToCart(id) {
    const part = store.getParts().find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...part, quantity: 1 });
    }
    updateCartUI();
}

window.addToCart = addToCart;

function updateCartUI() {
    const itemsEl = document.getElementById('cart-items');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');

    if (!itemsEl) return;

    if (cart.length === 0) {
        itemsEl.innerHTML = '<p style="color: var(--text-muted);">담긴 부품이 없습니다.</p>';
        countEl.innerText = '0 items';
        totalEl.innerText = '₩0';
        return;
    }

    itemsEl.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>${item.name} x ${item.quantity}</span>
            <span>₩${(item.price * item.quantity).toLocaleString()}</span>
        </div>
    `).join('');

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    countEl.innerText = `${count} items`;
    totalEl.innerText = `₩${total.toLocaleString()}`;
}

function renderCheckout() {
    if (cart.length === 0) return alert('장바구니가 비어있습니다.');

    viewport.innerHTML = `
        <div class="animate-fade" style="max-width: 600px; margin: 0 auto;">
            <h1>주문 접수</h1>
            <div class="card">
                <form id="order-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted);">고객명 / 업체명</label>
                        <input type="text" id="cust-name" required style="width: 100%; background: var(--bg-color); border: 1px solid var(--border); color: white; padding: 0.8rem; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted);">배송지 주소</label>
                        <input type="text" id="cust-addr" required style="width: 100%; background: var(--bg-color); border: 1px solid var(--border); color: white; padding: 0.8rem; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: var(--text-muted);">연락처</label>
                        <input type="text" id="cust-phone" required style="width: 100%; background: var(--bg-color); border: 1px solid var(--border); color: white; padding: 0.8rem; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1.5rem; background: var(--glass); padding: 1rem; border-radius: 8px;">
                        <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">주문 요약</h3>
                        ${cart.map(item => `<div style="display: flex; justify-content: space-between; font-size: 0.9rem;"><span>${item.name} x ${item.quantity}</span><span>₩${(item.price * item.quantity).toLocaleString()}</span></div>`).join('')}
                        <div style="display: flex; justify-content: space-between; font-weight: 700; margin-top: 0.5rem; border-top: 1px solid var(--border); padding-top: 0.5rem;">
                            <span>결제 금액</span>
                            <span>₩${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">택배 발송 요청하기</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('order-form').onsubmit = (e) => {
        e.preventDefault();
        const order = {
            customer: document.getElementById('cust-name').value,
            address: document.getElementById('cust-addr').value,
            phone: document.getElementById('cust-phone').value,
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        };
        const savedOrder = store.addOrder(order);
        cart = [];
        renderOrderComplete(savedOrder);
    };
    lucide.createIcons();
}

function renderOrderComplete(order) {
    viewport.innerHTML = `
        <div class="animate-fade" style="text-align: center; max-width: 500px; margin: 4rem auto;">
            <div style="color: var(--secondary); margin-bottom: 2rem;"><i data-lucide="check-circle" style="width: 80px; height: 80px;"></i></div>
            <h1 style="margin-bottom: 1rem;">주문이 완료되었습니다!</h1>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">주문 번호: <strong>#${order.id}</strong><br>부품이 준비되는 대로 택배 발송을 시작합니다.</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="btn btn-primary" onclick="navigate('shop')">홈으로 이동</button>
                <button class="btn" style="background: var(--glass);" onclick="navigate('tracking')">주문조회</button>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function renderTracking(container) {
    const orders = store.getOrders();
    container.innerHTML = `
        <h1>주문 조회</h1>
        ${orders.length === 0 ? '<p style="color: var(--text-muted);">주문 내역이 없습니다.</p>' : `
            <div style="display: grid; gap: 1rem;">
                ${orders.map(order => `
                    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">#${order.id} | ${new Date(order.date).toLocaleDateString()}</div>
                            <div style="font-weight: 700; margin-top: 0.2rem;">${order.items.map(i => i.name).join(', ')}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="margin-bottom: 0.5rem; font-weight: 800; color: ${order.status === 'Shipping' ? 'var(--accent)' : order.status === 'Completed' ? 'var(--secondary)' : 'var(--text-muted)'}">${order.status}</div>
                            <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--glass);" onclick="alert('준비 중입니다.')">인쇄/송장</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

// Attach to window for global access
window.renderAdmin = (container) => {
    import('./admin.js').then(module => module.render(container));
};

init();
