/**
 * ProductModal.js — Wizard / Quick View de un producto.
 *
 * Comportamiento al agregar al carrito:
 *  1. Muestra feedback visual "✓ Agregado"
 *  2. A los 800ms cierra el modal automáticamente
 *  3. Como ShopApp.addToCart() ya abre el CartSidebar, el usuario ve el carrito directamente
 */
(function (owl, SS) {
    'use strict';
    const { Component, useState, xml } = owl;
    const { fmt, NOTE_COLORS } = SS;

    class ProductModal extends Component {
        static props = ['product', 'onClose', 'onAddToCart'];
        static template = xml/* html */`
            <div class="ss-modal-overlay" t-on-click.self="props.onClose">
                <div class="ss-modal">

                    <!-- Barra superior con botón de cierre -->
                    <div class="ss-modal__topbar">
                        <button class="ss-modal__close" t-on-click="props.onClose">✕</button>
                    </div>

                    <!-- Cuerpo del modal: imagen + información -->
                    <div class="ss-modal__body">

                        <!-- Columna izquierda: imagen -->
                        <div class="ss-modal__gallery">
                            <span t-if="props.product.discount_percentage &gt; 0 and !isOutOfStock" class="ss-card__discount-badge">
                                -<t t-esc="props.product.discount_percentage"/>%
                            </span>
                            <span t-if="isLowStock" class="ss-card__low-stock-badge">
                                Pocas unidades
                            </span>
                            <img class="ss-modal__img"
                                 t-att-src="props.product.image_url"
                                 t-att-alt="props.product.name"/>
                        </div>

                        <!-- Columna derecha: información -->
                        <div class="ss-modal__info">

                            <!-- Familia badge -->
                            <span t-if="props.product.family_name"
                                  class="ss-modal__family"
                                  t-esc="props.product.family_name"/>

                            <!-- Nombre -->
                            <h2 class="ss-modal__name" t-esc="props.product.name"/>

                            <!-- Metadatos (tamaño, concentración, género) -->
                            <div t-if="props.product.size_ml or props.product.concentration or props.product.gender"
                                 class="ss-modal__meta">
                                <span t-if="props.product.size_ml">
                                    <strong>Tamaño:</strong> <t t-esc="props.product.size_ml"/> ML
                                </span>
                                <span t-if="props.product.concentration">
                                    <strong>Concentración:</strong> <t t-esc="props.product.concentration"/>
                                </span>
                                <span t-if="props.product.gender">
                                    <strong>Género:</strong> <t t-esc="props.product.gender"/>
                                </span>
                            </div>

                            <!-- Precio o No disponible -->
                            <div class="ss-modal__price-row">
                                <t t-if="isOutOfStock">
                                    <span class="ss-card__not-available" style="font-size: 22px; text-align: left;">No disponible</span>
                                </t>
                                <t t-else="">
                                    <span t-if="props.product.compare_at_price &gt; 0" class="ss-modal__old-price">
                                        $<t t-esc="fmt(props.product.compare_at_price)"/>
                                    </span>
                                    <span class="ss-modal__price">$<t t-esc="fmt(props.product.price)"/></span>
                                </t>
                            </div>

                            <!-- Alerta de pocas unidades si aplica -->
                            <div t-if="isLowStock" class="ss-modal__low-stock-alert">
                                ⚠️ ¡Pocas unidades disponibles! (Solo quedan <t t-esc="props.product.qty_available"/>)
                            </div>

                            <!-- Descripción corta -->
                            <div t-if="props.product.description"
                                 style="font-size:14px;color:#555;line-height:1.6">
                                <t t-esc="props.product.description"/>
                            </div>

                            <!-- Notas olfativas como pills de colores -->
                            <t t-if="notePills.length">
                                <div class="ss-modal__divider"/>
                                <p class="ss-modal__notes-title">Acordes principales</p>
                                <div class="ss-modal__notes-pills">
                                    <t t-foreach="notePills" t-as="note" t-key="note_index">
                                        <span class="ss-note-pill"
                                              t-att-style="'background:' + note.color"
                                              t-esc="note.label"/>
                                    </t>
                                </div>
                            </t>

                            <!-- Acciones: cantidad + botón agregar -->
                            <div class="ss-modal__actions">
                                <t t-if="isOutOfStock">
                                    <button class="ss-btn ss-modal__not-available-btn" disabled="disabled">
                                        No disponible
                                    </button>
                                </t>
                                <t t-else="">
                                    <div class="ss-modal__add-row">
                                        <div class="ss-card__qty-control">
                                            <button class="ss-qty-btn" t-on-click="dec">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                            </button>
                                            <span class="ss-qty-val" t-esc="state.qty"/>
                                            <button class="ss-qty-btn" t-on-click="inc">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                            </button>
                                        </div>
                                        <button class="ss-btn ss-modal__btn-cart"
                                                t-att-class="{ 'ss-btn--added': state.added }"
                                                t-att-disabled="state.adding"
                                                t-on-click="addToCart">
                                            <t t-if="state.added">✓ ¡Agregado!</t>
                                            <t t-else="">Agregar al carrito</t>
                                        </button>
                                    </div>
                                </t>
                            </div>

                        </div><!-- /ss-modal__info -->
                    </div><!-- /ss-modal__body -->
                </div><!-- /ss-modal -->
            </div>`;

        setup() {
            this.state = useState({ qty: 1, added: false, adding: false });
        }

        get isOutOfStock() {
            const qty = this.props.product.qty_available;
            return qty === undefined || qty === null || qty <= 0;
        }

        get isLowStock() {
            const qty = this.props.product.qty_available;
            return qty !== undefined && qty !== null && qty > 0 && qty <= 5;
        }

        fmt(p) { return fmt(p); }
        inc() {
            const max = this.props.product.qty_available;
            if (max && this.state.qty >= max) return;
            this.state.qty++;
        }
        dec() { if (this.state.qty > 1) this.state.qty--; }

        /** Convierte el campo de notas (texto separado por comas) en pills con colores */
        get notePills() {
            const raw = this.props.product.notes || '';
            if (!raw) return [];
            return raw
                .split(',')
                .map((n, i) => ({ label: n.trim(), color: NOTE_COLORS[i % NOTE_COLORS.length] }))
                .filter(n => n.label);
        }

        /**
         * Agrega el producto al carrito, muestra feedback y cierra el modal.
         * El CartSidebar se abre automáticamente desde ShopApp.addToCart().
         */
        async addToCart() {
            if (this.isOutOfStock) return;
            if (this.state.adding) return;
            this.state.adding = true;

            await this.props.onAddToCart(this.props.product.id, this.state.qty);

            this.state.added = true;
            this.state.adding = false;

            // Cierra el modal tras 800ms para dar feedback visual antes de la transición
            setTimeout(() => {
                this.props.onClose();
            }, 800);
        }
    }

    SS.ProductModal = ProductModal;

})(window.owl, window.SS);
