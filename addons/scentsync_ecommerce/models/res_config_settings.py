# -*- coding: utf-8 -*-
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    scentsync_whatsapp_number = fields.Char(
        string="Número de WhatsApp / Teléfono",
        config_parameter='scentsync.whatsapp_number',
        help="Número para recibir pedidos y contacto por WhatsApp."
    )
    scentsync_instagram_handle = fields.Char(
        string="Cuenta de Instagram",
        config_parameter='scentsync.instagram_handle',
        help="Nombre de usuario en Instagram (ej: @scentsync_oficial)."
    )
    scentsync_location = fields.Char(
        string="Ubicación / Ciudad",
        config_parameter='scentsync.location',
        help="Ciudad o dirección visible en el lateral de la tienda."
    )
    scentsync_delivery_info = fields.Char(
        string="Información de Entrega",
        config_parameter='scentsync.delivery_info',
        help="Detalles de envíos, retiros y delivery visibles en la tienda web."
    )
