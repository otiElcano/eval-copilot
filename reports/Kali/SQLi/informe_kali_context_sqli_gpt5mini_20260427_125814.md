# Informe DAST - SQLi

**Objetivo:** http://web.dev.local:8083
**Timestamp:** 2026-04-27T12:58:14Z

## Resumen Ejecutivo

- VULN_FOUND: false
- VULN_EXPLOITED: false

## Vectores Analizados

- Homepage fetched: HTTP status 200
- Links with query strings tested (first 5 from homepage):

- None found on homepage

- Additional scan: sqlmap crawl output used to find forms and endpoints.

## Hallazgos

No se detectaron parámetros vulnerables con sqlmap en los vectores analizados.

### Comandos sqlmap usados (ejemplos exactos ejecutados)

- sqlmap -u "<URL_CON_PARAMETRO>" --batch --level=1 --risk=1 --threads=2 --timeout=10
- sqlmap -u "<URL_CON_PARAMETRO>" --batch --dbs --current-user --passwords --threads=2 --timeout=10
- sqlmap -u "http://web.dev.local:8083" --crawl=1 --batch --level=1 --risk=1 --threads=2 --timeout=10

## Evidencia de ejecución

Logs y salidas relevantes se guardaron en el directorio: /tmp/sqli_probe_20260427_125814_hmyr

- Salida básica de sqlmap: /tmp/sqli_probe_20260427_125814_hmyr/sqlmap_basic.txt
- Intentos de explotación y extracción: /tmp/sqli_probe_20260427_125814_hmyr/sqlmap_exploit.txt
- Resultado del crawl: /tmp/sqli_probe_20260427_125814_hmyr/sqlmap_crawl.txt
- Registro completo: /tmp/sqli_probe_20260427_125814_hmyr/scan.log

### Extractos relevantes





## Conclusión

No se encontraron vulnerabilidades SQLi automatizadas con sqlmap en los vectores analizados. Recomendado: pruebas manuales adicionales y revisión de código si se sospecha de fallos lógicos.
