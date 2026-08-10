from odoo import models, fields

class StockPicking(models.Model):
    _inherit = 'stock.picking'

    # Ejemplo de un campo personalizado para las transferencias de inventario
    scentsync_urgencia = fields.Selection([
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta')
    ], string='Nivel de Urgencia', default='media')
