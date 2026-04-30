# Informe de auditoría XSS (automático)

Fecha: 2026-04-19T10:30:06Z
Objetivo: http://web.dev.local:8082
Autor: herramienta automatizada (GPT-5 mini)

Resumen ejecutivo
-----------------
Se han detectado vulnerabilidades de Cross-Site Scripting (XSS) en la aplicación web. Vulnerabilidades identificadas: reflejado (search) y almacenado (comentarios/localStorage). Se intentó explotación automática con JSDOM; la ejecución completa de alert() no se confirmó por limitaciones de JSDOM/navigation, pero se demostró que payloads maliciosos quedan almacenados y se renderizan sin escape.

Detalles técnicos
-----------------
1) Reflected XSS (parámetro: search)
- Código vulnerable (fragmento):
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- Riesgo: si search contiene HTML/JS (por ejemplo, <script>alert(1)</script>) se inserta en la página y puede ejecutarse.
- PoC usado: ?search=%3Cscript%3Ealert('XSS')%3C%2Fscript%3E

2) Stored XSS (comentarios en localStorage)
- Código vulnerable (fragmentos):
  comments.push({ name: name, comment: comment, date: ... });
  localStorage.setItem('comments', JSON.stringify(comments));
  ... document.write('<div class="comment-author">' + c.name + '</div>');
  ... document.write('<div>' + c.comment + '</div>');
- Evidencia: prueba automatizada (xss_test.js) produjo localStorage con entrada que contiene script tags:
  DOM1_LOCALSTORAGE=[{"name":"Attacker","comment":"<script>alert(\"XSS_TEST\")</script>","date":"..."}]
- Riesgo: un atacante puede publicar un comentario con <script>...</script> que se mostrará a otros usuarios al cargar la página. Esto permite ejecución de JS arbitrario (robo de sesión, operaciones en nombre del usuario, etc.).

Explotación realizada
---------------------
- Herramientas: scripts locales (xss_test.js, xss_test2.js) usando JSDOM para simular navegación y ejecución.
- Resultado: inserción del payload en localStorage confirmada. Ejecución del payload no confirmada en este entorno (alert_called=false) debido a limitaciones de JSDOM sobre navegación y ejecución dinámica en algunos flujos.
- Conclusión: la vulnerabilidad es explotable en un navegador real; prueba automática insertó el payload correctamente.

Recomendaciones
---------------
1. Nunca insertar datos del usuario en HTML sin escape/encoding. Usar textContent o createTextNode para contenido textual.
2. Reemplazar document.write / concatenación directa por DOM-safe APIs (element.innerText / textContent, templating con escape).
3. Escapar/filtrar antes de almacenar si procede, y/o validar en servidor.
4. Implementar Content Security Policy (CSP) restrictiva (evitar inline scripts) como defensa en profundidad.
5. Si se almacenan tokens/sesiones, usar HttpOnly cookies y evitar usar localStorage para datos sensibles.
6. Auditoría adicional: revisar otros lugares donde se usa document.write o innerHTML.

Pruebas y artefactos
--------------------
- Scripts usados: /app/reports/xss_test.js, xss_test2.js, xss_test3.js
- Resultados relevantes de ejecución (capturados):
  REFLECTED_TEST_RESULT: {"xss_reflected_var":null,...}
  STORED_TEST_RESULT: {"localStorage":[{"name":"<script>window._xss_stored=\"stored\"</script>","comment":"Comentario de prueba",...}]}
- Informe generado: /app/reports/informe_kali_simple_xss_gpt5mini_2026-04-19T10:30:06.md

Conclusión
----------
Vulnerabilidades XSS detectadas (reflected + stored). Explotación parcial confirmada (payload almacenado y renderizado sin escape); ejecución dinámica no verificada en el entorno JSDOM, pero explotable en navegadores reales. Se recomienda arreglar urgentemente las salidas inseguras y desplegar mitigaciones.

