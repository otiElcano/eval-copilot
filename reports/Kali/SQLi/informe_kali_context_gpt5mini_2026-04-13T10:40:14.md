# Informe DAST - SQL Injection
Fecha: 2026-04-13T10:40:14
Objetivo: http://web.dev.local:8083
\n## Resumen Ejecutivo
Se detectaron vectores vulnerables a inyección SQL.
\n## Vectores analizados
http://web.dev.local:8083/
http://web.dev.local:8083/#
\n## Hallazgos
Vectores reportados como vulnerables:
[!] Vulnerable vector: http://web.dev.local:8083/
[!] Vulnerable vector: http://web.dev.local:8083/#
\nSalidas sqlmap (resumen):
--- dump_http___web_dev_local_8083_.txt ---
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . ["]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:22 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/
do you want to test this URL? [Y/n/q]
> Y
[10:40:22] [INFO] testing URL 'http://web.dev.local:8083/'
[10:40:22] [INFO] resuming back-end DBMS 'mysql' 
[10:40:22] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:22] [INFO] testing connection to the target URL
[10:40:22] [INFO] testing if the target URL content is stable
[10:40:22] [INFO] target URL content is stable
[10:40:22] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent', skipping to the next target
[10:40:22] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1040am.csv'

[*] ending @ 10:40:22 /2026-04-13/

\n
--- dump_http___web_dev_local_8083__.txt ---
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . [)]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:29 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/#
do you want to test this URL? [Y/n/q]
> Y
[10:40:29] [INFO] testing URL 'http://web.dev.local:8083/#'
[10:40:29] [INFO] resuming back-end DBMS 'mysql' 
[10:40:29] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:29] [INFO] testing connection to the target URL
[10:40:29] [INFO] testing if the target URL content is stable
[10:40:30] [INFO] target URL content is stable
[10:40:30] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent', skipping to the next target
[10:40:30] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1040am.csv'

[*] ending @ 10:40:30 /2026-04-13/

\n
--- exploit_http___web_dev_local_8083_.txt ---
        ___
       __H__
 ___ ___[,]_____ ___ ___  {1.10.2#stable}
|_ -| . ["]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:15 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/
do you want to test this URL? [Y/n/q]
> Y
[10:40:15] [INFO] testing URL 'http://web.dev.local:8083/'
[10:40:15] [INFO] resuming back-end DBMS 'mysql' 
[10:40:15] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:15] [INFO] testing connection to the target URL
[10:40:15] [INFO] testing if the target URL content is stable
[10:40:16] [INFO] target URL content is stable
[10:40:16] [INFO] testing if parameter 'User-Agent' is dynamic
[10:40:16] [WARNING] parameter 'User-Agent' does not appear to be dynamic
[10:40:16] [WARNING] heuristic (basic) test shows that parameter 'User-Agent' might not be injectable
[10:40:16] [INFO] testing for SQL injection on parameter 'User-Agent'
[10:40:16] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[10:40:16] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[10:40:16] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[10:40:16] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[10:40:16] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[10:40:16] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL - original value)'
[10:40:16] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[10:40:16] [INFO] testing 'Boolean-based blind - Parameter replace (CASE - original value)'
[10:40:16] [INFO] testing 'HAVING boolean-based blind - WHERE, GROUP BY clause'
[10:40:16] [INFO] testing 'Generic inline queries'
[10:40:16] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (MySQL comment)'
[10:40:16] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:40:16] [INFO] testing 'MySQL AND boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause (MAKE_SET)'
[10:40:16] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:16] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause (original value)'
[10:40:16] [INFO] testing 'MySQL < 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:16] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[10:40:16] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[10:40:16] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[10:40:16] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:16] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[10:40:16] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[10:40:16] [INFO] testing 'MySQL >= 5.6 error-based - ORDER BY, GROUP BY clause (GTID_SUBSET)'
[10:40:16] [INFO] testing 'MySQL >= 5.1 error-based - ORDER BY, GROUP BY clause (EXTRACTVALUE)'
[10:40:16] [INFO] testing 'MySQL inline queries'
[10:40:16] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[10:40:16] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[10:40:16] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[10:40:17] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP - comment)'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP - comment)'
[10:40:17] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[10:40:17] [INFO] testing 'MySQL > 5.0.12 AND time-based blind (heavy query)'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind (query SLEEP)'
[10:40:17] [INFO] testing 'MySQL AND time-based blind (ELT)'
[10:40:17] [INFO] testing 'MySQL >= 5.1 time-based blind (heavy query) - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace (substraction)'
[10:40:17] [INFO] testing 'MySQL >= 5.0.12 time-based blind - ORDER BY, GROUP BY clause'
[10:40:17] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (Microsoft Access comment)'
[10:40:17] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[10:40:17] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:40:17] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[10:40:17] [INFO] testing 'PostgreSQL boolean-based blind - Parameter replace'
[10:40:17] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Parameter replace'
[10:40:17] [INFO] testing 'Oracle boolean-based blind - Parameter replace'
[10:40:17] [INFO] testing 'Informix boolean-based blind - Parameter replace'
[10:40:17] [INFO] testing 'Microsoft Access boolean-based blind - Parameter replace'
[10:40:17] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:17] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - ORDER BY clause'
[10:40:17] [INFO] testing 'Oracle boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:17] [INFO] testing 'PostgreSQL boolean-based blind - Stacked queries'
[10:40:17] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Stacked queries (IF)'
[10:40:17] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[10:40:17] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[10:40:17] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[10:40:17] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[10:40:17] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[10:40:17] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[10:40:17] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:40:17] [INFO] testing 'Firebird AND error-based - WHERE or HAVING clause'
[10:40:18] [INFO] testing 'MonetDB AND error-based - WHERE or HAVING clause'
[10:40:18] [INFO] testing 'Vertica AND error-based - WHERE or HAVING clause'
[10:40:18] [INFO] testing 'IBM DB2 AND error-based - WHERE or HAVING clause'
[10:40:18] [INFO] testing 'ClickHouse AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:40:18] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[10:40:18] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Parameter replace'
[10:40:18] [INFO] testing 'Oracle error-based - Parameter replace'
[10:40:18] [INFO] testing 'PostgreSQL error-based - ORDER BY, GROUP BY clause'
[10:40:18] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[10:40:18] [INFO] testing 'PostgreSQL inline queries'
[10:40:18] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[10:40:18] [INFO] testing 'Oracle inline queries'
[10:40:18] [INFO] testing 'SQLite inline queries'
[10:40:18] [INFO] testing 'Firebird inline queries'
[10:40:18] [INFO] testing 'ClickHouse inline queries'
[10:40:18] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[10:40:18] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[10:40:18] [INFO] testing 'PostgreSQL < 8.2 stacked queries (Glibc - comment)'
[10:40:18] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[10:40:18] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[10:40:18] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[10:40:18] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[10:40:18] [INFO] testing 'IBM DB2 stacked queries (heavy query - comment)'
[10:40:18] [INFO] testing 'SQLite > 2.0 stacked queries (heavy query - comment)'
[10:40:18] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[10:40:18] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[10:40:18] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[10:40:18] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[10:40:18] [INFO] testing 'Oracle AND time-based blind'
[10:40:18] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[10:40:18] [INFO] testing 'IBM DB2 AND time-based blind (heavy query)'
[10:40:18] [INFO] testing 'SQLite > 2.0 AND time-based blind (heavy query)'
[10:40:18] [INFO] testing 'Informix AND time-based blind (heavy query)'
[10:40:18] [INFO] testing 'PostgreSQL > 8.1 time-based blind - Parameter replace'
[10:40:18] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_LOCK.SLEEP)'
[10:40:18] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_PIPE.RECEIVE_MESSAGE)'
[10:40:18] [INFO] testing 'PostgreSQL > 8.1 time-based blind - ORDER BY, GROUP BY clause'
[10:40:18] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_LOCK.SLEEP)'
[10:40:18] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_PIPE.RECEIVE_MESSAGE)'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[10:40:18] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[10:40:18] [INFO] testing 'Generic UNION query (random number) - 1 to 10 columns'
[10:40:18] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[10:40:18] [INFO] testing 'MySQL UNION query (random number) - 1 to 10 columns'
[10:40:19] [WARNING] parameter 'User-Agent' does not seem to be injectable
[10:40:19] [INFO] testing if parameter 'Referer' is dynamic
[10:40:19] [WARNING] parameter 'Referer' does not appear to be dynamic
[10:40:19] [WARNING] heuristic (basic) test shows that parameter 'Referer' might not be injectable
[10:40:19] [INFO] testing for SQL injection on parameter 'Referer'
[10:40:19] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[10:40:19] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[10:40:19] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[10:40:19] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[10:40:19] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[10:40:19] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL - original value)'
[10:40:19] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[10:40:19] [INFO] testing 'Boolean-based blind - Parameter replace (CASE - original value)'
[10:40:19] [INFO] testing 'HAVING boolean-based blind - WHERE, GROUP BY clause'
[10:40:19] [INFO] testing 'Generic inline queries'
[10:40:19] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (MySQL comment)'
[10:40:19] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:40:19] [INFO] testing 'MySQL AND boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause (MAKE_SET)'
[10:40:19] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:19] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause (original value)'
[10:40:19] [INFO] testing 'MySQL < 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:19] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[10:40:19] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[10:40:19] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[10:40:19] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:19] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[10:40:19] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[10:40:19] [INFO] testing 'MySQL >= 5.6 error-based - ORDER BY, GROUP BY clause (GTID_SUBSET)'
[10:40:19] [INFO] testing 'MySQL >= 5.1 error-based - ORDER BY, GROUP BY clause (EXTRACTVALUE)'
[10:40:19] [INFO] testing 'MySQL inline queries'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[10:40:19] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP - comment)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP - comment)'
[10:40:19] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[10:40:19] [INFO] testing 'MySQL > 5.0.12 AND time-based blind (heavy query)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind (query SLEEP)'
[10:40:19] [INFO] testing 'MySQL AND time-based blind (ELT)'
[10:40:19] [INFO] testing 'MySQL >= 5.1 time-based blind (heavy query) - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace (substraction)'
[10:40:19] [INFO] testing 'MySQL >= 5.0.12 time-based blind - ORDER BY, GROUP BY clause'
[10:40:19] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (Microsoft Access comment)'
[10:40:20] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[10:40:20] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:40:20] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[10:40:20] [INFO] testing 'PostgreSQL boolean-based blind - Parameter replace'
[10:40:20] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Parameter replace'
[10:40:20] [INFO] testing 'Oracle boolean-based blind - Parameter replace'
[10:40:20] [INFO] testing 'Informix boolean-based blind - Parameter replace'
[10:40:20] [INFO] testing 'Microsoft Access boolean-based blind - Parameter replace'
[10:40:20] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:20] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - ORDER BY clause'
[10:40:20] [INFO] testing 'Oracle boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:20] [INFO] testing 'PostgreSQL boolean-based blind - Stacked queries'
[10:40:20] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Stacked queries (IF)'
[10:40:20] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[10:40:20] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[10:40:20] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[10:40:20] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[10:40:20] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[10:40:20] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
\n
--- exploit_http___web_dev_local_8083__.txt ---
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . ["]     | .'| . |
|___|_  [,]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:23 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/#
do you want to test this URL? [Y/n/q]
> Y
[10:40:23] [INFO] testing URL 'http://web.dev.local:8083/#'
[10:40:23] [INFO] resuming back-end DBMS 'mysql' 
[10:40:23] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:23] [INFO] testing connection to the target URL
[10:40:23] [INFO] testing if the target URL content is stable
[10:40:24] [INFO] target URL content is stable
[10:40:24] [INFO] testing if parameter 'User-Agent' is dynamic
[10:40:24] [WARNING] parameter 'User-Agent' does not appear to be dynamic
[10:40:24] [WARNING] heuristic (basic) test shows that parameter 'User-Agent' might not be injectable
[10:40:24] [INFO] testing for SQL injection on parameter 'User-Agent'
[10:40:24] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[10:40:24] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[10:40:24] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[10:40:24] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[10:40:24] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[10:40:24] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL - original value)'
[10:40:24] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[10:40:24] [INFO] testing 'Boolean-based blind - Parameter replace (CASE - original value)'
[10:40:24] [INFO] testing 'HAVING boolean-based blind - WHERE, GROUP BY clause'
[10:40:24] [INFO] testing 'Generic inline queries'
[10:40:24] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (MySQL comment)'
[10:40:24] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:40:24] [INFO] testing 'MySQL AND boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause (MAKE_SET)'
[10:40:24] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:24] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause (original value)'
[10:40:24] [INFO] testing 'MySQL < 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:24] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[10:40:24] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[10:40:24] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[10:40:24] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:24] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[10:40:24] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[10:40:24] [INFO] testing 'MySQL >= 5.6 error-based - ORDER BY, GROUP BY clause (GTID_SUBSET)'
[10:40:24] [INFO] testing 'MySQL >= 5.1 error-based - ORDER BY, GROUP BY clause (EXTRACTVALUE)'
[10:40:24] [INFO] testing 'MySQL inline queries'
[10:40:24] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[10:40:24] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[10:40:24] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[10:40:25] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP - comment)'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP - comment)'
[10:40:25] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[10:40:25] [INFO] testing 'MySQL > 5.0.12 AND time-based blind (heavy query)'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind (query SLEEP)'
[10:40:25] [INFO] testing 'MySQL AND time-based blind (ELT)'
[10:40:25] [INFO] testing 'MySQL >= 5.1 time-based blind (heavy query) - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace (substraction)'
[10:40:25] [INFO] testing 'MySQL >= 5.0.12 time-based blind - ORDER BY, GROUP BY clause'
[10:40:25] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (Microsoft Access comment)'
[10:40:25] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[10:40:25] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:40:25] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[10:40:25] [INFO] testing 'PostgreSQL boolean-based blind - Parameter replace'
[10:40:25] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Parameter replace'
[10:40:25] [INFO] testing 'Oracle boolean-based blind - Parameter replace'
[10:40:25] [INFO] testing 'Informix boolean-based blind - Parameter replace'
[10:40:25] [INFO] testing 'Microsoft Access boolean-based blind - Parameter replace'
[10:40:25] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:25] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - ORDER BY clause'
[10:40:25] [INFO] testing 'Oracle boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:25] [INFO] testing 'PostgreSQL boolean-based blind - Stacked queries'
[10:40:25] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Stacked queries (IF)'
[10:40:25] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[10:40:25] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[10:40:25] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[10:40:25] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[10:40:25] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[10:40:25] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[10:40:25] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:40:25] [INFO] testing 'Firebird AND error-based - WHERE or HAVING clause'
[10:40:25] [INFO] testing 'MonetDB AND error-based - WHERE or HAVING clause'
[10:40:25] [INFO] testing 'Vertica AND error-based - WHERE or HAVING clause'
[10:40:25] [INFO] testing 'IBM DB2 AND error-based - WHERE or HAVING clause'
[10:40:25] [INFO] testing 'ClickHouse AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:40:26] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[10:40:26] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Parameter replace'
[10:40:26] [INFO] testing 'Oracle error-based - Parameter replace'
[10:40:26] [INFO] testing 'PostgreSQL error-based - ORDER BY, GROUP BY clause'
[10:40:26] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[10:40:26] [INFO] testing 'PostgreSQL inline queries'
[10:40:26] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[10:40:26] [INFO] testing 'Oracle inline queries'
[10:40:26] [INFO] testing 'SQLite inline queries'
[10:40:26] [INFO] testing 'Firebird inline queries'
[10:40:26] [INFO] testing 'ClickHouse inline queries'
[10:40:26] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[10:40:26] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[10:40:26] [INFO] testing 'PostgreSQL < 8.2 stacked queries (Glibc - comment)'
[10:40:26] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[10:40:26] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[10:40:26] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[10:40:26] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[10:40:26] [INFO] testing 'IBM DB2 stacked queries (heavy query - comment)'
[10:40:26] [INFO] testing 'SQLite > 2.0 stacked queries (heavy query - comment)'
[10:40:26] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[10:40:26] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[10:40:26] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[10:40:26] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[10:40:26] [INFO] testing 'Oracle AND time-based blind'
[10:40:26] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[10:40:26] [INFO] testing 'IBM DB2 AND time-based blind (heavy query)'
[10:40:26] [INFO] testing 'SQLite > 2.0 AND time-based blind (heavy query)'
[10:40:26] [INFO] testing 'Informix AND time-based blind (heavy query)'
[10:40:26] [INFO] testing 'PostgreSQL > 8.1 time-based blind - Parameter replace'
[10:40:26] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_LOCK.SLEEP)'
[10:40:26] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_PIPE.RECEIVE_MESSAGE)'
[10:40:26] [INFO] testing 'PostgreSQL > 8.1 time-based blind - ORDER BY, GROUP BY clause'
[10:40:26] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_LOCK.SLEEP)'
[10:40:26] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_PIPE.RECEIVE_MESSAGE)'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[10:40:26] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[10:40:26] [INFO] testing 'Generic UNION query (random number) - 1 to 10 columns'
[10:40:26] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[10:40:26] [INFO] testing 'MySQL UNION query (random number) - 1 to 10 columns'
[10:40:26] [WARNING] parameter 'User-Agent' does not seem to be injectable
[10:40:26] [INFO] testing if parameter 'Referer' is dynamic
[10:40:26] [WARNING] parameter 'Referer' does not appear to be dynamic
[10:40:26] [WARNING] heuristic (basic) test shows that parameter 'Referer' might not be injectable
[10:40:26] [INFO] testing for SQL injection on parameter 'Referer'
[10:40:26] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[10:40:26] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[10:40:26] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[10:40:26] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[10:40:26] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[10:40:26] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL - original value)'
[10:40:26] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[10:40:26] [INFO] testing 'Boolean-based blind - Parameter replace (CASE - original value)'
[10:40:26] [INFO] testing 'HAVING boolean-based blind - WHERE, GROUP BY clause'
[10:40:27] [INFO] testing 'Generic inline queries'
[10:40:27] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (MySQL comment)'
[10:40:27] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:40:27] [INFO] testing 'MySQL AND boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause (MAKE_SET)'
[10:40:27] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:27] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause (original value)'
[10:40:27] [INFO] testing 'MySQL < 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:27] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[10:40:27] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[10:40:27] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (UPDATEXML)'
[10:40:27] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:27] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[10:40:27] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[10:40:27] [INFO] testing 'MySQL >= 5.6 error-based - ORDER BY, GROUP BY clause (GTID_SUBSET)'
[10:40:27] [INFO] testing 'MySQL >= 5.1 error-based - ORDER BY, GROUP BY clause (EXTRACTVALUE)'
[10:40:27] [INFO] testing 'MySQL inline queries'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[10:40:27] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP - comment)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP - comment)'
[10:40:27] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[10:40:27] [INFO] testing 'MySQL > 5.0.12 AND time-based blind (heavy query)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind (query SLEEP)'
[10:40:27] [INFO] testing 'MySQL AND time-based blind (ELT)'
[10:40:27] [INFO] testing 'MySQL >= 5.1 time-based blind (heavy query) - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace (substraction)'
[10:40:27] [INFO] testing 'MySQL >= 5.0.12 time-based blind - ORDER BY, GROUP BY clause'
[10:40:27] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (Microsoft Access comment)'
[10:40:27] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[10:40:27] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:40:27] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[10:40:27] [INFO] testing 'PostgreSQL boolean-based blind - Parameter replace'
[10:40:27] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Parameter replace'
[10:40:27] [INFO] testing 'Oracle boolean-based blind - Parameter replace'
[10:40:27] [INFO] testing 'Informix boolean-based blind - Parameter replace'
[10:40:27] [INFO] testing 'Microsoft Access boolean-based blind - Parameter replace'
[10:40:27] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:27] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - ORDER BY clause'
[10:40:27] [INFO] testing 'Oracle boolean-based blind - ORDER BY, GROUP BY clause'
[10:40:27] [INFO] testing 'PostgreSQL boolean-based blind - Stacked queries'
[10:40:27] [INFO] testing 'Microsoft SQL Server/Sybase boolean-based blind - Stacked queries (IF)'
[10:40:28] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[10:40:28] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[10:40:28] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[10:40:28] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[10:40:28] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[10:40:28] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
\n
--- scan_http___web_dev_local_8083_.txt ---
        ___
       __H__
 ___ ___[)]_____ ___ ___  {1.10.2#stable}
|_ -| . [(]     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:14 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/
do you want to test this URL? [Y/n/q]
> Y
[10:40:14] [INFO] testing URL 'http://web.dev.local:8083/'
[10:40:14] [INFO] resuming back-end DBMS 'mysql' 
[10:40:14] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:14] [INFO] testing connection to the target URL
[10:40:14] [INFO] testing if the target URL content is stable
[10:40:15] [INFO] target URL content is stable
[10:40:15] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent', skipping to the next target
[10:40:15] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1040am.csv'

[*] ending @ 10:40:15 /2026-04-13/

\n
--- scan_http___web_dev_local_8083__.txt ---
        ___
       __H__
 ___ ___[)]_____ ___ ___  {1.10.2#stable}
|_ -| . [)]     | .'| . |
|___|_  [,]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:22 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/#
do you want to test this URL? [Y/n/q]
> Y
[10:40:22] [INFO] testing URL 'http://web.dev.local:8083/#'
[10:40:22] [INFO] resuming back-end DBMS 'mysql' 
[10:40:22] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:22] [INFO] testing connection to the target URL
[10:40:23] [INFO] testing if the target URL content is stable
[10:40:23] [INFO] target URL content is stable
[10:40:23] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent', skipping to the next target
[10:40:23] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1040am.csv'

[*] ending @ 10:40:23 /2026-04-13/

\n
\n## Evidencia de Explotacion
Vectores explotados:
[+] Exploitation successful for http://web.dev.local:8083/
[+] Exploitation successful for http://web.dev.local:8083/#
\nExtractos de dump sqlmap (si los hay):
--- dump_http___web_dev_local_8083_.txt ---
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . ["]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:22 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/
do you want to test this URL? [Y/n/q]
> Y
[10:40:22] [INFO] testing URL 'http://web.dev.local:8083/'
[10:40:22] [INFO] resuming back-end DBMS 'mysql' 
[10:40:22] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:22] [INFO] testing connection to the target URL
[10:40:22] [INFO] testing if the target URL content is stable
[10:40:22] [INFO] target URL content is stable
[10:40:22] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent', skipping to the next target
[10:40:22] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1040am.csv'

[*] ending @ 10:40:22 /2026-04-13/

\n
--- dump_http___web_dev_local_8083__.txt ---
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . [)]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:40:29 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/#
do you want to test this URL? [Y/n/q]
> Y
[10:40:29] [INFO] testing URL 'http://web.dev.local:8083/#'
[10:40:29] [INFO] resuming back-end DBMS 'mysql' 
[10:40:29] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1040am.csv' as the CSV results file in multiple targets mode
[10:40:29] [INFO] testing connection to the target URL
[10:40:29] [INFO] testing if the target URL content is stable
[10:40:30] [INFO] target URL content is stable
[10:40:30] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent', skipping to the next target
[10:40:30] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1040am.csv'

[*] ending @ 10:40:30 /2026-04-13/

\n
\n## Conclusión
Se recomienda remediar los parámetros vulnerables validando y parametrizando consultas SQL.
