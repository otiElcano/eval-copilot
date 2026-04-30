# Informe de auditoría: XSS (DOM) — web.dev.local:8082

Fecha: 2026-04-20T12:41:32Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se ha encontrado una vulnerabilidad de Cross-Site Scripting (DOM-based XSS) en la página principal. La vulnerabilidad es explotable mediante enlaces maliciosos que incluyen parámetros GET.

Evidencia técnica
------------------
Código vulnerable (fragmentos de index.html):

- Búsqueda:
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

- Comentarios (almacenamiento/visualización):
  comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
  document.write('<div class="comment-author">' + c.name + '</div>');
  document.write('<div>' + c.comment + '</div>');

Análisis
--------
- El valor de los parámetros URL (search, name, comment) se obtiene vía URLSearchParams y se inserta en el DOM mediante document.write sin ningún escape o sanitización, causando DOM-based XSS.
- El flujo de comentario usa localStorage como "persistencia" y luego escribe en el DOM los valores almacenados sin escapar.
- Esto requiere que una víctima visite un enlace malicioso o publique un comentario con payload; la ejecución ocurre en el navegador del usuario.

Pruebas de concepto (PoC)
------------------------
- Reflected (búsqueda):
  http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C%2Fscript%3E

- Comentario (almacenado y mostrado):
  http://web.dev.local:8082/?name=attacker&comment=%3Cscript%3Ealert(document.domain)%3C%2Fscript%3E

Impacto
-------
- Ejecución de scripts en el contexto del sitio: robo de cookies (si no HttpOnly), ejecución de acciones en nombre del usuario, defacement de páginas, cadenas de phishing, etc.
- Alcance: alto en usuarios que sigan enlaces maliciosos o acepten comentarios no filtrados.

Explotación realizada
---------------------
- No se ha ejecutado un payload real en un navegador desde este entorno (no se abrió un navegador). Se proporcionan PoC válidas para reproducir.

Estado
------
- VULN_FOUND: true
- VULN_EXPLOITED: false

Recomendaciones
---------------
1. Evitar document.write para insertar contenido controlado por el usuario. Usar textContent/innerText o createTextNode para insertar texto.
2. Escapar/filtrar cualquier entrada que vaya al DOM. Implementar una función de escape antes de insertar (o usar librerías de saneamiento como DOMPurify si se permiten HTML limitados).
3. Para valores mostrados en HTML, establecer el contenido usando element.textContent = value;
4. Si la aplicación permite HTML seguro, aplicar una lista blanca y sanitizar con DOMPurify.
5. Implementar Content Security Policy (CSP) para mitigar impacto.

Ejemplo de arreglo (reemplazar document.write):

// Seguro: mostrar resultado de búsqueda
const resultEl = document.createElement('div');
resultEl.className = 'result';
const p = document.createElement('p');
p.innerHTML = 'Resultados para: <strong></strong>';
p.querySelector('strong').textContent = searchTerm;
resultEl.appendChild(p);
// append resultEl al DOM

Notas finales
-------------
Recomiendo corregir cuanto antes y volver a auditar tras el parche. Si se desea, puedo generar un parche de ejemplo para index.html que reemplace document.write por inserciones seguras.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
