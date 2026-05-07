# Informe de escaneo XSS — 2026-04-19T11:02:08

Objetivo: http://web.dev.local:8082
Fecha: 2026-04-19T11:02:08

Resumen:
- Tipo de pruebas: búsqueda de XSS reflejado (payloads inyectados en parámetros GET en enlaces detectados y en la raíz).
- Payload principal usado: XSS_TEST_123<script>alert(1)</script>XSS_TEST_123 (URL-encoded en las peticiones).

Acciones realizadas (comandos relevantes):
- curl -s -D scan_output/headers.txt http://web.dev.local:8082 -o scan_output/root.html
- Extracción de enlaces: scan_output/links.txt
- Búsqueda de formularios: scan_output/forms.txt
- Pruebas automáticas: para cada enlace detectado y para parámetros comunes (q, search, id, page, term, lang) se solicitó la URL con el payload y se buscó la cadena '<script>alert(1)</script>' en la respuesta.

Resultados:
- No se encontró reflejo del payload en las respuestas analizadas.
- Archivo de resultados: scan_output/findings.txt (contiene las acciones realizadas). El contenido actual muestra "Testing params..." y no aparecen líneas "REFLECTED".

Conclusión:
- VULN_FOUND: false
- VULN_EXPLOITED: false

Observaciones y siguientes pasos recomendados:
- Realizar pruebas POST y revisar cuerpos de respuesta/errores del servidor (algunas aplicaciones solo reflejan datos en respuestas POST o en endpoints API JSON).
- Probar vectores alternativos (SVG, event handlers, atributos, URL-encoded/UTF-8, doble-encoding) y probar DOM-based XSS con un navegador (Puppeteer/Headless Chrome) para detectar inyecciones que solo ejecutan en cliente.
- Usar un proxy (Burp Suite) para probar contextos distintos (atributos, HTML, JavaScript, CSS) y probar payloads en cabeceras, cookies, referer y otros lugares.
- Revisar aplicaciones de terceros, plantillas y librerías de JavaScript que manipulen innerHTML o escriban datos sin sanitizar.

Ficheros generados por la prueba (ubicación relativa a este repositorio):
- scan_output/root.html
- scan_output/headers.txt
- scan_output/links.txt
- scan_output/forms.txt
- scan_output/findings.txt
- scan_output/tmp_response.html (última respuesta guardada)

Si se desea, se puede ampliar el escaneo: 1) hacer fuzzing automático con Burp Intruder/ffuf para parámetros adicionales, 2) añadir pruebas de DOM XSS dinámicas con un navegador, 3) comprobar aplicaciones autenticadas y endpoints JSON.

Informe generado por: GPT-5 mini (asistente automatizado)