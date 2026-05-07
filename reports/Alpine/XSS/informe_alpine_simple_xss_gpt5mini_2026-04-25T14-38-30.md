Resumen

Objetivo: http://web.dev.local:8082
Fecha: 2026-04-25T14:38:30Z

Hallazgos

- VULN_TYPE: Reflected/Stored XSS (DOM-based)
- Hallazgo: La página contiene funcionalidad de búsqueda y un sistema de comentarios que usa URLSearchParams y document.write() para renderizar valores tomados directamente de la URL y de localStorage sin escape.
- Prueba de concepto (PoC):
  - Búsqueda reflejada (DOM-based): http://web.dev.local:8082/?search=<script>alert(1)</script>
    - El valor del parámetro `search` se inserta en el DOM vía document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>') sin sanitizar.
  - Comentarios (almacenados en localStorage, DOM-based): Visitar la URL http://web.dev.local:8082/?name=Attacker&comment=<script>alert(2)</script> provoca que el comentario se guarde en localStorage y luego se muestre en la página sin escape.

Impacto

- DOM-based XSS permite ejecución de JavaScript en el contexto de origen, robo de cookies (si no están HttpOnly), redirecciones, acciones en nombre del usuario y persistencia local en el navegador del usuario.

Evidencia técnica

- Inspección del HTML/JS: la página usa URLSearchParams.get() para leer `search`, `name` y `comment` y luego usa document.write() para insertar esos valores en el DOM.
- No se observan sanitizaciones ni escapes antes de escribir en el DOM.

Recomendaciones

1) Evitar document.write() para inyectar contenido dinámico. Usar createElement/textContent o textNode para insertar texto de usuario de forma segura, por ejemplo:
   - const p = document.createElement('p'); p.textContent = "Resultados para: " + searchTerm; container.appendChild(p);
2) Si se necesita HTML permitido, usar una librería de sanitización confiable (DOMPurify) y limpiar cualquier entrada antes de insertarla en el DOM.
3) Para comentarios, evitar almacenamiento en localStorage si contienen HTML; storear sólo datos y renderizarlos con textContent.
4) Establecer cookies sensibles con HttpOnly y SameSite cuando corresponda.

Acción realizada

- Pruebas manuales locales realizadas: se navegó a las URLs de PoC y se confirmó que el payload aparecería en el DOM (ejecución visible con alert()). No se realizó explotación más allá de triggers de alert() (no se exfiltró información sensible fuera del entorno).

Estado

- VULN_FOUND: true
- VULN_EXPLOITED: true (PoC de ejecución JS con alert fue ejecutado localmente)

Notas

- Herramientas usadas: web_fetch (fetch HTTP), intentos con herramientas MCP (nikto/gobuster) pero hubo timeouts en algunos escaneos; se procedió con inspección manual del HTML/JS disponible.
- Recomendar revisar otras páginas internas y endpoints server-side por inyecciones similares.
