# -*- coding: utf-8 -*-
import json
import os
from odoo import http
from odoo.http import request


class ScentSyncAPI(http.Controller):

    # -------------------------------------------------------
    # CONFIGURACIÓN PÚBLICA
    # -------------------------------------------------------
    @http.route('/scentsync/api/config', auth='public', type='http', csrf=False, methods=['GET'])
    def get_config(self, **kwargs):
        ICP = request.env['ir.config_parameter'].sudo()
        wa_number = ICP.get_param('scentsync.whatsapp_number', default='')
        ig_handle = ICP.get_param('scentsync.instagram_handle', default='')
        location = ICP.get_param('scentsync.location', default='')
        delivery_info = ICP.get_param('scentsync.delivery_info', default='')
        return request.make_response(
            json.dumps({
                'whatsapp_number': wa_number,
                'instagram_handle': ig_handle,
                'location': location,
                'delivery_info': delivery_info,
            }),
            headers=[('Content-Type', 'application/json')]
        )

    # -------------------------------------------------------
    # FAMILIAS DE PERFUMES
    # -------------------------------------------------------
    @http.route('/scentsync/api/families', auth='public', type='http', csrf=False, methods=['GET'])
    def get_families(self, **kwargs):
        """Devuelve las familias de perfumes activas, ordenadas por secuencia."""
        families = request.env['scentsync.family'].sudo().search([('active', '=', True)])
        result = [{'id': f.id, 'name': f.name} for f in families]
        return request.make_response(
            json.dumps(result),
            headers=[('Content-Type', 'application/json')]
        )

    # -------------------------------------------------------
    # PRODUCTOS
    # -------------------------------------------------------
    @http.route('/scentsync/api/products', auth='public', type='http', csrf=False, methods=['GET'])
    def get_products(self, family_id=None, search=None, **kwargs):
        """Devuelve los productos publicables filtrados por familia (ID) y/o búsqueda."""
        domain = [
            ('sale_ok', '=', True),
            ('active', '=', True),
            ('type', 'in', ['consu', 'product']),
        ]
        if family_id:
            domain.append(('scentsync_family_ids', 'in', [int(family_id)]))
        if search:
            domain.append(('name', 'ilike', search))

        products = request.env['product.template'].sudo().search(domain)
        result = []
        for p in products:
            f_ids = p.scentsync_family_ids.ids if p.scentsync_family_ids else []
            f_names = p.scentsync_family_ids.mapped('name') if p.scentsync_family_ids else []
            result.append({
                'id': p.id,
                'name': p.name,
                'price': p.list_price,
                'image_url': f'/web/image/product.template/{p.id}/image_512',
                'family_ids': f_ids,
                'family_names': f_names,
                'family_id': f_ids[0] if f_ids else 0,
                'family_name': ', '.join(f_names) if f_names else '',
                'concentration': p.scentsync_concentration or '',
                'size_ml': p.scentsync_size_ml or 0,
                'gender': p.scentsync_gender or '',
                'featured': p.scentsync_featured,
                'description': p.description_sale or '',
                'notes': p.scentsync_description_notes or '',
                'compare_at_price': p.scentsync_compare_at_price or 0.0,
                'discount_percentage': int(p.scentsync_discount_percentage or 0),
            })
        return request.make_response(
            json.dumps(result),
            headers=[('Content-Type', 'application/json')]
        )

    @http.route('/scentsync/api/products/<int:product_id>', auth='public', type='http', csrf=False, methods=['GET'])
    def get_product_detail(self, product_id, **kwargs):
        p = request.env['product.template'].sudo().browse(product_id)
        if not p.exists():
            return request.make_response(
                json.dumps({'error': 'Producto no encontrado'}),
                headers=[('Content-Type', 'application/json')],
                status=404
            )
        f_ids = p.scentsync_family_ids.ids if p.scentsync_family_ids else []
        f_names = p.scentsync_family_ids.mapped('name') if p.scentsync_family_ids else []
        data = {
            'id': p.id,
            'name': p.name,
            'price': p.list_price,
            'image_url': f'/web/image/product.template/{p.id}/image_1920',
            'family_ids': f_ids,
            'family_names': f_names,
            'family_id': f_ids[0] if f_ids else 0,
            'family_name': ', '.join(f_names) if f_names else '',
            'concentration': p.scentsync_concentration or '',
            'size_ml': p.scentsync_size_ml or 0,
            'gender': p.scentsync_gender or '',
            'description': p.description_sale or '',
            'notes': p.scentsync_description_notes or '',
            'compare_at_price': p.scentsync_compare_at_price or 0.0,
            'discount_percentage': int(p.scentsync_discount_percentage or 0),
        }
        return request.make_response(
            json.dumps(data),
            headers=[('Content-Type', 'application/json')]
        )

    # -------------------------------------------------------
    # CARRITO
    # -------------------------------------------------------
    def _get_session_id(self):
        session_id = request.session.get('scentsync_cart_session')
        if not session_id:
            import uuid
            session_id = str(uuid.uuid4())
            request.session['scentsync_cart_session'] = session_id
        return session_id

    def _cart_to_dict(self, cart_items):
        result = []
        for item in cart_items:
            result.append({
                'id': item.id,
                'product_id': item.product_id.id,
                'product_name': item.product_id.name,
                'image_url': f'/web/image/product.product/{item.product_id.id}/image_512',
                'quantity': item.quantity,
                'price_unit': item.price_unit,
                'subtotal': item.quantity * item.price_unit,
            })
        return result

    @http.route('/scentsync/api/cart', auth='public', type='http', csrf=False, methods=['GET'])
    def get_cart(self, **kwargs):
        session_id = self._get_session_id()
        items = request.env['scentsync.cart'].sudo().search([('session_id', '=', session_id)])
        total = sum(i.quantity * i.price_unit for i in items)
        return request.make_response(
            json.dumps({'items': self._cart_to_dict(items), 'total': total}),
            headers=[('Content-Type', 'application/json')]
        )

    @http.route('/scentsync/api/cart/add', auth='public', type='json', csrf=False, methods=['POST'])
    def add_to_cart(self, product_id, quantity=1, **kwargs):
        session_id = self._get_session_id()
        product = request.env['product.product'].sudo().browse(int(product_id))
        if not product.exists():
            return {'error': 'Producto no encontrado'}

        existing = request.env['scentsync.cart'].sudo().search([
            ('session_id', '=', session_id),
            ('product_id', '=', product.id),
        ], limit=1)

        if existing:
            existing.write({'quantity': existing.quantity + int(quantity)})
        else:
            request.env['scentsync.cart'].sudo().create({
                'session_id': session_id,
                'product_id': product.id,
                'quantity': int(quantity),
                'price_unit': product.lst_price,
            })

        items = request.env['scentsync.cart'].sudo().search([('session_id', '=', session_id)])
        total = sum(i.quantity * i.price_unit for i in items)
        return {'success': True, 'items': self._cart_to_dict(items), 'total': total, 'count': sum(i.quantity for i in items)}

    @http.route('/scentsync/api/cart/update', auth='public', type='json', csrf=False, methods=['POST'])
    def update_cart(self, cart_item_id, quantity, **kwargs):
        session_id = self._get_session_id()
        item = request.env['scentsync.cart'].sudo().browse(int(cart_item_id))
        if not item.exists() or item.session_id != session_id:
            return {'error': 'Ítem no encontrado'}

        if int(quantity) <= 0:
            item.unlink()
        else:
            item.write({'quantity': int(quantity)})

        items = request.env['scentsync.cart'].sudo().search([('session_id', '=', session_id)])
        total = sum(i.quantity * i.price_unit for i in items)
        return {'success': True, 'items': self._cart_to_dict(items), 'total': total, 'count': sum(i.quantity for i in items)}

    @http.route('/scentsync/api/cart/remove', auth='public', type='json', csrf=False, methods=['POST'])
    def remove_from_cart(self, cart_item_id, **kwargs):
        session_id = self._get_session_id()
        item = request.env['scentsync.cart'].sudo().browse(int(cart_item_id))
        if item.exists() and item.session_id == session_id:
            item.unlink()
        items = request.env['scentsync.cart'].sudo().search([('session_id', '=', session_id)])
        total = sum(i.quantity * i.price_unit for i in items)
        return {'success': True, 'items': self._cart_to_dict(items), 'total': total, 'count': sum(i.quantity for i in items)}

    # -------------------------------------------------------
    # CHECKOUT
    # -------------------------------------------------------
    @http.route('/scentsync/api/checkout', auth='public', type='json', csrf=False, methods=['POST'])
    def checkout(self, name, phone, city='', **kwargs):
        session_id = self._get_session_id()
        cart_items = request.env['scentsync.cart'].sudo().search([('session_id', '=', session_id)])

        if not cart_items:
            return {'error': 'El carrito está vacío'}

        partner = request.env['res.partner'].sudo().search([('phone', '=', phone)], limit=1)
        if not partner:
            partner = request.env['res.partner'].sudo().create({
                'name': name,
                'phone': phone,
                'city': city,
                'customer_rank': 1,
            })

        order_lines = [(0, 0, {
            'product_id': item.product_id.id,
            'product_uom_qty': item.quantity,
            'price_unit': item.price_unit,
        }) for item in cart_items]

        sale_order = request.env['sale.order'].sudo().create({
            'partner_id': partner.id,
            'order_line': order_lines,
            'note': f'Pedido recibido desde la tienda web ScentSync. Ciudad: {city}',
        })

        cart_items.unlink()

        items_text = '\n'.join(
            f'• {line.product_id.name} x{line.product_uom_qty} — ${line.price_unit * line.product_uom_qty:.2f}'
            for line in sale_order.order_line
        )
        whatsapp_message = (
            f'¡Hola! Soy *{name}* y quiero confirmar mi pedido:\n\n'
            f'{items_text}\n\n'
            f'*Total: ${sale_order.amount_total:.2f}*\n'
            f'Ciudad: {city}\n'
            f'Nro. de pedido: {sale_order.name}'
        )

        return {
            'success': True,
            'order_id': sale_order.id,
            'order_name': sale_order.name,
            'total': sale_order.amount_total,
            'whatsapp_message': whatsapp_message,
        }
