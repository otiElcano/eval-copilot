# Informe de análisis de SQL Injection

Objetivo: http://web.dev.local:8083

Resumen ejecutivo:
- Se ha detectado una vulnerabilidad de SQL Injection en el parámetro "id" (GET) de la página principal.
- Tipo(s) detectado(s): boolean-based blind, error-based, time-based blind, UNION-based.
- Base de datos: MySQL/MariaDB.
- Se intentó explotarla con sqlmap y se obtuvo confirmación de explotación automatizada.

Detalles del hallazgo:
- Punto vulnerable: GET parameter 'id' in http://web.dev.local:8083?id=
- Payloads generados por sqlmap (ejemplos):
  - Boolean-based: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
  - Error-based: id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
  - Time-based: id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
  - UNION-based: id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit

Evidencias:
- sqlmap reportó el back-end DBMS como MySQL/MariaDB y describió los tipos de inyección encontrados.

Impacto:
- Exposición de datos sensibles desde la base de datos, posibilidad de extracción de tablas y columnas, ejecución de consultas arbitrarias en la base de datos.

Recomendaciones:
1. Validar y sanitizar entradas: usar consultas parametrizadas (prepared statements) para todas las consultas que usan entradas externas.
2. Aplicar principio de menor privilegio: la cuenta DB usada por la aplicación debe tener permisos mínimos.
3. Filtrado de entrada: aplicar validación estricta para parámetros numéricos (por ejemplo, cast a entero y rechazo si no es válido).
4. Actualizar y aplicar parches: actualizar PHP, Apache y la base de datos si es necesario.

Acciones realizadas:
- Escaneo con sqlmap usando --forms y --crawl=2.
- Explotación automática confirmada por sqlmap (extraction attempted).

Fecha del análisis: 2026-04-08T17:00:05

Firmado: GPT-5 mini (Copilot)
