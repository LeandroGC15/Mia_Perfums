/**
 * ProductCard.js — Tarjeta individual de producto con hover-reveal de notas, precio tachado y badge % de descuento
 */
(function (owl, SS) {
    'use strict';
    const { Component, useState, xml } = owl;
    const { fmt, NOTE_COLORS } = SS;

    class ProductCard extends Component {
        static props = ['product', 'onViewDetail', 'onAddToCart', 'focusMode?', 'listMode?'];
        static template = xml/* html */`
            <div t-att-class="cardClass" t-on-click="() => props.onViewDetail(props.product)">
                <div class="ss-card__img-wrap">
                    <img class="ss-card__img"
                         t-att-src="props.product.image_url"
                         t-att-alt="props.product.name"
                         loading="lazy"/>

                    <!-- Badge de Descuento (-17%) estilo tienda de lujo -->
                    <span t-if="props.product.discount_percentage &gt; 0" class="ss-card__discount-badge">
                        -<t t-esc="props.product.discount_percentage"/>%
                    </span>

                    <!-- Badge destacado (si no tiene descuento) -->
                    <span t-if="props.product.featured and (!props.product.discount_percentage || props.product.discount_percentage &lt;= 0)" class="ss-card__badge">⭐ Destacado</span>

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

                        <div t-if="props.listMode" class="ss-card__price-box">
                            <span t-if="props.product.compare_at_price &gt; 0" class="ss-card__old-price">
                                $<t t-esc="fmt(props.product.compare_at_price)"/>
                            </span>
                            <span class="ss-card__price" t-att-class="{ 'ss-card__price--sale': props.product.compare_at_price &gt; 0 }">
                                $<t t-esc="fmt(props.product.price)"/>
                            </span>
                        </div>
                    </div>

                    <div t-if="!props.listMode" class="ss-card__footer">
                        <div class="ss-card__price-box">
                            <span t-if="props.product.compare_at_price &gt; 0" class="ss-card__old-price">
                                $<t t-esc="fmt(props.product.compare_at_price)"/>
                            </span>
                            <span class="ss-card__price" t-att-class="{ 'ss-card__price--sale': props.product.compare_at_price &gt; 0 }">
                                $<t t-esc="fmt(props.product.price)"/>
                            </span>
                        </div>
                        <button class="ss-btn ss-btn--icon-cart"
                                t-att-class="{ 'ss-btn--added': state.added }"
                                t-on-click.stop="addToCart"
                                title="Agregar al carrito">
                            <!-- Icono Plus o Checkmark -->
                            <span t-if="!state.added" class="ss-btn__plus-icon">+</span>
                            <svg t-else="" width="18" height="18" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" stroke-width="3"
                                 stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </button>
                    </div>

                    <button t-if="props.listMode"
                            class="ss-btn ss-btn--icon-cart"
                            t-att-class="{ 'ss-btn--added': state.added }"
                            t-on-click.stop="addToCart"
                            title="Agregar al carrito">
                        <span t-if="!state.added" class="ss-btn__plus-icon">+</span>
                        <svg t-else="" width="18" height="18" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" stroke-width="3"
                             stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                </div>
            </div>`;

        setup() {
            this.state = useState({ added: false });
        }

        get cardClass() {
            if (this.props.listMode) return 'ss-card ss-card--list';
            if (this.props.focusMode) return 'ss-card ss-card--focus';
            return 'ss-card';
        }

        fmt(p) { return fmt(p); }

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
            await this.props.onAddToCart(this.props.product.id, 1);
            this.state.added = true;
            setTimeout(() => { this.state.added = false; }, 1500);
        }
    }

    SS.ProductCard = ProductCard;

})(window.owl, window.SS);
