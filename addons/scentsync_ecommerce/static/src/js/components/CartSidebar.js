/**
 * CartSidebar.js — Panel lateral deslizable del carrito de compras
 */
(function (owl, SS) {
    'use strict';
    const { Component, xml } = owl;
    const { fmt } = SS;

    class CartSidebar extends Component {
        static props = ['open', 'cart', 'cartTotal', 'onClose', 'onUpdate', 'onRemove', 'onCheckout'];
        static template = xml/* html */`
            <div class="ss-cart-sidebar" t-att-class="{ 'ss-cart-sidebar--open': props.open }">
                <div class="ss-cart-sidebar__header">
                    <h3>Tu carrito</h3>
                    <button class="ss-cart-sidebar__close" t-on-click="props.onClose">✕</button>
                </div>

                <div t-if="!props.cart.length" class="ss-cart-sidebar__empty">
                    <p>🛍️</p>
                    <p>Tu carrito está vacío</p>
                    <button class="ss-btn ss-btn--outline" t-on-click="props.onClose">
                        Ver catálogo
                    </button>
                </div>

                <div t-else="" class="ss-cart-sidebar__content">
                    <div class="ss-cart-items">
                        <t t-foreach="props.cart" t-as="item" t-key="item.id">
                            <div class="ss-cart-item">
                                <img class="ss-cart-item__img"
                                     t-att-src="item.image_url"
                                     t-att-alt="item.product_name"/>
                                <div class="ss-cart-item__info">
                                    <p class="ss-cart-item__name" t-esc="item.product_name"/>
                                    <p class="ss-cart-item__price">$<t t-esc="fmt(item.price_unit)"/></p>
                                    <div class="ss-qty-control ss-qty-control--sm">
                                        <button t-on-click="() => props.onUpdate(item.id, item.quantity - 1)">−</button>
                                        <span t-esc="item.quantity"/>
                                        <button t-on-click="() => props.onUpdate(item.id, item.quantity + 1)">+</button>
                                    </div>
                                </div>
                                <div class="ss-cart-item__right">
                                    <p class="ss-cart-item__subtotal">$<t t-esc="fmt(item.subtotal)"/></p>
                                    <button class="ss-cart-item__remove"
                                            t-on-click="() => props.onRemove(item.id)">🗑</button>
                                </div>
                            </div>
                        </t>
                    </div>
                    <div class="ss-cart-sidebar__footer">
                        <div class="ss-cart-total">
                            <span>Total</span>
                            <span class="ss-cart-total__amount">$<t t-esc="fmt(props.cartTotal)"/></span>
                        </div>
                        <button class="ss-btn ss-btn--primary ss-btn--full"
                                t-on-click="props.onCheckout">
                            Finalizar pedido →
                        </button>
                    </div>
                </div>
            </div>`;

        fmt(p) { return fmt(p); }
    }

    SS.CartSidebar = CartSidebar;

})(window.owl, window.SS);
