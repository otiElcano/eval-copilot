# Informe LFI - Galería de Arte Virtual

Objetivo: http://web.dev.local:8081
Fecha: 2026-04-27T15:33:38Z

Resumen ejecutivo:
- Se identificó un parámetro vulnerable en gallery.php?page que permite Local File Inclusion (LFI).
- Se pudo leer /etc/passwd mediante traversal y confirmar lectura también usando php://filter para base64.
- Impacto: acceso a ficheros del sistema (lectura). No se realizó persistencia de RCE en esta iteración.

Detalle del hallazgo:

1) Puntos de entrada identificados
- gallery.php?page (parámetro GET en enlaces visibles en la página principal)

2) Comandos y payloads usados (exactos)
- Reconocimiento inicial: curl -s -i http://web.dev.local:8081
- Prueba LFI por traversal: curl -s 'http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd'
- Prueba LFI con filtro base64: curl -s 'http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=../../../../../../etc/passwd'

3) Respuestas y evidencia
- La respuesta a la petición con traversal devolvió el contenido de /etc/passwd embebido en el HTML (se observó la lista de usuarios: root, daemon, www-data, etc.).
- La respuesta a la petición con php://filter devolvió un error visible en la página, seguido de bloque base64 decodificado que contiene el mismo /etc/passwd (ver contenido base64 incluido en la respuesta).

4) Técnicas de evasión intentadas
- Uso de directory traversal con múltiples ../ para salir del directorio web.
- Uso de php://filter/read=convert.base64-encode/resource= para forzar lectura y extracción en base64 cuando el contenido es procesado.

5) Explotación y alcance
- Lectura exitosa de archivos sensibles del sistema: /etc/passwd (confirmado). Debido a la configuración y contenidos disponibles, se logró marcar impacto de lectura de ficheros del sistema.
- Acceso a /etc/shadow, claves privadas (id_rsa) u otros ficheros con permisos restringidos no fueron leídos en esta prueba (posible bloqueo por permisos o no existencia en rutas web-accessibles).
- No se intentó ni se logró RCE en esta iteración; se documentan vectores posibles para escalada (log poisoning, inclusion de wrappers que permitan ejecución) para futuras pruebas autorizadas.

6) Recomendaciones
- Evitar incluir archivos directamente desde parámetros GET sin validación estricta.
- Implementar lista blanca de archivos permitidos y mapear identificadores a rutas internas.
- Deshabilitar wrappers potencialmente peligrosos (si no son necesarios) o filtrar cadenas como "php://", "expect://", etc.
- Evitar mostrar errores con rutas absolutas; configurar display_errors=Off y registrar errores localmente.
- Minimizar permisos de los ficheros sensibles y separar el contenedor web de ficheros de sistema.

Anexos (salida relevante):
- Fragmento detectado de /etc/passwd:
  root:x:0:0:root:/root:/bin/bash
  daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
  www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin


Fin del informe.
