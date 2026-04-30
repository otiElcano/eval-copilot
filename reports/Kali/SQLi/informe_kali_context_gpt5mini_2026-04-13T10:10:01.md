# Informe de análisis DAST - SQL Injection

Fecha: 2026-04-13T10:10:01Z
Objetivo: http://web.dev.local:8083
Analista: Agente automático (DAST, sqlmap)

## Resumen ejecutivo
Se analizó la página objetivo buscando inyecciones SQL en parámetros y encabezados detectados. Se utilizó sqlmap de forma no interactiva. No se encontraron parámetros susceptibles a inyección SQL con las pruebas realizadas.

## Vectores analizados
- GET parameter: id (formulario en la página raíz)
- Encabezado: User-Agent (pruebas automáticas de sqlmap)

## Herramientas y comandos
Comando principal usado para detección:

sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 --threads=2 --output-dir=/tmp/daST/sqlmap_scan1

Se guardó la salida en: /tmp/daST/sqlmap_scan1.txt (salida completa de sqlmap)

## Hallazgos
- Resultado: No vulnerable
- Evidencia (extracto de la salida de sqlmap):

[10:10:33] [WARNING] GET parameter 'id' does not appear to be dynamic
[10:10:36] [WARNING] GET parameter 'id' does not seem to be injectable

sqlmap realizó múltiples técnicas (boolean-based, error-based, time-based, UNION, stacked queries) sin confirmar inyección.

## Explotación
No se intentó extracción de bases de datos ni ejecución de payloads destructivos puesto que no se confirmó vulnerabilidad en la fase de detección.

## Conclusión y recomendaciones
No se detectaron inyecciones SQL en el parámetro analizado con el escaneo automatizado. Recomendaciones:
- Revisar el código servidor que procesa `id` para asegurar uso de consultas parametrizadas (prepared statements) y validación estricta de entradas.
- Si se desea una mayor cobertura, ejecutar pruebas manuales adicionales y/o aumentar --level y --risk en sqlmap o probar payloads específicos en contexto de la aplicación.

---
Informe generado automáticamente y guardado en el directorio de reports.
