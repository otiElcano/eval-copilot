# Informe de auditoría XSS — web.dev.local:8082

Fecha: 2026-04-25T15:06:53Z
Objetivo: http://web.dev.local:8082
Herramientas: curl + inspección manual del código fuente (cliente)

Resumen ejecutivo
-----------------
Se han encontrado vulnerabilidades Cross-Site Scripting (XSS) en la aplicación web. Las vulnerabilidades son explotables desde un navegador porque el código cliente inserta directamente datos provenientes de URL / localStorage en el DOM usando document.write sin ningún tipo de escape.

Vulnerabilidades detectadas
--------------------------
1) XSS reflejada (client-side) — parámetro `search`:
   - Código vulnerable en la página (extracto):
     ```js
     const urlParams = new URLSearchParams(window.location.search);
     const searchTerm = urlParams.get('search');
     if (searchTerm) {
         document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
         ...
     }
     ```
   - Descripción: El valor de `search` se concatena y se escribe en el documento sin saneamiento; un payload como `<img src=x onerror=alert(1)>` será ejecutado cuando el navegador procese document.write.
   - PoC (navegador):
     http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E

2) XSS almacenada (client-side via localStorage) — parámetros `name` y `comment`:
   - Código vulnerable en la página (extracto):
     ```js
     const name = urlParams.get('name');
     const comment = urlParams.get('comment');
     if (name && comment) {
         let comments = JSON.parse(localStorage.getItem('comments') || '[]');
         comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
         localStorage.setItem('comments', JSON.stringify(comments));
         window.location.href = window.location.pathname;
     }
     // ... later ...
     comments.forEach(function(c, index) {
         document.write('<div class="comment">');
         document.write('<div class="comment-author">' + c.name + '</div>');
         document.write('<div>' + c.comment + '</div>');
         document.write('</div>');
     });
     ```
   - Descripción: Los valores `name` y `comment` se almacenan en localStorage y después se renderizan con document.write sin ninguna codificación, permitiendo ejecución de JS cuando cualquier usuario carga la página y el contenido almacenado se escribe en el DOM.
   - PoC (navegador):
     1. Visitar: http://web.dev.local:8082/?name=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&comment=hola
     2. La página almacena el comentario y redirige (limpia la URL). Recargar la página disparará la carga de los comentarios desde localStorage y ejecutará el payload.
     Alternativa por consola de desarrollo:
     ```js
     localStorage.setItem('comments', JSON.stringify([{name:'<img src=x onerror=alert(1)>',comment:'x',date:new Date().toLocaleString()}])); location.reload();
     ```

Impacto
-------
- Alta severidad: ejecución de JavaScript arbitrario en el contexto del sitio (robo de cookies, token CSRF, redireccionamientos, keylogging, etc.).
- Afecta a cualquier usuario que cargue la página con contenido malicioso en `search` o que tenga comentarios maliciosos en su localStorage.

Evidencia
---------
- Fuente HTML/JS recuperada del servidor muestra uso de URLSearchParams y document.write como se cita arriba (visto con curl y revisión manual del código). El comportamiento vulnerable ocurre en el lado cliente, por lo que curl no muestra ejecución, pero el código fuente es suficiente para confirmar la vulnerabilidad.

Reproducción (resumen rápido)
-----------------------------
- Reflected: abrir en un navegador la URL con el payload como `search` (ej. `?search=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E`) y verificar alert(1).
- Stored: enviar `name` y `comment` con payloads (GET) para que el código guarde en localStorage; recargar la página para observar ejecución.

Mitigaciones recomendadas
-------------------------
1. Nunca insertar datos no confiables usando document.write o concatenación de cadenas en HTML. Usar textContent/innerText o createTextNode para insertar texto.
2. Escapar/encodear cualquier valor antes de insertarlo en HTML (por ejemplo, usar una librería probada como DOMPurify para sanitizar HTML si se permite HTML limitado).
3. Evitar almacenar HTML no confiable en localStorage para mostrarlo tal cual; almacenar sólo datos y renderizar como texto.
4. Implementar Content-Security-Policy (CSP) que restringa la ejecución de scripts en línea (aunque no sustituye el saneamiento, ayuda a mitigar impactos).
5. Validación y saneamiento server-side además del client-side.

Conclusión
----------
Vulnerabilidades XSS encontradas en frontend: reflejada y almacenada. Son explotables desde un navegador con payloads sencillos; se recomienda corregir con prioridad alta.

Autor: auditor automático (informe generado por script)

