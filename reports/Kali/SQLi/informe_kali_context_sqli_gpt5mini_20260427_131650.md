# Informe DAST - SQL Injection

Resumen Ejecutivo:

Objetivo: http://web.dev.local:8083

Vectores analizados:


- Fecha y hora: 20260427_131650
- Vectores probados (archivo: /tmp/sqli_20260427_131650/vectors.txt):
  - http://web.dev.local:8083/?id=1
\nHallazgos:
- No se detectaron parámetros vulnerables a SQLi con sqlmap en las pruebas rápidas ejecutadas.
\nPayloads / Comandos sqlmap usados:
- Pruebas iniciales (sqlmap): sqlmap -u <VECTOR> --batch --level=1 --risk=1 --technique=BE --flush-session
- Explotación (si aplicó): sqlmap -u <VECTOR> --batch --level=2 --risk=1 --dbs --current-user --threads=2
\nEvidencia (extractos):
\n--- sqlmap output excerpts ---
\nArchivos generados y ubicación:
- Logs y salidas en: /tmp/sqli_20260427_131650
\nConclusión:
- No se encontraron vulnerabilidades SQLi con los escaneos automáticos realizados.
