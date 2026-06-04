#!/bin/bash

# Script para configurar MariaDB manualmente
# Usar si el script principal falla

echo "🔧 Configurando MariaDB manualmente..."

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar si MariaDB está instalado
if ! command -v mysql &> /dev/null; then
    print_error "MariaDB no está instalado. Ejecuta primero:"
    echo "sudo apt install -y mariadb-server"
    exit 1
fi

# Iniciar MariaDB
print_status "Iniciando MariaDB..."
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Esperar a que el servicio esté listo
sleep 3

# Configurar acceso root
print_status "Configurando acceso root..."
sudo mysql -e "USE mysql;" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "Configurando usuario root sin contraseña..."
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '';"
    sudo mysql -e "FLUSH PRIVILEGES;"
else
    print_error "No se pudo conectar a MariaDB como root"
    print_warning "Intentando configuración alternativa..."
    
    # Método alternativo usando mysql_secure_installation
    print_warning "Ejecuta los siguientes comandos manualmente:"
    echo ""
    echo "sudo mysql_secure_installation"
    echo "  - Presiona ENTER para no poner contraseña"
    echo "  - Responde 'n' a cambiar contraseña root"
    echo "  - Responde 'Y' al resto de preguntas"
    echo ""
    echo "Luego ejecuta:"
    echo "sudo mysql < setup_database.sql"
    exit 1
fi

# Crear la base de datos
print_status "Creando base de datos sqli_demo..."
mysql -u root -e "source $(pwd)/setup_database.sql"

if [ $? -eq 0 ]; then
    print_status "✅ Base de datos creada exitosamente"
    
    # Verificar datos
    print_status "Verificando datos..."
    mysql -u root -e "USE sqli_demo; SELECT COUNT(*) as 'Total usuarios' FROM users;"
    
    echo ""
    echo "🎉 MariaDB configurado correctamente!"
    echo "   - Base de datos: sqli_demo"
    echo "   - Usuario: root"
    echo "   - Contraseña: (vacía)"
    echo ""
    print_status "Ahora puedes ejecutar la aplicación web"
else
    print_error "Error al crear la base de datos"
    print_warning "Verifica que el archivo setup_database.sql existe y es correcto"
    exit 1
fi