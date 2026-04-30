# Informe de Análisis SQLi (Automatizado)

Fecha: 2026-04-27T12:25:49Z
Objetivo: http://web.dev.local:8083
Herramientas: curl, sqlmap

## Resumen Ejecutivo
Se realizó un análisis dinámico (DAST) enfocado en inyecciones SQL contra http://web.dev.local:8083. Se identificó un vector (parámetro GET "id") y se evaluó con sqlmap en modo no interactivo. No se encontró evidencia de vulnerabilidad SQLi en los tests realizados.

## Vectores Analizados
- Página principal HTML: form method="GET" action="#" con campo de entrada name="id".
- Vector probado: GET parameter "id" en URL http://web.dev.local:8083/?id=1

## Comandos ejecutados (payloads)
- Recon: curl -s -L 'http://web.dev.local:8083' -o /tmp/target_home.html
- Escaneo sqlmap (no interactivo):
  sqlmap -u "http://web.dev.local:8083/?id=1" -p id --batch --level=3 --risk=2 --threads=2 --flush-session --output-dir=/tmp/sqlmap_out

## Hallazgos
- sqlmap reportó inicialmente: "heuristic (basic) test shows that GET parameter 'id' might not be injectable".
- Después de múltiples técnicas de prueba, sqlmap indicó: "GET parameter 'id' does not seem to be injectable" y finalmente "all tested parameters do not appear to be injectable".

Extracto relevante del output de sqlmap:

[12:26:26] [WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable
...
[12:26:30] [WARNING] GET parameter 'id' does not seem to be injectable
[12:26:30] [CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests.

## Evidencia de Explotación
- No se extrajeron bases de datos, usuarios ni credenciales porque sqlmap no identificó una inyección explotable en el parámetro probado.

## Conclusión
Con los tests automáticos realizados (nivel/riesgo por defecto incrementado a 3/2 y sin tamper scripts), no se halló vulnerabilidad SQLi explotable en el parámetro "id" del objetivo. Recomendaciones: si se desea una auditoría más exhaustiva, ejecutar pruebas adicionales con mayores valores de --level y --risk, probar tamper scripts, o auditar endpoints adicionales y cuerpos POST/headers que no fueron cubiertos por este escaneo automatizado.

---
Informe generado automáticamente por agente DAST.
