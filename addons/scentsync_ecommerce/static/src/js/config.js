/**
 * config.js — Constantes globales de ScentSync
 */
(function () {
    'use strict';

    window.SS = window.SS || {};
    window.SS.VENDOR_WA = '';
    window.SS.FAMILIES = [];  // Se carga dinámicamente desde /scentsync/api/families

    window.SS.loadConfig = async function () {
        try {
            const [cfgRes, famRes] = await Promise.all([
                fetch('/scentsync/api/config'),
                fetch('/scentsync/api/families'),
            ]);
            const cfg = await cfgRes.json();
            const families = await famRes.json();
            window.SS.VENDOR_WA = cfg.whatsapp_number || '';
            window.SS.CONFIG = cfg || {};
            window.SS.FAMILIES = Array.isArray(families) ? families : [];
        } catch (e) {
            console.warn('ScentSync: No se pudo cargar la configuración.', e);
        }
    };

    window.SS.NOTE_COLORS = [
        '#c0392b','#e67e22','#f39c12','#27ae60','#16a085',
        '#2980b9','#8e44ad','#d35400','#1abc9c','#2c3e50',
        '#6c3483','#1a5276','#145a32','#784212','#717d7e',
    ];
})();
