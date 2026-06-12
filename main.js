// Configuração inicial
const APP_CONFIG = {
    storageKey: 'agroforte_cart',
    currency: 'BRL',
    locale: 'pt-BR'
};

// Estado da aplicação
let state = {
    products: [],
    cart: [],
    filters: {
        search: '',
        category: 'all',
        sortBy: 'name'
    }
};

// Dados iniciais dos produtos
const initialProducts = [
    {
        id: 1,
        name: "Café Orgânico",
        description: "Café cultivado sem agrotóxicos, com certificação orgânica e sabor incomparável.",
        price: 35.90,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        badge: "Orgânico",
        category: "bebidas",
        rating: 4.8,
        stock: 50
    },
    {
        id: 2,
        name: "Mel Puro Silvestre",
        description: "Mel silvestre produzido por abelhas nativas, sem aditivos ou conservantes.",
        price: 25.00,
        image: "https://images.unsplash.com/photo-1587049352847-917187a2f3d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        badge: "Natural",
        category: "alimentos",
        rating: 4.9,
        stock: 30
    },
    {
        id: 3,
        name: "Cesta de Frutas Frescas",
        description: "Cesta com frutas da estação colhidas no dia, direto do produtor.",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        badge: "Fresco",
        category: "alimentos",
        rating: 4.7,
        stock: 20
    },
    {
        id: 4,
        name: "Mix de Grãos Integrais",
        description: "Mix especial de grãos para uma alimentação saudável e equilibrada.",
        price: 18.50,
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        badge: "Saudável",
        category: "alimentos",
        rating: 4.6,
        stock: 100
    },
    {
        id: 5,
        name: "Vinho Orgânico",
        description: "Vinho produzido com uvas orgânicas, sem sulfitos adicionados.",
        price: 89.90,
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        badge: "Premium",
        category: "bebidas",
        rating: 4.9,
        stock: 15
    },
    {
        id: 6,
        name: "Queijo Artesanal",
        description: "Queijo produzido artesanalmente com leite de vacas criadas a pasto.",
        price: 42.00,
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        badge: "Artesanal",
        category: "laticinios",
        rating: 4.8,
        stock: 25
    }
];

// Classe principal do carrinho
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadCart();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        
        this.saveCart();
        this.showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(this.items));
    }

    loadCart() {
        const savedCart = localStorage.getItem(APP_CONFIG.storageKey);
        if (savedCart) {
            try {
                this.items = JSON.parse(savedCart);
            } catch (error) {
                console.error('Erro ao carregar carrinho:', error);
                this.items = [];
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Classe de UI
class UI {
    constructor(cart) {
        this.cart = cart;
        this.initEventListeners();
    }

    initEventListeners() {
        // Formulário de venda
        document.getElementById('sellForm')?.addEventListener('submit', (e) => this.handleSellForm(e));
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('cartModal');
            if (e.target === modal) {
                this.closeCart();
            }
        });
    }

    renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        grid.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const ratingStars = '⭐'.repeat(Math.floor(product.rating));
        
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" 
                         alt="${product.name}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/400x300?text=Produto+Sustentável'">
                </div>
                <div class="product-info">
                    <span class="product-badge">${product.badge || 'Novo'}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-rating">${ratingStars} ${product.rating}</div>
                    <div class="product-price">${this.formatPrice(product.price)}</div>
                    <div class="product-stock">${product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}</div>
                    <button class="btn-add-cart" 
                            onclick="app.addToCart(${product.id})"
                            ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> 
                        ${product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
                    </button>
                </div>
            </div>
        `;
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) return;

        if (this.cart.items.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ddd;"></i>
                    <p style="margin-top: 1rem; color: #999;">Seu carrinho está vazio</p>
                </div>
            `;
            cartTotal.textContent = 'Total: R$ 0,00';
            return;
        }

        cartItems.innerHTML = this.cart.items.map((item, index) => `
            <div class="cart-item">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${item.image}" 
                         alt="${item.name}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 10px;"
                         onerror="this.src='https://via.placeholder.com/50'">
                    <div>
                        <strong>${item.name}</strong>
                        <br>
                        <small>${this.formatPrice(item.price)} x ${item.quantity}</small>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button onclick="app.updateCartItemQuantity(${item.id}, ${item.quantity - 1})" 
                                style="background: #ddd; border: none; width: 25px; height: 25px; border-radius: 5px; cursor: pointer;">
                            -
                        </button>
                        <span>${item.quantity}</span>
                        <button onclick="app.updateCartItemQuantity(${item.id}, ${item.quantity + 1})" 
                                style="background: #ddd; border: none; width: 25px; height: 25px; border-radius: 5px; cursor: pointer;">
                            +
                        </button>
                    </div>
                    <span class="remove-item" onclick="app.removeFromCart(${item.id})">
                        <i class="fas fa-trash-alt"></i>
                    </span>
                </div>
            </div>
        `).join('');

        cartTotal.textContent = `Total: ${this.formatPrice(this.cart.getTotal())}`;
    }

    openCart() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'flex';
            this.renderCart();
        }
    }

    closeCart() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat(APP_CONFIG.locale, {
            style: 'currency',
            currency: APP_CONFIG.currency
        }).format(price);
    }

    updateCartCount() {
        const countElement = document.getElementById('cartCount');
        if (countElement) {
            const count = this.cart.getItemCount();
            countElement.textContent = count;
            
            // Animação
            countElement.style.animation = 'none';
            countElement.offsetHeight; // Trigger reflow
            countElement.style.animation = 'bounce 0.3s ease';
        }
    }

    handleSellForm(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            image: document.getElementById('productImage').value || 'https://via.placeholder.com/400x300?text=Produto+Sustentável',
            badge: 'Novo',
            category: 'outros',
            rating: 0,
            stock: 10
        };

        // Validação
        if (!formData.name || !formData.description || isNaN(formData.price)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (formData.price <= 0) {
            alert('O preço deve ser maior que zero.');
            return;
        }

        // Adicionar produto
        const newProduct = {
            id: Date.now(),
            ...formData
        };

        state.products.unshift(newProduct);
        this.renderProducts(state.products);
        
        // Limpar formulário
        e.target.reset();
        
        // Feedback
        alert('✅ Produto anunciado com sucesso!');
        
        // Scroll para produtos
        document.getElementById('produtos')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Classe principal da aplicação
class AgroForteApp {
    constructor() {
        this.cart = new ShoppingCart();
        this.ui = new UI(this.cart);
        this.init();
    }

    init() {
        state.products = [...initialProducts];
        this.ui.renderProducts(state.products);
        this.ui.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Eventos globais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.ui.closeCart();
            }
        });
    }

    addToCart(productId) {
        const product = state.products.find(p => p.id === productId);
        if (product && product.stock > 0) {
            this.cart.addItem(product);
            this.ui.updateCartCount();
            
            // Feedback visual no botão
            const button = document.querySelector(`[onclick="app.addToCart(${productId})"]`);
            if (button) {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    removeFromCart(productId) {
        this.cart.removeItem(productId);
        this.ui.updateCartCount();
        this.ui.renderCart();
    }

    updateCartItemQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.cart.updateQuantity(productId, quantity);
        }
        this.ui.updateCartCount();
        this.ui.renderCart();
    }

    openCart() {
        this.ui.openCart();
    }

    closeCart() {
        this.ui.closeCart();
    }
}

// Inicializar aplicação
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new AgroForteApp();
    
    // Adicionar estilos de notificação dinamicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-weight: 500;
        }
    `;
    document.head.appendChild(style);
});

// Exportar para uso global
window.app = app;