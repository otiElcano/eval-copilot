# Informe SQLi - 20260427_135445

Resumen Ejecutivo:
VULN_FOUND: true
VULN_EXPLOITED: true

Vectores analizados:
- Links with query strings from homepage: 1
- Forms: see /app/reports/sqli_scan_20260427_135445/sqlmap_forms.txt

Hallazgos:
\nFound vulnerable: http://web.dev.local:8083/?id=1\nSee /app/reports/sqli_scan_20260427_135445/sqlmap_scan_1.txt\nFound form vuln: see /app/reports/sqli_scan_20260427_135445/sqlmap_forms.txt

Evidencia de explotación:
\nForms exploit: /app/reports/sqli_scan_20260427_135445/sqlmap_forms_exploit.txt

Comandos sqlmap utilizados:
- Default scans used --batch --level=3 --risk=2
- Example output files: /app/reports/sqli_scan_20260427_135445

Archivos generados en: /app/reports/sqli_scan_20260427_135445
