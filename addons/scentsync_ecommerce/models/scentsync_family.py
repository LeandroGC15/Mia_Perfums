# -*- coding: utf-8 -*-
from odoo import models, fields, api


class ScentSyncFamily(models.Model):
    _name = 'scentsync.family'
    _description = 'Familia de Perfumes ScentSync'
    _order = 'sequence, name'

    name = fields.Char(string='Nombre', required=True)
    sequence = fields.Integer(string='Secuencia', default=10)
    description = fields.Text(string='Descripción')
    active = fields.Boolean(string='Activo', default=True)

    product_ids = fields.Many2many(
        'product.template',
        'product_scentsync_family_rel',
        'family_id',
        'product_id',
        string='Productos',
    )
    product_count = fields.Integer(
        string='Nro. Productos', compute='_compute_product_count', store=True
    )

    @api.depends('product_ids')
    def _compute_product_count(self):
        for rec in self:
            rec.product_count = len(rec.product_ids)
