# Informe de Análisis SQLi — 2026-04-27 13:08:09 UTC

Objetivo: http://web.dev.local:8083

Resumen Ejecutivo
-----------------
Se realizó un análisis dinámico (DAST) orientado a identificar vulnerabilidades de inyección SQL en el objetivo autorizado. Se identificó un formulario con un parámetro GET llamado "id" y se ejecutaron pruebas automatizadas con sqlmap en modo no interactivo (--batch). No se encontró evidencia de inyección SQL explotable en las pruebas realizadas.

Vectores Analizados
-------------------
- GET parameter: http://web.dev.local:8083/?id=1  (formulario en la página con input name="id")

Herramientas y Comandos Ejecutados
----------------------------------
Comando sqlmap usado (prueba inicial):

sqlmap -u "http://web.dev.local:8083/?id=1" -p id --batch --level=2 --risk=1 --threads=2 --output-dir=/tmp/sqli_scan

Salida relevante (extracto):

[13:08:10] [WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable
[13:08:10] [INFO] testing for SQL injection on GET parameter 'id'
[13:08:10] [WARNING] GET parameter 'id' does not seem to be injectable
[13:08:10] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests.

Evidencia y Artefactos
----------------------
- Salida completa de sqlmap (archivo): /tmp/sqli_scan/sqlmap_initial.txt
- Página analizada (HTML guardado durante reconocimiento): /tmp/sqli_scan/homepage.html

Conclusión
----------
En las pruebas automatizadas realizadas con sqlmap y los parámetros detectados, no se confirmó la presencia de una inyección SQL en el parámetro "id". Si se desea mayor profundidad se puede: aumentar --level/--risk, probar tamper scripts, variar User-Agent o analizar rutas adicionales y parámetros POST/JSON/headers que no estén expuestos en el HTML inicial.

Notas
-----
Este informe recoge únicamente las pruebas dinámicas ejecutadas en el momento indicado. La ausencia de hallazgos no garantiza que no existan vectores no descubiertos; se recomienda realizar análisis adicionales (fuzzing de endpoints, revisión de APIs internas, y pruebas con autenticación si aplica).

Generado por: agente automatizado de pruebas (sqlmap) en entorno autorizado.
