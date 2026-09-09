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
                <button class="ss-back-btn ss-checkout__back" t-on-click="props.onBack">← Volver al catálogo</button>
                <div class="ss-checkout__inner">
                    <div class="ss-checkout__card">
                        <h2 class="ss-checkout__card-title">Datos</h2>
                        
                        <form class="ss-form" t-on-submit.prevent="submit">
                            <!-- Nombre -->
                            <div class="ss-form__group">
                                <label class="ss-form__label">Nombre y apellido</label>
                                <input class="ss-form__input" type="text"
                                       t-model="state.name" required="1"/>
                            </div>
                            
                            <!-- Teléfono -->
                            <div class="ss-form__group">
                                <label class="ss-form__label">Teléfono</label>
                                <div class="ss-phone-input">
                                    <div class="ss-phone-select-wrap">
                                        <select class="ss-phone-select" t-model="state.countryCode">
                                            <t t-foreach="countries" t-as="c" t-key="c.code">
                                                <option t-att-value="c.code"><t t-esc="c.flag"/> <t t-esc="c.code"/></option>
                                            </t>
                                        </select>
                                    </div>
                                    <input class="ss-form__input ss-phone-number" type="tel"
                                           t-model="state.phone"
                                           placeholder="412 1234567" required="1"/>
                                </div>
                            </div>
                            
                            <!-- Dirección -->
                            <div class="ss-form__group">
                                <label class="ss-form__label">Dirección</label>
                                <textarea class="ss-form__input ss-form__textarea" 
                                          t-model="state.city"
                                          rows="3" required="1"></textarea>
                            </div>
                            
                            <p t-if="state.error" class="ss-form__error" t-esc="state.error"/>
                            
                            <!-- Resumen Integrado para móvil (opcional) o quitarlo si va a la derecha. Lo quitaré y dejaré solo el total -->
                            <div class="ss-checkout__bottom-summary" style="border:none; margin-bottom: 12px; padding-top:0">
                                <!-- Espacio en blanco antes del boton -->
                            </div>

                            <button class="ss-btn ss-btn--wa ss-btn--full"
                                    type="submit"
                                    t-att-disabled="state.loading">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                <t t-if="state.loading">Procesando...</t>
                                <t t-else="">Enviar pedido</t>
                            </button>
                        </form>
                    </div>

                    <!-- Resumen (Right Column) -->
                    <div class="ss-checkout__card ss-checkout__summary-card">
                        <h2 class="ss-checkout__card-title">Resumen del pedido</h2>
                        <div class="ss-checkout__items">
                            <t t-foreach="props.cart" t-as="item" t-key="item.id">
                                <div class="ss-checkout__item">
                                    <div class="ss-checkout__item-info">
                                        <span class="ss-checkout__item-name"><t t-esc="item.product_name"/></span>
                                        <span class="ss-checkout__item-qty">Cant: <t t-esc="item.quantity"/></span>
                                    </div>
                                    <span class="ss-checkout__item-price">$<t t-esc="fmt(item.subtotal)"/></span>
                                </div>
                            </t>
                        </div>
                        <div class="ss-checkout__bottom-summary">
                            <div class="ss-checkout__summary-row">
                                <span><t t-esc="totalItems"/> artículos</span>
                                <span>$<t t-esc="fmt(props.cartTotal)"/></span>
                            </div>
                            <div class="ss-checkout__summary-total">
                                <span>Total:</span>
                                <span>$<t t-esc="fmt(props.cartTotal)"/></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        setup() {
            this.state = useState({ name: '', phone: '', city: '', countryCode: '+58', loading: false, error: '' });
            this.countries = [
                { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
                { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
                { code: '+57', flag: '🇨🇴', name: 'Colombia' },
                { code: '+52', flag: '🇲🇽', name: 'México' },
                { code: '+34', flag: '🇪🇸', name: 'España' },
                { code: '+54', flag: '🇦🇷', name: 'Argentina' },
                { code: '+56', flag: '🇨🇱', name: 'Chile' },
                { code: '+51', flag: '🇵🇪', name: 'Perú' },
                { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
                { code: '+55', flag: '🇧🇷', name: 'Brasil' },
            ];
        }

        get totalItems() {
            return this.props.cart.reduce((sum, item) => sum + item.quantity, 0);
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
                const fullPhone = `${this.state.countryCode}${this.state.phone.replace(/[^0-9]/g, '')}`;
                const result = await rpc('/scentsync/api/checkout', {
                    name: this.state.name,
                    phone: fullPhone,
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
