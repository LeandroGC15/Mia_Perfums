# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class ScentSyncShop(http.Controller):

    @http.route('/shop', auth='public', type='http', csrf=False, methods=['GET'])
    def shop(self, **kwargs):
        """Sirve una página HTML completamente independiente de Odoo."""
        html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="description" content="ScentSync — Perfumes de lujo. Descubre nuestra colección única."/>
    <title>ScentSync — Perfumes de Lujo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="/scentsync_ecommerce/static/src/css/shop.css"/>
</head>
<body>
    <div id="scentsync-shop-root"></div>

    <!-- 1. OWL Framework -->
    <script src="/web/static/lib/owl/owl.js"></script>

    <!-- 2. Configuración global y utilidades -->
    <script src="/scentsync_ecommerce/static/src/js/config.js"></script>
    <script src="/scentsync_ecommerce/static/src/js/utils.js"></script>

    <!-- 3. Componentes (orden de dependencias: los hijos antes que los padres) -->
    <script src="/scentsync_ecommerce/static/src/js/components/ProductCard.js"></script>
    <script src="/scentsync_ecommerce/static/src/js/components/ProductGrid.js"></script>
    <script src="/scentsync_ecommerce/static/src/js/components/ProductModal.js"></script>
    <script src="/scentsync_ecommerce/static/src/js/components/CartSidebar.js"></script>
    <script src="/scentsync_ecommerce/static/src/js/components/CheckoutForm.js"></script>
    <script src="/scentsync_ecommerce/static/src/js/components/HeroSection.js"></script>
    <script src="/scentsync_ecommerce/static/src/js/components/ShopApp.js"></script>

    <!-- 4. Punto de entrada: monta la aplicación -->
    <script src="/scentsync_ecommerce/static/src/js/main.js"></script>
</body>
</html>"""

        return request.make_response(html, headers=[('Content-Type', 'text/html; charset=utf-8')])
