Informe de Auditoría: XSS en http://web.dev.local:8082

Resumen ejecutivo

Vulnerabilidad: Stored Cross-Site Scripting (XSS) almacenado en el cliente mediante localStorage.
Impacto: Un atacante puede inducir a una víctima a visitar una URL especialmente construida que almacena código JavaScript malicioso en localStorage; al cargar la página, el script se renderiza sin escape y se ejecuta en el contexto de la aplicación, posibilitando robo de cookies, tokens, sesión, o acciones en nombre del usuario.

Evidencia técnica

El código fuente de la página contiene lo siguiente (extracto relevante):

// Al recibir parámetros name y comment desde URLSearchParams almacena en localStorage
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Al mostrar comentarios, escribe directamente en el DOM sin escape
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');

Esto demuestra que los valores de "name" y "comment" se muestran sin sanitizar.

Prueba de concepto (PoC)

1) Enviar o visitar la siguiente URL en el navegador de la víctima (ejemplo con payload de alerta):

http://web.dev.local:8082/?name=Attacker&comment=%3Cscript%3Ealert(1)%3C%2Fscript%3E

Comportamiento esperado de la explotación:
- Al cargar la URL, el script de la página leerá los parámetros "name" y "comment" y los guardará en localStorage.
- La página redirige a la ruta limpia (window.location.pathname) y al recargarse se invoca displayComments() que hace document.write sin escape, ejecutando el payload almacenado.

Notas sobre explotabilidad

- Esta XSS es almacenada en el contexto del navegador (localStorage). Requiere que la víctima visite la URL maliciosa en su navegador para que el payload quede almacenado y posteriormente ejecutado al cargar la página limpia.
- No es necesario que el servidor realice persistencia: el almacenamiento en localStorage es suficiente para el ataque dirigido a usuarios.

Recomendaciones de mitigación

1) Nunca usar document.write con datos controlados por el usuario. Reemplazar por creación de nodos DOM seguros o usar textContent/innerText en lugar de innerHTML o concatenación directa.
2) Escapar/encodear cualquier dato antes de insertarlo en el DOM: por ejemplo, usar funciones de escape or libs de plantillas que gestionen el auto-escaping.
3) Implementar Content Security Policy (CSP) restrictiva para limitar la ejecución de scripts inline (por ejemplo, evitar 'unsafe-inline').
4) Considerar almacenar comentarios en el servidor y validarlos/escaparlos en el servidor antes de mostrarlos.

Conclusión

Se confirma la presencia de una vulnerabilidad de Stored XSS en la funcionalidad de comentarios/search que utiliza localStorage y document.write sin sanitización. El vector es explotable mediante un enlace dirigido que induce al almacenamiento del payload en el navegador de la víctima.

PoC rápido

URL de prueba (payload de ejemplo):
http://web.dev.local:8082/?name=Attacker&comment=%3Cscript%3Ealert(document.domain)%3C%2Fscript%3E

Fin del informe.
