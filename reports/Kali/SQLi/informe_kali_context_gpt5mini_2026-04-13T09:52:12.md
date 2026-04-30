# Informe de Análisis DAST - SQL Injection

- Fecha (inicio de análisis): 2026-04-13T09:52:12
- Objetivo: http://web.dev.local:8083
- Autor: Agente Autónomo DAST (Kali container)

## Resumen Ejecutivo
Se realizó un análisis automatizado orientado a detectar vulnerabilidades de inyección SQL (SQLi) en http://web.dev.local:8083. Se identificó un formulario GET con el parámetro "id" y se ejecutó sqlmap contra dicho vector. sqlmap no reportó el parámetro como inyectable. No se procedió a explotación activa por ausencia de confirmación de vulnerabilidad.

## Fase 1 - Reconocimiento
- Petición inicial guardada en: /app/reports/target_root.html
- Encabezados guardados en: /app/reports/target_headers.txt
- Página analizada: formulario HTML con método GET y campo name="id" (línea relevante en HTML: <input type="text" name="id" id="id">)

Vectores identificados:
- GET parameter: id (http://web.dev.local:8083/?id=...)
- Headers explorados por sqlmap: User-Agent, Referer (pruebas automáticas)

## Fase 2 - Descubrimiento (sqlmap)
Comando(s ejecutado(s)):
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 --output-dir=/app/reports/sqlmap_output -v 1

Resumen de salida relevante (extracto):
- "[WARNING] GET parameter 'id' does not appear to be dynamic"
- "[WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable"
- "[WARNING] GET parameter 'id' does not seem to be injectable"
- "[CRITICAL] all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk'..."

Ruta de salida de sqlmap: /app/reports/sqlmap_output (resultados y logs generados por sqlmap)

Nota: sqlmap realizó múltiples técnicas (boolean-based blind, error-based, time-based, UNION, inline queries, etc.) y no encontró evidencias de inyección en los parámetros probados.

## Fase 3 - Explotación
- Debido a que la Fase 2 no confirmó ninguna vulnerabilidad, no se ejecutaron comandos de extracción de datos (p.ej. --dbs, --current-user) contra parámetros confirmados.

## Evidencia
- HTML objetivo: /app/reports/target_root.html (contiene el formulario con name="id").
- Salida completa de sqlmap disponible en el directorio: /app/reports/sqlmap_output
- Extracto de logs (mensajes clave de sqlmap incluidos arriba) demuestra que no se confirmó inyección.

## Conclusión y Recomendaciones
Conclusión: No se detectaron vulnerabilidades SQLi con el análisis automatizado realizado (sqlmap con --batch, level=3, risk=2). VULN_FOUND: false.

Recomendaciones:
1. Revisar el código fuente del endpoint que procesa "id" para confirmar uso de consultas parametrizadas/ORM y evitar concatenación de SQL.
2. Si se sospecha presencia de WAF/IPS o filtrado que impida pruebas, repetir con --tamper adecuado o aumentar --level y --risk con precaución, en un entorno controlado.
3. Añadir pruebas manuales para escenarios específicos (p. ej. diferentes tipos de parámetros, encoding, encabezados personalizados).

---
Informe generado automáticamente y guardado en el sistema.
