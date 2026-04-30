# Informe DAST - SQLi

Fecha: 2026-04-27 12:25:38+00:00 (UTC)

## Resumen ejecutivo
- Objetivo: http://web.dev.local:8083
- Vector analizado: parámetro GET 'id' en la URL raíz
- Vulnerabilidad encontrada: false
- Vulnerabilidad explotada: false

## Vectores analizados
- Formulario en la página principal con campo 'id' (GET).
- URL probada: http://web.dev.local:8083/?id=1

## Hallazgos y comandos utilizados
### Comando de detección (sqlmap)

Salida de detección (extracto):

(Últimas 200 líneas de la salida de detección)
        ___
       __H__
 ___ ___["]_____ ___ ___  {1.10.2#stable}
|_ -| . [.]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 12:25:35 /2026-04-27/

[12:25:35] [WARNING] using '/app/reports/sqlmap_sqli_20260427_122535' as the output directory
[12:25:35] [INFO] testing connection to the target URL
[12:25:35] [INFO] checking if the target is protected by some kind of WAF/IPS
[12:25:35] [INFO] testing if the target URL content is stable
[12:25:36] [INFO] target URL content is stable
[12:25:36] [WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable
[12:25:36] [INFO] testing for SQL injection on GET parameter 'id'
[12:25:36] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[12:25:36] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[12:25:36] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[12:25:36] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (MySQL comment)'
[12:25:36] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (Microsoft Access comment)'
[12:25:36] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[12:25:36] [INFO] testing 'MySQL AND boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause (MAKE_SET)'
[12:25:36] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[12:25:36] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[12:25:36] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[12:25:36] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[12:25:36] [INFO] testing 'PostgreSQL boolean-based blind - Parameter replace'
[12:25:36] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Parameter replace'
[12:25:36] [INFO] testing 'Oracle boolean-based blind - Parameter replace'
[12:25:36] [INFO] testing 'Informix boolean-based blind - Parameter replace'
[12:25:36] [INFO] testing 'Microsoft Access boolean-based blind - Parameter replace'
[12:25:36] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[12:25:36] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL - original value)'
[12:25:36] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[12:25:36] [INFO] testing 'Boolean-based blind - Parameter replace (CASE - original value)'
[12:25:36] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[12:25:36] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause (original value)'
[12:25:36] [INFO] testing 'MySQL < 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[12:25:36] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[12:25:36] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - ORDER BY clause'
[12:25:36] [INFO] testing 'Oracle boolean-based blind - ORDER BY, GROUP BY clause'
[12:25:36] [INFO] testing 'HAVING boolean-based blind - WHERE, GROUP BY clause'
[12:25:36] [INFO] testing 'PostgreSQL boolean-based blind - Stacked queries'
[12:25:36] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Stacked queries (IF)'
[12:25:36] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[12:25:36] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[12:25:36] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[12:25:36] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[12:25:36] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[12:25:36] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[12:25:36] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[12:25:37] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[12:25:37] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[12:25:37] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[12:25:37] [INFO] testing 'Firebird AND error-based - WHERE or HAVING clause'
[12:25:37] [INFO] testing 'MonetDB AND error-based - WHERE or HAVING clause'
[12:25:37] [INFO] testing 'Vertica AND error-based - WHERE or HAVING clause'
[12:25:37] [INFO] testing 'IBM DB2 AND error-based - WHERE or HAVING clause'
[12:25:37] [INFO] testing 'ClickHouse AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause'
[12:25:37] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[12:25:37] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[12:25:37] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[12:25:37] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[12:25:37] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Parameter replace'
[12:25:37] [INFO] testing 'Oracle error-based - Parameter replace'
[12:25:37] [INFO] testing 'MySQL >= 5.6 error-based - ORDER BY, GROUP BY clause (GTID_SUBSET)'
[12:25:37] [INFO] testing 'MySQL >= 5.1 error-based - ORDER BY, GROUP BY clause (EXTRACTVALUE)'
[12:25:37] [INFO] testing 'PostgreSQL error-based - ORDER BY, GROUP BY clause'
[12:25:37] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[12:25:37] [INFO] testing 'Generic inline queries'
[12:25:37] [INFO] testing 'MySQL inline queries'
[12:25:37] [INFO] testing 'PostgreSQL inline queries'
[12:25:37] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[12:25:37] [INFO] testing 'Oracle inline queries'
[12:25:37] [INFO] testing 'SQLite inline queries'
[12:25:37] [INFO] testing 'Firebird inline queries'
[12:25:37] [INFO] testing 'ClickHouse inline queries'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[12:25:37] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[12:25:37] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[12:25:37] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[12:25:37] [INFO] testing 'PostgreSQL < 8.2 stacked queries (Glibc - comment)'
[12:25:37] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[12:25:37] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[12:25:37] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[12:25:37] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[12:25:37] [INFO] testing 'IBM DB2 stacked queries (heavy query - comment)'
[12:25:37] [INFO] testing 'SQLite > 2.0 stacked queries (heavy query - comment)'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP - comment)'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP - comment)'
[12:25:37] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[12:25:37] [INFO] testing 'MySQL > 5.0.12 AND time-based blind (heavy query)'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[12:25:37] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind (query SLEEP)'
[12:25:37] [INFO] testing 'MySQL AND time-based blind (ELT)'
[12:25:37] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[12:25:37] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[12:25:38] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[12:25:38] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[12:25:38] [INFO] testing 'Oracle AND time-based blind'
[12:25:38] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[12:25:38] [INFO] testing 'IBM DB2 AND time-based blind (heavy query)'
[12:25:38] [INFO] testing 'SQLite > 2.0 AND time-based blind (heavy query)'
[12:25:38] [INFO] testing 'Informix AND time-based blind (heavy query)'
[12:25:38] [INFO] testing 'MySQL >= 5.1 time-based blind (heavy query) - PROCEDURE ANALYSE (EXTRACTVALUE)'
[12:25:38] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[12:25:38] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace (substraction)'
[12:25:38] [INFO] testing 'PostgreSQL > 8.1 time-based blind - Parameter replace'
[12:25:38] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_LOCK.SLEEP)'
[12:25:38] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_PIPE.RECEIVE_MESSAGE)'
[12:25:38] [INFO] testing 'MySQL >= 5.0.12 time-based blind - ORDER BY, GROUP BY clause'
[12:25:38] [INFO] testing 'PostgreSQL > 8.1 time-based blind - ORDER BY, GROUP BY clause'
[12:25:38] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_LOCK.SLEEP)'
[12:25:38] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_PIPE.RECEIVE_MESSAGE)'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[12:25:38] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[12:25:38] [INFO] testing 'Generic UNION query (random number) - 1 to 10 columns'
[12:25:38] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[12:25:38] [INFO] testing 'MySQL UNION query (random number) - 1 to 10 columns'
[12:25:38] [WARNING] GET parameter 'id' does not seem to be injectable
[12:25:38] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent'

[*] ending @ 12:25:38 /2026-04-27/


### Comando de explotación (si aplicable)
No se intentó explotación ya que no se detectó vulnerabilidad.

## Evidencia y payloads exactos
- Payloads utilizados por sqlmap se pueden encontrar en los archivos de salida dentro del directorio: /app/reports/sqlmap_sqli_20260427_122535

## Conclusión
- Recomendaciones: validar y parametrizar consultas en servidor, utilizar prepared statements, sanitizar entrada y aplicar principios de mínimo privilegio en DB.
