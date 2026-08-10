# -*- coding: utf-8 -*-
from odoo import models, fields

class ScentSyncCart(models.Model):
    _name = 'scentsync.cart'
    _description = 'Carrito de compra de la tienda ScentSync'

    session_id = fields.Char(string='ID de Sesión', required=True, index=True)
    product_id = fields.Many2one('product.product', string='Producto', required=True)
    quantity = fields.Integer(string='Cantidad', default=1)
    price_unit = fields.Float(string='Precio Unitario')

    _sql_constraints = [
        ('unique_product_per_session', 'UNIQUE(session_id, product_id)',
         'Ya existe este producto en el carrito de esta sesión.'),
    ]
