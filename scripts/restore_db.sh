#!/bin/sh

# Script de restauración de base de datos para ScentSync (Odoo 19)
# Permite restaurar archivos .sql, .sql.gz, .dump y .zip (incluyendo filestore)

database_container=${DB_CONTAINER_NAME:-postgres15_scentsync}
odoo_container=${PROJECT_NAME:-odoo19_scentsync}

usage() {
    echo "Uso: $0 -f <archivo_backup> -d <nombre_base_datos> [-b <contenedor_db>] [-o <contenedor_odoo>]"
    echo "  -f : Archivo de backup (.sql, .sql.gz, .dump, .zip)"
    echo "  -d : Nombre de la base de datos destino"
    echo "  -b : Nombre del contenedor DB (opcional, por defecto: $database_container)"
    echo "  -o : Nombre del contenedor Odoo (opcional, por defecto: $odoo_container)"
}

while getopts :b:o:f:d: flag
do
    case "${flag}" in
        b) database_container=${OPTARG};;
        o) odoo_container=${OPTARG};;
        f) file_compress=${OPTARG};;
        d) database_name=${OPTARG};;
        :)
            echo "Error: -${OPTARG} requiere un argumento."
            usage
            exit 1
            ;;
        *)
            usage
            exit 1
            ;;
    esac
done

if [ -z "$file_compress" ] || [ -z "$database_name" ]; then
    usage
    exit 1
fi

unzip_file(){
    echo "📦 Preparando backup: ${file_compress}..."
    rm -rf backup_tmp
    mkdir -p backup_tmp
    case "${file_compress}" in
        *.zip)
            unzip "${file_compress}" -d backup_tmp
            if [ -f backup_tmp/dump.sql ]; then
                SQLFILE="dump.sql"
            else
                SQLFILE=$(ls backup_tmp/*.sql 2>/dev/null | head -n1 | xargs -n1 basename)
                if [ -z "$SQLFILE" ]; then
                    SQLFILE=$(ls backup_tmp/*.dump 2>/dev/null | head -n1 | xargs -n1 basename)
                fi
            fi
            ;;
        *.gz)
            gunzip -c "${file_compress}" > backup_tmp/dump.sql
            SQLFILE="dump.sql"
            ;;
        *.sql)
            cp "${file_compress}" backup_tmp/dump.sql
            SQLFILE="dump.sql"
            ;;
        *.dump)
            cp "${file_compress}" backup_tmp/dump.dump
            SQLFILE="dump.dump"
            ;;
        *)
            echo "❌ Tipo de archivo no soportado: ${file_compress}"
            exit 1
            ;;
    esac
    echo "✅ Archivo preparado: backup_tmp/${SQLFILE}"
}

load_database(){  
    echo "🔍 Verificando existencia de la base de datos '${database_name}'..."
    exists=$(docker exec -i ${database_container} psql -U odoo -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${database_name}';")
    if [ "$exists" = "1" ]; then
        echo "⚠️ La base de datos '${database_name}' ya existe. Cerrando conexiones previas y eliminando..."
        docker exec -i ${database_container} psql -U odoo -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='${database_name}' AND pid <> pg_backend_pid();"
        docker exec -i ${database_container} psql -U odoo -d postgres -c "DROP DATABASE IF EXISTS ${database_name};"
    fi
    echo "🗄️ Creando base de datos '${database_name}'..."
    docker exec -i ${database_container} psql -U odoo -d postgres -c "CREATE DATABASE ${database_name};"
    
    echo "⚡ Restaurando contenido en '${database_name}'..."
    if [ "${SQLFILE##*.}" = "dump" ]; then
        docker cp "backup_tmp/${SQLFILE}" ${database_container}:/tmp/${SQLFILE}
        docker exec -i ${database_container} pg_restore -U odoo -d ${database_name} /tmp/${SQLFILE}
        docker exec -i ${database_container} rm /tmp/${SQLFILE}
    else
        cat "backup_tmp/${SQLFILE}" | docker exec -i ${database_container} psql -U odoo ${database_name}
    fi
    echo "✅ Base de datos restaurada."
}

load_filestore(){
    if [ -d backup_tmp/filestore ]; then
        echo "📁 Copiando filestore..."
        docker exec -u root -i ${odoo_container} mkdir -p /var/lib/odoo/filestore/${database_name}
        docker cp backup_tmp/filestore/. ${odoo_container}:/var/lib/odoo/filestore/${database_name}
        docker exec -u root -i ${odoo_container} chown -R odoo:odoo /var/lib/odoo/filestore/${database_name}
        echo "✅ Filestore copiado exitosamente."
    else
        echo "ℹ️ No se detectó carpeta filestore en el backup. Se omite este paso."
    fi
}

clear_tmp(){
    echo "🧹 Limpiando archivos temporales..."
    rm -rf backup_tmp
    echo "✨ Restauración completada con éxito."
}

main(){
    unzip_file
    load_database
    load_filestore
    clear_tmp
}

main
