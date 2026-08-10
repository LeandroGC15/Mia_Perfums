from odoo import models, fields

class AccountMove(models.Model):
    _inherit = 'account.move'

    # Ejemplo de un campo personalizado
    scentsync_observacion = fields.Char(string='Observación ScentSync', help='Campo extra de ejemplo para facturas')
