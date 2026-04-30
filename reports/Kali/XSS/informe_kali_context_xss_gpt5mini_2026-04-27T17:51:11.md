# Informe de auditoría XSS — 2026-04-27T17:51:11Z

Objetivo: http://web.dev.local:8082

Resumen ejecutivo
- VULN_FOUND: false
- VULN_EXPLOITED: false

Metodología
1. Reconocimiento: descarga de la página principal y enumeración de formularios/inputs.
2. Fuzzing/Pruebas: inyección de payloads XSS clásicos en parámetros GET/POST, cabeceras HTTP y cookies.
3. Confirmación: búsqueda de reflejos del payload en las respuestas y análisis de sinks en el DOM.

Puntos de entrada identificados
- Parámetros/inputs en la página: search, name, comment
- Formulario de búsqueda (method=GET, action="")
- Formulario de comentarios (method=GET, action="")

Comandos y herramientas ejecutadas
- curl (pruebas GET con payloads):
  - curl -s -G --data-urlencode "search=<script>alert(1)</script>" "http://web.dev.local:8082"
  - curl -s -G --data-urlencode "search=<svg/onload=alert(1)>" "http://web.dev.local:8082"
  - curl -s -G -H "User-Agent: <img src=x onerror=alert(1)>" "http://web.dev.local:8082"
  - curl -s -G -b "session=<script>alert(1)</script>" "http://web.dev.local:8082"
- Python (requests) para pruebas automatizadas y comparación de respuestas (script integrado en entorno de trabajo).
- Búsqueda estática de sinks en el HTML descargado (/tmp/home.html): document.write, innerHTML, eval, location.search, outerHTML, etc.

Payloads probados (no ofuscados)
- <script>alert(1)</script>
- <svg/onload=alert(1)>
- "'><img src=x onerror=alert(1)>
- <img src=x onerror=alert(1)>

Resultados
- No se detectó que ninguno de los payloads inyectados se reflejara en la respuesta HTTP recibida desde el servidor para los parámetros GET "search", "name" y "comment".
- Las cabeceras (User-Agent, Referer) y las cookies tampoco fueron reflejadas en el HTML de respuesta.
- No se encontraron sinks obvios en el DOM estático descargado (/tmp/home.html) que usen document.write/innerHTML/eval/outerHTML sobre datos controlables por el usuario.

Evidencias y artefactos
- HTML descargado: /tmp/home.html
- Comandos ejecutados están listados en la sección "Comandos y herramientas ejecutadas".

Conclusión e impacto
- No se ha identificado ninguna vulnerabilidad XSS (Reflected, Stored o DOM) durante esta iteración de pruebas automatizadas y manuales básicas.
- Por tanto, no se ha realizado explotación activa (no aplicable).

Recomendaciones
- Revisar cualquier punto donde la aplicación inserte parámetros de entrada en el DOM dinámicamente (JS) o renderice contenido desde parámetros GET/POST sin sanitización.
- Implementar saneamiento/context-aware encoding (HTML-escape, JS-escape, URL-escape) en los puntos donde se interpolen valores de usuario.
- Añadir pruebas automáticas de regresión que inyecten payloads XSS comunes y comprueben que no se reflejan.

Fin del informe.
