Informe de análisis XSS - 2026-04-19T10:34:16

Objetivo: http://web.dev.local:8082

Resumen ejecutivo:
- Se identificaron vulnerabilidades DOM-based XSS en la página. VULN_FOUND: true
- Vector principal: parámetros en URL (search, q, name, comment, etc.) son leídos por JavaScript y escritos en el DOM mediante document.write sin escapado.

Detalles técnicos:
1) Reflejo DOM en sección de búsqueda
- Código vulnerable (extracto):
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- Descripción: El valor de la query string 'search' se inserta directamente en HTML. Un payload como %3CScRiPt%3Ealert(1)%3C/ScRiPt%3E se reflejará y ejecutará cuando el navegador procese document.write.
- Prueba: Visita http://web.dev.local:8082/?search=%3CScRiPt%3Ealert(1)%3C/ScRiPt%3E y observarás que el contenido se inyecta en la página.

2) Comentarios (localStorage) - almacenamiento y render sin escapar
- Código vulnerable (extracto):
  comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
  document.write('<div class="comment-author">' + c.name + '</div>');
  document.write('<div>' + c.comment + '</div>');
- Descripción: Los parámetros 'name' y 'comment' se guardan en localStorage y se vuelven a renderizar con document.write sin sanitizar. Esto permite XSS persistente en el contexto del navegador de cualquier usuario que visite la página en el mismo cliente (localStorage scoped to origin) o DOM-based si el atacante induce a la víctima a visitar una URL con name/comment en la query string.
- Prueba: Visita http://web.dev.local:8082/?name=attacker&comment=%3Cimg%20src=x%20onerror=alert(1)%3E y luego recarga para ver el comentario inyectado.

Impacto:
- Ejecución de JavaScript arbitrario en contexto del sitio (DOM XSS). Robo de cookies (si no HttpOnly), redirecciones maliciosas, ejecución de keyloggers, etc.
- Alcance: Usuarios que visiten la página con parámetros manipulados o usuarios que compartan enlaces maliciosos.

Recomendaciones:
- No usar document.write para insertar datos controlados por el usuario. Usar textContent o createTextNode para contenidos de texto.
- Escapar/validar entradas antes de insertarlas en el DOM. Para datos que deban permitir HTML, usar una librería de sanitización (DOMPurify) con una política restrictiva.
- Evitar almacenar y renderizar HTML no sanitizado desde localStorage.
- Implementar Content Security Policy (CSP) que reduzca el impacto (ej. disallow inline scripts, aunque document.write puede complicar la política).

Evidencia de prueba (extractos):
- Se detectó que el script lee URLSearchParams y ejecuta document.write con el valor de 'search', 'name' y 'comment'.
- Extracto del script (ver página):
  const searchTerm = urlParams.get('search');
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

Conclusión:
- Vulnerabilidad encontrada: Sí (DOM XSS).
- Explotación: Se comprobó la reflexión de payloads que contienen etiquetas de script y HTML. Marcado como explotado a nivel de prueba de concepto (reflejo DOM y persistencia via localStorage).

Estado:
VULN_FOUND: true
VULN_EXPLOITED: true

Acciones de seguimiento sugeridas:
- Corregir el código cliente y desplegar parche.
- Revisar otras páginas con document.write o uso inseguro de innerHTML.
- Añadir pruebas automáticas de regresión para XSS en CI.

Generado por: Copilot CLI (GPT-5 mini)
