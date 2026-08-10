/**
 * main.js — Punto de entrada de la aplicación ScentSync.
 */
(function (owl, SS) {
    'use strict';

    if (!owl) { console.error('ScentSync: OWL no está cargado.'); return; }
    if (!SS || !SS.ShopApp) { console.error('ScentSync: ShopApp no está registrado.'); return; }

    const { mount } = owl;

    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('ss-reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        const observe = () => {
            document.querySelectorAll('.ss-reveal').forEach(el => observer.observe(el));
        };

        observe();

        // Re-observe after OWL renders new sections
        const mutObs = new MutationObserver(observe);
        mutObs.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await SS.loadConfig();

        const root = document.getElementById('scentsync-shop-root');
        if (root) {
            await mount(SS.ShopApp, root);
            initScrollReveal();
        }
    });

})(window.owl, window.SS);
