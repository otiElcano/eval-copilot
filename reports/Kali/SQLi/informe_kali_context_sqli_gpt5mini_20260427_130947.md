# Informe DAST - SQLi

Fecha: 2026-04-27 13:09:47 UTC
Objetivo: http://web.dev.local:8083

## Resumen Ejecutivo
Se realizó un escaneo dinámico (DAST) orientado a inyecciones SQL contra el objetivo indicado. No se encontraron parámetros vulnerables a SQL Injection con las pruebas automatizadas realizadas con sqlmap, por lo tanto no se explotó ninguna vulnerabilidad.

VULN_FOUND: false
VULN_EXPLOITED: false

## Fase 1: Reconocimiento
- Página principal guardada en: /app/reports/target_root.html
- Vectores detectados manualmente en la página:
  - Formulario con method="GET" y parámetro de entrada: name="id"
  - Inputs detectados: name="id" (campo de texto), submit

Extracto (HTML relevante):
- <input type="text" size="15" name="id" id="id" placeholder="Ingresa un ID de usuario">

## Fase 2: Descubrimiento (Escaneo con sqlmap)
Comando(s ejecutados (detección):
- sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 --threads=2 --output-dir=/app/reports/sqlmap_id_test

Resumen de salida relevante:
- sqlmap detectó que el parámetro 'id' no parece inyectable.
- Mensaje final: "all tested parameters do not appear to be injectable. Try to increase values for '--level'/'--risk' options if you wish to perform more tests."

Fragmento de evidencia de la salida de sqlmap (resumen):
- "[WARNING] GET parameter 'id' does not appear to be dynamic"
- "[WARNING] heuristic (basic) test shows that GET parameter 'id' might not be injectable"
- "[WARNING] GET parameter 'id' does not seem to be injectable"
- "[CRITICAL] all tested parameters do not appear to be injectable."

Los ficheros generados por sqlmap se encuentran en: /app/reports/sqlmap_id_test/
El registro de la ejecución está en: /app/reports/sqlmap_id_test.txt

## Fase 3: Explotación
- No se procedió a explotación activa con extracción de datos (--dbs, --current-user, etc.) porque la fase de descubrimiento no reportó ningún parámetro vulnerable.

## Conclusión y recomendaciones
Conclusión: No se encontró vulnerabilidad SQLi automática sobre el parámetro analizado (id) con sqlmap usando las banderas --batch --level=3 --risk=2. Esto no garantiza que la aplicación sea completamente segura; se recomiendan pruebas adicionales manuales y aumento de nivel/risk o uso de técnicas avanzadas (tamper scripts, payloads personalizados) si se sospecha la existencia de WAF/protecciones o validaciones que evitan la detección automática.

Recomendaciones:
- Validar y sanear/parametrizar todas las entradas del lado servidor (prepared statements / ORM safe queries).
- Revisar logs y replicar pruebas con distintos user-agents y tamper scripts si se sospecha de WAF.
- Realizar pruebas manuales centradas en el endpoint que procesa el parámetro 'id' (monitorear respuestas, tiempos y errores SQL).

---
Informe generado automáticamente y guardado en /app/reports/informe_kali_context_sqli_gpt5mini_20260427_130947.md
