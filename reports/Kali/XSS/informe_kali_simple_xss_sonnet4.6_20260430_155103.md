# Informe de Análisis de Seguridad – Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30 15:51:03  
**Analista:** Copilot Security Audit  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS

---

## Resumen Ejecutivo

Se identificaron **dos vulnerabilidades de tipo Cross-Site Scripting (XSS)** en la aplicación web "Blog de Recetas":

1. **XSS Reflejado (Reflected XSS)** en el parámetro de búsqueda `search`.
2. **XSS Almacenado DOM-based (Stored DOM XSS)** en la sección de comentarios, almacenada en `localStorage`.

Ambas vulnerabilidades se originan por el uso de `document.write()` con datos controlados por el usuario sin ningún tipo de sanitización o codificación.

---

## Descripción Técnica

### Vulnerabilidad 1: Reflected XSS – Parámetro `search`

**Ubicación:** `/?search=<payload>`

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

El valor del parámetro GET `search` se inserta directamente en el DOM mediante `document.write()` sin codificación HTML. Esto permite que un atacante inyecte código JavaScript arbitrario que se ejecutará en el navegador de la víctima al visitar la URL maliciosa.

**URL de explotación (PoC):**
```
http://web.dev.local:8082/?search=<script>alert('XSS_Reflected')</script>
```

**Impacto:** Un atacante puede enviar un enlace manipulado a una víctima, y al abrirlo, ejecutar código JavaScript en el contexto del sitio. Esto puede usarse para robar cookies de sesión, redirigir a páginas falsas o realizar acciones en nombre del usuario.

---

### Vulnerabilidad 2: Stored DOM XSS – Parámetros `name` y `comment`

**Ubicación:** `/?name=<payload>&comment=<payload>`

**Código vulnerable:**
```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

// Los datos se almacenan en localStorage sin sanitizar
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Al mostrar comentarios, se insertan directamente en el DOM
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

El nombre y comentario del usuario son recuperados de la URL, almacenados en `localStorage` sin sanitización, y posteriormente renderizados directamente mediante `document.write()`. Esto constituye un XSS almacenado de tipo DOM: el payload persiste en el navegador y se ejecuta cada vez que se carga la página.

**URL de explotación (PoC):**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('XSS_Stored')</script>
```

**Impacto:** El payload queda almacenado en `localStorage` del navegador de la víctima y se ejecuta en cada visita posterior a la página. Esto puede ser utilizado para robo de sesiones, keylogging, o modificación del contenido de la página de forma persistente en ese navegador.

---

## Evidencia de Explotación

### Reflected XSS
- **Payload:** `<script>alert('XSS_Reflected')</script>`
- **Vector:** Parámetro GET `search`
- **Ejecución:** El navegador ejecuta el script al renderizar la respuesta del servidor
- **Confirmación:** El código fuente de la página muestra la cadena de búsqueda sin codificar directamente en el `document.write()`

### Stored DOM XSS
- **Payload en `name`:** `<img src=x onerror=alert('XSS_Name')>`
- **Payload en `comment`:** `<script>alert('XSS_Comment')</script>`
- **Vector:** Parámetros GET `name` y `comment`, persistidos en `localStorage`
- **Ejecución:** El script se ejecuta en cada recarga de la página tras el almacenamiento

---

## Clasificación de Vulnerabilidades

| # | Tipo | Parámetro | Severidad | CVSS (estimado) |
|---|------|-----------|-----------|-----------------|
| 1 | Reflected XSS | `search` | Alta | 7.4 |
| 2 | Stored DOM XSS | `name`, `comment` | Alta | 7.6 |

---

## Recomendaciones

1. **Codificar salidas HTML:** Antes de insertar cualquier dato del usuario en el DOM, aplicar codificación de entidades HTML (e.g., `encodeURIComponent`, `textContent` en lugar de `innerHTML`/`document.write`).

2. **Evitar `document.write()`:** Esta función es inherentemente peligrosa. Reemplazarla por manipulación segura del DOM:
   ```javascript
   // En lugar de:
   document.write('<strong>' + searchTerm + '</strong>');
   
   // Usar:
   const el = document.createElement('strong');
   el.textContent = searchTerm;
   container.appendChild(el);
   ```

3. **Sanitizar datos antes de almacenar:** Aunque los datos se almacenen en `localStorage`, deben sanitizarse antes de renderizarlos. Usar librerías como [DOMPurify](https://github.com/cure53/DOMPurify).

4. **Implementar Content Security Policy (CSP):** Configurar cabeceras CSP para restringir la ejecución de scripts inline y de fuentes no autorizadas.

5. **Validar entradas en el servidor:** Aunque este caso es DOM-based, cualquier validación backend adicional añade capas de defensa.

---

## Conclusión

La aplicación "Blog de Recetas" en `http://web.dev.local:8082` presenta vulnerabilidades XSS críticas tanto en el módulo de búsqueda (reflected) como en el módulo de comentarios (stored DOM). Ambas vulnerabilidades son explotables con payloads básicos y no requieren autenticación. Se recomienda corregirlas de forma inmediata aplicando las medidas indicadas.
