#!/bin/bash

# Script para desplegar SQL Injection Demo con Docker
# Red: br_vuln

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Banner
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 SQL Injection Demo - Docker Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero:"
    echo "  sudo apt install docker.io docker-compose"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está instalado."
    exit 1
fi

# Verificar permisos de Docker
if ! docker ps &> /dev/null; then
    print_warning "No tienes permisos para ejecutar Docker sin sudo."
    print_status "Ejecutando con sudo..."
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker-compose"
else
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker-compose"
fi

# Verificar si existe la red br_vuln
print_step "1. Verificando red Docker br_vuln..."
if ! $DOCKER_CMD network ls | grep -q "br_vuln"; then
    print_warning "La red br_vuln no existe. Creándola con subred 172.19.0.0/16..."
    $DOCKER_CMD network create --subnet=172.19.0.0/16 br_vuln
    if [ $? -eq 0 ]; then
        print_status "✓ Red br_vuln creada exitosamente"
    else
        print_error "No se pudo crear la red br_vuln"
        exit 1
    fi
else
    print_status "✓ Red br_vuln encontrada"
fi

# Detener contenedores existentes si los hay
print_step "2. Deteniendo contenedores existentes (si los hay)..."
$COMPOSE_CMD down 2>/dev/null

# Construir e iniciar los contenedores
print_step "3. Construyendo imágenes Docker..."
$COMPOSE_CMD build

if [ $? -ne 0 ]; then
    print_error "Error al construir las imágenes Docker"
    exit 1
fi

print_step "4. Iniciando contenedores..."
$COMPOSE_CMD up -d

if [ $? -ne 0 ]; then
    print_error "Error al iniciar los contenedores"
    exit 1
fi

# Esperar a que los servicios estén listos
print_step "5. Esperando a que los servicios estén listos..."
sleep 8

# Verificar estado de los contenedores
print_step "6. Verificando estado de los contenedores..."
$COMPOSE_CMD ps

# Mostrar información de conexión
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Despliegue completado exitosamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_status "🌐 Aplicación disponible en: http://172.19.0.10"
print_status "   También disponible en: http://localhost:8080"
print_status "📦 Contenedor web: sqli_web (IP: 172.19.0.10)"
print_status "🗄️  Contenedor DB: sqli_db"
print_status "🔗 Red Docker: br_vuln (172.19.0.0/16)"
echo ""
print_status "Para ver los logs:"
echo "  $COMPOSE_CMD logs -f"
echo ""
print_status "Para detener los contenedores:"
echo "  $COMPOSE_CMD down"
echo ""
print_status "Para eliminar todo (incluyendo volúmenes):"
echo "  $COMPOSE_CMD down -v"
echo ""
print_warning "⚠️  RECORDATORIO: Esta aplicación es vulnerable por diseño."
print_warning "   Solo usar en entornos de testing y educación."
echo ""
