{
    'name': 'ScentSync Theme',
    'version': '1.0',
    'category': 'Theme/Backend',
    'summary': 'Transforma el menú de aplicaciones a pantalla completa',
    'description': 'Modifica la interfaz Community de Odoo para que el menú de aplicaciones sea de pantalla completa, mejorando la experiencia de usuario.',
    'depends': ['web'],
    'data': [],
    'assets': {
        'web.assets_backend': [
            'scentsync_theme/static/src/scss/home_menu.scss',
        ],
    },
    'installable': True,
    'application': False,
    'license': 'LGPL-3',
}
