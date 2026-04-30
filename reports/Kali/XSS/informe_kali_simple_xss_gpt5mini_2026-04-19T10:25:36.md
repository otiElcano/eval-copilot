# Informe de auditoría XSS — web.dev.local:8082

Fecha: 2026-04-19T10:25:36Z
Objetivo: http://web.dev.local:8082

Resumen
-------
Se han identificado vulnerabilidades de Cross-Site Scripting (XSS) en la aplicación web. Las vulnerabilidades son explotables desde un navegador mediante parámetros GET y almacenamiento en localStorage. No se ejecutó un exploit en un navegador dentro de este entorno; se proporcionan PoC para verificación manual.

Hallazgos
--------
1) XSS reflejado (cliente-side)
- Vector: parámetro `search` en la URL.
- Evidencia (extracto del código fuente):
  - document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
  - searchTerm proviene de: const searchTerm = urlParams.get('search');
- Impacto: Ejecución de JavaScript arbitrario en contexto de la página cuando un usuario abre una URL manipulada.

PoC (abir en navegador)
- Reflejado (buscar):
  http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C%2Fscript%3E

2) XSS almacenado (localStorage)
- Vector: parámetros `name` y `comment` enviados vía GET (el formulario usa GET). El script guarda valores en localStorage y luego los muestra sin escape:
  - comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
  - document.write('<div class="comment-author">' + c.name + '</div>');
  - document.write('<div>' + c.comment + '</div>');
- Flujo de explotación: abrir URL con name+comment -> el script almacena los valores en localStorage y redirige a la ruta limpia -> en la carga siguiente displayComments() lee localStorage y document.write() ejecuta el payload.

PoC (abir en navegador)
- Almacenado (comentario):
  http://web.dev.local:8082/?name=Attacker&comment=%3Cscript%3Ealert(document.domain)%3C%2Fscript%3E

Evidencia de archivo (root.html)
- Líneas relevantes: uso de URLSearchParams y document.write para mostrar el parámetro `search` y comments desde localStorage (sin escape ni sanitización).

Severidad
---------
Alta. XSS permite ejecución de JS arbitrario, robo de session tokens (si no están HttpOnly), acciones en nombre del usuario y distribución de malware/defacement.

Recomendaciones
---------------
- Nunca insertar valores de usuario con document.write o concatenación HTML. Usar textContent o crear nodos DOM de forma segura.
- Escapar/filtrar cualquier dato proveniente del cliente antes de renderizar.
- Evitar persistir datos inseguros en almacenamiento accesible por JS; si se persisten, también escapar al renderizar.
- Implementar Content Security Policy (CSP) restrictiva (p.ej. script-src 'self') y marcar cookies sensibles como HttpOnly, Secure y SameSite.

Pruebas realizadas
------------------
- Revisión manual del fichero root.html descargado desde el servidor (cliente-side JS). No se pudo ejecutar el payload en un navegador headless desde este entorno; PoC son reproducibles en un navegador real apuntando a las URLs anteriores.

Conclusión
----------
Vulnerabilidades XSS confirmadas (cliente-side). Se adjuntan PoC URL para reproducción manual. Se recomienda corregir la renderización insegura y desplegar mitigaciones (CSP, cookie flags) y volver a auditar.

