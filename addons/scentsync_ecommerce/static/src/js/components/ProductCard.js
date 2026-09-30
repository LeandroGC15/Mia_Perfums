/**
 * ProductCard.js — Tarjeta individual de producto con hover-reveal de notas, precio tachado y badge % de descuento
 */
(function (owl, SS) {
    'use strict';
    const { Component, useState, xml } = owl;
    const { fmt, NOTE_COLORS } = SS;

    class ProductCard extends Component {
        static props = ['product', 'onViewDetail', 'onAddToCart', 'focusMode?', 'listMode?', 'cart?', 'onSetQuantity?'];
        static template = xml/* html */`
            <div t-att-class="cardClass" t-on-click="() => props.onViewDetail(props.product)">
                <div class="ss-card__img-wrap">
                    <img class="ss-card__img"
                         t-att-src="props.product.image_url"
                         t-att-alt="props.product.name"
                         loading="lazy"/>

                    <!-- Badge de Descuento (-17%) solo si hay stock -->
                    <span t-if="props.product.discount_percentage &gt; 0 and !isOutOfStock" class="ss-card__discount-badge">
                        -<t t-esc="props.product.discount_percentage"/>%
                    </span>

                    <!-- Tab de Pocas Unidades / Poco Stock (entre 1 y 5 unidades) -->
                    <span t-if="isLowStock" class="ss-card__low-stock-badge">
                        Pocas unidades
                    </span>

                    <!-- Badge destacado (si no tiene descuento y hay stock) -->
                    <span t-if="props.product.featured and (!props.product.discount_percentage || props.product.discount_percentage &lt;= 0) and !isOutOfStock" class="ss-card__badge">⭐ Destacado</span>

                    <!-- Badge de familia -->
                    <span t-if="props.product.family_name and !props.listMode"
                          class="ss-card__family"
                          t-esc="props.product.family_name"/>

                    <!-- Hover reveal: notas olfativas como mini pills -->
                    <div t-if="notePills.length and !props.listMode" class="ss-card__hover-reveal">
                        <t t-foreach="notePills" t-as="note" t-key="note_index">
                            <span class="ss-card__mini-pill"
                                  t-att-style="'background:' + note.color"
                                  t-esc="note.label"/>
                        </t>
                    </div>
                </div>

                <div class="ss-card__body">
                    <div class="ss-card__info-col">
                        <h3 class="ss-card__name" t-esc="props.product.name"/>
                        <p t-if="props.product.size_ml and !props.listMode" class="ss-card__meta">
                            <t t-esc="props.product.size_ml"/> ML
                            <t t-if="props.product.concentration">
                                · <t t-esc="props.product.concentration"/>
                            </t>
                        </p>

                        <!-- En vista focus: mostrar descripción -->
                        <p t-if="props.focusMode and props.product.description"
                           style="font-size:14px;color:#666;line-height:1.6;margin-top:4px">
                            <t t-esc="props.product.description"/>
                        </p>

                        <!-- En modo lista -->
                        <div t-if="props.listMode" class="ss-card__price-box">
                            <t t-if="isOutOfStock">
                                <span class="ss-card__not-available">No disponible</span>
                            </t>
                            <t t-else="">
                                <span t-if="props.product.compare_at_price &gt; 0" class="ss-card__old-price">
                                    $<t t-esc="fmt(props.product.compare_at_price)"/>
                                </span>
                                <span class="ss-card__price" t-att-class="{ 'ss-card__price--sale': props.product.compare_at_price &gt; 0 }">
                                    $<t t-esc="fmt(props.product.price)"/>
                                </span>
                            </t>
                        </div>
                    </div>

                    <!-- En modo normal (grilla / carrusel) -->
                    <div t-if="!props.listMode" class="ss-card__footer" t-att-class="{ 'ss-card__footer--out-of-stock': isOutOfStock }">
                        <t t-if="isOutOfStock">
                            <span class="ss-card__not-available">No disponible</span>
                        </t>
                        <t t-else="">
                            <div class="ss-card__price-box">
                                <span t-if="props.product.compare_at_price &gt; 0" class="ss-card__old-price">
                                    $<t t-esc="fmt(props.product.compare_at_price)"/>
                                </span>
                                <span class="ss-card__price" t-att-class="{ 'ss-card__price--sale': props.product.compare_at_price &gt; 0 }">
                                    $<t t-esc="fmt(props.product.price)"/>
                                </span>
                            </div>
                            <div t-if="cartQty &gt; 0" class="ss-card__qty-control" t-on-click.stop="">
                                <button class="ss-qty-btn" t-on-click.stop="decreaseQty">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </button>
                                <span class="ss-qty-val" t-esc="cartQty"/>
                                <button class="ss-qty-btn" t-on-click.stop="increaseQty">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                </button>
                            </div>
                            <button t-else="" class="ss-btn ss-btn--icon-cart"
                                    t-on-click.stop="increaseQty"
                                    title="Agregar al carrito">
                                <span class="ss-btn__plus-icon">+</span>
                            </button>
                        </t>
                    </div>

                    <!-- Botón en modo lista (solo si hay stock) -->
                    <t t-if="props.listMode and !isOutOfStock">
                        <div t-if="cartQty &gt; 0" class="ss-card__qty-control ss-card__qty-control--list" t-on-click.stop="">
                            <button class="ss-qty-btn" t-on-click.stop="decreaseQty">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                            <span class="ss-qty-val" t-esc="cartQty"/>
                            <button class="ss-qty-btn" t-on-click.stop="increaseQty">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                        </div>
                        <button t-else="" class="ss-btn ss-btn--icon-cart"
                                t-on-click.stop="increaseQty"
                                title="Agregar al carrito">
                            <span class="ss-btn__plus-icon">+</span>
                        </button>
                    </t>
                </div>
            </div>`;

        setup() {
            this.state = useState({ added: false });
        }

        get isOutOfStock() {
            const qty = this.props.product.qty_available;
            return qty === undefined || qty === null || qty <= 0;
        }

        get isLowStock() {
            const qty = this.props.product.qty_available;
            return qty !== undefined && qty !== null && qty > 0 && qty <= 5;
        }

        get cardClass() {
            let cls = 'ss-card';
            if (this.props.listMode) cls += ' ss-card--list';
            if (this.props.focusMode) cls += ' ss-card--focus';
            if (this.isOutOfStock) cls += ' ss-card--out-of-stock';
            return cls;
        }

        fmt(p) { return fmt(p); }

        get cartQty() {
            if (!this.props.cart) return 0;
            const item = this.props.cart.find(i => i.product_id === this.props.product.id);
            return item ? item.quantity : 0;
        }

        async increaseQty() {
            if (this.isOutOfStock) return;
            const max = this.props.product.qty_available;
            if (max !== undefined && max !== null && max > 0 && this.cartQty >= max) {
                return;
            }
            if (this.props.onSetQuantity) {
                await this.props.onSetQuantity(this.props.product.id, this.cartQty + 1);
            } else {
                await this.addToCart();
            }
        }

        async decreaseQty() {
            if (this.props.onSetQuantity) {
                await this.props.onSetQuantity(this.props.product.id, this.cartQty - 1);
            }
        }

        get notePills() {
            const raw = this.props.product.notes || '';
            if (!raw) return [];
            return raw
                .split(',')
                .map((n, i) => ({ label: n.trim(), color: NOTE_COLORS[i % NOTE_COLORS.length] }))
                .filter(n => n.label)
                .slice(0, 5);
        }

        async addToCart() {
            if (this.isOutOfStock) return;
            await this.props.onAddToCart(this.props.product.id, 1);
            this.state.added = true;
            setTimeout(() => { this.state.added = false; }, 1500);
        }
    }

    SS.ProductCard = ProductCard;

})(window.owl, window.SS);
