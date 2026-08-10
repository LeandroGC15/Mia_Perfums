/**
 * CheckoutForm.js — Formulario de cierre de pedido (datos del cliente)
 */
(function (owl, SS) {
    'use strict';
    const { Component, useState, xml } = owl;
    const { fmt, rpc } = SS;

    class CheckoutForm extends Component {
        static props = ['cart', 'cartTotal', 'onBack', 'onOrderComplete'];
        static template = xml/* html */`
            <div class="ss-checkout">
                <button class="ss-back-btn" t-on-click="props.onBack">← Volver al catálogo</button>
                <div class="ss-checkout__inner">

                    <!-- Formulario -->
                    <div class="ss-checkout__form-wrap">
                        <h2 class="ss-checkout__title">Confirmar Pedido</h2>
                        <p class="ss-checkout__sub">
                            Completa tus datos. Tu vendedor se pondrá en contacto
                            para coordinar el pago y envío.
                        </p>
                        <form class="ss-form" t-on-submit.prevent="submit">
                            <div class="ss-form__group">
                                <label class="ss-form__label">Nombre completo *</label>
                                <input class="ss-form__input" type="text"
                                       t-model="state.name"
                                       placeholder="Ej: María García" required="1"/>
                            </div>
                            <div class="ss-form__group">
                                <label class="ss-form__label">WhatsApp *</label>
                                <input class="ss-form__input" type="tel"
                                       t-model="state.phone"
                                       placeholder="Ej: +58 412 1234567" required="1"/>
                            </div>
                            <div class="ss-form__group">
                                <label class="ss-form__label">Ciudad</label>
                                <input class="ss-form__input" type="text"
                                       t-model="state.city"
                                       placeholder="Ej: Caracas"/>
                            </div>
                            <p t-if="state.error" class="ss-form__error" t-esc="state.error"/>
                            <button class="ss-btn ss-btn--primary ss-btn--full"
                                    type="submit"
                                    t-att-disabled="state.loading">
                                <t t-if="state.loading">Procesando...</t>
                                <t t-else="">Enviar Pedido</t>
                            </button>
                        </form>
                    </div>

                    <!-- Resumen del pedido -->
                    <div class="ss-checkout__summary">
                        <h3 class="ss-checkout__summary-title">Resumen</h3>
                        <div class="ss-checkout__items">
                            <t t-foreach="props.cart" t-as="item" t-key="item.id">
                                <div class="ss-checkout__item">
                                    <span><t t-esc="item.product_name"/> × <t t-esc="item.quantity"/></span>
                                    <span>$<t t-esc="fmt(item.subtotal)"/></span>
                                </div>
                            </t>
                        </div>
                        <div class="ss-checkout__total">
                            <strong>Total</strong>
                            <strong>$<t t-esc="fmt(props.cartTotal)"/></strong>
                        </div>
                    </div>

                </div>
            </div>`;

        setup() {
            this.state = useState({ name: '', phone: '', city: '', loading: false, error: '' });
        }

        fmt(p) { return fmt(p); }

        async submit() {
            if (!this.state.name || !this.state.phone) {
                this.state.error = 'Por favor completa tu nombre y número de WhatsApp.';
                return;
            }
            this.state.loading = true;
            this.state.error = '';
            try {
                const result = await rpc('/scentsync/api/checkout', {
                    name: this.state.name,
                    phone: this.state.phone,
                    city: this.state.city,
                });
                if (result && result.success) {
                    const msg = encodeURIComponent(result.whatsapp_message);
                    const waUrl = `https://wa.me/${SS.VENDOR_WA}?text=${msg}`;
                    this.props.onOrderComplete({ ...result, whatsapp_url: waUrl });
                } else {
                    this.state.error = (result && result.error) || 'Ocurrió un error. Intenta de nuevo.';
                }
            } catch (e) {
                this.state.error = 'Error de conexión. Verifica tu internet.';
            }
            this.state.loading = false;
        }
    }

    SS.CheckoutForm = CheckoutForm;

})(window.owl, window.SS);
