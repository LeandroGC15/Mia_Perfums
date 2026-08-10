#!/bin/sh

# Script de respaldo de base de datos y filestore para ScentSync (Odoo 19)

database_container=${DB_CONTAINER_NAME:-postgres15_scentsync}
odoo_container=${PROJECT_NAME:-odoo19_scentsync}

usage() {
    echo "Uso: $0 -d <nombre_base_datos> [-o <archivo_salida.zip>]"
    echo "  -d : Nombre de la base de datos a respaldar"
    echo "  -o : Nombre del archivo de salida (opcional)"
}

while getopts :d:o: flag
do
    case "${flag}" in
        d) database_name=${OPTARG};;
        o) output_file=${OPTARG};;
        *)
            usage
            exit 1
            ;;
    esac
done

if [ -z "$database_name" ]; then
    usage
    exit 1
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -z "$output_file" ]; then
    output_file="backup_${database_name}_${TIMESTAMP}.zip"
fi

echo "📦 Respaldando base de datos '${database_name}' y filestore..."
rm -rf backup_tmp
mkdir -p backup_tmp

echo "🗄️ Generando dump SQL de la base de datos..."
docker exec -i ${database_container} pg_dump -U odoo -d ${database_name} > backup_tmp/dump.sql

echo "📁 Copiando filestore..."
mkdir -p backup_tmp/filestore
docker cp ${odoo_container}:/var/lib/odoo/filestore/${database_name}/. backup_tmp/filestore/ 2>/dev/null || echo "Info: Filestore no encontrado o vacío."

echo "🤐 Comprimiendo respaldo en '${output_file}'..."
cd backup_tmp
zip -r "../${output_file}" dump.sql filestore 2>/dev/null || zip -r "../${output_file}" dump.sql
cd ..

rm -rf backup_tmp
echo "✅ Respaldo creado exitosamente: ${output_file}"
