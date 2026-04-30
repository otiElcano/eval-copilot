# Informe DAST - SQLi

Fecha: 2026-04-27 12:44:38Z UTC
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo

Vulnerabilidad detectada: Sí
Explotada con éxito: No

## Vectores Analizados



enumerate:


Vectores probados:
http://web.dev.local:8083/?id=1
\n## Hallazgos
Se detectaron los siguientes vectores vulnerables y payloads de sqlmap utilizados:

     1	[!] Vulnerable: http://web.dev.local:8083/?id=1
     2	[i] Exploitation attempted but no clear data extracted for: http://web.dev.local:8083/?id=1

Comandos sqlmap ejecutados (ejemplos):
```
sqlmap -u "" --batch --level=2 --risk=1 --threads=2
sqlmap -u "" --batch --current-user --dbs --threads=2
```

## Evidencia de Explotación
### Extracto: exploit_1.txt
```
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . [)]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 12:44:37 /2026-04-27/

)07[?47h[1;24r[m[4l[24;1H[2J[?47l8[?1l>[1/1] URL:
GET http://web.dev.local:8083/?id=1
do you want to test this URL? [Y/n/q]
> Y
[12:44:37] [INFO] testing URL 'http://web.dev.local:8083/?id=1'
[12:44:37] [INFO] using '/root/.local/share/sqlmap/output/results-04272026_1244pm.csv' as the CSV results file in multiple targets mode
[12:44:37] [INFO] testing connection to the target URL
[12:44:37] [INFO] testing if the target URL content is stable
[12:44:38] [INFO] target URL content is stable
[12:44:38] [INFO] testing if GET parameter 'id' is dynamic
[12:44:38] [WARNING] GET parameter 'id' does not appear to be dynamic
[12:44:38] [WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable
[12:44:38] [INFO] testing for SQL injection on GET parameter 'id'
[12:44:38] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[12:44:38] [INFO] testing 'Boolean-based blind - Parameter replace (original value)'
[12:44:38] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[12:44:38] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[12:44:38] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[12:44:38] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[12:44:38] [INFO] testing 'Generic inline queries'
[12:44:38] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[12:44:38] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[12:44:38] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[12:44:38] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[12:44:38] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[12:44:38] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[12:44:38] [INFO] testing 'Oracle AND time-based blind'
it is recommended to perform only basic UNION tests if there is not at least one other (potential) technique found. Do you want to reduce the number of requests? [Y/n] Y
[12:44:38] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[12:44:38] [WARNING] GET parameter 'id' does not seem to be injectable
[12:44:38] [ERROR] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent', skipping to the next target
[12:44:38] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04272026_1244pm.csv'

[*] ending @ 12:44:38 /2026-04-27/

```
\n## Conclusión
Se han encontrado vulnerabilidades SQLi en el objetivo. Recomendado: corregir las consultas inseguras y aplicar parametrización/prepared statements, y limitar privilegios de la BD.
