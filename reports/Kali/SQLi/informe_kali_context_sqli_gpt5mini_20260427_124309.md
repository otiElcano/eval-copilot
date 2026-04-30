# Informe DAST - SQLi

**Fecha:** $(date -u +"%Y-%m-%d %H:%M:%SZ")

## Objetivo
- http://web.dev.local:8083

## Resumen Ejecutivo
Se realizó un escaneo dinámico enfocado en la detección de inyecciones SQL (SQLi) contra el objetivo indicado. Se identificó un formulario GET que expone el parámetro `id`. Se ejecutó sqlmap contra ese parámetro con opciones no interactivas y niveles de prueba aumentados. No se detectó que el parámetro sea vulnerable a inyección SQL con las pruebas realizadas; por tanto, no fue posible explotarlo ni extraer datos.

## Vectores Analizados
- GET /?id= (formulario en la página principal)

## Herramientas y comandos ejecutados
- curl para descargar la página:
  - curl -s -D /tmp/headers.txt -o /tmp/body.html 'http://web.dev.local:8083'
- Escaneo con sqlmap (detección):
  - sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 --threads=2 --output-dir=/tmp/sqlmap_output

## Hallazgos
- Parámetro analizado: `id` (GET)
- Resultado del escaneo: sqlmap reportó que el parámetro no parece ser inyectable con las técnicas probadas.

### Salida (extracto) de sqlmap
```
[12:42:37] [INFO] testing 'PostgreSQL AND error-based - WHERE or HAVING clause'
[12:42:37] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)'
[12:42:37] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONVERT)'
[12:42:37] [INFO] testing 'Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (CONCAT)'
[12:42:37] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (XMLType)'
[12:42:37] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (UTL_INADDR.GET_HOST_ADDRESS)'
[12:42:37] [INFO] testing 'Oracle AND error-based - WHERE or HAVING clause (CTXSYS.DRITHSX.SN)'
[12:42:37] [INFO] testing 'Firebird AND error-based - WHERE or HAVING clause'
[12:42:37] [INFO] testing 'MonetDB AND error-based - WHERE or HAVING clause'
[12:42:37] [INFO] testing 'Vertica AND error-based - WHERE or HAVING clause'
[12:42:38] [INFO] testing 'IBM DB2 AND error-based - WHERE or HAVING clause'
[12:42:38] [INFO] testing 'ClickHouse AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause'
[12:42:38] [INFO] testing 'MySQL >= 5.1 error-based - PROCEDURE ANALYSE (EXTRACTVALUE)'
[12:42:38] [INFO] testing 'MySQL >= 5.6 error-based - Parameter replace (GTID_SUBSET)'
[12:42:38] [INFO] testing 'MySQL >= 5.1 error-based - Parameter replace (EXTRACTVALUE)'
[12:42:38] [INFO] testing 'PostgreSQL error-based - Parameter replace'
[12:42:38] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Parameter replace'
[12:42:38] [INFO] testing 'Oracle error-based - Parameter replace'
[12:42:38] [INFO] testing 'MySQL >= 5.6 error-based - ORDER BY, GROUP BY clause (GTID_SUBSET)'
[12:42:38] [INFO] testing 'MySQL >= 5.1 error-based - ORDER BY, GROUP BY clause (EXTRACTVALUE)'
[12:42:38] [INFO] testing 'PostgreSQL error-based - ORDER BY, GROUP BY clause'
[12:42:38] [INFO] testing 'Microsoft SQL Server/Sybase error-based - Stacking (EXEC)'
[12:42:38] [INFO] testing 'Generic inline queries'
[12:42:38] [INFO] testing 'MySQL inline queries'
[12:42:38] [INFO] testing 'PostgreSQL inline queries'
[12:42:38] [INFO] testing 'Microsoft SQL Server/Sybase inline queries'
[12:42:38] [INFO] testing 'Oracle inline queries'
[12:42:38] [INFO] testing 'SQLite inline queries'
[12:42:38] [INFO] testing 'Firebird inline queries'
[12:42:38] [INFO] testing 'ClickHouse inline queries'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[12:42:38] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[12:42:38] [INFO] testing 'PostgreSQL > 8.1 stacked queries (comment)'
[12:42:38] [INFO] testing 'PostgreSQL stacked queries (heavy query - comment)'
[12:42:38] [INFO] testing 'PostgreSQL < 8.2 stacked queries (Glibc - comment)'
[12:42:38] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (comment)'
[12:42:38] [INFO] testing 'Microsoft SQL Server/Sybase stacked queries (DECLARE - comment)'
[12:42:38] [INFO] testing 'Oracle stacked queries (DBMS_PIPE.RECEIVE_MESSAGE - comment)'
[12:42:38] [INFO] testing 'Oracle stacked queries (heavy query - comment)'
[12:42:38] [INFO] testing 'IBM DB2 stacked queries (heavy query - comment)'
[12:42:38] [INFO] testing 'SQLite > 2.0 stacked queries (heavy query - comment)'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP)'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (SLEEP - comment)'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP - comment)'
[12:42:38] [INFO] testing 'MySQL < 5.0.12 AND time-based blind (BENCHMARK)'
[12:42:38] [INFO] testing 'MySQL > 5.0.12 AND time-based blind (heavy query)'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind'
[12:42:38] [INFO] testing 'MySQL >= 5.0.12 RLIKE time-based blind (query SLEEP)'
[12:42:38] [INFO] testing 'MySQL AND time-based blind (ELT)'
[12:42:38] [INFO] testing 'PostgreSQL > 8.1 AND time-based blind'
[12:42:38] [INFO] testing 'PostgreSQL AND time-based blind (heavy query)'
[12:42:38] [INFO] testing 'Microsoft SQL Server/Sybase time-based blind (IF)'
[12:42:38] [INFO] testing 'Microsoft SQL Server/Sybase AND time-based blind (heavy query)'
[12:42:38] [INFO] testing 'Oracle AND time-based blind'
[12:42:38] [INFO] testing 'Oracle AND time-based blind (heavy query)'
[12:42:39] [INFO] testing 'IBM DB2 AND time-based blind (heavy query)'
[12:42:39] [INFO] testing 'SQLite > 2.0 AND time-based blind (heavy query)'
[12:42:39] [INFO] testing 'Informix AND time-based blind (heavy query)'
[12:42:39] [INFO] testing 'MySQL >= 5.1 time-based blind (heavy query) - PROCEDURE ANALYSE (EXTRACTVALUE)'
[12:42:39] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace'
[12:42:39] [INFO] testing 'MySQL >= 5.0.12 time-based blind - Parameter replace (substraction)'
[12:42:39] [INFO] testing 'PostgreSQL > 8.1 time-based blind - Parameter replace'
[12:42:39] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_LOCK.SLEEP)'
[12:42:39] [INFO] testing 'Oracle time-based blind - Parameter replace (DBMS_PIPE.RECEIVE_MESSAGE)'
[12:42:39] [INFO] testing 'MySQL >= 5.0.12 time-based blind - ORDER BY, GROUP BY clause'
[12:42:39] [INFO] testing 'PostgreSQL > 8.1 time-based blind - ORDER BY, GROUP BY clause'
[12:42:39] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_LOCK.SLEEP)'
[12:42:39] [INFO] testing 'Oracle time-based blind - ORDER BY, GROUP BY clause (DBMS_PIPE.RECEIVE_MESSAGE)'
[12:42:39] [INFO] testing 'Generic UNION query (NULL) - 1 to 10 columns'
[12:42:39] [INFO] testing 'Generic UNION query (random number) - 1 to 10 columns'
[12:42:39] [INFO] testing 'MySQL UNION query (NULL) - 1 to 10 columns'
[12:42:39] [INFO] testing 'MySQL UNION query (random number) - 1 to 10 columns'
[12:42:39] [WARNING] parameter 'Referer' does not seem to be injectable
[12:42:39] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests. If you suspect that there is some kind of protection mechanism involved (e.g. WAF) maybe you could try to use option '--tamper' (e.g. '--tamper=space2comment') and/or switch '--random-agent'

[*] ending @ 12:42:39 /2026-04-27/

```

## Evidencia de Explotación
- No se logró explotar ni extraer datos; no hay nombres de usuario ni contraseñas recuperadas.

## Conclusión
- Vectores probados: parámetro GET `id` del formulario principal.
- Resultado: No se identificó vulnerabilidad SQLi con sqlmap usando las opciones indicadas (--batch, level=3, risk=2).
- Recomendaciones: Si se sospecha bloqueo por WAF o sanitización parcial, ejecutar pruebas adicionales con --tamper o aumentando --level/--risk y revisar la lógica servidor-side; revisar también endpoints API que puedan procesar entradas sin sanitizar.

---
Informe generado automáticamente y guardado en este fichero.
