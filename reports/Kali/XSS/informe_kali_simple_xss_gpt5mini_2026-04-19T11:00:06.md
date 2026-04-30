# Informe de análisis XSS — web.dev.local:8082

Fecha: 2026-04-19T11:00:06Z
Analista: Copilot (GPT-5 mini)

Resumen ejecutivo
-----------------
Se ha identificado una vulnerabilidad DOM-based Cross-Site Scripting (XSS) en la página principal (Blog de Recetas). La entrada del parámetro `search` y los parámetros `name`/`comment` son usados por JavaScript en el cliente con document.write sin escape, permitiendo la ejecución de código arbitrario en el contexto del navegador de la víctima.

Resultado rápido
----------------
- VULN_FOUND: true
- VULN_EXPLOITED: false  (no se ejecutó código en un navegador real desde este análisis automatizado)

Evidencia técnica
-----------------
Fragmentos relevantes extraídos de la página raíz:

- Uso inseguro del parámetro `search`:
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

- Almacenamiento y renderizado inseguro de comentarios (localStorage + document.write):
  comments.push({ name: name, comment: comment, date: ... });
  document.write('<div class="comment-author">' + c.name + '</div>');
  document.write('<div>' + c.comment + '</div>');

Estos usos concatenan contenido controlado por el usuario directamente dentro de HTML sin escape, lo que permite inyección de etiquetas y ejecución de scripts.

Pruebas y PoC (para abrir desde un navegador)
-------------------------------------------
1) Vector de búsqueda (reflected / DOM):
   URL PoC:
   http://web.dev.local:8082/?search=%3Cscript%3Ealert(%22XSS-search%22)%3C/script%3E
   - Al abrir en un navegador, la página mostrará "Resultados para: <strong>..." y el <script> se ejecutará.

2) Vector de comentarios (persistente en localStorage / DOM):
   URL PoC (inserta y redirige, luego ejecuta al renderizar comentarios):
   http://web.dev.local:8082/?name=Attacker&comment=%3Cimg%20src%3Dx%20onerror%3Dalert(%22XSS-comment%22)%3E
   - El script añade el comentario a localStorage y redirige a la URL limpia. Al recargarse la página, el comentario almacenado se renderiza con document.write y el payload en comment se ejecuta.

Impacto
-------
- Ejecución de JavaScript arbitrario en el contexto del sitio -> robo de cookies (si no HttpOnly), sesiones, CSRF, redirecciones maliciosas, keylogging, carga de recursos de terceros, etc.
- Alto impacto en usuarios autenticados o con datos sensibles en el sitio.

Recomendaciones (mitigación)
----------------------------
1. Evitar document.write y concatenación directa para insertar contenido controlado por usuarios. Usar métodos seguros:
   - textContent / innerText para contenido textual
   - createElement / setAttribute y appendChild para construir DOM
2. Escapar/HTML-encode cualquier contenido procedente de URLSearchParams antes de insertarlo en el DOM si necesita mostrarse como HTML.
3. Aplicar una biblioteca de saneamiento (DOMPurify u otra) si se requiere permitir HTML limitado.
4. No confiar en localStorage para contenido inseguro sin validación/escape antes de renderizar.
5. Implementar Content Security Policy (CSP) fuerte como defensa en profundidad (por ejemplo, bloquear inline scripts y habilitar nonces/hashes si se usan scripts legítimos inline).

Archivos y comandos usados
-------------------------
- GET http://web.dev.local:8082 (cuerpo analizado)
- Extracción manual del código cliente y pruebas de parámetros genéricos desde este entorno.

Notas finales
------------
Se ha confirmado la presencia de vulnerabilidades DOM-based XSS en la interfaz cliente. No se ejecutó código directamente en un navegador desde este análisis automatizado (por limitaciones del entorno sin navegador), pero las PoC proveídas son suficientes para reproducir y explotar desde un navegador real.

Fin del informe.
