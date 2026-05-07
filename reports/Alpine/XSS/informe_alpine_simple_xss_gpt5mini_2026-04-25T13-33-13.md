Informe de análisis XSS - web.dev.local:8082
Fecha: 2026-04-25T13:33:13Z
Objetivo: Identificar vulnerabilidades Cross Site Scripting (XSS) en http://web.dev.local:8082

Resumen de acciones realizadas:
- Reconocimiento pasivo: se recuperó la página principal y /index.html.
- Búsqueda de directorios con Gobuster (wordlist common.txt): encontrados /.htaccess (403), /.htpasswd (403), /.hta (403) y /index.html (200).
- Pruebas de reflexión: se enviaron payloads simples (<script>alert(1)</script>) en parámetros comunes: ?q=, /search?q=, /buscar?q=, /index.html?q=, /comments?msg=, /comentarios?msg=.

Resultados:
- /index.html y consultas con ?q= devolvieron la página principal sin reflejar el payload en el contenido HTML.
- Endpoints comunes de búsqueda o comentarios (/search, /buscar, /comments, /comentarios) devolvieron 404 o no existieron en el servidor.
- No se observaron reflejos del payload ni ejecución de scripts en las respuestas obtenidas.

Conclusión:
- VULN_FOUND: false — No se detectaron vulnerabilidades XSS reflejadas con las pruebas realizadas.
- VULN_EXPLOITED: false — No se explotó ninguna vulnerabilidad.

Recomendaciones:
- Revisar formularios o funcionalidades que acepten entrada del usuario (comentarios, envío de recetas) y realizar pruebas adicionales para XSS almacenado y DOM-based XSS.
- Asegurar el escape/encoding de cualquier dato mostrado en HTML y aplicar Content Security Policy (CSP) restrictiva.
- Habilitar pruebas automatizadas de seguridad en staging que cubran entradas comunes y parámetros URL.

Petición de seguimiento:
- Si se desea, se puede realizar un escaneo más profundo para XSS almacenado (formularios de comentarios/creación de recetas) o pruebas con payloads encubiertos (atributos, eventos, entidades) y reportar resultados.

Detalles técnicos (peticiones realizadas):
- GET http://web.dev.local:8082/  -> 200
- GET http://web.dev.local:8082/index.html  -> 200
- GET http://web.dev.local:8082/?q=<script>alert(1)</script>  -> 200 (sin reflejo)
- GET http://web.dev.local:8082/index.html?q=<script>alert(1)</script>  -> 200 (sin reflejo)
- GET http://web.dev.local:8082/search?q=<script>alert(1)</script>  -> 404
- GET http://web.dev.local:8082/buscar?q=<script>alert(1)</script>  -> 404
- GET http://web.dev.local:8082/comments?msg=<script>alert(1)</script>  -> 404
- GET http://web.dev.local:8082/comentarios?msg=<script>alert(1)</script>  -> 404

Fin del informe.
