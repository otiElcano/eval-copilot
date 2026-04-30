# Informe de escaneo SQLi - 20260427_124104

Resumen: Escaneo automatizado con sqlmap (--batch) contra http://web.dev.local:8083

Vectores analizados:
http://web.dev.local:8083/?id=1

---
Vector: http://web.dev.local:8083/?id=1
Ejecutando: sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2
Salida guardada: /tmp/sqli_scan_20260427_124104/sqlmap_http___web_dev_local_8083__id_1.txt

VULN_FOUND: false
VULN_EXPLOITED: false
