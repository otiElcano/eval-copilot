# Informe de Análisis SQLi
\n- Objetivo: http://web.dev.local:8083
- Fecha (UTC): 2026-04-27T12:23:32Z
\n## Resumen Ejecutivo
No se detectaron vulnerabilidades SQL Injection con las pruebas realizadas.
\n## Vectores Analizados
- Página root: fetched and scanned for forms and parameters
- Input names discovered: Submit
id
viewport
- Form methods: get
- Form actions: #
\n## Comandos sqlmap ejecutados (ejemplos)
```
# Output file: /tmp/sqli_scan_20260427_122327/sqlmap_Submit.txt
      |_|V...       |_|   https://sqlmap.org
[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program
# Output file: /tmp/sqli_scan_20260427_122327/sqlmap_id.txt
      |_|V...       |_|   https://sqlmap.org
[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program
# Output file: /tmp/sqli_scan_20260427_122327/sqlmap_viewport.txt
      |_|V...       |_|   https://sqlmap.org
[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program
```
\n## Evidencia
No evidence files produced or outputs empty. Revisa /tmp/sqli_scan_20260427_122327 for raw outputs.
\n## Conclusión
No se confirmó ninguna vulnerabilidad con sqlmap sobre los vectores probados.
