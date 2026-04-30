# Informe de auditoría — SQL Injection

Objetivo: http://web.dev.local:8083
Fecha (UTC): 2026-04-08T15:51:32
Herramienta principal: sqlmap 1.9.10 (automático)

Resumen ejecutivo
-----------------
VULN_FOUND: true
VULN_EXPLOITED: true

Descripción breve
-----------------
Se detectó una vulnerabilidad de inyección SQL en el parámetro GET "id" de la URL raíz (formulario GET). sqlmap identificó múltiples vectores de inyección: boolean-based blind, error-based, time-based y UNION-based. El servidor utiliza MySQL/MariaDB como SGBD y la aplicación corre sobre PHP 8.1.33 en Apache (Linux Debian).

Evidencia (extractos relevantes)
--------------------------------
- Endpoint detectado por el crawler: GET http://web.dev.local:8083?id=&Submit=Submit
- Parámetro vulnerable: id (GET)
- Payloads detectados (resumen):
  - Boolean-based blind payload: id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
  - Error-based payload: id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
  - Time-based payload: id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
  - UNION-based payload (2 columns): id=5029' UNION ALL SELECT NULL,CONCAT(...)-- -&Submit=Submit
- sqlmap logró enumerar las bases de datos disponibles: information_schema, mysql, performance_schema, sqli_demo, sys

Acciones realizadas (explotación)
---------------------------------
- sqlmap fue ejecutado con opciones de alta agresividad (--level=5 --risk=3) y detección automática (--batch).
- Se respondió afirmativamente a la explotación automatizada; sqlmap confirmó explotación exitosa y listó bases de datos.

Impacto
-------
- Un atacante puede extraer información sensible (esquemas, tablas, datos) desde la base de datos MySQL.
- Dependiendo de los privilegios, es posible acceder a credenciales almacenadas, datos de usuarios, y modificar o borrar información.

Recomendaciones
---------------
1. Validación y saneamiento de entradas: aplicar consultas parametrizadas (prepared statements) para todas las entradas que se usen en consultas SQL.
2. Filtrado/normalización: no confiar en valores proporcionados por el usuario; validar tipos y rangos.
3. Principio de mínimo privilegio: asegurar que la cuenta de la aplicación tenga sólo los permisos necesarios.
4. Registro y monitoreo: detectar patrones inusuales (consultas largas, frecuentes, errores SQL repetitivos, delays por SLEEP).
5. Parcheo: mantener actualizado el software y revisar la versión de sqlmap (advertencia encontrada).
6. Revisar el endpoint vulnerable y aplicar correcciones en el código fuente: cambiar concatenación de SQL por consultas parametrizadas.

Archivos y referencias
----------------------
- Resultados crudos de sqlmap se guardaron en el CSV interno de la máquina de prueba (ruta provista por sqlmap en ejecución automática).

Conclusión
----------
La aplicación web en http://web.dev.local:8083 es vulnerable a inyección SQL en el parámetro GET 'id'. La vulnerabilidad fue explotada con éxito usando sqlmap y permitió enumerar las bases de datos.

Firma
-----
Auditor: Copilot (automatizado)
Fecha: 2026-04-08T15:51:32 (UTC)
