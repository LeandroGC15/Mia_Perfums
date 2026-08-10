/**
 * FamilyExplorer.js — Carrusel horizontal de familias olfativas
 * Al hacer hover sobre una tarjeta cambia el fondo de página reactivamente.
 */
(function (owl, SS) {
    'use strict';
    const { Component, xml } = owl;
    const { FAMILIES, FAMILY_META, FAMILY_BG } = SS;

    class FamilyExplorer extends Component {
        static props = ['onSelect'];
        static template = xml/* html */`
            <section class="ss-family-explorer ss-reveal">
                <div class="ss-family-explorer__header">
                    <span class="ss-section-label">Colecciones</span>
                    <h2 class="ss-section-title">Explora por familia olfativa</h2>
                </div>
                <div class="ss-family-track">
                    <t t-foreach="families" t-as="fam" t-key="fam.value">
                        <button
                            t-attf-class="ss-family-card ss-family-card--#{fam.value}"
                            t-on-click="() => this.select(fam.value)"
                            t-on-mouseenter="() => this.hoverBg(fam.value)"
                            t-on-mouseleave="() => this.resetBg()">
                            <span class="ss-family-card__icon"
                                  t-esc="meta(fam.value).icon"/>
                            <span class="ss-family-card__name" t-esc="fam.label"/>
                            <span class="ss-family-card__sub"
                                  t-esc="meta(fam.value).sub"/>
                        </button>
                    </t>
                </div>
            </section>`;

        get families() { return FAMILIES; }

        meta(value) {
            return FAMILY_META[value] || { icon: '✦', sub: '' };
        }

        select(value) {
            this.resetBg();
            this.props.onSelect(value);
        }

        hoverBg(value) {
            const color = FAMILY_BG[value];
            if (color) document.documentElement.style.setProperty('--ss-page-bg', color);
        }

        resetBg() {
            document.documentElement.style.setProperty('--ss-page-bg', '#f8f6f1');
        }
    }

    SS.FamilyExplorer = FamilyExplorer;

})(window.owl, window.SS);
