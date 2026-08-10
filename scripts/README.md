# Scripts de Utilidad para ScentSync (Odoo 19)

Esta carpeta agrupa scripts auxiliares para la administración del entorno Docker de **ScentSync**.

---

## 🛠️ CLI Principal

El script principal de administración es **`./odoo`** ubicado en la raíz del proyecto.

### Comandos del CLI Principal

```bash
# Iniciar contenedores
./odoo start

# Detener contenedores
./odoo stop

# Reiniciar contenedores
./odoo restart

# Ver logs en tiempo real
./odoo logs

# Entrar a la terminal bash dentro de Odoo
./odoo bash

# Actualizar módulos
./odoo update -d <nombre_bd> -m scentsync_ecommerce

# Acceder a PostgreSQL
./odoo psql -d <nombre_bd>

# Reconstruir imágenes Docker
./odoo build
```

---

## 📂 Scripts Auxiliares (`scripts/`)

### 1. `restore_db.sh`
Restaura un respaldo de base de datos (`.sql`, `.sql.gz`, `.dump`, `.zip` con filestore):

```bash
./scripts/restore_db.sh -f backup.zip -d mi_base_datos
```

### 2. `backup_db.sh`
Crea un respaldo en formato ZIP que contiene la base de datos SQL y la carpeta filestore:

```bash
./scripts/backup_db.sh -d mi_base_datos
```

### 3. `odoo-update`
Shortcut para actualizar uno o más módulos en la base de datos:

```bash
./scripts/odoo-update -d mi_base_datos scentsync_ecommerce
```

### 4. `odoo-pw`
Restablece la contraseña de un usuario en Odoo (por defecto `admin` / `admin`):

```bash
./scripts/odoo-pw -d mi_base_datos -u admin -p admin
```
