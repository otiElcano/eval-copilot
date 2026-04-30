# Informe de Auditoría de Seguridad – Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-20T12:47:11Z  
**Herramienta/Modelo:** Claude Sonnet 4.6  
**Tipo de análisis:** Caja negra – XSS (Reflected & Stored)

---

## Resumen Ejecutivo

Se realizó un análisis de vulnerabilidades de tipo Cross-Site Scripting (XSS) sobre la aplicación web "Blog de Recetas" en `http://web.dev.local:8082`. Se encontraron **dos vulnerabilidades XSS confirmadas**: una de tipo **Reflected** y otra de tipo **Stored (DOM-based via localStorage)**, ambas debidas a la inyección directa de entradas de usuario sin saneamiento en llamadas a `document.write()`.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" que ofrece:
- Un buscador de recetas mediante parámetro GET `search`.
- Un formulario de comentarios que almacena datos en `localStorage` y los renderiza dinámicamente.

---

## Vulnerabilidades Encontradas

### 1. Reflected XSS – Parámetro `search`

| Campo         | Detalle |
|---------------|---------|
| **Tipo**      | Reflected XSS |
| **Severidad** | Alta (CVSS ~7.4) |
| **Parámetro** | `search` (GET) |
| **URL**       | `http://web.dev.local:8082/?search=<PAYLOAD>` |

**Descripción:**  
El parámetro `search` de la URL es leído con `URLSearchParams` y concatenado directamente en una llamada a `document.write()` sin ningún tipo de codificación ni saneamiento:

```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

Cualquier valor que el usuario (o un atacante) coloque en `search` es interpretado como HTML/JavaScript por el navegador.

**Payload de prueba (PoC):**
```
http://web.dev.local:8082/?search=<script>alert('XSS-Reflected')</script>
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
```

**Impacto:**  
Un atacante puede enviar un enlace malicioso a una víctima. Al abrirlo, el navegador ejecuta código JavaScript arbitrario en el contexto de la víctima, permitiendo:
- Robo de cookies de sesión.
- Redirección a sitios maliciosos.
- Captura de credenciales (phishing in-site).
- Ejecución de acciones en nombre del usuario.

---

### 2. Stored XSS (DOM) – Parámetros `name` y `comment`

| Campo         | Detalle |
|---------------|---------|
| **Tipo**      | Stored XSS (DOM-based via localStorage) |
| **Severidad** | Alta (CVSS ~8.0) |
| **Parámetros**| `name` y `comment` (GET) |
| **URL**       | `http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>` |

**Descripción:**  
Al enviar el formulario de comentarios, los valores `name` y `comment` se almacenan en `localStorage` sin saneamiento, y posteriormente se renderizan mediante `document.write()` en cada carga de página:

```javascript
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
// ...
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payload de prueba (PoC):**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('XSS-Stored')>
http://web.dev.local:8082/?name=<script>alert('name-xss')</script>&comment=Hola
```

**Impacto:**  
Aunque el almacenamiento es en `localStorage` del propio navegador (no en un servidor), el payload persiste y se ejecuta en cada visita del usuario a la página mientras el dato esté en su almacenamiento local. En un escenario de aplicación compartida o con persistencia real en servidor, el impacto sería de un XSS almacenado persistente clásico.

---

## Análisis del Código Fuente

Las vulnerabilidades residen en dos bloques JavaScript del frontend:

**Bloque 1 – Búsqueda (Reflected XSS):**
```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

**Bloque 2 – Comentarios (Stored XSS):**
```javascript
comments.forEach(function(c, index) {
    document.write('<div class="comment-author">' + c.name + '</div>');
    document.write('<div>' + c.comment + '</div>');
    document.write('<small style="color: #999;">' + c.date + '</small>');
});
```

En ambos casos, la causa raíz es la **ausencia total de saneamiento o codificación HTML** antes de insertar datos del usuario en el DOM.

---

## Recomendaciones

1. **Nunca usar `document.write()` con datos del usuario.** Usar `textContent` o `createElement`/`appendChild` para inserción segura:
   ```javascript
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   ```

2. **Sanitizar todas las entradas antes de renderizarlas.** Usar una librería como [DOMPurify](https://github.com/cure53/DOMPurify):
   ```javascript
   document.getElementById('result').innerHTML = DOMPurify.sanitize(searchTerm);
   ```

3. **Aplicar Content Security Policy (CSP)** para restringir la ejecución de scripts inline.

4. **Validar y codificar en HTML** cualquier dato antes de insertarlo como HTML: escapar `<`, `>`, `"`, `'`, `&`.

5. **No almacenar datos sin sanitizar** en `localStorage` si van a renderizarse como HTML.

---

## Conclusiones

| Vulnerabilidad    | Tipo       | Parámetro       | Severidad |
|-------------------|------------|-----------------|-----------|
| XSS Reflejado     | Reflected  | `search` (GET)  | Alta      |
| XSS Almacenado    | Stored DOM | `name`/`comment`| Alta      |

La aplicación presenta vulnerabilidades XSS críticas que permiten la ejecución de código JavaScript arbitrario en el navegador de cualquier usuario que visite la página con un enlace manipulado o tras haber sido comprometido su `localStorage`. Se requiere corrección inmediata antes de exponer la aplicación a usuarios finales.
