{
    'name': 'ScentSync E-Commerce',
    'version': '1.0',
    'category': 'Website',
    'summary': 'Tienda web pública de perfumes con checkout por WhatsApp',
    'depends': ['base', 'product', 'sale', 'stock'],
    'data': [
        'security/ir.model.access.csv',
        'views/scentsync_family_views.xml',
        'views/product_template_views.xml',
        'views/res_config_settings_views.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
