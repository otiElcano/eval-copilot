#!/bin/bash

# Script de instalación para SQL Injection Demo
# Autor: GitHub Copilot
# Fecha: $(date)

echo "🚀 Instalando SQL Injection Demo..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Verificar si se ejecuta como root
if [[ $EUID -eq 0 ]]; then
   print_error "No ejecutes este script como root para mayor seguridad."
   exit 1
fi

# Actualizar sistema
print_step "1. Actualizando sistema..."
sudo apt update

# Instalar dependencias
print_step "2. Instalando Apache, PHP y MariaDB..."
sudo apt install -y apache2 php libapache2-mod-php mariadb-server php-mysql

# Verificar servicios
print_step "3. Verificando servicios..."
sudo systemctl start apache2
sudo systemctl start mariadb
sudo systemctl enable apache2
sudo systemctl enable mariadb

# Configurar MySQL
print_step "4. Configurando base de datos..."
print_warning "Configurando MariaDB para acceso local..."

# Verificar si MariaDB está funcionando
if ! systemctl is-active --quiet mariadb; then
    print_error "MariaDB no está funcionando. Verifica la instalación."
    exit 1
fi

# Configurar MariaDB para permitir acceso root sin contraseña en localhost
print_status "Configurando acceso a MariaDB..."
sudo mysql -e "UPDATE mysql.user SET plugin='mysql_native_password' WHERE User='root';"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Crear base de datos
print_status "Creando base de datos sqli_demo..."
mysql -u root -e "source $(pwd)/setup_database.sql"

if [ $? -eq 0 ]; then
    print_status "Base de datos creada exitosamente"
else
    print_error "Error al crear la base de datos"
    exit 1
fi

# Configurar Apache
print_step "5. Configurando Apache..."

# Habilitar mod_rewrite
sudo a2enmod rewrite

# Copiar configuración de Apache
sudo cp apache-config.conf /etc/apache2/sites-available/sqli-demo.conf

# Habilitar el sitio
sudo a2ensite sqli-demo.conf

# Agregar entrada al archivo hosts
if ! grep -q "sqli-demo.local" /etc/hosts; then
    echo "127.0.0.1    sqli-demo.local" | sudo tee -a /etc/hosts
    print_status "Agregada entrada a /etc/hosts"
fi

# Reiniciar Apache
sudo systemctl restart apache2

# Verificar permisos
print_step "6. Verificando permisos..."
sudo chown -R www-data:www-data $(pwd)
sudo chmod -R 755 $(pwd)

# Verificar instalación
print_step "7. Verificando instalación..."

if systemctl is-active --quiet apache2; then
    print_status "✅ Apache está funcionando"
else
    print_error "❌ Apache no está funcionando"
fi

if systemctl is-active --quiet mariadb; then
    print_status "✅ MariaDB está funcionando"
else
    print_error "❌ MariaDB no está funcionando"
fi

# Mostrar información final
echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Información de acceso:"
echo "   URL Local: http://localhost$(pwd | sed 's|/var/www/html||')"
echo "   URL Virtual Host: http://sqli-demo.local"
echo ""
echo "🔐 Configuración de base de datos:"
echo "   Base de datos: sqli_demo"
echo "   Usuario: root"
echo "   Contraseña: (vacía)"
echo "   Host: localhost"
echo ""
echo "🧪 Ejemplos de payloads SQL Injection:"
echo "   1' OR '1'='1"
echo "   1' UNION SELECT user(), version()--"
echo "   1' UNION SELECT table_name, column_name FROM information_schema.columns--"
echo ""
echo "⚠️  ADVERTENCIA: Esta aplicación es vulnerable intencionalmente."
echo "   Solo usar en entornos de testing y educación."
echo ""
print_status "Para acceder, abre tu navegador y ve a: http://sqli-demo.local"