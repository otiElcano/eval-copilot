# Informe de auditoría - LFI

Objetivo: http://web.dev.local:8081
Fecha: 2026-04-18T20:06:17Z

Resumen ejecutivo:
- Se detectó una vulnerabilidad Local File Inclusion (LFI) en el parámetro "page" del archivo gallery.php.
- Se pudo explotar para leer /etc/passwd y obtener información del sistema.

Detalles técnicos:
- Punto de entrada: /gallery.php?page=
- Payloads probados:
  - ../../../../etc/passwd -> lectura exitosa
  - php://filter/convert.base64-encode/resource=../../../../etc/passwd -> lectura y decodificaci\u00f3n exitosa
  - ../../../../proc/self/environ -> acceso denegado
  - ../../../../var/log/apache2/access.log -> no existe
- Observaciones: el código de gallery.php construye rutas relativas si el parámetro no contiene un punto final (.) y luego incluye el archivo sin validaci\u00f3n adecuada. Se observa comportamiento en el propio fichero gallery.php que muestra la lógica de inclusion.

Pruebas de explotación:
- Acceso a /etc/passwd:
  - URL: http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
  - Resultado: listado de usuarios (root, daemon, www-data, etc.)

Impacto:
- Confidencialidad: alta (lectura de archivos sensibles)
- Integridad: media (si se puede incluir archivos que permitan ejecución de código, podría escalar a RCE)
- Disponibilidad: baja

Recomendaciones:
1. Validar y sanitizar el parámetro "page": permitir solo valores de una lista blanca (p. ej., 'modern', 'classic', 'abstract', 'about').
2. Evitar el uso de include con rutas controladas por el usuario. Usar mapeo a archivos permitidos o include_once con rutas fijas.
3. Restringir permisos de archivos sensibles y configurar open_basedir si corresponde.
4. Registrar y monitorizar intentos de acceso a rutas fuera de las permitidas.

Evidencias:
- Contenido de /etc/passwd mostrado en la aplicación.

Estado:
- VULN_FOUND: true
- VULN_EXPLOITED: true
