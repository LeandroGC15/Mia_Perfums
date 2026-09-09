/**
 * ShopApp.js — Componente raíz de la tienda.
 */
(function (owl, SS) {
    'use strict';
    const { Component, useState, onWillStart, xml } = owl;
    const { fmt, rpc } = SS;
    const { ProductGrid, ProductModal, CartSidebar, CheckoutForm, HeroSection } = SS;

    class ShopApp extends Component {
        static components = { ProductGrid, ProductModal, CartSidebar, CheckoutForm, HeroSection };
        static template = xml/* html */`
        <div>

            <!-- ── HEADER ──────────────────────────────────── -->
            <header class="ss-header">
                <div class="ss-header__inner">
                    <a href="/shop" class="ss-logo">
                        <img src="/scentsync_ecommerce/static/src/img/logo.png" alt="Mía Parfums" class="ss-logo__img"/>
                        <span class="ss-logo__name">Mía Parfums</span>
                    </a>
                    <div style="flex:1"/>
                    <button class="ss-cart-btn"
                            t-on-click="() => state.cartOpen = !state.cartOpen">
                        <svg width="22" height="22" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        <span t-if="cartCount > 0" class="ss-cart-btn__badge" t-esc="cartCount"/>
                    </button>
                </div>
            </header>

            <!-- ── VISTA: CATÁLOGO ─────────────────────────── -->
            <t t-if="state.view === 'catalog'">

                <!-- 1. HERO -->
                <HeroSection onExplore.bind="scrollToCatalog"/>

                <!-- 2. MANIFIESTO -->
                <section class="ss-manifesto">
                    <div class="ss-manifesto__bg-wrap">
                        <div class="ss-manifesto__bg-glow"/>
                        <img class="ss-manifesto__bottle-spin"
                             src="/scentsync_ecommerce/static/src/img/manifesto_bottle.png?v=sauvage3d_vfinal"
                             alt="Perfume Sauvage ScentSync"/>
                    </div>
                    <div class="ss-manifesto__inner ss-reveal">
                        <p class="ss-manifesto__text">
                            Una fragancia no es solo un aroma,
                            es una <em>huella invisible</em> que
                            dejas en cada lugar que visitas.
                        </p>
                        <div class="ss-manifesto__line"/>
                        <span class="ss-manifesto__brand">ScentSync — El arte de oler bien</span>
                    </div>
                </section>

                <!-- 3. CATÁLOGO (sección principal) -->
                <div id="ss-catalog-anchor">
                    <section class="ss-catalog-section">
                        <ProductGrid
                            products="state.products"
                            loading="state.loading"
                            families="state.families"
                            activeFamily="state.activeFamily"
                            searchQuery="state.searchQuery"
                            onFamilyChange.bind="onFamilyChange"
                            onSearch.bind="onSearch"
                            cart="state.cart"
                            onViewDetail.bind="openModal"
                            onAddToCart.bind="addToCart"
                            onSetQuantity.bind="setProductQuantity"/>
                    </section>
                </div>

                <!-- 4. PRODUCTO DESTACADO -->
                <t t-if="featuredProduct">
                    <section class="ss-featured-section">
                        <div class="ss-featured-section__inner">
                            <div class="ss-reveal">
                                <span class="ss-featured-section__label">Fragancia Destacada</span>
                                <h2 class="ss-featured-section__title"
                                    t-esc="featuredProduct.name"/>
                                <p class="ss-featured-section__desc"
                                   t-esc="featuredProduct.description || 'Una fragancia única que define el lujo moderno.'"/>
                                <div class="ss-featured-section__price">
                                    $<t t-esc="fmt(featuredProduct.price)"/>
                                </div>
                                <div class="ss-featured-section__actions">
                                    <button class="ss-featured-section__btn ss-featured-section__btn--gold"
                                            t-on-click="() => openModal(featuredProduct)">
                                        Ver detalles
                                    </button>
                                    <button class="ss-featured-section__btn ss-featured-section__btn--outline"
                                            t-on-click="() => addToCart(featuredProduct.id, 1)">
                                        🛒 Agregar al carrito
                                    </button>
                                </div>
                            </div>
                            <div class="ss-featured-section__img-wrap ss-reveal ss-reveal--delay-2">
                                <img class="ss-featured-section__img"
                                     t-att-src="featuredProduct.image_url"
                                     t-att-alt="featuredProduct.name"/>
                            </div>
                        </div>
                    </section>
                </t>



                <!-- 7. FOOTER -->
                <footer class="ss-footer">
                    <div class="ss-footer__inner">
                        <div class="ss-footer__top">
                            <div class="ss-footer__brand-wrap">
                                <a href="/shop" class="ss-footer__brand ss-logo">
                                    <img src="/scentsync_ecommerce/static/src/img/logo.png" alt="Mía Parfums" class="ss-logo__img"/>
                                    <span class="ss-logo__name">Mía Parfums</span>
                                </a>
                                <p class="ss-footer__tagline">
                                    Fragancias de lujo con entrega directa y atención personalizada.
                                </p>
                                <a t-att-href="waLink" target="_blank" class="ss-footer__wa">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    Contáctanos por WhatsApp
                                </a>
                            </div>
                            <div t-if="state.families.length">
                                <p class="ss-footer__col-title">Colecciones</p>
                                <div class="ss-footer__links">
                                    <t t-foreach="state.families" t-as="fam" t-key="fam.id">
                                        <button class="ss-footer__link"
                                                t-on-click="() => onFamilyThenScroll(fam.id)"
                                                t-esc="fam.name"/>
                                    </t>
                                </div>
                            </div>
                        </div>
                        <div class="ss-footer__bottom">
                            <span class="ss-footer__copy">
                                © 2025 Mía Parfums · Todos los derechos reservados
                            </span>
                            <span class="ss-footer__gold">✦ Mía Parfums</span>
                        </div>
                    </div>
                </footer>
            </t>

            <!-- ── VISTA: CHECKOUT ─────────────────────────── -->
            <t t-elif="state.view === 'checkout'">
                <main class="ss-main">
                    <CheckoutForm
                        cart="state.cart"
                        cartTotal="cartTotal"
                        onBack="() => state.view = 'catalog'"
                        onOrderComplete.bind="onOrderComplete"/>
                </main>
            </t>

            <!-- ── VISTA: ÉXITO ────────────────────────────── -->
            <t t-elif="state.view === 'success'">
                <main class="ss-main">
                    <div class="ss-success">
                        <div class="ss-success__icon">🎉</div>
                        <h2 class="ss-success__title">¡Pedido Enviado!</h2>
                        <p class="ss-success__sub">
                            Tu pedido <strong t-esc="state.lastOrder.order_name"/> fue registrado.
                            Continúa por WhatsApp para coordinar el pago.
                        </p>
                        <a t-att-href="state.lastOrder.whatsapp_url" target="_blank"
                           class="ss-btn ss-btn--whatsapp">
                            📱 Confirmar por WhatsApp
                        </a>
                        <button class="ss-btn ss-btn--outline"
                                t-on-click="() => state.view = 'catalog'">
                            Seguir comprando
                        </button>
                    </div>
                </main>
            </t>

            <!-- ── MODAL QUICK VIEW ────────────────────────── -->
            <t t-if="state.modalProduct">
                <ProductModal
                    product="state.modalProduct"
                    onClose="() => state.modalProduct = null"
                    onAddToCart.bind="addToCart"/>
            </t>

            <!-- ── CART SIDEBAR ────────────────────────────── -->
            <CartSidebar
                open="state.cartOpen"
                cart="state.cart"
                cartTotal="cartTotal"
                onClose="() => state.cartOpen = false"
                onUpdate.bind="updateCart"
                onRemove.bind="removeFromCart"
                onCheckout="() => { state.cartOpen = false; state.view = 'checkout'; }"/>

            <div t-if="state.cartOpen" class="ss-overlay"
                 t-on-click="() => state.cartOpen = false"/>

            <button t-if="cartCount > 0 and !state.cartOpen and state.view === 'catalog'"
                    class="ss-floating-cart-btn"
                    t-on-click="() => state.cartOpen = true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
                <span>Ver Pedido</span>
                <span class="ss-floating-badge" t-esc="cartCount"/>
            </button>

        </div>`;

        setup() {
            this.state = useState({
                view: 'catalog',
                products: [],
                families: [],        // cargado desde la API
                loading: true,
                activeFamily: null,  // ID numérico o null = todos
                searchQuery: '',
                modalProduct: null,
                cart: [],
                cartOpen: false,
                lastOrder: null,
            });
            onWillStart(async () => {
                await Promise.all([this.fetchProducts(), this.fetchCart()]);
                // Las familias ya las cargó loadConfig() en main.js
                this.state.families = SS.FAMILIES || [];
            });
        }

        get cartCount()       { return this.state.cart.reduce((s, i) => s + i.quantity, 0); }
        get cartTotal()       { return this.state.cart.reduce((s, i) => s + i.subtotal, 0); }
        get featuredProduct() { return this.state.products.find(p => p.featured) || null; }
        get waLink() {
            const wa = SS.VENDOR_WA || '';
            return wa ? `https://wa.me/${wa}` : '#';
        }

        fmt(p) { return fmt(p); }

        scrollToCatalog() {
            const el = document.getElementById('ss-catalog-anchor');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }

        async fetchProducts() {
            this.state.loading = true;
            const params = new URLSearchParams();
            if (this.state.activeFamily) params.set('family_id', this.state.activeFamily);
            if (this.state.searchQuery)  params.set('search', this.state.searchQuery);
            try {
                const r = await fetch(`/scentsync/api/products?${params}`);
                this.state.products = await r.json();
            } catch { this.state.products = []; }
            this.state.loading = false;
        }

        async fetchCart() {
            try {
                const r = await fetch('/scentsync/api/cart');
                const d = await r.json();
                this.state.cart = d.items || [];
            } catch { /* silent */ }
        }

        async onFamilyChange(familyId) {
            this.state.activeFamily = familyId;
            await this.fetchProducts();
        }

        async onFamilyThenScroll(familyId) {
            await this.onFamilyChange(familyId);
            this.scrollToCatalog();
        }

        async onSearch(q) { this.state.searchQuery = q; await this.fetchProducts(); }

        openModal(product) { this.state.modalProduct = product; }

        async addToCart(productId, qty, openCart = true) {
            const res = await rpc('/scentsync/api/cart/add', { product_id: productId, quantity: qty });
            if (res) { 
                this.state.cart = res.items || []; 
                if (openCart) this.state.cartOpen = true; 
            }
        }

        async setProductQuantity(productId, newQty) {
            const item = this.state.cart.find(i => i.product_id === productId);
            if (newQty <= 0) {
                if (item) await this.removeFromCart(item.id);
            } else {
                if (item) {
                    await this.updateCart(item.id, newQty);
                } else {
                    await this.addToCart(productId, newQty, false);
                }
            }
        }

        async updateCart(itemId, qty) {
            const res = await rpc('/scentsync/api/cart/update', { cart_item_id: itemId, quantity: qty });
            if (res) this.state.cart = res.items || [];
        }

        async removeFromCart(itemId) {
            const res = await rpc('/scentsync/api/cart/remove', { cart_item_id: itemId });
            if (res) this.state.cart = res.items || [];
        }

        onOrderComplete(orderData) {
            this.state.lastOrder = orderData;
            this.state.cart = [];
            this.state.view = 'success';
        }
    }

    SS.ShopApp = ShopApp;

})(window.owl, window.SS);
