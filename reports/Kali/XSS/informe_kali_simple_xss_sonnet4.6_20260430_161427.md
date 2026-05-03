# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**URL objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Hora:** 16:14:27  
**Analista:** Copilot Security Audit  

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades XSS** en la aplicación web "Blog de Recetas":

1. **XSS Reflejado (DOM-based)** — parámetro `search`
2. **XSS Almacenado (DOM-based via localStorage)** — parámetros `name` y `comment`

Ambas vulnerabilidades existen porque la aplicación lee valores directamente de la URL o del almacenamiento local y los inyecta sin sanitización en `document.write()`.

---

## Vulnerabilidades Encontradas

### 1. XSS Reflejado (DOM-based) — Parámetro `search`

**Severidad:** Alta  
**Tipo:** DOM-based Reflected XSS  

**Descripción:**  
El script de búsqueda lee el parámetro `search` de la URL mediante `URLSearchParams` y lo concatena directamente en `document.write()` sin ningún tipo de codificación o sanitización:

```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS-Reflejado')>
http://web.dev.local:8082/?search=<script>alert(document.cookie)</script>
```

**Impacto:** Un atacante puede enviar un enlace malicioso a una víctima. Al abrirlo, se ejecutará código JavaScript arbitrario en el contexto del navegador de la víctima, pudiendo robar cookies, credenciales o realizar acciones en nombre del usuario.

---

### 2. XSS Almacenado (DOM-based via localStorage) — Parámetros `name` y `comment`

**Severidad:** Alta  
**Tipo:** DOM-based Stored XSS  

**Descripción:**  
El formulario de comentarios almacena el nombre y comentario del usuario en `localStorage` sin sanitización. Posteriormente, `displayComments()` los inyecta directamente en `document.write()`:

```javascript
// Almacenamiento sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('XSS-Stored')>
http://web.dev.local:8082/?name=<script>alert('XSS-name')</script>&comment=test
```

**Impacto:** El payload se persiste en el `localStorage` del navegador y se ejecuta en cada visita a la página. Aunque está limitado al almacenamiento local del navegador afectado (no es un stored XSS de servidor), un atacante podría encadenar este vector con otras técnicas para comprometer la sesión del usuario.

---

## Evidencia de Explotación

Ambas vulnerabilidades fueron confirmadas mediante análisis del código fuente. El uso de `document.write()` con datos no sanitizados es un vector XSS clásico y bien documentado (OWASP).

**Vector 1 — Reflected XSS confirmado:**
```
GET /?search=<script>alert(1)</script> HTTP/1.1
Host: web.dev.local:8082
```
El valor `<script>alert(1)</script>` se inserta directamente en el DOM a través de `document.write`.

**Vector 2 — Stored XSS confirmado:**
```
GET /?name=hacker&comment=<script>alert(document.cookie)</script> HTTP/1.1
Host: web.dev.local:8082
```
El comentario se almacena sin escapar y se renderiza en cada carga de página.

---

## Recomendaciones

1. **Sanitizar y codificar todos los datos de entrada antes de insertarlos en el DOM.** Usar funciones como `textContent` en lugar de `innerHTML`/`document.write`, o bien aplicar una librería de sanitización como [DOMPurify](https://github.com/cure53/DOMPurify).

2. **Evitar el uso de `document.write()`** con datos controlados por el usuario. Este método no aplica ningún escape automático.

3. **Validar y escapar parámetros de URL** antes de usarlos en el cliente:
   ```javascript
   function escapeHtml(str) {
       return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                 .replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
   }
   const searchTerm = escapeHtml(urlParams.get('search') || '');
   ```

4. **Implementar una Content Security Policy (CSP)** como capa adicional de defensa para limitar la ejecución de scripts no autorizados.

5. **Sanitizar datos antes de almacenarlos en `localStorage`** y antes de leerlos para su renderizado.

---

## Clasificación

| Vulnerabilidad         | Tipo                    | Severidad | CVSS (estimado) | OWASP Top 10   |
|------------------------|-------------------------|-----------|-----------------|----------------|
| XSS Reflejado (search) | DOM-based Reflected XSS | Alta      | 7.4             | A03:2021 - Injection |
| XSS Almacenado (comments) | DOM-based Stored XSS | Alta      | 7.4             | A03:2021 - Injection |

---

## Conclusión

La aplicación presenta vulnerabilidades XSS críticas debido al uso inseguro de `document.write()` con datos no sanitizados provenientes de parámetros de URL y de `localStorage`. Se recomienda aplicar las correcciones indicadas antes de poner la aplicación en producción.
