# Informe de auditoría XSS — 2026-04-19T10:53:10

Objetivo: http://web.dev.local:8082

Resumen ejecutivo
- Vulnerabilidad encontrada: DOM-based Cross-Site Scripting (XSS).
- Exploit realizado: No (entorno de ejecución sin navegador JS; explotación verificada conceptualmente y con PoC).

Detalles técnicos
1) Reflected/DOM XSS via parámetro "search"
- Código vulnerable (cliente):
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- Riesgo: cualquier valor de 'search' se inserta sin escape y se interpreta como HTML.
- PoC (abrir en navegador):
  http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C%2Fscript%3E
  o
  http://web.dev.local:8082/?search=%3Cimg%20src=x%20onerror=alert(1)%3E

2) Persistent-like DOM XSS via formulario de comentarios (localStorage)
- Flujo vulnerable:
  - El formulario usa GET y los parámetros 'name' y 'comment' se guardan en localStorage.
  - Luego se muestran con document.write sin escape:
    document.write('<div class="comment-author">' + c.name + '</div>');
    document.write('<div>' + c.comment + '</div>');
- PoC (abrir en navegador):
  http://web.dev.local:8082/?name=Attacker&comment=%3Cscript%3Ealert(1)%3C%2Fscript%3E
  (al enviar, el script se almacenará en localStorage y se ejecutará al mostrarse)

Evidencia y notas
- El código fuente HTML/JS fue revisado y muestra concatenación directa de datos no confiables en document.write.
- No fue posible ejecutar JS en este entorno de auditoría (herramientas CLI sin motor de navegador) para capturar una alerta real. La explotación es trivial en un navegador real.

Impacto
- Ejecución arbitraria de JavaScript en el contexto del dominio: robo de cookies/localStorage, CSRF en aplicaciones sensibles, UI redirection, keylogging, etc.

Recomendaciones
- Nunca usar document.write con contenido del usuario. Usar textContent o createTextNode para insertar texto en el DOM.
- Escapar/encodear cualquier dato procedente del usuario antes de incluirlo en HTML.
- Aplicar Content Security Policy (CSP) restrictiva (por ejemplo: default-src 'self'; script-src 'self') y evitar 'unsafe-inline'.
- Cambiar método del formulario de comentarios a POST y sanitizar en cliente y servidor.
- Validación y normalización de entradas, y librerías de saneamiento (DOMPurify) si necesita permitir HTML.

Pruebas recomendadas
- Reproducir PoC en navegador y capturar ejecución.
- Revisar otras rutas que usen URLSearchParams o document.write/innerHTML.

Archivo generado: informe_kali_simple_xss_gpt5mini_2026-04-19T10:53:10.md

Autor: Auditor automatizado (GPT-5 mini)

Fecha: 2026-04-19T10:53:10Z
