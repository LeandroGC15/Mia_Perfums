/**
 * utils.js — Funciones utilitarias reutilizables
 */
(function () {
    'use strict';

    window.SS = window.SS || {};

    /** Formatea un número como precio con 2 decimales */
    window.SS.fmt = function (p) {
        return parseFloat(p || 0).toFixed(2);
    };

    /**
     * Realiza una llamada JSON-RPC a un endpoint de Odoo.
     * @param {string} url - URL del endpoint
     * @param {object} params - Parámetros del método
     * @returns {Promise<any>} - El campo `result` de la respuesta
     */
    window.SS.rpc = async function (url, params) {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'call', id: 1, params }),
        });
        const d = await r.json();
        return d.result;
    };
})();
