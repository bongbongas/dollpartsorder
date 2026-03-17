const INITIAL_PARTS = [
    { id: 1, name: "[기계부속] 중형 집게발 고무", category: "Mechanical", price: 5000, stock: 100, desc: "전 기종 사용가능한 고탄성 고무", img: "https://via.placeholder.com/150/4f46e5/ffffff?text=Claw+Rubber" },
    { id: 2, name: "[기계부속] LED 전원부", category: "Mechanical", price: 45000, stock: 20, desc: "안정적인 DC 전원 공급 장치", img: "https://via.placeholder.com/150/4f46e5/ffffff?text=Power+Unit" },
    { id: 3, name: "[카드리더기] TCP-42", category: "Payment", price: 120000, stock: 5, desc: "다양한 결제 수단 지원 리더기", img: "https://via.placeholder.com/150/10b981/ffffff?text=Card+Reader" },
    { id: 4, name: "봉봉 발매트 (Blue)", category: "Accessories", price: 15000, stock: 50, desc: "인형뽑기 앞 분위기를 살려주는 매트", img: "https://via.placeholder.com/150/f59e0b/ffffff?text=Mat" },
    { id: 5, name: "[소모품] 포장 봉투 (Size L)", category: "Consumables", price: 8000, stock: 200, desc: "대형 인형 주문용 튼튼한 봉투", img: "https://via.placeholder.com/150/94a3b8/ffffff?text=Bag" }
];

class Store {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('parts')) {
            localStorage.setItem('parts', JSON.stringify(INITIAL_PARTS));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
    }

    getParts() {
        return JSON.parse(localStorage.getItem('parts'));
    }

    getOrders() {
        return JSON.parse(localStorage.getItem('orders'));
    }

    addOrder(order) {
        const orders = this.getOrders();
        const newOrder = {
            ...order,
            id: Date.now(),
            date: new Date().toISOString(),
            status: 'Pending' // Pending, Shipping, Completed
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        return newOrder;
    }

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === parseInt(orderId));
        if (index !== -1) {
            orders[index].status = status;
            localStorage.setItem('orders', JSON.stringify(orders));
        }
    }

    saveParts(parts) {
        localStorage.setItem('parts', JSON.stringify(parts));
    }
}

export const store = new Store();
