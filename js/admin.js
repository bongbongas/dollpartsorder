import { store } from './store.js';

export function render(container) {
    const orders = store.getOrders();
    const parts = store.getParts();

    container.innerHTML = `
        <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div>
                <h1>관리자 대시보드</h1>
                <p style="color: var(--text-muted);">주문 관리 및 택배 발송 처리</p>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button class="btn" style="background: var(--glass);">재고 상태</button>
                <button class="btn btn-primary" onclick="alert('준비 중')">부품 추가</button>
            </div>
        </header>

        <section style="margin-bottom: 3rem;">
            <h2 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--primary);">최신 주문 현황</h2>
            <div style="overflow-x: auto; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border); background: var(--glass);">
                            <th style="padding: 1rem;">주문번호</th>
                            <th style="padding: 1rem;">날짜</th>
                            <th style="padding: 1rem;">고객</th>
                            <th style="padding: 1rem;">전화번호</th>
                            <th style="padding: 1rem;">금액</th>
                            <th style="padding: 1rem;">상태</th>
                            <th style="padding: 1rem;">액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.length === 0 ? '<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">접수된 주문이 없습니다.</td></tr>' :
            orders.sort((a, b) => b.id - a.id).map(order => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 1rem; color: var(--text-muted);">#${order.id}</td>
                                <td style="padding: 1rem;">${new Date(order.date).toLocaleDateString()}</td>
                                <td style="padding: 1rem; font-weight: 600;">${order.customer}</td>
                                <td style="padding: 1rem;">${order.phone || '-'}</td>
                                <td style="padding: 1rem;">₩${order.total.toLocaleString()}</td>
                                <td style="padding: 1rem;">
                                    <span style="padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: ${statusBg(order.status)}; color: white;">
                                        ${order.status}
                                    </span>
                                </td>
                                <td style="padding: 1rem;">
                                    <select onchange="window.updateStatus('${order.id}', this.value)" style="background: var(--bg-color); color: white; border: 1px solid var(--border); padding: 0.3rem; border-radius: 4px;">
                                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>대기</option>
                                        <option value="Shipping" ${order.status === 'Shipping' ? 'selected' : ''}>배송중</option>
                                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>완료</option>
                                    </select>
                                    <button class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; background: var(--glass);" onclick="window.issueInvoice('${order.id}')">청구서</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </section>

        <section>
            <h2 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--secondary);">부품 재고 현황</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${parts.map(part => `
                    <div class="card" style="padding: 1rem;">
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${part.category}</div>
                        <div style="font-weight: 600; margin: 0.2rem 0;">${part.name}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                            <span style="font-size: 1.1rem; font-weight: 700;">${part.stock}개</span>
                            <span style="color: ${part.stock < 10 ? 'var(--accent)' : 'var(--text-muted)'}; font-size: 0.75rem;">${part.stock < 10 ? '재고부족' : '정상'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;

    lucide.createIcons();
}

function statusBg(status) {
    if (status === 'Shipping') return 'var(--accent)';
    if (status === 'Completed') return 'var(--secondary)';
    return 'var(--text-muted)';
}

window.updateStatus = (id, status) => {
    store.updateOrderStatus(id, status);
    if (status === 'Shipping') {
        alert('고객에게 택배 발송 시작 알림을 보냈습니다. (시뮬레이션)');
    }
    window.navigate('admin'); // Refresh
};

window.issueInvoice = (id) => {
    const order = store.getOrders().find(o => o.id === parseInt(id));
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>청구서 #${order.id}</title>
            <style>
                body { font-family: sans-serif; padding: 40px; color: #333; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .company { font-size: 24px; font-weight: bold; }
                .details { margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background: #f4f4f4; }
                .total { text-align: right; margin-top: 30px; font-size: 20px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company">CLAWPARTS 청구서</div>
                <div>No. #${order.id} / ${new Date(order.date).toLocaleDateString()}</div>
            </div>
            <div class="details">
                <p><strong>수신:</strong> ${order.customer} 귀하</p>
                <p><strong>주소:</strong> ${order.address}</p>
                <p><strong>연락처:</strong> ${order.phone}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>품명</th>
                        <th>수량</th>
                        <th>단가</th>
                        <th>금액</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(i => `
                        <tr>
                            <td>${i.name}</td>
                            <td>${i.quantity}</td>
                            <td>₩${i.price.toLocaleString()}</td>
                            <td>₩${(i.price * i.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">합계 금액: ₩${order.total.toLocaleString()}</div>
            <div style="margin-top: 50px; text-align: center; color: #888;">위 금액을 정히 청구합니다.</div>
        </body>
        </html>
    `);
    win.document.close();
};
