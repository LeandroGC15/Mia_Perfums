/**
 * ProductGrid.js — Catálogo en 2 columnas (Sidebar + Carrusel por familias olfativas)
 */
(function (owl, SS) {
    'use strict';
    const { Component, useState, xml } = owl;
    const { ProductCard } = SS;

    class ProductGrid extends Component {
        static components = { ProductCard };
        static props = [
            'products', 'loading', 'families', 'activeFamily', 'searchQuery',
            'onFamilyChange', 'onSearch', 'onViewDetail', 'onAddToCart',
        ];
        static template = xml/* html */`
            <div class="ss-catalog-layout">

                <!-- ── COLUMNA IZQUIERDA: SIDEBAR ────────────────────────────── -->
                <aside class="ss-sidebar">

                    <!-- Box 1: ENTRA EN CONTACTO -->
                    <div t-if="contactInfo.instagram_handle || contactInfo.whatsapp_number || contactInfo.location" class="ss-sidebar__box">
                        <div t-if="contactInfo.whatsapp_number" class="ss-sidebar__item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            <span t-esc="contactInfo.whatsapp_number"/>
                        </div>
                        <div t-if="contactInfo.instagram_handle" class="ss-sidebar__item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                            <span t-esc="contactInfo.instagram_handle"/>
                        </div>
                        <div t-if="contactInfo.location" class="ss-sidebar__item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span t-esc="contactInfo.location"/>
                        </div>
                    </div>

                    <!-- Box 2: ENTREGA -->
                    <div class="ss-sidebar__box">
                        <h4 class="ss-sidebar__title">ENTREGA</h4>
                        <div class="ss-sidebar__delivery">
                            <p t-if="contactInfo.delivery_info" style="white-space: pre-line;" t-esc="contactInfo.delivery_info"/>
                            <t t-else="">
                                <p><strong>Entrega</strong></p>
                                <p>📍 Tienda virtual. 🛍️ Retiros personales.</p>
                                <p>🛵 Delivery a toda la ciudad.</p>
                                <p>📦 Envíos a nivel nacional.</p>
                            </t>
                        </div>
                    </div>

                </aside>

                <!-- ── COLUMNA DERECHA: CONTENIDO PRINCIPAL ──────────────────── -->
                <main class="ss-catalog-main">

                    <!-- Barra Superior de Navegación + Filtros -->
                    <div class="ss-catalog-topbar">
                        <!-- Búsqueda -->
                        <div class="ss-search">
                            <svg class="ss-search__icon" width="18" height="18"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input class="ss-search__input" type="text"
                                   placeholder="Buscar perfumes..."
                                   t-att-value="props.searchQuery"
                                   t-on-input="ev => props.onSearch(ev.target.value)"/>
                        </div>

                        <!-- Bar horizontal de categorías con scroll -->
                        <div class="ss-category-bar">
                            <div id="ss-pills-track" class="ss-category-bar__track">
                                <button class="ss-pill"
                                        t-att-class="{ 'ss-pill--active': !props.activeFamily }"
                                        t-on-click="() => props.onFamilyChange(null)">
                                    INICIO
                                </button>
                                <t t-foreach="props.families" t-as="fam" t-key="fam.id">
                                    <button class="ss-pill"
                                            t-att-class="{ 'ss-pill--active': props.activeFamily === fam.id }"
                                            t-on-click="() => props.onFamilyChange(fam.id)"
                                            t-esc="fam.name"/>
                                </t>
                            </div>
                            <button class="ss-category-bar__arrow"
                                    t-on-click="scrollCategoryPills"
                                    title="Ver más categorías">
                                ❯
                            </button>
                        </div>

                        <!-- View Toggle (Grilla / Lista Horizontal) -->
                        <div class="ss-view-toggle">
                            <button class="ss-view-toggle__btn"
                                    t-att-class="{ 'ss-view-toggle__btn--active': viewMode === 'grid' }"
                                    t-on-click="() => state.viewMode = 'grid'"
                                    title="Vista grilla">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                                    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                                    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                                    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                                </svg>
                            </button>
                            <button class="ss-view-toggle__btn"
                                    t-att-class="{ 'ss-view-toggle__btn--active': viewMode === 'list' }"
                                    t-on-click="() => state.viewMode = 'list'"
                                    title="Vista lista horizontal">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                    <line x1="8" y1="6" x2="21" y2="6"/>
                                    <line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Mensajes de Estado (Cargando / Sin resultados) -->
                    <div t-if="props.loading" class="ss-state-msg">
                        <div class="ss-spinner"/>
                        <p>Cargando catálogo...</p>
                    </div>
                    <div t-elif="!props.products.length" class="ss-state-msg">
                        <p class="ss-state-msg__icon">🔍</p>
                        <p>No encontramos perfumes con ese criterio.</p>
                    </div>

                    <!-- MODO A: VISTA POR FAMILIAS (INICIO) -->
                    <t t-elif="!props.activeFamily &amp;&amp; !props.searchQuery">
                        <t t-foreach="displayFamilies" t-as="fam" t-key="fam.id">
                            <div t-if="getFamilyProducts(fam.id).length" class="ss-family-section">
                                
                                <!-- Cabecera de la Sección de Familia -->
                                <div class="ss-family-section__head">
                                    <h3 class="ss-family-section__name">
                                        <t t-esc="fam.name"/>
                                        <button class="ss-family-section__link"
                                                t-on-click="() => props.onFamilyChange(fam.id)">
                                            Ver todo (<t t-esc="getFamilyProducts(fam.id).length"/>)
                                        </button>
                                    </h3>
                                </div>

                                <!-- Vista Grilla (Carrusel Horizontal) -->
                                <div t-if="viewMode === 'grid'" class="ss-carousel-wrapper">
                                    <button class="ss-carousel__arrow ss-carousel__arrow--prev"
                                            t-on-click="() => scrollTrack('fam-track-' + fam.id, 'left')"
                                            title="Anterior">
                                        ‹
                                    </button>

                                    <div t-att-id="'fam-track-' + fam.id" class="ss-carousel-track">
                                        <t t-foreach="getFamilyProducts(fam.id)" t-as="product" t-key="product.id">
                                            <div class="ss-carousel-slide">
                                                <ProductCard product="product"
                                                             onViewDetail="props.onViewDetail"
                                                             onAddToCart="props.onAddToCart"/>
                                            </div>
                                        </t>

                                        <!-- Tarjeta final: VER TODO DE [FAMILIA] -->
                                        <div class="ss-carousel-slide">
                                            <div class="ss-card ss-card--see-all"
                                                 t-on-click="() => props.onFamilyChange(fam.id)">
                                                <div class="ss-card--see-all__inner">
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                                         stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                                    </svg>
                                                    <span class="ss-card--see-all__sub">Ver todo de</span>
                                                    <strong class="ss-card--see-all__title" t-esc="fam.name"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button class="ss-carousel__arrow ss-carousel__arrow--next"
                                            t-on-click="() => scrollTrack('fam-track-' + fam.id, 'right')"
                                            title="Siguiente">
                                        ›
                                    </button>
                                </div>

                                <!-- Vista Lista (Filas Horizontales Apiladas) -->
                                <div t-else="" class="ss-grid--list">
                                    <t t-foreach="getFamilyProducts(fam.id)" t-as="product" t-key="product.id">
                                        <ProductCard product="product"
                                                     listMode="true"
                                                     onViewDetail="props.onViewDetail"
                                                     onAddToCart="props.onAddToCart"/>
                                    </t>
                                </div>

                            </div>
                        </t>

                        <!-- Si ninguna familia tiene productos asociadas aún -->
                        <div t-if="!hasAnyFamilyProducts" class="ss-family-section">
                            <div class="ss-family-section__head">
                                <h3 class="ss-family-section__name">Catálogo General</h3>
                            </div>
                            <div t-if="viewMode === 'grid'" class="ss-grid">
                                <t t-foreach="props.products" t-as="product" t-key="product.id">
                                    <ProductCard product="product"
                                                 onViewDetail="props.onViewDetail"
                                                 onAddToCart="props.onAddToCart"/>
                                </t>
                            </div>
                            <div t-else="" class="ss-grid--list">
                                <t t-foreach="props.products" t-as="product" t-key="product.id">
                                    <ProductCard product="product"
                                                 listMode="true"
                                                 onViewDetail="props.onViewDetail"
                                                 onAddToCart="props.onAddToCart"/>
                                </t>
                            </div>
                        </div>
                    </t>

                    <!-- MODO B: VISTA DE FAMILIA ESPECÍFICA O BÚSQUEDA -->
                    <t t-else="">
                        <div class="ss-family-section__head" style="margin-bottom: 20px;">
                            <h3 class="ss-family-section__name">
                                <t t-if="props.activeFamily" t-esc="activeFamilyName"/>
                                <t t-else="">Resultados de búsqueda</t>
                                <button class="ss-family-section__link" t-on-click="() => props.onFamilyChange(null)">
                                    ← Ver todas las familias
                                </button>
                            </h3>
                        </div>

                        <div t-if="viewMode === 'grid'" class="ss-grid">
                            <t t-foreach="props.products" t-as="product" t-key="product.id">
                                <ProductCard product="product"
                                             onViewDetail="props.onViewDetail"
                                             onAddToCart="props.onAddToCart"/>
                            </t>
                        </div>
                        <div t-else="" class="ss-grid--list">
                            <t t-foreach="props.products" t-as="product" t-key="product.id">
                                <ProductCard product="product"
                                             listMode="true"
                                             onViewDetail="props.onViewDetail"
                                             onAddToCart="props.onAddToCart"/>
                            </t>
                        </div>
                    </t>

                </main>
            </div>`;

        setup() {
            this.state = useState({ viewMode: 'grid' });
        }

        get viewMode() { return this.state.viewMode; }
        get contactInfo() { return SS.CONFIG || {}; }

        get displayFamilies() {
            if (this.props.families && this.props.families.length) {
                return this.props.families;
            }
            return [];
        }

        get hasAnyFamilyProducts() {
            return this.props.families.some(f => this.getFamilyProducts(f.id).length > 0);
        }

        get activeFamilyName() {
            const fam = this.props.families.find(f => f.id === this.props.activeFamily);
            return fam ? fam.name : 'Colección';
        }

        getFamilyProducts(famId) {
            return this.props.products.filter(p => {
                if (p.family_ids && Array.isArray(p.family_ids)) {
                    return p.family_ids.includes(famId);
                }
                return p.family_id === famId;
            });
        }

        scrollTrack(trackId, direction) {
            const el = document.getElementById(trackId);
            if (el) {
                const scrollAmount = 320;
                el.scrollBy({
                    left: direction === 'right' ? scrollAmount : -scrollAmount,
                    behavior: 'smooth'
                });
            }
        }

        scrollCategoryPills() {
            const el = document.getElementById('ss-pills-track');
            if (el) {
                el.scrollBy({ left: 180, behavior: 'smooth' });
            }
        }
    }

    SS.ProductGrid = ProductGrid;

})(window.owl, window.SS);
