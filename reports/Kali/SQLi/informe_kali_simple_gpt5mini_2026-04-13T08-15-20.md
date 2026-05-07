# Informe de auditoría — SQL Injection

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T08:15:20Z

Resumen ejecutivo:
Se inspeccionó la página principal y se identificó un formulario GET con parámetro "id". Se ejecutaron múltiples payloads comunes de SQLi (error-based, UNION, boolean) contra el parámetro "id" y se registraron respuestas.

Pruebas realizadas:
- Fetch de la página y extracción de formulario (action="#", method=GET).
- Payloads probados (no exhaustivo):
  - "1' OR '1'='1"  
  - "1' OR '1'='1' -- "
  - "' OR '1'='1' -- "
  - "1 OR 1=1"  
  - "1' UNION SELECT null,null -- "
  - "'" y '"' para provocar errores
- Comandos y carpeta de trabajo: /tmp/sqli_scan/ (resp_*.html, summary.txt)

Resultados:
- Respuesta base: HTTP 200, tamaño 2576 bytes.
- Todas las respuestas con payloads devolvieron HTTP 200 y contenido visualmente idéntico al baseline (no se detectaron diferencias significativas ni mensajes de error SQL en las páginas revisadas).
- No se encontraron mensajes de error típicos de bases de datos (MySQL, SQLite, PostgreSQL, Oracle), ni indicios de UNION exitoso ni de filtrado de columnas.

Conclusión:
Vulnerabilidad de SQL Injection: NO detectada con las pruebas realizadas.
Explotación: NO realizada (no aplicable dado que no se detectó vector explotable).

Recomendaciones:
1. Validación y saneamiento: aplicar validación estricta del parámetro "id" (ej. permitir sólo números si corresponde).
2. Use consultas preparadas/parametrizadas en el servidor para evitar inyección.
3. Registrar y monitorizar errores sin mostrarlos al usuario.
4. Considerar pruebas adicionales: pruebas ciegas (time-based), revisar endpoints POST/otros parámetros, autenticación y pruebas con herramientas automatizadas (sqlmap) en un entorno controlado.

Archivos relacionados generados durante la auditoría:
- /tmp/sqli_scan/summary.txt (resumen y snippets)
- /tmp/sqli_scan/resp_*.html (respuestas por payload)

Notas legales: Se confirmó autorización del propietario para realizar las pruebas.

Informe generado automáticamente por Copilot CLI (GPT-5 mini).
