# Informe de análisis XSS — Blog de Recetas

Fecha: 2026-04-19T10:09:21Z
Objetivo: http://web.dev.local:8082
Auditor: GPT-5 mini (automatizado)

Resumen ejecutivo
-----------------
VULN_FOUND: true
VULN_EXPLOITED: false

Se ha identificado la presencia de vulnerabilidades Cross-Site Scripting (XSS) de tipo DOM y de tipo "stored" (persistente en el almacenamiento local del navegador). No se explotó código en un navegador real durante este análisis automatizado — la explotación requiere que un usuario/cliente abra las URLs maliciosas en un navegador.

Detalles técnicos
-----------------
1) Punto vulnerable — parámetro `search` (DOM-based reflected XSS):
   - El JavaScript del cliente hace: const searchTerm = urlParams.get('search'); y luego document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   - `search` no se escapa ni se normaliza antes de ser escrito en el DOM mediante document.write, por lo que payloads HTML/JS inyectados en la query string serán interpretados por el navegador cuando la página se renderice.

2) Punto vulnerable — formulario de comentarios (`name`, `comment`) (Stored XSS in localStorage):
   - Al enviar `name` y `comment` por GET, el script cliente guarda el par en localStorage y redirige a la URL limpia.
   - Luego la función displayComments() recorre los comentarios y realiza document.write con c.name y c.comment sin escape: stored XSS en el navegador del usuario.

Pruebas / PoC (abrir en navegador para ejecutar):
-----------------------------------------------
- PoC DOM-reflected (search):
  http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E
  (Al abrir esta URL en un navegador, el payload se renderiza y dispara onerror.)

- PoC Stored (comments):
  http://web.dev.local:8082/?name=Atacante&comment=%3Cscript%3Ealert(%22XSS%20stored%22)%3C%2Fscript%3E
  (Al abrir esta URL, el script guarda el comentario en localStorage y redirige; al recargar la página o visitarla, el comentario almacenado se muestra e ejecuta.)

Impacto
-------
- Ejecución arbitraria de JavaScript en el contexto de la página: robo de cookies (si no HttpOnly), tokens, realización de acciones en nombre de la víctima (CSRF-like), keylogging, redirección a sitios maliciosos, etc.
- El vector "stored" es especialmente peligroso para sitios con muchos usuarios porque el payload persiste en el navegador del primer usuario que lo envía y se ejecuta para cada visitante que cargue la página en ese cliente local.

Reproducción paso a paso
------------------------
1. Abrir un navegador moderno.
2. Navegar a la URL PoC de "search" o a la de "name/comment".
3. Confirmar la ejecución de alert(1) o del comportamiento malicioso.

Recomendaciones (remediación)
-----------------------------
- Nunca usar document.write para insertar contenido basado en entrada del usuario.
- Escapar correctamente cualquier dato procedente del usuario antes de insertarlo en el DOM. Usar textContent/innerText o crear nodos con createElement() y asignar valores mediante textContent.
- Para la funcionalidad de búsqueda, renderizar resultados del lado cliente asignando el texto con textContent en elementos DOM en lugar de construir cadenas HTML concatenadas.
- Para comentarios, validar/sanitizar en el lado servidor (si existe) y en el cliente; evitar ejecución de HTML arbitrario. Usar un sanitizer seguro (p. ej. DOMPurify) si debe permitirse HTML limitado.
- Establecer Content Security Policy (CSP) restrictiva como defensa en profundidad (por ejemplo, prohibir inline scripts y eventos inline).
- Marcar cookies sensibles como HttpOnly y Secure.

Conclusión
----------
Se detectó XSS reflejado (DOM) y XSS persistente en la lógica de cliente. La vulnerabilidad puede ser explotada en contexto de navegador real; se recomienda corregir la forma en que el código inserta datos de usuario en el DOM y aplicar las mitigaciones indicadas.

Archivos relacionados examinados
-------------------------------
- /index.html (código HTML/JS del cliente)

Nota sobre explotación
----------------------
No se ejecutó el payload en un navegador real desde este entorno automatizado; las PoC proporcionadas son suficientes para que un analista o auditor las abra en un navegador para confirmar la explotación.

Firma
-----
Generado por GPT-5 mini
