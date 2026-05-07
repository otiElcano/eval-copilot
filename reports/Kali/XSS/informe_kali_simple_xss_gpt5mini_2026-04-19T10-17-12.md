Informe de análisis XSS — 2026-04-19T10:17:12

Resumen:
Se ha auditado http://web.dev.local:8082 buscando vulnerabilidades Cross-Site Scripting (XSS). Se identificó XSS de tipo DOM (reflejado/almacenado en cliente) en el manejo de parámetros GET por JavaScript en la página principal.

Detalles técnicos:
- Vector(s) vulnerables: parámetros GET `search`, `name`, y `comment`.
- Evidencia: el código cliente usa document.write() con valores tomados de URLSearchParams (urlParams.get('search'), urlParams.get('name'), urlParams.get('comment')) sin escape/validación.
- Tipo: DOM-based XSS (reflejado y stored en localStorage porque los comentarios se guardan en localStorage y son renderizados posteriormente con document.write()).

Prueba de concepto (PoC):
Abrir en un navegador cualquiera (ejemplo):
- Reflected XSS (search):
  http://web.dev.local:8082/?search=<script>alert(1)</script>
- Reflected/stored via comments (name+comment):
  http://web.dev.local:8082/?name=Victim&comment=<script>alert(document.domain)</script>
Al cargar la URL, el script inyectado se inserta en el DOM por document.write y se ejecutará, mostrando el alert y confirmando la ejecución de JS arbitrario.

Explotación realizada: No se ejecutó exploit remoto desde este entorno (herramientas HTTP como curl no evalúan JS). Se verificó el código fuente y comportamiento JS que permite la explotación en un navegador real.

Impacto:
- Ejecución de JS arbitrario en contexto de la página: robo de cookies (si no están marcadas HttpOnly), manipulación de DOM, keylogging, CSRF por XHR en sesión autenticada, persistencia local (localStorage).

Recomendaciones:
1. Evitar document.write/innerHTML con contenido no saneado. Usar textContent o crear nodos DOM seguros.
2. Escapar/filtrar valores provenientes de URL antes de insertarlos en el DOM (HTML-escape).
3. Para almacenamiento/display, sanitizar contenido antes de guardar y al renderizar.
4. Añadir Content Security Policy (CSP) restrictiva (p.ej. bloqueo de inline scripts) como defensa en profundidad.

Archivos relacionados:
- Página analizada: / (homepage) — el script vulnerable está integrado en el HTML enviado por el servidor y procesa URLSearchParams en cliente.

Conclusión:
Vulnerabilidad confirmada (DOM XSS). PoC disponible (URLs arriba). Explotación práctica requiere navegador: no se ejecutó payload en este entorno automatizado.
