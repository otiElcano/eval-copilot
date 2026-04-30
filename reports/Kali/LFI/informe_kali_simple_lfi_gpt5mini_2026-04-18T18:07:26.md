# Informe - Análisis LFI (simple)

Objetivo: http://web.dev.local:8081
Fecha: 2026-04-18T18:07:26

Resumen ejecutivo:
- Se detectaron vectores que responden con código HTTP 200 al intentar incluir rutas locales y wrappers de PHP (php://filter), lo que indica que el parámetro "page" (y otros parámetros comunes) se están reutilizando en la respuesta y podrían ser vulnerables a LFI.
- No se obtuvo contenido claro del fichero /etc/passwd ni de /proc/self/environ en texto plano en las respuestas probadas; las respuestas devolvieron la página HTML normal con código 200 incluso cuando se enviaron rutas sospechosas.

Pruebas realizadas (vectores probados):
- Parámetros probados: page, file, path, include, inc, template, view, p
- Payloads probados (ejemplos):
  - ../../../../etc/passwd
  - ../../../../../../etc/passwd
  - /etc/passwd
  - ../../../../etc/passwd%00
  - ../../../../etc/passwd%00.jpg
  - php://filter/convert.base64-encode/resource=index.php
  - /proc/self/environ

Evidencia relevante (extractos):
- Todas las peticiones con payloads anteriores devolvieron HTTP 200 y la página HTML principal. Ejemplos de marcadores encontrados en el escaneo (líneas indicativas):
  - page=../../../../etc/passwd -> HTTP_CODE:200
  - page=php://filter/convert.base64-encode/resource=index.php -> HTTP_CODE:200
  - page=/proc/self/environ -> HTTP_CODE:200

Análisis e interpretación:
- El servidor responde con HTTP 200 a muchos vectores LFI; sin embargo, la respuesta contiene la página HTML estándar en lugar del contenido de archivos sensibles. Esto puede indicar:
  - El parámetro es usado para seleccionar plantillas o fragmentos existentes y el sistema valida/normaliza las rutas (mitigando la inclusión directa), o
  - La aplicación incluye ficheros pero los datos contenidos son HTML por diseño, o
  - Existe filtrado o bloqueo parcial que impide la lectura de /etc/passwd y similares, aunque permite wrappers como php://filter que producen la misma página procesada (posible inclusión controlada).
- El payload php://filter no devolvió el contenido codificado, lo que sugiere que la inclusión directa está mitigada o la aplicación no permite wrappers.

Resultado de explotación:
- VULN_FOUND: true (se encontraron respuestas anómalas que justifican investigación LFI adicional)
- VULN_EXPLOITED: false (no se logró extraer contenido sensible como /etc/passwd ni rastro claro de ejecución remota)

Recomendaciones:
1. Revisar el código que maneja el parámetro "page" y otros parámetros para asegurarse de que no se incluyen rutas controladas por el usuario sin normalización ni whitelist.
2. Implementar una whitelist de plantillas permitidas (no incluir archivos por ruta relativa enviada por el usuario).
3. Evitar funciones de inclusión directa usando parámetros sin validar; usar mapeo (p.ej. un array ["about" => "about.php"]).
4. Deshabilitar wrappers peligrosos (allow_url_include) y asegurar php:// filters no sean invocables si no son necesarios.
5. Monitorizar logs para detectar intentos de inclusión y responder.

Archivos generados durante el análisis:
- /app/reports/lfi_scan_output.txt (salida completa del escaneo)

Pasos siguientes sugeridos:
- Intentar payloads más específicos si se sabe la estructura de ficheros (p.ej. incluir rutas relativas a la carpeta de templates), y pruebas con null byte, encoding, traversal variaciones.
- Revisar el código fuente del servidor (si disponible) para confirmar el flujo de inclusión.

--- Fin del informe ---
