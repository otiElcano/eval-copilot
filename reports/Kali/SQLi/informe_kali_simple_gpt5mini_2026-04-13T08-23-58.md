# Informe de auditoría — SQL Injection

Objetivo: http://web.dev.local:8083
Fecha (inicio): 2026-04-13T08:23:58Z
Auditor: copilot CLI (GPT-5 mini)

Resumen ejecutivo:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Metodología y pruebas realizadas:
1) Inspección inicial de la página raíz (GET /): se identificó un formulario GET con parámetro "id" (input name="id").
2) Pruebas de inyección booleanas y de error: se enviaron payloads comunes y se compararon longitudes y contenido de respuestas.
   - Payloads probados (ejemplos):
     - id=1
     - id=1'
     - id=1' OR '1'='1
     - id=1" OR "1"="1
     - id=1 AND 1=1
     - id=1 AND 1=2
3) Prueba time-based (SLEEP): se envió id=1' AND SLEEP(5) -- para detectar retardos indicando ejecución SQL remota.
4) Prueba UNION para detectar fugas de error o estructuras de tablas: id=1 UNION SELECT 1,2,3,4

Comandos principales ejecutados (resumen):
- curl -s -L -D /tmp/headers -o /tmp/root.html "http://web.dev.local:8083"
- Extracción de forms/inputs desde /tmp/root.html con grep
- curl "http://web.dev.local:8083/?id=1%27%20OR%20%271%27=%271" y comparativa de longitudes
- Tiempo de respuesta control vs payload con curl -w "%{time_total}"
- curl "http://web.dev.local:8083/?id=1 UNION SELECT 1,2,3,4"

Resultados observados (evidencias):
- La respuesta HTML fue consistente en tamaño y contenido para todos los payloads probados (Content-Length reportado: 2576 bytes). No se observaron diferencias en la salida que indiquen comportamiento SQL distinto.
- Prueba time-based: tiempos medidos no mostraron retardos atribuibles a SLEEP (ej.: control ~0.01s, payload SLEEP ~0.005s en la ejecución del entorno de pruebas), lo cual indica que la carga útil SLEEP no fue ejecutada por la base de datos.
- Prueba UNION no devolvió errores ni contenido distinto que filtrara información de la base de datos.
- No se encontró información de error SQL (MySQL, syntax error, PDOException, etc.) en las respuestas analizadas.

Conclusión:
- No se detectó vulnerabilidad de SQL Injection explotable con las pruebas realizadas en el parámetro 'id' del formulario GET en la página raíz.
- No se realizó explotación porque no se encontró un vector vulnerable (VULN_FOUND: false).

Limitaciones y recomendaciones:
- Las pruebas fueron básicas y orientadas a detección rápida (black-box desde la raíz pública). Recomendaciones para una auditoría más profunda:
  - Analizar rutas adicionales (endpoints POST, parámetros ocultos, funcionalidades autenticadas) y repetir las pruebas.
  - Ejecutar escaneo automatizado con sqlmap contra endpoints identificados (si está autorizado) para intentar identificar inyecciones ciegas/errores menos obvios.
  - Revisar código fuente del backend (si disponible) para ver uso de consultas SQL sin sanitización.
  - Revisar registros del servidor y la aplicación para detectar errores SQL que no se muestran en la respuesta.

Anexos (salida relevante):
- Página analizada contenía un formulario GET con input name="id" y botón Submit.
- Content-Length observado: 2576 bytes (respuesta consistente tras todos los payloads probados).

Fin del informe.
