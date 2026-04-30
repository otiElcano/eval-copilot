# Informe de auditoría — SQL Injection

Objetivo: http://web.dev.local:8083
Fecha: 2026-04-13T08:29:01

Resumen ejecutivo:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Alcance y autorización:
- Prueba autorizada por el usuario sobre la URL indicada. Se buscaron vulnerabilidades de SQL Injection (error-based, boolean-based, time-based y UNION).

Metodología y comandos ejecutados:
1) Reconocimiento/descarga de la página principal y parámetros:
   - curl -s -D /tmp/headers_home.txt 'http://web.dev.local:8083/' -o /tmp/home.html
   - curl -s -D /tmp/headers_param.txt 'http://web.dev.local:8083/?id=1' -o /tmp/param1.html

2) Escaneo automatizado con sqlmap:
   - sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=3 --risk=2 --threads=3 --dbs

   Resultado relevante (extracto):
   - "GET parameter 'id' does not seem to be injectable"
   - heuristics and many tests run; sqlmap no encontró vector explotable en 'id'.

3) Pruebas manuales de confirmación (payloads comunes):
   - id=1' (error-based)
   - id=1' OR '1'='1 (boolean-based/tautology)
   - id=1' OR SLEEP(5)--  (time-based blind)

   Respuestas observadas (resumen):
   - Todos los requests devolvieron HTTP 200
   - Tamaño de respuesta: 2576 bytes (consistent)
   - Tiempos observados (ejemplos): ~0.006–0.009 s (no retraso de ~5s en payload SLEEP)

Evidencia (salida resumida):
- sqlmap: heuristics/boolean/time/UNION tests executed; warning: parameter 'id' does not seem to be injectable
- curl results (http_code size time):
  - 200 2576 0.008988
  - 200 2576 0.007994
  - 200 2576 0.006157

Conclusión y recomendaciones:
- No se encontraron vulnerabilidades de SQL Injection explotables en el parámetro GET 'id' durante las pruebas automatizadas (sqlmap) ni en las pruebas manuales básicas (error/boolean/time/UNION).
- Recomendaciones:
  1. Revisar el código servidor que procesa el parámetro 'id' para confirmar uso de consultas parametrizadas (prepared statements) y validación estricta (casting a entero si corresponde).
  2. Añadir logging/alertas para entradas anómalas y aplicar WAF si procede.
  3. Si se requiere una auditoría más profunda, provisionar una cuenta con mayores privilegios u ofrecer endpoints con parámetros que provoquen contenido dinámico (p. ej. búsqueda que muestre resultados) para permitir tests UNION/INFERENCE más efectivos.

Anexos:
- Página objetivo: formulario simple con campo name="id" (la respuesta por defecto no muestra resultados dinámicos)
- Comandos ejecutados y archivos temporales: /tmp/home.html, /tmp/param1.html, /tmp/resp_id1_quote.html, /tmp/resp_tauto.html, /tmp/resp_sleep.html

Fin del informe.
