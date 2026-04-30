# Informe SQLi - 20260427_131228

Resumen ejecutivo:

Se realizó un análisis dinámico (DAST) con sqlmap contra el objetivo autorizado http://web.dev.local:8083 buscando inyecciones SQL en parámetros GET y formularios detectados.

Vectores analizados:

- Formulario GET en la página principal con parámetro "id" (action="#", method=GET)
- URL probada: http://web.dev.local:8083/?id=1

Comando sqlmap usado (fase de descubrimiento):

        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . [,]     | .'| . |
|___|_  [,]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 13:12:28 /2026-04-27/

[13:12:28] [WARNING] using '/app/reports/sqlmap_run_param' as the output directory
[13:12:28] [INFO] testing connection to the target URL
[13:12:28] [INFO] testing if the target URL content is stable
[13:12:29] [INFO] target URL content is stable
[13:12:29] [WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable
[13:12:29] [INFO] testing for SQL injection on GET parameter 'id'
[13:12:29] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[13:12:29] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[13:12:29] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[13:12:29] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (MySQL comment)'
[13:12:29] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (Microsoft Access comment)'
[13:12:29] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[13:12:29] [INFO] testing 'MySQL AND boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause (MAKE_SET)'
[13:12:29] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[13:12:29] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[13:12:29] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[13:12:29] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[13:12:29] [INFO] testing 'PostgreSQL boolean-based blind - Parameter replace'
[13:12:29] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Parameter replace'
[13:12:29] [INFO] testing 'Oracle boolean-based blind - Parameter replace'
[13:12:29] [INFO] testing 'Informix boolean-based blind - Parameter replace'
[13:12:29] [INFO] testing 'Microsoft Access boolean-based blind - Parameter replace'
[13:12:29] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[13:12:29] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL - original value)'
[13:12:29] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[13:12:29] [INFO] testing 'Boolean-based blind - Parameter replace (CASE - original value)'
[13:12:29] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[13:12:29] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause (original value)'
[13:12:29] [INFO] testing 'MySQL < 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[13:12:29] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[13:12:29] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - ORDER BY clause'
[13:12:29] [INFO] testing 'Oracle boolean-based blind - ORDER BY, GROUP BY clause'
[13:12:29] [INFO] testing 'HAVING boolean-based blind - WHERE, GROUP BY clause'
[13:12:29] [INFO] testing 'PostgreSQL boolean-based blind - Stacked queries'
[13:12:29] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Stacked queries (IF)'
[13:12:29] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[13:12:29] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[13:12:29] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[13:12:29] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[13:12:29] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[13:12:29] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[13:12:30] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[13:12:30] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[13:12:30] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[13:12:30] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[13:12:30] [INFO] testing 'Firebird AND error-based - WHERE or HAVING clause'
[13:12:30] [INFO] testing 'MonetDB AND error-based - WHERE or HAVING clause'
[13:12:30] [INFO] testing 'Vertica AND error-based - WHERE or HAVING clause'
[13:12:30] [INFO] testing 'IBM DB2 AND error-based - WHERE or HAVING clause'
[13:12:30] [INFO] testing 'ClickHouse AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause'
[13:12:30] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[13:12:30] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[13:12:30] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[13:12:30] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[13:12:30] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Parameter replace'
[13:12:30] [INFO] testing 'Oracle error-based - Parameter replace'
[13:12:30] [INFO] testing 'MySQL >= 5.6 error-based - ORDER BY, GROUP BY clause (GTID_SUBSET)'
[13:12:30] [INFO] testing 'MySQL >= 5.1 error-based - ORDER BY, GROUP BY clause (EXTRACTVALUE)'
[13:12:30] [INFO] testing 'PostgreSQL error-based - ORDER BY, GROUP BY clause'
[13:12:30] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[13:12:30] [INFO] testing 'Generic inline queries'
[13:12:30] [INFO] testing 'MySQL inline queries'
[13:12:30] [INFO] testing 'PostgreSQL inline queries'
[13:12:30] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[13:12:30] [INFO] testing 'Oracle inline queries'
[13:12:30] [INFO] testing 'SQLite inline queries'
[13:12:30] [INFO] testing 'Firebird inline queries'
[13:12:30] [INFO] testing 'ClickHouse inline queries'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[13:12:30] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[13:12:30] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[13:12:30] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[13:12:30] [INFO] testing 'PostgreSQL < 8.2 stacked queries (Glibc - comment)'
[13:12:30] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[13:12:30] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[13:12:30] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[13:12:30] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[13:12:30] [INFO] testing 'IBM DB2 stacked queries (heavy query - comment)'
[13:12:30] [INFO] testing 'SQLite > 2.0 stacked queries (heavy query - comment)'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP - comment)'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP - comment)'
[13:12:30] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[13:12:30] [INFO] testing 'MySQL > 5.0.12 AND time-based blind (heavy query)'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[13:12:30] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind (query SLEEP)'
[13:12:31] [INFO] testing 'MySQL AND time-based blind (ELT)'
[13:12:31] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[13:12:31] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[13:12:31] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[13:12:31] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[13:12:31] [INFO] testing 'Oracle AND time-based blind'
[13:12:31] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[13:12:31] [INFO] testing 'IBM DB2 AND time-based blind (heavy query)'
[13:12:31] [INFO] testing 'SQLite > 2.0 AND time-based blind (heavy query)'
[13:12:31] [INFO] testing 'Informix AND time-based blind (heavy query)'
[13:12:31] [INFO] testing 'MySQL >= 5.1 time-based blind (heavy query) - PROCEDURE ANALYSE (EXTRACTVALUE)'
[13:12:31] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[13:12:31] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace (substraction)'
[13:12:31] [INFO] testing 'PostgreSQL > 8.1 time-based blind - Parameter replace'
[13:12:31] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_LOCK.SLEEP)'
[13:12:31] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_PIPE.RECEIVE_MESSAGE)'
[13:12:31] [INFO] testing 'MySQL >= 5.0.12 time-based blind - ORDER BY, GROUP BY clause'
[13:12:31] [INFO] testing 'PostgreSQL > 8.1 time-based blind - ORDER BY, GROUP BY clause'
[13:12:31] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_LOCK.SLEEP)'
[13:12:31] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_PIPE.RECEIVE_MESSAGE)'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[13:12:31] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[13:12:31] [INFO] testing 'Generic UNION query (random number) - 1 to 10 columns'
[13:12:31] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[13:12:31] [INFO] testing 'MySQL UNION query (random number) - 1 to 10 columns'
[13:12:31] [WARNING] GET parameter 'id' does not seem to be injectable
[13:12:31] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent'

[*] ending @ 13:12:31 /2026-04-27/

Hallazgos:

- Resultado: No se confirmó inyección SQL en el parámetro GET 'id'.
- Observación: sqlmap reportó pruebas heurísticas y pruebas posteriores indicando que "GET parameter 'id' does not seem to be injectable".

Evidencia (fragmentos relevantes de la salida de sqlmap):



Salida completa (resumen) del escaneo sqlmap:



Conclusión:

- No se identificó vulnerabilidad SQLi explotable en el vector probado (parámetro 'id'). Por tanto, no se procedió a la fase de explotación activa de extracción de bases de datos.
- Recomendaciones: Si se desea más cobertura, ejecutar sqlmap con valores más altos de --level/--risk, probar tamper scripts y revisar otros endpoints/APIs que acepten parámetros.

