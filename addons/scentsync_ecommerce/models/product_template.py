# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    scentsync_family_ids = fields.Many2many(
        'scentsync.family',
        'product_scentsync_family_rel',
        'product_id',
        'family_id',
        string='Familias de Perfumes',
    )

    scentsync_family_id = fields.Many2one(
        'scentsync.family',
        string='Familia Principal',
        compute='_compute_scentsync_family_id',
        inverse='_inverse_scentsync_family_id',
        store=True,
    )

    @api.depends('scentsync_family_ids')
    def _compute_scentsync_family_id(self):
        for rec in self:
            rec.scentsync_family_id = rec.scentsync_family_ids[0] if rec.scentsync_family_ids else False

    def _inverse_scentsync_family_id(self):
        for rec in self:
            if rec.scentsync_family_id and rec.scentsync_family_id not in rec.scentsync_family_ids:
                rec.scentsync_family_ids = [(4, rec.scentsync_family_id.id)]

    scentsync_concentration = fields.Selection([
        ('parfum', 'Parfum (EDP Intense)'),
        ('edp', 'Eau de Parfum (EDP)'),
        ('edt', 'Eau de Toilette (EDT)'),
        ('edc', 'Eau de Cologne (EDC)'),
        ('body_mist', 'Body Mist'),
    ], string='Concentración')

    scentsync_size_ml = fields.Integer(string='Tamaño (ML)')

    scentsync_gender = fields.Selection([
        ('unisex', 'Unisex'),
        ('male', 'Hombre'),
        ('female', 'Mujer'),
    ], string='Género')

    scentsync_featured = fields.Boolean(string='Destacado en tienda', default=False)

    scentsync_description_notes = fields.Text(
        string='Notas Olfativas',
        help='Describe las notas de salida, corazón y fondo del perfume.'
    )

    scentsync_price_bcv = fields.Float(
        string='Precio BCV',
        digits='Product Price',
        help='Precio del producto según la tasa oficial BCV.'
    )

    scentsync_profit = fields.Float(
        string='Ganancia',
        compute='_compute_scentsync_profit',
        store=True,
        digits='Product Price',
        help='Ganancia (Precio de Venta - Costo).'
    )

    @api.depends('list_price', 'standard_price')
    def _compute_scentsync_profit(self):
        for rec in self:
            rec.scentsync_profit = (rec.standard_price or 0.0) - (rec.list_price or 0.0)

    scentsync_compare_at_price = fields.Float(
        string='Precio Anterior',
        digits='Product Price',
        help='Precio original tachado para ofertas y promociones.'
    )

    scentsync_discount_percentage = fields.Float(
        string='% de Descuento',
        compute='_compute_scentsync_discount',
        store=True,
        readonly=False,
        digits=(5, 0),
        help='Porcentaje de descuento mostrado en la tarjeta web (ej: 17).'
    )

    @api.depends('list_price', 'scentsync_compare_at_price')
    def _compute_scentsync_discount(self):
        for rec in self:
            if rec.scentsync_compare_at_price and rec.scentsync_compare_at_price > rec.list_price and rec.scentsync_compare_at_price > 0:
                diff = rec.scentsync_compare_at_price - rec.list_price
                rec.scentsync_discount_percentage = round((diff / rec.scentsync_compare_at_price) * 100.0, 0)
            elif not rec.scentsync_discount_percentage:
                rec.scentsync_discount_percentage = 0.0


